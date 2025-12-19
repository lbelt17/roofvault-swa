// api/exam/index.js
// RoofVault /api/exam — SWA-friendly exam generation
// Goals:
// - Stable under SWA timeout
// - Returns EXACT count or fails loudly (no silent short exams)
// - Consistent JSON schema for UI
// - Uses Azure AI Search REST (no @azure/search-documents)
// - Works with multi-part books by searching on base title

const crypto = require("crypto");

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

const SEARCH_TOP = 60;             // chunks to pull from Search
const MAX_SOURCE_CHARS = 14000;    // cap total text passed to AOAI
const SEARCH_TIMEOUT_MS = 9000;
const AOAI_TIMEOUT_MS = 28000;

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
    return { ok: res.ok, status: res.status, data, _rawText: text };
  } finally {
    clearTimeout(t);
  }
}

function safeString(x, fallback = "") {
  if (typeof x === "string") return x;
  if (x == null) return fallback;
  return String(x);
}

// Strip " - Part 01" / " Part 01" from end
function baseTitleFromPartName(name) {
  return String(name)
    .replace(/\s*-\s*Part\s*\d+\s*$/i, "")
    .replace(/\s+Part\s*\d+\s*$/i, "")
    .trim();
}

// Compact sources with labels so the model can cite
function compactSources(hits) {
  let out = "";
  for (const h of hits) {
    const cite = safeString(h.metadata_storage_name || "source");
    const content = safeString(h.content || "");
    if (!content) continue;

    const block = `\n\n[${cite}]\n${content.trim()}`;
    if (out.length + block.length > MAX_SOURCE_CHARS) break;
    out += block;
  }
  return out.trim();
}

