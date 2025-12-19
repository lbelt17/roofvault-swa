// api/exam/index.js
// RoofVault /api/exam — SIMPLE + RELIABLE (SWA-friendly)
// - Azure AI Search via REST (text search, like /api/searchtest)
// - ONE Azure OpenAI call total
// - Robust env var support (handles your real SWA settings)
// - Normalizes AOAI endpoint (prevents "wrong endpoint" 401)
// - Always returns JSON + diagnostics

const crypto = require("crypto");

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

const SEARCH_TOP = 50;
const MAX_SOURCE_CHARS = 16000;
const SEARCH_TIMEOUT_MS = 10000;
const AOAI_TIMEOUT_MS = 30000;

// ======= RESPONSE =======
function send(context, status, obj, extraHeaders = {}) {
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      ...extraHeaders
    },
    body: obj === undefined ? "" : JSON.stringify(obj)
  };
  return context.res;
}

function clampInt(n, min, max, fallback) {
  const v = parseInt(n, 10);
  if (Number.isFinite(v)) return Math.min(Math.max(v, min), max);
  return fallback;
}

function safeString(x, fallback = "") {
  if (typeof x === "string") return x;
  if (x == null) return fallback;
  return String(x);
}

// ======= ENV HELPERS =======
function firstEnv(names) {
  for (const n of names) {
    const v = process.env[n];
    if (v && String(v).trim()) return { name: n, value: String(v).trim() };
  }
  return { name: null, value: null };
}

function normalizeBaseUrl(u) {
  if (!u) return null;
  let s = String(u).trim();

  // If someone pasted a full AOAI URL including /openai/..., strip back to host
  const idx = s.toLowerCase().indexOf("/openai/");
  if (idx !== -1) s = s.slice(0, idx);

  // Ensure it has scheme for URL parsing
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;

  // Remove trailing slashes
  s = s.replace(/\/+$/, "");
  return s;
}

// ======= FETCH JSON WITH TIMEOUT =======
async function fetchJson(url, options, timeoutMs) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ac.signal });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { _raw: text };
    }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(t);
  }
}

// ======= SOURCE PACKING =======
function compactSources(hits) {
  // Expect docs with { content, metadata_storage_name }
  let out = "";
  for (const h of hits) {
    const cite = safeString(h.metadata_storage_name || h.cite || "source");
    const content = safeString(h.content || "");
    if (!content) continue;

    const block = `\n\n[${cite}]\n${content.trim()}`;
    if (out.length + block.length > MAX_SOURCE_CHARS) break;
    out += block;
  }
  return out.trim();
}

function tryParseJsonStrict(s) {
  if (!s) return null;
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const candidate = s.slice(first, last + 1);
    try { return JSON.parse(candidate); } catch { /* ignore */ }
  }
  try { return JSON.parse(s); } catch { return null; }
}

// ======= QUERY NORMALIZATION =======
function baseFromPartName(partName) {
  // "IIBEC - RoofDecks A-Z Hogan - Part 01" -> "IIBEC - RoofDecks A-Z Hogan"
  return String(partName || "")
    .trim()
    .replace(/\s*-\s*Part\s*\d+\s*$/i, "")
    .trim();
}

function deriveSearchQuery(body) {
  if (Array.isArray(body.parts) && body.parts.length) {
    const base = baseFromPartName(body.parts[0]);
    return base || "*";
  }
  if (body.book) return String(body.book);
  if (body.bookGroupId) return String(body.bookGroupId);
  return "*";
}

