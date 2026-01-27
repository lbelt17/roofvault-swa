// api/rvchat/index.js
// RoofVault Chat API (STRICT doc-grounded for roofing questions)
// mode: "doc" | "general" | "web"
// ✅ Default: roofing => DOC ONLY (Azure AI Search snippets + AOAI) with strict citations
// ✅ If roofing + no doc support => return a "needsConsentForWeb" flag (UI should prompt user)
// ✅ Web is NEVER automatic. Only runs when client explicitly sets mode:"web" (or allowWeb:true)
// ✅ Session-only memory via messages[]
// ✅ Citation tightening + enforcement
// ✅ Stronger support check (prevents "sounds right" doc answers)
// ✅ List-item citation enforcement (each bullet/step must cite a snippet)

const {
  SEARCH_ENDPOINT,
  SEARCH_KEY,
  SEARCH_INDEX,
  AOAI_ENDPOINT,
  AOAI_KEY,
  AOAI_DEPLOYMENT,

  // ✅ Foundry Agents (real web mode)
  FOUNDRY_PROJECT_ENDPOINT, // e.g. https://<res>.services.ai.azure.com/api/projects/<project>
  FOUNDRY_AGENT_ID,         // e.g. asst_...

  // Entra app creds (recommended)
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,

  WEB_QUESTION_CREDITS // optional: e.g. "5"
} = process.env;

const DEPLOY_TAG = "RVCHAT__2026-01-27__FOUNDRY_WEB_WIRE__A";

/* ===== Config (STRICT by default) ===== */
const STRICT_DOC_GROUNDING =
  (process.env.STRICT_DOC_GROUNDING ?? "true").toLowerCase() === "true";

const DEFAULT_WEB_CREDITS = Number.isFinite(Number(WEB_QUESTION_CREDITS))
  ? Number(WEB_QUESTION_CREDITS)
  : 5;

/* Always-JSON response helper */
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

/* Minimal HTTP(S) request for JSON */
function httpJson(method, url, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    try {
      const { URL } = require("node:url");
      const u = new URL(url);
      const isHttps = u.protocol === "https:";
      const mod = require(isHttps ? "node:https" : "node:http");

      const hasBody = bodyObj !== undefined && bodyObj !== null;
      const data = hasBody ? JSON.stringify(bodyObj) : "";

      const req = mod.request(
        {
          method,
          hostname: u.hostname,
          port: u.port || (isHttps ? 443 : 80),
          path: u.pathname + (u.search || ""),
          headers: Object.assign(
            {
              "Accept": "application/json"
            },
            hasBody
              ? {
                  "Content-Type": "application/json",
                  "Content-Length": Buffer.byteLength(data)
                }
              : {},
            headers || {}
          )
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
    } catch (e) {
      reject(e);
    }
  });
}

/* ===== Query normalization helpers ===== */
function aliasExpand(q) {
  let s = String(q || "");
  s = s.replace(/\bmembrane (roof )?systems?\b/gi, "Membrane Roof Systems");
  s = s.replace(
    /\broof\s*decks\s*(a\s*to\s*z|atoz|a\-z)\b/gi,
    "Roof Decks: A to Z Hogan"
  );
  s = s.replace(/\bsteep[-\s]?slope\b/gi, "Steep-slope Roof Systems");
  return s;
}

function _norm(s) {
  return (s || "").toLowerCase();
}
function _tokens(s) {
  return _norm(s)
    .replace(/[^a-z0-9\-\._ ]+/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w &&
        w.length > 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "from",
          "manual",
          "roofs",
          "systems",
          "system",
          "nrca",
          "iibec",
          "detail",
          "details",
          "part",
          "final",
          "digital",
          "pdf"
        ].includes(w)
    );
}

const ROOF_ANCHORS = new Set([
  "roof","roofing","reroof","re-roof","slope","steep","lowslope","low-slope","pitch",
  "deck","decks","sheathing","substrate","parapet","coping","curb","curbs",
  "flashing","counterflashing","baseflashing","termination","reglet",
  "drain","drains","scupper","gutter","downspout","leader",
  "insulation","polyiso","eps","xps","mineral","coverboard","gypsum",
  "vapor","retarder","air","barrier","condensation","dewpoint","moisture",
  "fastener","fasteners","plates","adhesive","bonding","weld","welded","seam","seams",
  "membrane","tpo","epdm","pvc","modbit","modified","bitumen","bur","asphalt",
  "shingle","shingles","tile","slate","metal","standing","seam",
  "underlayment","ice","water","shield",
  "uplift","wind","pressure","fm","factory","mutual",
  "penetration","penetrations","pipe","vent","skylight","equipment",
  "sealant","primer","mastic","tape",
  "rvalue","r-value","thermal","heat","humidity","ventilation","attic","soffit","ridge"
]);

