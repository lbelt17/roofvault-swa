// api/rvchat/index.js
// RoofVault Chat API (STRICT doc-grounded for roofing questions)
// mode: "doc" | "general" | "web"
//
// ✅ Doc mode: roofing-related questions MUST be supported by Search snippets.
//    If not supported => refuse + needsConsentForWeb:true (opt-in web).
// ✅ Web mode: explicit only, uses Azure AI Foundry Agents (already confirmed working).
// ✅ General mode: general knowledge answer (no docs required).
//
// Stability-first: does not touch Library/Exam endpoints.

const {
  // Azure AI Search (RoofVault docs)
  SEARCH_ENDPOINT,
  SEARCH_KEY,
  SEARCH_INDEX,

  // Azure OpenAI
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

  // Web credits
  WEB_QUESTION_CREDITS
} = process.env;

const DEPLOY_TAG = "RVCHAT__2026-01-28__WEB_SOURCES__D";

/* ========================= CONFIG ========================= */

const DEFAULT_WEB_CREDITS = Number(WEB_QUESTION_CREDITS || 5);
const FOUNDRY_VER = (FOUNDRY_API_VERSION || "2025-05-01").trim();
const FOUNDRY_SCOPE_E = (FOUNDRY_SCOPE || "https://ai.azure.com/.default").trim();

// Search API version (stable)
const SEARCH_API_VERSION = "2023-11-01";

// Support gate: require at least 1 usable snippet
const MIN_SNIPPET_CHARS = 80;

// Poll settings for Foundry run
const FOUNDRY_POLL_TRIES = 20;
const FOUNDRY_POLL_DELAY_MS = 600;

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

    const hasBody = bodyObj !== undefined && bodyObj !== null;
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

function safeJsonParse(text, fallback = {}) {
  try {
    return JSON.parse(text || "");
  } catch {
    return fallback;
  }
}

function isRoofingRelated(q) {
  const s = String(q || "").toLowerCase();

  // RoofVault domain anchors
  const keywords = [
    "roof",
    "roofing",
    "shingle",
    "shingles",
    "tile",
    "slate",
    "metal roof",
    "standing seam",
    "tpo",
    "pvc",
    "epdm",
    "modified bitumen",
    "mod bit",
    "built-up",
    "bur",
    "asphalt",
    "underlayment",
    "flashing",
    "counterflashing",
    "drip edge",
    "ridge",
    "valley",
    "parapet",
    "coping",
    "scupper",
    "drain",
    "roof drain",
    "cricket",
    "curb",
    "penetration",
    "skylight",
    "deck",
    "substrate",
    "insulation",
    "polyiso",
    "vapor barrier",
    "air barrier",
    "uplift",
    "wind uplift",
    "fastener",
    "adhesive",
    "membrane",
    "sealant",
    "pitch",
    "slope",
    "sbs",
    "app",
    "torch",
    "granules",
    "ponding",
    "leak",
    "waterproofing",

    // orgs/standards commonly asked in roofing context
    "nrca",
    "iibec",
    "smacna",
    "astm",
    "ansi",
    "fm global",
    "ul",
    "ibc",
    "fbc",
    "miami-dade"
  ];

  return keywords.some((k) => s.includes(k));
}

function toStr(x) {
  return x === undefined || x === null ? "" : String(x);
}

function normalizeUrl(u) {
  const s = toStr(u).trim();
  if (!s) return "";
  // basic sanity check
  if (!/^https?:\/\//i.test(s)) return "";
  return s;
}

function dedupeSources(sources) {
  const seen = new Set();
  const out = [];
  for (const s of Array.isArray(sources) ? sources : []) {
    const url = normalizeUrl(s.url);
    if (!url) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title: toStr(s.title).trim() || url,
      url,
      publisher: toStr(s.publisher).trim() || ""
    });
  }
  return out;
}

/* ========================= AOAI ========================= */