// ======= MAIN =======
module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") return send(context, 204, "");
    if (req.method === "GET") {
      return send(context, 200, { ok: true, name: "exam", time: new Date().toISOString() });
    }

    const body = req.body || {};
    const count = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    const hasParts = Array.isArray(body.parts) && body.parts.length > 0;
    const hasBook = !!body.book;
    const hasGroup = !!body.bookGroupId;

    if (!hasParts && !hasBook && !hasGroup) {
      return send(context, 400, { error: "Provide {parts:[...]} or {book:\"...\"} or {bookGroupId:\"...\"}" });
    }

    // ---- Search env ----
    const searchEp = firstEnv(["SEARCH_ENDPOINT"]);
    const searchKey = firstEnv(["SEARCH_API_KEY"]);
    const searchIndex = firstEnv(["SEARCH_INDEX_CONTENT"]).value || "azureblob-index-content";

    // ---- AOAI env (ROBUST) ----
    const aoaiEp = firstEnv(["AOAI_ENDPOINT", "AZURE_OPENAI_ENDPOINT", "OPENAI_ENDPOINT"]);
    const aoaiKey = firstEnv([
      "AOAI_API_KEY",
      "AOAI_KEY",
      "AZURE_OPENAI_API_KEY",
      "AZURE_OPENAI_KEY",
      "OPENAI_API_KEY",
      "OPENAI_KEY"
    ]);
    const aoaiDep = firstEnv(["AOAI_DEPLOYMENT", "AZURE_OPENAI_DEPLOYMENT", "OPENAI_DEPLOYMENT"]).value || "gpt-4o-mini";
    const aoaiVer = firstEnv(["AOAI_API_VERSION", "AZURE_OPENAI_API_VERSION", "OPENAI_API_VERSION"]).value || "2024-06-01";

    const SEARCH_ENDPOINT = normalizeBaseUrl(searchEp.value);
    const AOAI_ENDPOINT = normalizeBaseUrl(aoaiEp.value);

    if (!SEARCH_ENDPOINT || !searchKey.value) {
      return send(context, 500, {
        error: "Missing Search configuration",
        missing: {
          SEARCH_ENDPOINT: !SEARCH_ENDPOINT,
          SEARCH_API_KEY: !searchKey.value
        }
      });
    }

    if (!AOAI_ENDPOINT || !aoaiKey.value) {
      return send(context, 500, {
        error: "Missing Azure OpenAI configuration",
        missing: {
          AOAI_ENDPOINT: !AOAI_ENDPOINT,
          AOAI_KEY: !aoaiKey.value
        },
        hint:
          "Your SWA environment variables likely use AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_KEY (or similar). This function supports multiple names, but they must exist in SWA Configuration."
      });
    }

    // ---- Search (TEXT QUERY; no filter) ----
    const searchQuery = deriveSearchQuery(body);

    const searchUrl =
      `${SEARCH_ENDPOINT}` +
      `/indexes/${encodeURIComponent(searchIndex)}` +
      `/docs/search?api-version=2023-11-01`;

    const searchBody = {
      search: searchQuery,
      top: SEARCH_TOP,
      select: "content,metadata_storage_name"
    };

    const sres = await fetchJson(
      searchUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": searchKey.value },
        body: JSON.stringify(searchBody)
      },
      SEARCH_TIMEOUT_MS
    );

    if (!sres.ok) {
      return send(context, 502, {
        error: "Search request failed",
        status: sres.status,
        detail: sres.data,
        _diag: { searchQuery, index: searchIndex, searchEndpointHost: new URL(SEARCH_ENDPOINT).host }
      });
    }

    const hits = (sres.data && (sres.data.value || sres.data.values)) || [];
    const sources = compactSources(hits);

    if (!sources) {
      return send(context, 404, {
        error: "No searchable content returned for selection",
        _diag: { searchQuery, hits: hits.length, index: searchIndex }
      });
    }

    // ---- AOAI (ONE CALL) ----
    const reqId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

    const system =
      "You are an exam generator. Return ONLY valid JSON. " +
      "Generate multiple-choice questions (MCQ) answerable from the provided sources. " +
      "Each question must have 4 options labeled A-D, one correct answer, and a short explanation. " +
      "Do not invent facts not present in the sources.";

    const user =
      `Create exactly ${count} MCQs.\n` +
      `Return JSON with this exact shape:\n` +
      `{"items":[{"id":"1","type":"mcq","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"answer":"A","cite":"<one of the [source] labels>","explanation":"..."}]}\n\n` +
      `SOURCES:\n${sources}`;

    const aoaiUrl =
      `${AOAI_ENDPOINT}` +
      `/openai/deployments/${encodeURIComponent(aoaiDep)}` +
      `/chat/completions?api-version=${encodeURIComponent(aoaiVer)}`;

    const ares = await fetchJson(
      aoaiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": aoaiKey.value,
          "x-ms-client-request-id": reqId
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ],
          temperature: 0.2,
          max_tokens: 2800
        })
      },
      AOAI_TIMEOUT_MS
    );

    if (!ares.ok) {
      return send(context, 502, {
        error: "AOAI request failed",
        status: ares.status,
        detail: ares.data,
        _diag: {
          requestId: reqId,
          deployment: aoaiDep,
          aoaiEndpointHost: new URL(AOAI_ENDPOINT).host,
          aoaiEndpointEnvUsed: aoaiEp.name,
          aoaiKeyEnvUsed: aoaiKey.name
        }
      });
    }

    const content =
      ares.data &&
      ares.data.choices &&
      ares.data.choices[0] &&
      ares.data.choices[0].message &&
      ares.data.choices[0].message.content;

    const parsed = tryParseJsonStrict(content);
    if (!parsed || !Array.isArray(parsed.items)) {
      return send(context, 500, {
        error: "Model returned non-JSON or wrong shape",
        raw: content,
        _diag: { requestId: reqId }
      });
    }

    const items = parsed.items.slice(0, count).map((q, i) => ({
      id: String(i + 1),
      type: "mcq",
      question: safeString(q.question),
      options: Array.isArray(q.options)
        ? q.options.slice(0, 4).map((o) => ({
            id: safeString(o.id).toUpperCase(),
            text: safeString(o.text)
          }))
        : [],
      answer: safeString(q.answer).toUpperCase(),
      cite: safeString(q.cite),
      explanation: safeString(q.explanation)
    }));

    if (items.length !== count) {
      return send(context, 500, {
        error: "Model did not return required count",
        requested: count,
        returned: items.length,
        _diag: { requestId: reqId }
      });
    }

    return send(context, 200, {
      items,
      modelDeployment: aoaiDep,
      _diag: {
        mode: "text-search-single-call",
        requested: count,
        returned: items.length,
        searchQuery,
        hits: hits.length,
        sourceChars: sources.length,
        searchIndexContent: searchIndex,
        searchEndpointHost: new URL(SEARCH_ENDPOINT).host,
        aoaiEndpointHost: new URL(AOAI_ENDPOINT).host,
        aoaiEndpointEnvUsed: aoaiEp.name,
        aoaiKeyEnvUsed: aoaiKey.name,
        aoaiRequestId: reqId
      }
    });
  } catch (e) {
    return send(context, 500, {
      error: "Unhandled exception",
      detail: e && e.message ? e.message : String(e)
    });
  }
};