function questionLooksRoofingRelated(question) {
  const raw = String(question || "").trim();
  if (!raw) return false;

  const expanded = aliasExpand(raw);
  const toks = _tokens(expanded);
  const n = _norm(expanded);

  for (const t of toks) {
    if (ROOF_ANCHORS.has(t)) return true;
  }
  for (const a of ROOF_ANCHORS) {
    if (a.length >= 4 && n.includes(a)) return true;
  }
  return false;
}

/* Decode index id (base64-encoded URL) into a nice filename */
function decodeIdToName(id) {
  try {
    const raw = String(id || "").trim();
    if (!raw) return id || "unknown";

    let b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (b64.length % 4)) % 4;
    if (padLen) b64 += "=".repeat(padLen);

    const url = Buffer.from(b64, "base64").toString("utf8");
    if (!/^https?:\/\//i.test(url)) return id;

    const lastSegment = url.split("/").pop() || url;
    try {
      return decodeURIComponent(lastSegment);
    } catch {
      return lastSegment;
    }
  } catch {
    return id || "unknown";
  }
}

/* Azure Search snippet fetch */
async function searchSnippets(query, topN = 8) {
  const base = (SEARCH_ENDPOINT || "").replace(/\/+$/, "");
  const url = `${base}/indexes('${encodeURIComponent(
    SEARCH_INDEX
  )}')/docs/search?api-version=2023-11-01`;

  const raw = String(query || "").trim();
  const expanded = aliasExpand(raw);
  const qToks = _tokens(expanded);

  const searchText = qToks.length ? qToks.join(" ") : expanded || "*";

  let pass1;
  try {
    const r = await httpJson(
      "POST",
      url,
      { "api-key": SEARCH_KEY },
      {
        search: searchText,
        top: 60,
        searchMode: "any",
        queryType: "full",
        searchFields: "content",
        select: "id,content"
      }
    );
    pass1 = JSON.parse(r.text || "{}");
  } catch {
    return [];
  }

  const vals = Array.isArray(pass1?.value) ? pass1.value : [];
  if (!vals.length) return [];

  return vals.slice(0, Math.max(topN, 8)).map((v, i) => {
    const rawId = v?.id || `doc-${i + 1}`;
    const niceName = decodeIdToName(rawId);
    return {
      id: i + 1,
      source: niceName,
      text: String(v?.content || "").slice(0, 1400)
    };
  });
}

/* Session-only memory prep */
function buildSafeHistory(historyMessages, max = 10) {
  return Array.isArray(historyMessages)
    ? historyMessages
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim()
        )
        .slice(-max)
        .map((m) => ({
          role: m.role,
          content: String(m.content).slice(0, 2000)
        }))
    : [];
}

/* AOAI wrapper */
async function aoaiAnswer(systemPrompt, userPrompt, historyMessages = []) {
  const base = (AOAI_ENDPOINT || "").replace(/\/+$/, "");
  const url = `${base}/openai/deployments/${encodeURIComponent(
    AOAI_DEPLOYMENT
  )}/chat/completions?api-version=2024-06-01`;

  const safeHistory = buildSafeHistory(historyMessages, 10);

  let resp;
  try {
    resp = await httpJson(
      "POST",
      url,
      { "api-key": AOAI_KEY },
      {
        temperature: 0.1,
        max_tokens: 900,
        messages: [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: userPrompt }
        ]
      }
    );
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(resp.text || "{}");
  } catch {}

  if (!resp.ok) {
    const err =
      parsed?.error?.message || parsed?.message || resp.text || "unknown";
    return { ok: false, error: `AOAI HTTP ${resp.status}: ${err}` };
  }

  const content = parsed?.choices?.[0]?.message?.content?.trim?.() || "";
  return { ok: true, content };
}

