// api/exam/index.js
// RoofVault /api/exam — SWA-friendly, stable, avoids unsupported filters
// This version fixes:
// - NO startswith() in $filter
// - Two-step search:
//   1) Resolve candidate metadata_storage_name values using keyword search
//   2) Filter with search.in(metadata_storage_name, '...', ',') and search using keyword
// - NEVER $select fields that might not exist (Azure Search throws 400)
// - Robust text extraction from Search hits, INCLUDING when `content` is a JSON-string like ["...","..."]
// - Fixes "No searchable content" caused by MAX_SOURCE_CHARS (truncates instead of skipping)
// - Fixes AOAI truncation by batching (10 + 10 + remainder)
// - Better diagnostics + stable output shape

const crypto = require("crypto");

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

const RESOLVE_TOP = 120; // step 1: find matching doc names
const FILTERED_TOP = 80; // step 2: pull chunks to feed AOAI
const MAX_SOURCE_CHARS = 11000;

const SEARCH_TIMEOUT_MS = 15000;
const AOAI_TIMEOUT_MS = 90000;

const TEXT_FIELDS = ["content", "text", "chunk", "chunkText", "pageText", "merged_content"];

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

function buildSearchInFilter(field, values) {
  const joined = values.map((v) => String(v)).join(",");
  return `search.in(${field}, '${escODataString(joined)}', ',')`;
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

function baseTitleFromPartName(name) {
  return String(name)
    .replace(/\s*-\s*Part\s*\d+\s*$/i, "")
    .replace(/\s+Part\s*\d+\s*$/i, "")
    .trim();
}

function extractKeyword(baseTitle) {
  const s = String(baseTitle || "").trim();
  if (!s) return "";
  const tokens = s
    .split(/\s+/)
    .map((t) => t.replace(/[^\w]+/g, ""))
    .filter(Boolean);
  if (!tokens.length) return s;
  const last = tokens[tokens.length - 1];
  return last.length >= 3 ? last : s;
}

// Robust conversion to plain text.
function asText(val) {
  if (val == null) return "";

  if (typeof val === "string") {
    const s = val.trim();
    if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
      try {
        const parsed = JSON.parse(s);
        return asText(parsed);
      } catch {
        // not valid JSON string; treat as text
      }
    }
    return val;
  }

  if (Array.isArray(val)) {
    const parts = val
      .map((x) => {
        if (typeof x === "string") return x;
        if (x == null) return "";
        if (typeof x === "object") {
          if (typeof x.text === "string") return x.text;
          if (typeof x.value === "string") return x.value;
        }
        try {
          return JSON.stringify(x);
        } catch {
          return String(x);
        }
      })
      .filter(Boolean);

    return parts.join("\n");
  }

  if (typeof val === "object") {
    if (typeof val.text === "string") return val.text;
    if (typeof val.value === "string") return val.value;
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }

  return String(val);
}

function pickText(doc) {
  if (!doc) return "";

  const primary = asText(doc.content);
  if (primary.trim()) return primary;

  for (const f of TEXT_FIELDS) {
    if (f === "content") continue;
    if (Object.prototype.hasOwnProperty.call(doc, f)) {
      const v = asText(doc[f]);
      if (v.trim()) return v;
    }
  }

  if (doc["@search.highlights"]) {
    const h = asText(doc["@search.highlights"]);
    if (h.trim()) return h;
  }

  return "";
}

// IMPORTANT: truncate instead of skipping when first chunk exceeds MAX_SOURCE_CHARS
function compactSources(hits) {
  let out = "";

  for (const h of hits) {
    const cite = safeString(h.metadata_storage_name || "source");
    const text = (pickText(h) || "").trim();
    if (!text) continue;

    const header = `\n\n[${cite}]\n`;
    const remaining = MAX_SOURCE_CHARS - out.length;

    if (remaining <= header.length + 50) break;

    const allow = remaining - header.length;
    const chunk = text.length > allow ? text.slice(0, allow) : text;

    out += header + chunk;

    if (out.length >= MAX_SOURCE_CHARS) break;
  }

  return out.trim();
}