async function aoaiAnswer(systemPrompt, userPrompt) {
  if (!AOAI_ENDPOINT || !AOAI_KEY || !AOAI_DEPLOYMENT) {
    return "";
  }

  const base = AOAI_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/openai/deployments/${AOAI_DEPLOYMENT}/chat/completions?api-version=2024-06-01`;

  const r = await postJson(
    url,
    { "api-key": AOAI_KEY },
    {
      temperature: 0.2,
      max_tokens: 900,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    }
  );

  const j = safeJsonParse(r.text, {});
  return j?.choices?.[0]?.message?.content || "";
}

/* ========================= SEARCH (DOC MODE) ========================= */

async function searchDocs(question) {
  if (!SEARCH_ENDPOINT || !SEARCH_KEY || !SEARCH_INDEX) {
    return { ok: false, results: [], error: "Missing SEARCH_* env vars" };
  }

  const base = SEARCH_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/indexes/${encodeURIComponent(
    SEARCH_INDEX
  )}/docs/search?api-version=${SEARCH_API_VERSION}`;

  // Keep this conservative (no semantic config dependency)
  const body = {
    search: question,
    top: 5,
    queryType: "simple",
    select: "title,source,fileName,chunk,content,url,uri,bookGroupId,displayTitle",
    count: false
  };

  const r = await postJson(url, { "api-key": SEARCH_KEY }, body);
  const j = safeJsonParse(r.text, {});
  const value = Array.isArray(j.value) ? j.value : [];

  // Normalize to {id, source, title, content}
  const results = value
    .map((v, idx) => {
      const content = String(v.content || v.chunk || "").trim();
      const title =
        String(v.displayTitle || v.title || v.fileName || v.source || "").trim() ||
        "Unknown";
      const source =
        String(v.source || v.fileName || v.title || v.displayTitle || "").trim() ||
        "Unknown";
      const url = String(v.url || v.uri || "").trim();

      return {
        id: String(idx + 1),
        title,
        source,
        url,
        content
      };
    })
    .filter((r) => r.content && r.content.length > 0);

  return { ok: true, results, error: null };
}

function hasStrongDocSupport(results) {
  if (!Array.isArray(results) || results.length === 0) return false;
  // Require at least one reasonably sized snippet
  return results.some((r) => String(r.content || "").trim().length >= MIN_SNIPPET_CHARS);
}

function buildDocContext(results) {
  // Provide snippets with stable ids [1], [2], ...
  const parts = results.map((r) => {
    const headerBits = [
      `[${r.id}]`,
      r.title ? `Title: ${r.title}` : null,
      r.source ? `Source: ${r.source}` : null,
      r.url ? `URL: ${r.url}` : null
    ].filter(Boolean);

    return `${headerBits.join(" | ")}\n${String(r.content || "").trim()}`;
  });

  return parts.join("\n\n---\n\n");
}

/* ========================= FOUNDRY (WEB MODE) ========================= */