/* Citation tightening: keep ONLY [[n]] where n is a valid snippet id */
function tightenCitations(answer, validIdSet) {
  let s = String(answer || "");
  s = s.replace(/(?<!\[)\[(\d{1,3})\](?!\])/g, (m, n) => `[[${n}]]`);
  s = s.replace(/\[\[([^\]]+)\]\]/g, (m, inner) => {
    const n = String(inner || "").trim();
    if (!/^\d{1,3}$/.test(n)) return "";
    if (!validIdSet.has(n)) return "";
    return `[[${n}]]`;
  });
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}
function hasAnyValidCitation(answer) {
  return /\[\[\d{1,3}\]\]/.test(String(answer || ""));
}

function isListStyleQuestion(question) {
  const q = _norm(String(question || ""));
  return (
    /\bwhat (are|is) (the )?(key )?(factors|considerations|steps|requirements|components)\b/.test(q) ||
    /\b(list|enumerate)\b/.test(q) ||
    /\bhow do i\b/.test(q) ||
    /\bwhat should\b/.test(q) ||
    /\bwhat must\b/.test(q)
  );
}

function snippetsLookRelevantStrict(question, snippets) {
  const expanded = aliasExpand(String(question || "").trim());
  const toks = _tokens(expanded);
  if (!toks.length) return true;

  const hay = _norm(snippets.map((s) => s.text || "").join(" ").slice(0, 12000));
  const uniq = Array.from(new Set(toks));

  let hits = 0;
  for (const t of uniq) if (hay.includes(t)) hits++;

  const minHits = uniq.length <= 3 ? uniq.length : Math.max(3, Math.ceil(uniq.length * 0.4));
  return hits >= minHits;
}

function listItemsAllHaveCitations(answer) {
  const lines = String(answer || "").split(/\r?\n/);
  const itemLine = (ln) =>
    /^\s*(\d+[\.\)]\s+|[-*]\s+|[A-Z][\.\)]\s+)/.test(ln);

  let sawItem = false;
  for (const ln of lines) {
    if (!itemLine(ln)) continue;
    sawItem = true;
    if (!/\[\[\d{1,3}\]\]/.test(ln)) return false;
  }
  return true;
}

/* Standard doc refusal payload (+ web prompt flags) */
function docRefusal(question, sources = [], note = "", web = {}) {
  return {
    ok: true,
    deployTag: DEPLOY_TAG,
    mode: "doc",
    question,
    answer: "No support in the provided sources.",
    sources,
    ...(note ? { note } : {}),
    needsConsentForWeb: true,
    web: {
      eligible: true,
      reason: "No direct RoofVault library support found for this roofing question.",
      creditsMax: DEFAULT_WEB_CREDITS,
      creditsRemaining:
        Number.isFinite(Number(web.creditsRemaining)) ? Number(web.creditsRemaining) : undefined,
      ...web
    }
  };
}