function tryParseJsonLoose(s) {
  if (!s) return null;

  const cleaned = String(s)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  let candidate = cleaned;

  if (first >= 0 && last > first) candidate = cleaned.slice(first, last + 1);

  try {
    return JSON.parse(candidate);
  } catch {
    try {
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

function normalizeOptions(opt) {
  if (Array.isArray(opt) && opt.length) {
    if (typeof opt[0] === "string") {
      const out = [];
      for (const s of opt.slice(0, 4)) {
        const str = String(s);
        const m = str.match(/^\s*([A-D])\s*[\)\.\:-]\s*(.*)$/i);
        if (m) out.push({ id: m[1].toUpperCase(), text: (m[2] || "").trim() });
        else out.push({ id: String.fromCharCode(65 + out.length), text: str.trim() });
      }
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

  for (let i = 0; i < count; i++) {
    const q = items[i];
    if (!q) return { ok: false, reason: "missing item" };
    if (!safeString(q.question).trim()) return { ok: false, reason: "missing question" };

    const opts = normalizeOptions(q.options);
    const ans = safeString(q.answer).toUpperCase().trim();

    if (!opts || opts.length !== 4) return { ok: false, reason: "options not 4" };
    if (!isValidAnswer(ans)) return { ok: false, reason: "answer not A-D" };
    if (!safeString(q.cite).trim()) return { ok: false, reason: "missing cite" };
    if (!safeString(q.explanation).trim()) return { ok: false, reason: "missing explanation" };
  }

  return { ok: true };
}

// ======= MAIN =======
module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") return send(context, 204, "");
    if (req.method === "GET") {
      return send(context, 200, { ok: true, name: "exam", time: new Date().toISOString() });
    }

    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
    const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "azureblob-index-content";

    const AOAI_ENDPOINT = process.env.AOAI_ENDPOINT;
    const AOAI_API_KEY = process.env.AOAI_API_KEY;
    const AOAI_DEPLOYMENT =
      process.env.AOAI_DEPLOYMENT || process.env.EXAM_OPENAI_DEPLOYMENT || "gpt-4o-mini";
    const AOAI_API_VERSION = process.env.AOAI_API_VERSION || process.env.OPENAI_API_VERSION || "2024-06-01";

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) {
      return send(context, 500, { error: "Missing SEARCH_ENDPOINT or SEARCH_API_KEY" });
    }
    if (!AOAI_ENDPOINT || !AOAI_API_KEY) {
      return send(context, 500, { error: "Missing AOAI_ENDPOINT or AOAI_API_KEY" });
    }

    const body = req.body || {};
    const count = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    const parts = Array.isArray(body.parts) ? body.parts.filter(Boolean) : null;
    const book = body.book ? String(body.book) : null;

    if ((!parts || parts.length === 0) && !book) {
      return send(context, 400, { error: 'Provide {parts:[...]} or {book:"..."}' });
    }

    const baseTitle = parts?.length ? baseTitleFromPartName(parts[0]) : baseTitleFromPartName(book);
    const keyword = extractKeyword(baseTitle) || baseTitle;

    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/+$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}` +
      `/docs/search?api-version=2023-11-01`;

    async function runSearchResolve(searchText, top) {
      const searchBody = {
        search: searchText || "*",
        top: top || RESOLVE_TOP,
        select: "metadata_storage_name",
        queryType: "simple"
      };

      return await fetchJson(
        searchUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
          body: JSON.stringify(searchBody)
        },
        SEARCH_TIMEOUT_MS
      );
    }

    async function runSearchFiltered(searchText, filter, top) {
      const searchBody = {
        search: searchText || "*",
        top: top || FILTERED_TOP,
        select: "metadata_storage_name,content",
        queryType: "simple"
      };
      if (filter) searchBody.filter = filter;

      return await fetchJson(
        searchUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
          body: JSON.stringify(searchBody)
        },
        SEARCH_TIMEOUT_MS
      );
    }

    // ---- Step 1: resolve candidate names ----
    const resolveRes = await runSearchResolve(keyword, RESOLVE_TOP);
    if (!resolveRes.ok) {
      return send(context, 502, {
        error: "Search request failed (resolve)",
        status: resolveRes.status,
        detail: resolveRes.data,
        _diag: { baseTitle, keyword }
      });
    }

    const resolveHits = (resolveRes.data && (resolveRes.data.value || resolveRes.data.values)) || [];
    const baseLower = String(baseTitle).toLowerCase();

    const keep = [];
    for (const h of resolveHits) {
      const name = safeString(h.metadata_storage_name);
      if (!name) continue;
      if (name.toLowerCase().includes(baseLower)) keep.push(name);
      if (keep.length >= 80) break;
    }

    const resolvedNames = keep.length
      ? Array.from(new Set(keep))
      : Array.from(new Set(resolveHits.map((h) => safeString(h.metadata_storage_name)).filter(Boolean)));

    if (!resolvedNames.length) {
      return send(context, 404, {
        error: "No searchable content returned for selection",
        _diag: { baseTitle, keyword, resolveHits: resolveHits.length }
      });
    }

    // ---- Step 2: search.in(...) filter + keyword search ----
    const filter = buildSearchInFilter("metadata_storage_name", resolvedNames);

    const sres = await runSearchFiltered(keyword, filter, FILTERED_TOP);
    if (!sres.ok) {
      return send(context, 502, {
        error: "Search request failed (filtered)",
        status: sres.status,
        detail: sres.data,
        _diag: { baseTitle, keyword, resolvedCount: resolvedNames.length, filter }
      });
    }

    const hits = (sres.data && (sres.data.value || sres.data.values)) || [];
    const sources = compactSources(hits);

    if (!sources) {
      const sample = hits[0] || null;
      const sampleKeys = sample ? Object.keys(sample) : [];
      const c = sample ? sample.content : null;

      const contentType = typeof c;
      const contentLen = typeof c === "string" ? c.length : Array.isArray(c) ? c.length : null;

      let contentPreview = null;
      try {
        contentPreview =
          typeof c === "string"
            ? c.slice(0, 240)
            : c == null
            ? null
            : JSON.stringify(c).slice(0, 240);
      } catch {
        contentPreview = c == null ? null : String(c).slice(0, 240);
      }

      return send(context, 404, {
        error: "No searchable content returned for selection",
        _diag: {
          baseTitle,
          keyword,
          resolvedCount: resolvedNames.length,
          filteredHits: hits.length,
          sampleKeys,
          contentType,
          contentLen,
          contentPreview
        }
      });
    }

    // ---- AOAI (batched to avoid truncation) ----
    const requestId =
      crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

    const system =
      "You generate practice exams from provided sources.\n" +
      "Return ONLY valid JSON (no markdown, no code fences, no extra text).\n" +
      "Do not invent facts not present in the sources.\n" +
      "Every question must be answerable from the sources.\n" +
      'If you cannot comply, return: {"items":[]}';

    function makeSchema(batchCount, idOffset) {
      return (
        `Return JSON exactly like:\n` +
        `{"items":[{"id":"${idOffset + 1}","type":"mcq","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],` +
        `"answer":"A","cite":"<one of the [source] labels>","explanation":"..."}]}\n` +
        `Rules:\n` +
        `- items length MUST be exactly ${batchCount}\n` +
        `- id MUST be "${idOffset + 1}" to "${idOffset + batchCount}" (sequential)\n` +
        `- answer MUST be one of "A","B","C","D"\n` +
        `- cite MUST match one of the bracketed source labels exactly\n` +
        `- Finish the JSON (no truncation).`
      );
    }

    const aoaiUrl =
      `${AOAI_ENDPOINT.replace(/\/+$/, "")}` +
      `/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}` +
      `/chat/completions?api-version=${encodeURIComponent(AOAI_API_VERSION)}`;

    async function callAoai(promptUser) {
      const r = await fetchJson(
        aoaiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": AOAI_API_KEY,
            "x-ms-client-request-id": requestId
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: system },
              { role: "user", content: promptUser }
            ],
            temperature: 0.2,
            max_tokens: 1200
          })
        },
        AOAI_TIMEOUT_MS
      );

      if (!r.ok) return { ok: false, status: r.status, detail: r.data };
      const content = r.data?.choices?.[0]?.message?.content;
      const parsed = tryParseJsonLoose(content);
      return { ok: true, parsed, raw: content };
    }

    async function generateBatch(batchCount, idOffset) {
      const schema = makeSchema(batchCount, idOffset);

      const user =
        `Create exactly ${batchCount} MCQs numbered ${idOffset + 1} to ${idOffset + batchCount}.\n\n` +
        `${schema}\n\n` +
        `SOURCES:\n${sources}`;

      const a1 = await callAoai(user);
      if (!a1.ok) return { ok: false, detail: a1.detail, raw: a1.raw };

      let parsed = a1.parsed;
      let items = parsed && parsed.items;
      let v = validateItems(items, batchCount);

      if (!v.ok) {
        const repair =
          `Your previous output was invalid (${v.reason}) or truncated.\n` +
          `Return ONLY valid JSON and EXACTLY ${batchCount} items numbered ${idOffset + 1} to ${idOffset + batchCount}.\n\n` +
          `${schema}\n\n` +
          `SOURCES:\n${sources}`;

        const a2 = await callAoai(repair);
        if (a2.ok) {
          parsed = a2.parsed;
          items = parsed && parsed.items;
          v = validateItems(items, batchCount);
          if (v.ok) return { ok: true, items };
        }

        return { ok: false, detail: v.reason, raw: a1.raw };
      }

      return { ok: true, items };
    }

    // Plan: 10 + 10 + remainder
    const plan = [];
    let remaining = count;
    let planOffset = 0;
    while (remaining > 0) {
      const n = remaining >= 10 ? 10 : remaining;
      plan.push({ n, idOffset: planOffset });
      remaining -= n;
      planOffset += n;
    }

    let all = [];
    for (const p of plan) {
      const b = await generateBatch(p.n, p.idOffset);
      if (!b.ok) {
        return send(context, 500, {
          error: "Model returned non-JSON or wrong/short shape",
          detail: b.detail || "batch failed",
          raw: b.raw,
          _diag: { requestId: requestId, deployment: AOAI_DEPLOYMENT, baseTitle, keyword, plan }
        });
      }
      all = all.concat(b.items);
    }

    const finalItems = all.slice(0, count).map((q, i) => ({
      id: String(i + 1),
      type: "mcq",
      question: safeString(q.question),
      options: normalizeOptions(q.options),
      answer: safeString(q.answer).toUpperCase().trim(),
      cite: safeString(q.cite).replace(/^\[|\]$/g, "").trim(),
      explanation: safeString(q.explanation)
    }));

    return send(context, 200, {
      items: finalItems,
      modelDeployment: AOAI_DEPLOYMENT,
      returned: finalItems.length,
      _diag: {
        mode: "resolve-names-then-searchin-keyword",
        baseTitle,
        keyword,
        resolvedCount: resolvedNames.length,
        filteredHits: hits.length,
        sourceChars: sources.length,
        requestId: requestId,
        plan
      }
    });
  } catch (e) {
    return send(context, 500, {
      error: "Unhandled exception",
      message: e?.message ? e.message : String(e),
      stack: e?.stack ? String(e.stack).split("\n").slice(0, 12) : []
    });
  }
};
