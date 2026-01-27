// api/rvchat/index.js
// RoofVault Chat API (STRICT doc-grounded for roofing questions)
// mode: "doc" | "general" | "web"

const {
  SEARCH_ENDPOINT,
  SEARCH_KEY,
  SEARCH_INDEX,
  AOAI_ENDPOINT,
  AOAI_KEY,
  AOAI_DEPLOYMENT,

  // Foundry Agents (Web mode)
  FOUNDRY_PROJECT_ENDPOINT,
  FOUNDRY_AGENT_ID,
  FOUNDRY_API_VERSION,
  FOUNDRY_SCOPE,

  // Entra
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,

  WEB_QUESTION_CREDITS
} = process.env;

const DEPLOY_TAG = "RVCHAT__2026-01-27__FOUNDRY_WIRED__B";

/* ========================= CONFIG ========================= */

const DEFAULT_WEB_CREDITS = Number(WEB_QUESTION_CREDITS || 5);
const FOUNDARY_VER = (FOUNDRY_API_VERSION || "2025-05-01").trim();
const FOUNDARY_SCOPE = (FOUNDRY_SCOPE || "https://ai.azure.com/.default").trim();

/* ========================= HELPERS ========================= */

function jsonRes(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

function httpJson(method, url, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const { URL } = require("node:url");
    const u = new URL(url);
    const isHttps = u.protocol === "https:";
    const mod = require(isHttps ? "node:https" : "node:http");

    const hasBody = bodyObj !== undefined;
    const data = hasBody ? JSON.stringify(bodyObj) : null;

    const req = mod.request(
      {
        method,
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + (u.search || ""),
        headers: {
          Accept: "application/json",
          ...(hasBody
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
              }
            : {}),
          ...(headers || {})
        }
      },
      (res) => {
        let text = "";
        res.on("data", (c) => (text += c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            text
          })
        );
      }
    );

    req.on("error", reject);
    if (hasBody) req.write(data);
    req.end();
  });
}

const postJson = (u, h, b) => httpJson("POST", u, h, b);
const getJson = (u, h) => httpJson("GET", u, h, null);

/* ========================= AOAI ========================= */

async function aoaiAnswer(systemPrompt, userPrompt) {
  const base = AOAI_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/openai/deployments/${AOAI_DEPLOYMENT}/chat/completions?api-version=2024-06-01`;

  const r = await postJson(
    url,
    { "api-key": AOAI_KEY },
    {
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    }
  );

  const j = JSON.parse(r.text || "{}");
  return j?.choices?.[0]?.message?.content || "";
}

/* ========================= FOUNDRY ========================= */

async function getEntraToken() {
  const body = new URLSearchParams({
    client_id: AZURE_CLIENT_ID,
    client_secret: AZURE_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: FOUNDARY_SCOPE
  }).toString();

  return new Promise((resolve, reject) => {
    const https = require("node:https");
    const req = https.request(
      {
        method: "POST",
        hostname: "login.microsoftonline.com",
        path: `/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (res) => {
        let text = "";
        res.on("data", (c) => (text += c));
        res.on("end", () => {
          const j = JSON.parse(text || "{}");
          if (!j.access_token) reject(new Error("No access token"));
          else resolve(j.access_token);
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function foundryWebAnswer(question) {
  const token = await getEntraToken();
  const base = FOUNDRY_PROJECT_ENDPOINT.replace(/\/+$/, "");

  // Create thread
  const t = await postJson(
    `${base}/threads?api-version=${FOUNDARY_VER}`,
    { Authorization: `Bearer ${token}` },
    {}
  );
  const threadId = JSON.parse(t.text).id;

  // Message
  await postJson(
    `${base}/threads/${threadId}/messages?api-version=${FOUNDARY_VER}`,
    { Authorization: `Bearer ${token}` },
    { role: "user", content: question }
  );

  // Run
  const r = await postJson(
    `${base}/threads/${threadId}/runs?api-version=${FOUNDARY_VER}`,
    { Authorization: `Bearer ${token}` },
    { assistant_id: FOUNDRY_AGENT_ID }
  );
  const runId = JSON.parse(r.text).id;

  // Poll
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 15; i++) {
    await sleep(600);
    const s = await getJson(
      `${base}/threads/${threadId}/runs/${runId}?api-version=${FOUNDARY_VER}`,
      { Authorization: `Bearer ${token}` }
    );
    if (JSON.parse(s.text).status === "completed") break;
  }

  // Read messages
  const msgs = await getJson(
    `${base}/threads/${threadId}/messages?api-version=${FOUNDARY_VER}`,
    { Authorization: `Bearer ${token}` }
  );
  const arr = JSON.parse(msgs.text).data || [];

  const assistant = arr.find((m) => m.role === "assistant");
  const content = assistant?.content?.[0]?.text?.value;

  return (
    content ||
    "Web search completed, but no readable answer was returned by the agent."
  );
}

/* ========================= HANDLER ========================= */

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = jsonRes({ ok: true });
    return;
  }

  const body = req.body || {};
  const question = String(body.question || "").trim();
  const mode = String(body.mode || "").toLowerCase();

  if (!question) {
    context.res = jsonRes({ ok: false, error: "No question provided" });
    return;
  }

  // WEB MODE (explicit only)
  if (mode === "web") {
    try {
      const answer = await foundryWebAnswer(question);
      context.res = jsonRes({
        ok: true,
        deployTag: DEPLOY_TAG,
        mode: "web",
        question,
        answer,
        sources: [],
        web: {
          creditsMax: DEFAULT_WEB_CREDITS
        }
      });
    } catch (e) {
      context.res = jsonRes({
        ok: false,
        deployTag: DEPLOY_TAG,
        error: String(e.message)
      });
    }
    return;
  }

  // GENERAL fallback
  const answer = await aoaiAnswer(
    "Answer using general knowledge.",
    question
  );

  context.res = jsonRes({
    ok: true,
    deployTag: DEPLOY_TAG,
    mode: "general",
    question,
    answer,
    sources: []
  });
};