/* General knowledge fallback (ONLY for clearly non-roofing questions) */
async function generalFallback(question, msgs) {
  const systemPrompt = [
    "You are RoofVault AI.",
    "Answer helpfully using general knowledge. Keep it concise and clear.",
    "If you are unsure, say so briefly.",
    "",
    "At the end, include exactly one line:",
    "Sources: General knowledge (no RoofVault document match)",
    "",
    "Do NOT use [[#]] style citations because no RoofVault snippets are available."
  ].join(" ");

  const userPrompt = `Question: ${question}`;
  const ao = await aoaiAnswer(systemPrompt, userPrompt, msgs);

  let answer =
    (ao.ok ? ao.content : "") ||
    (ao.error ? `No answer due to model error: ${ao.error}` : "I couldn't generate an answer.");

  answer = String(answer)
    .replace(/\[\[\s*#\s*\]\]/g, "")
    .replace(/\[\[\s*\d+\s*\]\]/g, "");

  return answer.replace(/\n{3,}/g, "\n\n").trim();
}

/* ===== Foundry Agents auth (Entra) =====
   Agents require Entra ID bearer token with scope https://ai.azure.com/.default */
async function getFoundryAccessToken() {
  // Service Principal (recommended)
  if (AZURE_TENANT_ID && AZURE_CLIENT_ID && AZURE_CLIENT_SECRET) {
    const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(
      AZURE_TENANT_ID
    )}/oauth2/v2.0/token`;

    const form = new URLSearchParams();
    form.set("grant_type", "client_credentials");
    form.set("client_id", AZURE_CLIENT_ID);
    form.set("client_secret", AZURE_CLIENT_SECRET);
    form.set("scope", "https://ai.azure.com/.default");

    const resp = await new Promise((resolve, reject) => {
      const https = require("node:https");
      const { URL } = require("node:url");
      const u = new URL(tokenUrl);

      const data = form.toString();
      const req = https.request(
        {
          method: "POST",
          hostname: u.hostname,
          path: u.pathname + (u.search || ""),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(data)
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
      req.write(data);
      req.end();
    });

    const parsed = JSON.parse(resp.text || "{}");
    if (!resp.ok) {
      const msg = parsed?.error_description || parsed?.error || resp.text || "token error";
      throw new Error(`Entra token failed (client credentials): HTTP ${resp.status} ${msg}`);
    }
    if (!parsed?.access_token) throw new Error("Entra token missing access_token");
    return parsed.access_token;
  }

  // If you prefer managed identity later, we can add it next.
  throw new Error(
    "Missing Entra auth env vars for Foundry Agents. Set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET."
  );
}

/* ===== Foundry Agent web mode (opt-in only) ===== */
async function foundryWebAnswer(question) {
  if (!FOUNDRY_PROJECT_ENDPOINT || !FOUNDRY_AGENT_ID) {
    throw new Error("Missing Foundry env vars: set FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_AGENT_ID.");
  }

  const endpoint = String(FOUNDRY_PROJECT_ENDPOINT).replace(/\/+$/, "");
  const token = await getFoundryAccessToken();

  // Create thread and run in one call:
  // POST {endpoint}/threads/runs?api-version=v1
  const createUrl = `${endpoint}/threads/runs?api-version=v1`;

  const createBody = {
    assistant_id: FOUNDRY_AGENT_ID,
    thread: {
      messages: [
        {
          role: "user",
          content: String(question || "")
        }
      ]
    },
    // Keep deterministic-ish; you can tune later
    temperature: 0.2
  };

  const created = await httpJson(
    "POST",
    createUrl,
    { Authorization: `Bearer ${token}` },
    createBody
  );

  let createdJson = {};
  try { createdJson = JSON.parse(created.text || "{}"); } catch {}

  if (!created.ok) {
    const err = createdJson?.error?.message || created.text || "create thread/run failed";
    throw new Error(`Foundry create thread/run failed: HTTP ${created.status} ${err}`);
  }

  const threadId = createdJson?.thread_id || createdJson?.thread?.id;
  const runId = createdJson?.id || createdJson?.run_id;

  if (!threadId || !runId) {
    throw new Error(`Foundry response missing thread_id/run_id. Raw: ${created.text?.slice(0, 600)}`);
  }

  // Poll run status until terminal
  const runUrl = `${endpoint}/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}?api-version=v1`;

  const startedAt = Date.now();
  const timeoutMs = 25000;

  while (true) {
    const r = await httpJson("GET", runUrl, { Authorization: `Bearer ${token}` }, null);
    let runJson = {};
    try { runJson = JSON.parse(r.text || "{}"); } catch {}

    if (!r.ok) {
      const err = runJson?.error?.message || r.text || "run status failed";
      throw new Error(`Foundry run status failed: HTTP ${r.status} ${err}`);
    }

    const status = String(runJson?.status || "").toLowerCase();
    if (status === "completed") break;

    if (status === "failed" || status === "cancelled" || status === "expired") {
      const err = runJson?.last_error?.message || runJson?.last_error || "run failed";
      throw new Error(`Foundry run ${status}: ${JSON.stringify(err).slice(0, 600)}`);
    }

    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Foundry run timed out waiting for completion.");
    }

    // 450ms poll
    await new Promise((r) => setTimeout(r, 450));
  }

  // Fetch messages
  const msgUrl = `${endpoint}/threads/${encodeURIComponent(threadId)}/messages?api-version=v1`;
  const m = await httpJson("GET", msgUrl, { Authorization: `Bearer ${token}` }, null);

  let msgJson = {};
  try { msgJson = JSON.parse(m.text || "{}"); } catch {}

  if (!m.ok) {
    const err = msgJson?.error?.message || m.text || "messages fetch failed";
    throw new Error(`Foundry messages failed: HTTP ${m.status} ${err}`);
  }

  const list = Array.isArray(msgJson?.data) ? msgJson.data : [];
  // Prefer the last assistant message
  const lastAssistant = [...list].reverse().find((x) => String(x?.role).toLowerCase() === "assistant");

  // The message content schema can vary; try common shapes
  let text = "";
  if (lastAssistant?.content) {
    // Often: content: [{ type:"text", text:{ value:"..." }}]
    const arr = Array.isArray(lastAssistant.content) ? lastAssistant.content : [];
    const block = arr.find((b) => b?.type === "text" && (b?.text?.value || b?.text));
    if (block?.text?.value) text = String(block.text.value);
    else if (block?.text) text = String(block.text);
  }

  text = (text || "").trim();
  if (!text) {
    // fallback: show something useful for debugging
    text = "Web mode ran, but no assistant text was returned.";
  }

  return {
    answer: text,
    // Future: you can return link citations here if you extract them from agent output/tool results
    sources: []
  };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = jsonRes({ ok: true, deployTag: DEPLOY_TAG });
    return;
  }

  // Diag
  if (req.method === "GET" && String(req.query?.diag) === "1") {
    const seen = {
      DEPLOY_TAG,
      SEARCH_ENDPOINT: !!SEARCH_ENDPOINT,
      SEARCH_KEY: !!SEARCH_KEY,
      SEARCH_INDEX: !!SEARCH_INDEX,
      AOAI_ENDPOINT: !!AOAI_ENDPOINT,
      AOAI_KEY: !!AOAI_KEY,
      AOAI_DEPLOYMENT: !!AOAI_DEPLOYMENT,
      FOUNDRY_PROJECT_ENDPOINT: !!FOUNDRY_PROJECT_ENDPOINT,
      FOUNDRY_AGENT_ID: !!FOUNDRY_AGENT_ID,
      ENTRA_SP: !!(AZURE_TENANT_ID && AZURE_CLIENT_ID && AZURE_CLIENT_SECRET),
      STRICT_DOC_GROUNDING,
      DEFAULT_WEB_CREDITS,
      node: process.version
    };

    context.res = jsonRes({ ok: true, layer: "diag", seen, t: new Date().toISOString() });
    return;
  }

  try {
    // AOAI is needed for general/doc
    const baseEnv = {
      AOAI_ENDPOINT: !!AOAI_ENDPOINT,
      AOAI_KEY: !!AOAI_KEY,
      AOAI_DEPLOYMENT: !!AOAI_DEPLOYMENT
    };
    if (!Object.values(baseEnv).every(Boolean)) {
      context.res = jsonRes({
        ok: false,
        deployTag: DEPLOY_TAG,
        layer: "env",
        error: "Missing AOAI environment variables",
        seen: baseEnv
      });
      return;
    }

    const body = req.body || {};
    const msgs = Array.isArray(body.messages) ? body.messages : [];
    const question =
      (body.question ||
        (msgs.length ? msgs[msgs.length - 1]?.content || "" : "") ||
        "").trim();

    const clientMode = String(body.mode || "").toLowerCase().trim();
    const allowWeb = Boolean(body.allowWeb);
    const webCreditsRemaining = body.webCreditsRemaining;

    if (!question) {
      context.res = jsonRes({
        ok: false,
        deployTag: DEPLOY_TAG,
        layer: "input",
        error: "No question provided."
      });
      return;
    }

    const isRoofing = questionLooksRoofingRelated(question);

    // Explicit general
    if (clientMode === "general") {
      const answer = await generalFallback(question, msgs);
      context.res = jsonRes({
        ok: true,
        deployTag: DEPLOY_TAG,
        mode: "general",
        question,
        answer,
        sources: []
      });
      return;
    }

    // ✅ Explicit web (opt-in only) => Foundry agent
    if (clientMode === "web" || allowWeb) {
      try {
        const webOut = await foundryWebAnswer(question);
        context.res = jsonRes({
          ok: true,
          deployTag: DEPLOY_TAG,
          mode: "web",
          question,
          answer: webOut.answer,
          sources: webOut.sources,
          web: {
            creditsMax: DEFAULT_WEB_CREDITS,
            creditsRemaining:
              Number.isFinite(Number(webCreditsRemaining)) ? Number(webCreditsRemaining) : undefined
          }
        });
      } catch (e) {
        // Fail safe: do NOT pretend web worked; return explicit error
        context.res = jsonRes({
          ok: false,
          deployTag: DEPLOY_TAG,
          layer: "foundry-web",
          error: String(e && e.message)
        });
      }
      return;
    }

    // Default behavior if not roofing: general knowledge allowed
    if (!isRoofing) {
      const answer = await generalFallback(question, msgs);
      context.res = jsonRes({
        ok: true,
        deployTag: DEPLOY_TAG,
        mode: "general",
        question,
        answer,
        sources: []
      });
      return;
    }

    // Roofing => doc mode only unless user explicitly opted in to web
    const docEnv = {
      SEARCH_ENDPOINT: !!SEARCH_ENDPOINT,
      SEARCH_KEY: !!SEARCH_KEY,
      SEARCH_INDEX: !!SEARCH_INDEX
    };
    if (!Object.values(docEnv).every(Boolean)) {
      context.res = jsonRes({
        ok: false,
        deployTag: DEPLOY_TAG,
        layer: "env",
        error: "Missing SEARCH environment variables for doc mode",
        seen: { ...baseEnv, ...docEnv }
      });
      return;
    }

    let snippets = await searchSnippets(question, 8);

    if (!snippets.length) {
      context.res = jsonRes(
        docRefusal(
          question,
          [],
          STRICT_DOC_GROUNDING
            ? "Roofing-related question, but no directly supporting RoofVault snippets were found."
            : "No relevant RoofVault snippets were found.",
          { creditsRemaining: webCreditsRemaining }
        )
      );
      return;
    }

    if (STRICT_DOC_GROUNDING && isListStyleQuestion(question)) {
      if (!snippetsLookRelevantStrict(question, snippets)) {
        context.res = jsonRes(
          docRefusal(
            question,
            snippets.map((s) => ({ id: s.id, source: s.source })),
            "Retrieved documents, but the excerpts did not contain strong direct support for a list-style answer.",
            { creditsRemaining: webCreditsRemaining }
          )
        );
        return;
      }
    }

    const systemPrompt = [
      "You are RoofVault AI, a senior roofing consultant.",
      "Use ONLY the provided RoofVault document snippets as your factual basis.",
      "Do NOT use outside or general knowledge.",
      "Write a natural, ChatGPT-style answer (no forced sections).",
      "Keep it concise unless the user asks for depth.",
      "Every key claim must include inline citations like [[1]] that match the snippet numbers.",
      "If the answer cannot be supported by the snippets, say exactly: No support in the provided sources.",
      "",
      "If you present a list (bullets/numbered items), each item must include a citation on the same line."
    ].join(" ");

    const userPrompt = `Question: ${question}

Snippets:
${snippets.map((s) => `[[${s.id}]] ${s.source}\n${s.text}`).join("\n\n")}`;

    const ao = await aoaiAnswer(systemPrompt, userPrompt, msgs);
    let answer = (ao.ok ? ao.content : "") || "";

    if (!answer) {
      answer = ao.error
        ? `No answer due to model error: ${ao.error}`
        : "No support in the provided sources.";
    }

    const validIds = new Set(snippets.map((s) => String(s.id)));
    answer = tightenCitations(answer, validIds);

    if (answer !== "No support in the provided sources." && !hasAnyValidCitation(answer)) {
      context.res = jsonRes(
        docRefusal(
          question,
          snippets.map((s) => ({ id: s.id, source: s.source })),
          "Model response did not include valid snippet citations.",
          { creditsRemaining: webCreditsRemaining }
        )
      );
      return;
    }

    if (STRICT_DOC_GROUNDING && isListStyleQuestion(question)) {
      if (!listItemsAllHaveCitations(answer)) {
        context.res = jsonRes(
          docRefusal(
            question,
            snippets.map((s) => ({ id: s.id, source: s.source })),
            "List-style answer did not provide per-item citations; refusing to avoid ungrounded synthesis.",
            { creditsRemaining: webCreditsRemaining }
          )
        );
        return;
      }
    }

    context.res = jsonRes({
      ok: true,
      deployTag: DEPLOY_TAG,
      mode: "doc",
      question,
      answer,
      sources: snippets.map((s) => ({ id: s.id, source: s.source })),
      needsConsentForWeb: false
    });
  } catch (e) {
    context.res = jsonRes({
      ok: false,
      deployTag: DEPLOY_TAG,
      layer: "pipeline",
      error: String(e && e.message),
      stack: String(e && e.stack)
    });
  }
};