async function getEntraToken() {
  const body = new URLSearchParams({
    client_id: AZURE_CLIENT_ID,
    client_secret: AZURE_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: FOUNDRY_SCOPE_E
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
          const j = safeJsonParse(text, {});
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

/**
 * Try to extract URL citations from common Foundry/Assistants message shapes.
 * We intentionally support multiple shapes because these payloads vary by API version + agent tooling.
 */
function extractWebSourcesFromMessages(messagesData) {
  const sources = [];

  const add = (title, url, publisher) => {
    const u = normalizeUrl(url);
    if (!u) return;
    sources.push({
      title: toStr(title).trim() || u,
      url: u,
      publisher: toStr(publisher).trim() || ""
    });
  };

  const msgs = Array.isArray(messagesData) ? messagesData : [];

  // Prefer assistant messages (some APIs return newest-first; others oldest-first)
  const assistantMsgs = msgs.filter((m) => m && m.role === "assistant");

  // Walk through all assistant messages to be safe
  for (const m of assistantMsgs) {
    const contentArr = Array.isArray(m.content) ? m.content : [];

    for (const c of contentArr) {
      // Most common: { type: "text", text: { value: "...", annotations: [...] } }
      const textObj = c?.text;
      const annotations = Array.isArray(textObj?.annotations)
        ? textObj.annotations
        : Array.isArray(c?.annotations)
        ? c.annotations
        : [];

      for (const a of annotations) {
        if (!a) continue;

        // Shape A: { type:"url_citation", url_citation:{ url, title } }
        if (a.type === "url_citation" && a.url_citation) {
          add(a.url_citation.title, a.url_citation.url, a.url_citation.publisher || a.url_citation.source);
          continue;
        }

        // Shape B: { url_citation:{ url, title } } (no type)
        if (a.url_citation) {
          add(a.url_citation.title, a.url_citation.url, a.url_citation.publisher || a.url_citation.source);
          continue;
        }

        // Shape C: { type:"web_citation", web_citation:{ url, title, publisher } }
        if (a.type === "web_citation" && a.web_citation) {
          add(a.web_citation.title, a.web_citation.url, a.web_citation.publisher || a.web_citation.source);
          continue;
        }

        // Shape D (fallback): a has url/title directly
        if (a.url) {
          add(a.title || a.name, a.url, a.publisher || a.source);
          continue;
        }
      }

      // Some agent stacks include "citations" on the content item itself
      const citations = Array.isArray(c?.citations) ? c.citations : [];
      for (const cit of citations) {
        if (!cit) continue;
        add(cit.title || cit.name, cit.url, cit.publisher || cit.source);
      }
    }

    // Some APIs include top-level citations on the message object
    const msgCitations = Array.isArray(m.citations) ? m.citations : [];
    for (const cit of msgCitations) {
      if (!cit) continue;
      add(cit.title || cit.name, cit.url, cit.publisher || cit.source);
    }
  }

  return dedupeSources(sources);
}

function pickAssistantAnswerText(messagesData) {
  const msgs = Array.isArray(messagesData) ? messagesData : [];
  const assistantMsgs = msgs.filter((m) => m && m.role === "assistant");

  // Try to pick the "latest" assistant message:
  // If API returns newest-first, index 0 is latest; if oldest-first, last is latest.
  // We'll pick whichever has readable text, preferring first, then last.
  const candidates = [];
  if (assistantMsgs[0]) candidates.push(assistantMsgs[0]);
  if (assistantMsgs[assistantMsgs.length - 1] && assistantMsgs.length > 1)
    candidates.push(assistantMsgs[assistantMsgs.length - 1]);

  // Also include the rest as fallback
  for (const m of assistantMsgs) candidates.push(m);

  const readTextFromMsg = (m) => {
    const contentArr = Array.isArray(m?.content) ? m.content : [];
    for (const c of contentArr) {
      const v = c?.text?.value;
      if (typeof v === "string" && v.trim()) return v.trim();
      // fallback: sometimes plain string
      if (typeof c === "string" && c.trim()) return c.trim();
    }
    // fallback: sometimes m.content is a string
    if (typeof m?.content === "string" && m.content.trim()) return m.content.trim();
    return "";
  };

  for (const m of candidates) {
    const t = readTextFromMsg(m);
    if (t) return t;
  }

  return "";
}

async function foundryWebAnswer(question) {
  const token = await getEntraToken();
  const base = FOUNDRY_PROJECT_ENDPOINT.replace(/\/+$/, "");

  // Create thread
  const t = await postJson(
    `${base}/threads?api-version=${FOUNDRY_VER}`,
    { Authorization: `Bearer ${token}` },
    {}
  );
  const threadId = safeJsonParse(t.text, {}).id;

  if (!threadId) {
    throw new Error("Foundry thread create failed");
  }

  // Add user message
  await postJson(
    `${base}/threads/${threadId}/messages?api-version=${FOUNDRY_VER}`,
    { Authorization: `Bearer ${token}` },
    { role: "user", content: question }
  );

  // Run assistant
  const r = await postJson(
    `${base}/threads/${threadId}/runs?api-version=${FOUNDRY_VER}`,
    { Authorization: `Bearer ${token}` },
    { assistant_id: FOUNDRY_AGENT_ID }
  );
  const runId = safeJsonParse(r.text, {}).id;

  if (!runId) {
    throw new Error("Foundry run create failed");
  }

  // Poll
  const sleep = (ms) => new Promise((rr) => setTimeout(rr, ms));
  for (let i = 0; i < FOUNDRY_POLL_TRIES; i++) {
    await sleep(FOUNDRY_POLL_DELAY_MS);
    const s = await getJson(
      `${base}/threads/${threadId}/runs/${runId}?api-version=${FOUNDRY_VER}`,
      { Authorization: `Bearer ${token}` }
    );
    const st = safeJsonParse(s.text, {}).status;
    if (st === "completed") break;
    if (st === "failed" || st === "cancelled" || st === "expired") {
      throw new Error(`Foundry run ${st}`);
    }
  }

  // Read messages
  const msgs = await getJson(
    `${base}/threads/${threadId}/messages?api-version=${FOUNDRY_VER}`,
    { Authorization: `Bearer ${token}` }
  );
  const data = safeJsonParse(msgs.text, {});
  const arr = Array.isArray(data.data) ? data.data : [];

  const answer = pickAssistantAnswerText(arr);
  const sources = extractWebSourcesFromMessages(arr);

  return {
    answer:
      answer ||
      "Web search completed, but no readable answer was returned by the agent.",
    sources
  };
}

/* ========================= DOC MODE ANSWER ========================= */

async function docModeAnswer(question) {
  const sr = await searchDocs(question);
  const results = sr.results || [];

  if (!hasStrongDocSupport(results)) {
    return {
      ok: true,
      mode: "doc",
      question,
      answer: "No support in the provided sources.",
      sources: [],
      needsConsentForWeb: true,
      note: "RoofVault docs did not directly support an answer. You can stay doc-only or opt into web mode.",
      web: { eligible: true, creditsMax: DEFAULT_WEB_CREDITS }
    };
  }

  const context = buildDocContext(results);

  const systemPrompt = [
    "You are RoofVault AI, a strict technical reference assistant for roofing.",
    "You MUST answer using ONLY the provided source snippets.",
    "If the snippets do not directly support the answer, reply exactly:",
    '"No support in the provided sources."',
    "",
    "When you state a factual claim, include bracketed citations like [1] or [2] that map to the snippets.",
    "Do not invent standards, organizations, details, or citations."
  ].join("\n");

  const userPrompt = [
    "Question:",
    question,
    "",
    "Sources:",
    context,
    "",
    "Answer:"
  ].join("\n");

  const answer = (await aoaiAnswer(systemPrompt, userPrompt)).trim();

  // If model still refused, trigger consent
  if (!answer || answer === "No support in the provided sources.") {
    return {
      ok: true,
      mode: "doc",
      question,
      answer: "No support in the provided sources.",
      sources: [],
      needsConsentForWeb: true,
      note: "RoofVault docs did not directly support an answer. You can stay doc-only or opt into web mode.",
      web: { eligible: true, creditsMax: DEFAULT_WEB_CREDITS }
    };
  }

  // Return sources list for UI (even if answer includes [1] style refs)
  const sources = results.map((r) => ({
    id: r.id,
    source: r.source || r.title || "Unknown source",
    title: r.title || r.source || "Unknown",
    url: r.url || ""
  }));

  return {
    ok: true,
    mode: "doc",
    question,
    answer,
    sources,
    web: { eligible: true, creditsMax: DEFAULT_WEB_CREDITS }
  };
}

/* ========================= HANDLER ========================= */

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = jsonRes({ ok: true });
    return;
  }

  const body = req.body || {};
  const question = String(body.question || "").trim();

  // IMPORTANT: Default to doc mode unless explicitly general/web.
  const modeRaw = String(body.mode || "").toLowerCase();
  const mode =
    modeRaw === "web" ? "web" : modeRaw === "general" ? "general" : "doc";

  if (!question) {
    context.res = jsonRes({
      ok: false,
      deployTag: DEPLOY_TAG,
      error: "No question provided"
    });
    return;
  }

  // WEB MODE (explicit only)
  if (mode === "web") {
    try {
      if (!FOUNDRY_PROJECT_ENDPOINT || !FOUNDRY_AGENT_ID) {
        context.res = jsonRes({
          ok: false,
          deployTag: DEPLOY_TAG,
          error: "Missing FOUNDRY_PROJECT_ENDPOINT or FOUNDRY_AGENT_ID"
        });
        return;
      }

      const webOut = await foundryWebAnswer(question);

      context.res = jsonRes({
        ok: true,
        deployTag: DEPLOY_TAG,
        mode: "web",
        question,
        answer: webOut.answer,
        // ✅ NEW: web sources for clickable links in UI
        sources: webOut.sources,
        web: { creditsMax: DEFAULT_WEB_CREDITS }
      });
    } catch (e) {
      context.res = jsonRes({
        ok: false,
        deployTag: DEPLOY_TAG,
        error: String(e && e.message ? e.message : e)
      });
    }
    return;
  }

  // DOC MODE (strict for roofing-related; non-roofing can be general without consent)
  if (mode === "doc") {
    const roofing = isRoofingRelated(question);

    // If it's not roofing-related, don't force doc grounding; answer as general.
    if (!roofing) {
      const answer = await aoaiAnswer("Answer using general knowledge.", question);
      context.res = jsonRes({
        ok: true,
        deployTag: DEPLOY_TAG,
        mode: "general",
        question,
        answer: (answer || "").trim() || "No answer available.",
        sources: [],
        web: { creditsMax: DEFAULT_WEB_CREDITS }
      });
      return;
    }

    // Roofing-related => strict doc-grounding, else consent prompt
    try {
      const out = await docModeAnswer(question);
      context.res = jsonRes({ deployTag: DEPLOY_TAG, ...out });
    } catch (e) {
      context.res = jsonRes({
        ok: false,
        deployTag: DEPLOY_TAG,
        error: String(e && e.message ? e.message : e)
      });
    }
    return;
  }

  // GENERAL MODE
  try {
    const answer = await aoaiAnswer("Answer using general knowledge.", question);
    context.res = jsonRes({
      ok: true,
      deployTag: DEPLOY_TAG,
      mode: "general",
      question,
      answer: (answer || "").trim() || "No answer available.",
      sources: [],
      web: { creditsMax: DEFAULT_WEB_CREDITS }
    });
  } catch (e) {
    context.res = jsonRes({
      ok: false,
      deployTag: DEPLOY_TAG,
      error: String(e && e.message ? e.message : e)
    });
  }
};
