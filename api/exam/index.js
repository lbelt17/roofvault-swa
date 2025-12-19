// api/exam/index.js
// RoofVault /api/exam — single-call exam generation (SWA-friendly)
// - ONE Azure OpenAI call total
// - Azure AI Search via REST
// - Deterministic filtering for multi-part books using startswith(name, '... - Part')
// - ALWAYS sets context.res

const crypto = require("crypto");

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

const SEARCH_TOP = 40;
const MAX_SOURCE_CHARS = 14000;
const AOAI_TIMEOUT_MS = 28000;
const SEARCH_TIMEOUT_MS = 8000;

// ======= HELPERS =======
function clampInt(n, min, max, fallback) {
  const v = parseInt(n, 10);
  if (Number.isFinite(v)) return Math.min(Math.max(v, min), max);
  return fallback;
}

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

function escODataString(s) {
  return String(s).replace(/'/g, "''");
}

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

function safeString(x, fallback = "") {
  if (typeof x === "string") return x;
  if (x == null) return fallback;
  return String(x);
}

function compactSources(hits) {
  // hits: docs with content + name
  let out = "";
  for (const h of hits) {
    const cite = safeString(h.name || h.metadata_storage_name || h.cite || "source");
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
    try {
      return JSON.parse(candidate);
    } catch {
      // ignore
    }
  }
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// ======= FILTER BUILDERS =======

// Convert: "IIBEC - RoofDecks A-Z Hogan - Part 01" -> "IIBEC - RoofDecks A-Z Hogan - Part"
function normalizePartPrefix(name) {
  return String(name)
    .trim()
    .replace(/\s*-\s*Part\s*\d+\s*$/i, " - Part")
    .replace(/\s*Part\s*\d+\s*$/i, " Part"); // fallback variant
}

// Deterministic: match all parts for the book using startswith() on the real field: `name`
function buildFilterFromParts(parts) {
  const sample = safeString(parts && parts[0] ? parts[0] : "").trim();
  if (!sample) return null;

  const prefix = normalizePartPrefix(sample);
  // NOTE: startswith() requires the field to be filterable. Your index returns `name`,
  // and this approach avoids search.ismatch(field) (which requires searchable).
  return `startswith(name, '${escODataString(prefix)}')`;
}

// ======= MAIN =======
module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") return send(context, 204, "");
    if (req.method === "GET") return send(context, 200, { ok: true, name: "exam", time: new Date().toISOString() });

    // ---- env ----
    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
    const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "azureblob-index-content";

    const AOAI_ENDPOINT = process.env.AOAI_ENDPOINT;
    const AOAI_API_KEY = process.env.AOAI_API_KEY;
    const AOAI_DEPLOYMENT = process.env.AOAI_DEPLOYMENT || "gpt-4o-mini";
    const AOAI_API_VERSION = process.env.AOAI_API_VERSION || "2024-06-01";

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) {
      return send(context, 500, { error: "Missing SEARCH_ENDPOINT or SEARCH_API_KEY" });
    }
    if (!AOAI_ENDPOINT || !AOAI_API_KEY) {
      return send(context, 500, { error: "Missing AOAI_ENDPOINT or AOAI_API_KEY" });
    }

    // ---- input ----
    const body = req.body || {};
    const count = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    const parts = Array.isArray(body.parts) ? body.parts.filter(Boolean) : null;
    const bookGroupId = body.bookGroupId ? String(body.bookGroupId) : null;

    // Back-compat support: { book:"...", filterField:"name" }
    const book = body.book ? String(body.book) : null;
    const filterField = body.filterField ? String(body.filterField) : null;

    if ((!parts || parts.length === 0) && !bookGroupId && !book) {
      return send(context, 400, { error: "Provide {parts:[...]} or {bookGroupId:\"...\"} or {book:\"...\", filterField:\"...\"}" });
    }

    // ---- build filter ----
    let filter = null;

    if (parts && parts.length) {
      filter = buildFilterFromParts(parts);
      if (!filter) return send(context, 400, { error: "Invalid parts[]", parts });
    } else if (book) {
      // If you call with book explicitly, you must tell us which field to match
      // e.g. {"book":"IIBEC - RoofDecks A-Z Hogan - Part 01","filterField":"name"}
      const ff = filterField || "name";
      filter = `${ff} eq '${escODataString(book)}'`;
    } else {
      const field = process.env.SEARCH_BOOKGROUP_FIELD || "bookGroupId";
      filter = `${field} eq '${escODataString(bookGroupId)}'`;
    }

    // ---- search ----
    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/+$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}` +
      `/docs/search?api-version=2023-11-01`;

    const searchBody = {
      search: "*",
      top: SEARCH_TOP,
      filter,
      // IMPORTANT: use fields that exist in your content index (per /api/searchtest)
      select: "content,name"
    };

    const sres = await fetchJson(
      searchUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
        body: JSON.stringify(searchBody)
      },
      SEARCH_TIMEOUT_MS
    );

    if (!sres.ok) {
      return send(context, 502, { error: "Search request failed", status: sres.status, detail: sres.data, filter });
    }

    const hits = (sres.data && (sres.data.value || sres.data.values)) || [];
    const sources = compactSources(hits);

    if (!sources) {
      return send(context, 404, { error: "No searchable content returned for selection", filter });
    }

    // ---- AOAI single call ----
    const reqId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

    const system =
      "You are an exam generator. Return only valid JSON. " +
      "Generate multiple-choice questions (MCQ) that are answerable from the provided sources. " +
      "Each question must have 4 options labeled A-D, one correct answer, and a short explanation. " +
      "Do not invent facts not present in sources.";

    const user =
      `Create exactly ${count} MCQs.\n` +
      `Return JSON with this shape:\n` +
      `{"items":[{"id":"1","type":"mcq","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"answer":"A","cite":"<one of the [source] labels>","explanation":"..."}]}\n\n` +
      `SOURCES:\n${sources}`;

    const aoaiUrl =
      `${AOAI_ENDPOINT.replace(/\/+$/, "")}` +
      `/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}` +
      `/chat/completions?api-version=${encodeURIComponent(AOAI_API_VERSION)}`;

    const ares = await fetchJson(
      aoaiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AOAI_API_KEY,
          "x-ms-client-request-id": reqId
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ],
          temperature: 0.2,
          max_tokens: 2500
        })
      },
      AOAI_TIMEOUT_MS
    );

    if (!ares.ok) {
      return send(context, 502, { error: "AOAI request failed", status: ares.status, detail: ares.data, requestId: reqId });
    }

    const content =
      ares.data &&
      ares.data.choices &&
      ares.data.choices[0] &&
      ares.data.choices[0].message &&
      ares.data.choices[0].message.content;

    const parsed = tryParseJsonStrict(content);
    if (!parsed || !Array.isArray(parsed.items)) {
      return send(context, 500, { error: "Model returned non-JSON or wrong shape", requestId: reqId, raw: content });
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
      return send(context, 500, { error: "Model did not return required count", requested: count, returned: items.length, requestId: reqId });
    }

    return send(context, 200, {
      items,
      modelDeployment: AOAI_DEPLOYMENT,
      _diag: {
        mode: "single-call",
        requested: count,
        returned: items.length,
        searchIndexContent: SEARCH_INDEX_CONTENT,
        searchTop: SEARCH_TOP,
        sourceChars: sources.length,
        aoaiRequestId: reqId,
        filter
      }
    });
  } catch (e) {
    return send(context, 500, { error: "Unhandled exception", detail: e && e.message ? e.message : String(e) });
  }
};