// More robust JSON extraction (handles ```json fences or extra text)
function tryParseJsonLoose(s) {
  if (!s) return null;

  // remove ```json fences if present
  const cleaned = String(s)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  // best effort: take first { ... } block
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const candidate = cleaned.slice(first, last + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // fall through
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function normalizeOptions(opt) {
  // Accept either:
  // - ["A) ...", "B) ...", ...]
  // - [{id:"A", text:"..."}, ...]
  if (Array.isArray(opt) && opt.length) {
    if (typeof opt[0] === "string") {
      const out = [];
      for (const s of opt.slice(0, 4)) {
        const str = String(s);
        const m = str.match(/^\s*([A-D])\s*[\)\.\:-]\s*(.*)$/i);
        if (m) out.push({ id: m[1].toUpperCase(), text: (m[2] || "").trim() });
        else out.push({ id: String(out.length ? String.fromCharCode(65 + out.length) : "A"), text: str.trim() });
      }
      // pad if short
      while (out.length < 4) out.push({ id: String.fromCharCode(65 + out.length), text: "" });
      return out;
    }
    if (typeof opt[0] === "object") {
      const out = opt.slice(0, 4).map((o, i) => ({
        id: safeString(o.id, String.fromCharCode(65 + i)).toUpperCase(),
        text: safeString(o.text)
      }));
      while (out.length < 4) out.push({ id: String.fromCharCode(65 + out.length), text: "" });
      return out;
    }
  }
  // default
  return [
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" }
  ];
}

function isValidAnswer(a) {
  const x = safeString(a).toUpperCase().trim();
  return x === "A" || x === "B" || x === "C" || x === "D";
}

function validateItems(items, count) {
  if (!Array.isArray(items)) return { ok: false, reason: "items not array" };
  if (items.length < count) return { ok: false, reason: `returned ${items.length} < requested ${count}` };

  // Validate first count items
  for (let i = 0; i < count; i++) {
    const q = items[i];
    if (!q) return { ok: false, reason: "missing item" };
    if (!safeString(q.question).trim()) return { ok: false, reason: "missing question" };

    const opts = normalizeOptions(q.options);
    const ans = safeString(q.answer).toUpperCase().trim();

    if (!opts || opts.length !== 4) return { ok: false, reason: "options not 4" };
    if (!isValidAnswer(ans)) return { ok: false, reason: "answer not A-D" };
  }

  return { ok: true };
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
    const AOAI_DEPLOYMENT = process.env.AOAI_DEPLOYMENT || process.env.EXAM_OPENAI_DEPLOYMENT || "gpt-4o-mini";
    const AOAI_API_VERSION = process.env.AOAI_API_VERSION || process.env.OPENAI_API_VERSION || "2024-06-01";

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) return send(context, 500, { error: "Missing SEARCH_ENDPOINT or SEARCH_API_KEY" });
    if (!AOAI_ENDPOINT || !AOAI_API_KEY) return send(context, 500, { error: "Missing AOAI_ENDPOINT or AOAI_API_KEY" });

    // ---- input ----
    const body = req.body || {};
    const count = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    const parts = Array.isArray(body.parts) ? body.parts.filter(Boolean) : null;
    const book = body.book ? String(body.book) : null;
    const bookGroupId = body.bookGroupId ? String(body.bookGroupId) : null;

    if ((!parts || parts.length === 0) && !book && !bookGroupId) {
      return send(context, 400, { error: "Provide {parts:[...]} or {book:\"...\"} or {bookGroupId:\"...\"}" });
    }

    // ---- derive base title + search query ----
    let baseTitle = "";
    if (parts && parts.length) baseTitle = baseTitleFromPartName(parts[0]);
    else if (book) baseTitle = baseTitleFromPartName(book);
    else baseTitle = String(bookGroupId);

    const searchQuery = baseTitle; // critical: matches across all parts

    // ---- Search request ----
    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/+$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}` +
      `/docs/search?api-version=2023-11-01`;

    // We try a filter to constrain to files that start with the base title.
    // If the index doesn't support filtering on metadata_storage_name, Azure will return 400,
    // and we auto-fallback to no filter.
    const filterTry = `startswith(metadata_storage_name, '${escODataString(baseTitle)}')`;

    const commonSearchBody = {
      search: searchQuery || "*",
      top: SEARCH_TOP,
      select: "content,metadata_storage_name",
      queryType: "simple"
    };

    let sres = await fetchJson(
      searchUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
        body: JSON.stringify({ ...commonSearchBody, filter: filterTry })
      },
      SEARCH_TIMEOUT_MS
    );

    // Fallback if filter invalid
    if (!sres.ok && sres.status === 400) {
      sres = await fetchJson(
        searchUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
          body: JSON.stringify({ ...commonSearchBody })
        },
        SEARCH_TIMEOUT_MS
      );
    }

    if (!sres.ok) {
      return send(context, 502, {
        error: "Search request failed",
        status: sres.status,
        detail: sres.data,
        _diag: { searchQuery, triedFilter: filterTry }
      });
    }

    const hits = (sres.data && (sres.data.value || sres.data.values)) || [];
    const sources = compactSources(hits);

    if (!sources) {
      return send(context, 404, { error: "No searchable content returned for selection", _diag: { searchQuery } });
    }

    // ---- AOAI: generate questions ----
    const reqId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

    const system =
      "You generate practice exams from provided sources.\n" +
      "Return ONLY valid JSON (no markdown, no code fences, no extra text).\n" +
      "Do not invent facts not present in the sources.\n" +
      "Every question must be answerable from the sources.";

    const schemaInstruction =
      `Return JSON exactly like:\n` +
      `{"items":[` +
      `{"id":"1","type":"mcq","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],` +
      `"answer":"A","cite":"<one of the [source] labels>","explanation":"..."}]}\n` +
      `Rules:\n` +
      `- items length MUST be exactly ${count}\n` +
      `- answer MUST be one of "A","B","C","D"\n` +
      `- cite MUST match one of the bracketed source labels exactly (example: [IIBEC - ... Part 03])`;

    const user =
      `Create exactly ${count} MCQs.\n\n` +
      `${schemaInstruction}\n\n` +
      `SOURCES:\n${sources}`;

    const aoaiUrl =
      `${AOAI_ENDPOINT.replace(/\/+$/, "")}` +
      `/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}` +
      `/chat/completions?api-version=${encodeURIComponent(AOAI_API_VERSION)}`;

    async function callAoai(promptUser, retryTag) {
      const r = await fetchJson(
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
              { role: "user", content: promptUser }
            ],
            temperature: 0.2,
            max_tokens: 2600
          })
        },
        AOAI_TIMEOUT_MS
      );

      if (!r.ok) {
        return { ok: false, error: { status: r.status, detail: r.data, retryTag } };
      }

      const content =
        r.data &&
        r.data.choices &&
        r.data.choices[0] &&
        r.data.choices[0].message &&
        r.data.choices[0].message.content;

      const parsed = tryParseJsonLoose(content);
      return { ok: true, parsed, raw: content };
    }

    // First attempt
    let a1 = await callAoai(user, "first");
    if (!a1.ok) {
      return send(context, 502, {
        error: "AOAI request failed",
        ...a1.error,
        _diag: {
          requestId: reqId,
          deployment: AOAI_DEPLOYMENT,
          aoaiEndpointHost: AOAI_ENDPOINT.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
        }
      });
    }

    let items = a1.parsed && a1.parsed.items;

    // If invalid / short, do ONE repair attempt
    let v = validateItems(items, count);
    if (!v.ok) {
      const repair =
        `Your previous response was invalid (${v.reason}).\n` +
        `Return ONLY valid JSON matching the schema and EXACTLY ${count} items.\n\n` +
        `${schemaInstruction}\n\n` +
        `SOURCES:\n${sources}`;

      const a2 = await callAoai(repair, "repair");
      if (a2.ok) {
        items = a2.parsed && a2.parsed.items;
        v = validateItems(items, count);
      }
    }

    if (!v.ok) {
      return send(context, 500, {
        error: "Model returned non-JSON or wrong/short shape",
        detail: v.reason,
        raw: a1.raw,
        _diag: {
          requestId: reqId,
          deployment: AOAI_DEPLOYMENT,
          searchQuery,
          hits: hits.length
        }
      });
    }

    // Normalize output to strict UI-friendly shape
    const finalItems = items.slice(0, count).map((q, i) => {
      const opts = normalizeOptions(q.options);
      const ans = safeString(q.answer).toUpperCase().trim();

      return {
        id: String(i + 1),
        type: "mcq",
        question: safeString(q.question),
        options: opts,
        answer: ans,
        cite: safeString(q.cite),
        explanation: safeString(q.explanation)
      };
    });

    return send(context, 200, {
      items: finalItems,
      modelDeployment: AOAI_DEPLOYMENT,
      returned: finalItems.length,
      _diag: {
        mode: "text-search-single-call",
        requested: count,
        returned: finalItems.length,
        searchQuery,
        hits: hits.length,
        sourceChars: sources.length,
        searchIndexContent: SEARCH_INDEX_CONTENT,
        searchEndpointHost: SEARCH_ENDPOINT.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
        aoaiEndpointHost: AOAI_ENDPOINT.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
        requestId: reqId
      }
    });
  } catch (e) {
    return send(context, 500, { error: "Unhandled exception", detail: e && e.message ? e.message : String(e) });
  }
};
