// api/exam/index.js
// RoofVault /api/exam — FAST single-call exam generation (SWA 45s max request time)
// - ONE Azure OpenAI call total (asks for exactly count questions in one shot)
// - Azure AI Search via REST (no @azure/search-documents dependency)
// - Hard caps to keep prompt small + fast

const crypto = require("crypto");

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

// Keep prompt compact so one AOAI call can finish under SWA API max duration (~45s).
const SEARCH_TOP = 40;            // number of chunks to fetch from Search
const MAX_SOURCE_CHARS = 14000;   // total chars of source text we feed to AOAI
const AOAI_TIMEOUT_MS = 28000;    // outbound AOAI request timeout (keep total < 45s)
const SEARCH_TIMEOUT_MS = 8000;   // outbound Search request timeout

// ======= HELPERS =======
function clampInt(n, min, max, fallback) {
  const v = parseInt(n, 10);
  if (Number.isFinite(v)) return Math.min(Math.max(v, min), max);
  return fallback;
}

function json(status, obj, extraHeaders = {}) {
  return {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      ...extraHeaders
    },
    body: JSON.stringify(obj)
  };
}

function escODataString(s) {
  // OData single-quoted string escaping: ' -> ''
  return String(s).replace(/'/g, "''");
}

async function fetchJson(url, options, timeoutMs) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ac.signal });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { _raw: text }; }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(t);
  }
}

function buildFilterFromParts(parts) {
  // Use search.in for safer OR-list filtering:
  // search.in(metadata_storage_name, 'a,b,c', ',')
  const joined = parts.map(p => escODataString(p)).join(",");
  return `search.in(metadata_storage_name, '${joined}', ',')`;
}

function safeString(x, fallback = "") {
  if (typeof x === "string") return x;
  if (x == null) return fallback;
  return String(x);
}

function compactSources(hits) {
  // hits are docs with content + metadata_storage_name
  // We produce a compact "SOURCE" string with short citations.
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
  // attempt to find first { ... } block if model wraps extra text
  if (!s) return null;
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const candidate = s.slice(first, last + 1);
    try { return JSON.parse(candidate); } catch { /* ignore */ }
  }
  try { return JSON.parse(s); } catch { return null; }
}

// ======= MAIN =======
module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") return json(204, {});
    if (req.method === "GET") return json(200, { ok: true, name: "exam", time: new Date().toISOString() });

    // ---- env ----
    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
    const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "azureblob-index-content";

    const AOAI_ENDPOINT = process.env.AOAI_ENDPOINT;
    const AOAI_API_KEY = process.env.AOAI_API_KEY;
    const AOAI_DEPLOYMENT = process.env.AOAI_DEPLOYMENT || "gpt-4o-mini";
    const AOAI_API_VERSION = process.env.AOAI_API_VERSION || "2024-06-01";

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) {
      return json(500, { error: "Missing SEARCH_ENDPOINT or SEARCH_API_KEY" });
    }
    if (!AOAI_ENDPOINT || !AOAI_API_KEY) {
      return json(500, { error: "Missing AOAI_ENDPOINT or AOAI_API_KEY" });
    }

    // ---- input ----
    const body = req.body || {};
    const count = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    const parts = Array.isArray(body.parts) ? body.parts.filter(Boolean) : null;
    const bookGroupId = body.bookGroupId ? String(body.bookGroupId) : null;

    if ((!parts || parts.length === 0) && !bookGroupId) {
      return json(400, { error: "Provide {parts:[...]} or {bookGroupId:\"...\"}" });
    }

    // ---- build filter ----
    let filter = null;
    if (parts && parts.length) {
      filter = buildFilterFromParts(parts);
    } else {
      // If you store grouping in content index, use your grouping field here.
      // Common patterns: bookGroupId, metadata_book_group_id, etc.
      // Adjust this one line if your field name differs.
      const field = process.env.SEARCH_BOOKGROUP_FIELD || "bookGroupId";
      filter = `${field} eq '${escODataString(bookGroupId)}'`;
    }

    // ---- search: pull top chunks across all parts ----
    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/+$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}` +
      `/docs/search?api-version=2023-11-01`;

    const searchBody = {
      search: "*",
      top: SEARCH_TOP,
      filter,
      select: "content,metadata_storage_name"
    };

    const sres = await fetchJson(
      searchUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": SEARCH_API_KEY
        },
        body: JSON.stringify(searchBody)
      },
      SEARCH_TIMEOUT_MS
    );

    if (!sres.ok) {
      return json(502, { error: "Search request failed", status: sres.status, detail: sres.data });
    }

    const hits = (sres.data && (sres.data.value || sres.data.values)) || [];
    const sources = compactSources(hits);

    if (!sources) {
      return json(404, { error: "No searchable content returned for selection", filter });
    }

    // ---- AOAI: ONE call, ask for exactly count questions ----
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
      return json(502, {
        error: "AOAI request failed",
        status: ares.status,
        detail: ares.data,
        requestId: reqId
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
      return json(500, {
        error: "Model returned non-JSON or wrong shape",
        requestId: reqId,
        raw: content
      });
    }

    // Ensure ids + clamp to exactly count
    const items = parsed.items.slice(0, count).map((q, i) => ({
      id: String(i + 1),
      type: "mcq",
      question: safeString(q.question),
      options: Array.isArray(q.options) ? q.options.slice(0, 4).map(o => ({
        id: safeString(o.id).toUpperCase(),
        text: safeString(o.text)
      })) : [],
      answer: safeString(q.answer).toUpperCase(),
      cite: safeString(q.cite),
      explanation: safeString(q.explanation)
    }));

    if (items.length !== count) {
      return json(500, { error: "Model did not return required count", requested: count, returned: items.length, requestId: reqId });
    }

    return json(200, {
      items,
      modelDeployment: AOAI_DEPLOYMENT,
      _diag: {
        mode: "single-call",
        requested: count,
        returned: items.length,
        searchIndexContent: SEARCH_INDEX_CONTENT,
        searchTop: SEARCH_TOP,
        sourceChars: sources.length,
        aoaiRequestId: reqId
      }
    });

  } catch (e) {
    // Always return JSON so you never get a silent crash from this function.
    return json(500, { error: "Unhandled exception", detail: e && e.message ? e.message : String(e) });
  }
};
