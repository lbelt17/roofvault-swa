// api/exam/index.js
// RoofVault /api/exam — SWA-friendly, stable, no unsupported filters
// Fixes:
// - NO startswith() (your Search returns 400: "startswith not supported")
// - Uses a 2-step approach:
//   1) Resolve exact metadata_storage_name values by searching content with a keyword
//   2) Use search.in(metadata_storage_name, 'a,b,c', ',') with the exact names
// - Includes JSON repair pass so model output doesn't break the endpoint

const crypto = require("crypto");

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

const SEARCH_TOP = 60;
const MAX_SOURCE_CHARS = 11000;
const SEARCH_TIMEOUT_MS = 10000;
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

// In search.in() list argument, Azure expects a single string with delimiter.
// We must avoid commas INSIDE values; your names won't have commas, so OK.
function buildSearchInFilter(field, values) {
  const joined = values.map(v => String(v)).join(",");
  return `search.in(${field}, '${escODataString(joined)}', ',')`;
}

async function fetchJson(url, options, timeoutMs) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ac.signal });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { _raw: text }; }
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
  const tokens = s.split(/\s+/).map(t => t.replace(/[^\w]+/g, "")).filter(Boolean);
  if (!tokens.length) return s;
  const last = tokens[tokens.length - 1];
  return last.length >= 3 ? last : s;
}

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

  let parsed = null;
  try { parsed = JSON.parse(candidate); }
  catch {
    try { parsed = JSON.parse(cleaned); }
    catch { return null; }
  }

  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch {}
  }
  return parsed;
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
    if (req.method === "GET") return send(context, 200, { ok: true, name: "exam", time: new Date().toISOString() });

    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
    const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "azureblob-index-content";

    const AOAI_ENDPOINT = process.env.AOAI_ENDPOINT;
    const AOAI_API_KEY = process.env.AOAI_API_KEY;
    const AOAI_DEPLOYMENT = process.env.AOAI_DEPLOYMENT || process.env.EXAM_OPENAI_DEPLOYMENT || "gpt-4o-mini";
    const AOAI_API_VERSION = process.env.AOAI_API_VERSION || process.env.OPENAI_API_VERSION || "2024-06-01";

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) return send(context, 500, { error: "Missing SEARCH_ENDPOINT or SEARCH_API_KEY" });
    if (!AOAI_ENDPOINT || !AOAI_API_KEY) return send(context, 500, { error: "Missing AOAI_ENDPOINT or AOAI_API_KEY" });

    const body = req.body || {};
    const count = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    const parts = Array.isArray(body.parts) ? body.parts.filter(Boolean) : null;
    const book = body.book ? String(body.book) : null;

    if ((!parts || parts.length === 0) && !book) {
      return send(context, 400, { error: "Provide {parts:[...]} or {book:\"...\"}" });
    }

    const baseTitle =
      parts?.length ? baseTitleFromPartName(parts[0]) :
      book ? baseTitleFromPartName(book) :
      "";

    const keyword = extractKeyword(baseTitle) || baseTitle;

    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/+$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}` +
      `/docs/search?api-version=2023-11-01`;

    async function runSearch({ searchText, filter, top }) {
      const searchBody = {
        search: searchText || "*",
        top: top || SEARCH_TOP,
        select: "content,metadata_storage_name",
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

    // ---- Step 1: Resolve exact metadata_storage_name values to filter on ----
    // We can't do startswith. We also can't rely on exact "Part 01" matching because
    // your index might store ".pdf" or full blob name. So we "discover" names by searching content.
    const resolveRes = await runSearch({ searchText: keyword, filter: null, top: 80 });
    if (!resolveRes.ok) {
      return send(context, 502, { error: "Search request failed (resolve)", status: resolveRes.status, detail: resolveRes.data, _diag: { baseTitle, keyword } });
    }

    const resolveHits = (resolveRes.data && (resolveRes.data.value || resolveRes.data.values)) || [];
    const want = parts?.length ? parts.map(p => baseTitleFromPartName(p)) : [baseTitle];

    // We keep docs whose metadata_storage_name contains the baseTitle (case-insensitive).
    const keep = [];
    const baseLower = String(baseTitle).toLowerCase();

    for (const h of resolveHits) {
      const name = safeString(h.metadata_storage_name);
      if (!name) continue;
      if (name.toLowerCase().includes(baseLower)) keep.push(name);
      if (keep.length >= 50) break;
    }

    // If we still found nothing, we fallback to just using whatever came back (last resort).
    const resolvedNames = keep.length ? Array.from(new Set(keep)) : Array.from(new Set(resolveHits.map(h => safeString(h.metadata_storage_name)).filter(Boolean)));

    if (!resolvedNames.length) {
      return send(context, 404, { error: "No searchable content returned for selection", _diag: { baseTitle, keyword, resolveHits: resolveHits.length } });
    }

    // ---- Step 2: Use search.in(metadata_storage_name, ...) to pull chunks only from that book ----
    const filter = buildSearchInFilter("metadata_storage_name", resolvedNames);

    const sres = await runSearch({ searchText: "*", filter, top: SEARCH_TOP });
    if (!sres.ok) {
      return send(context, 502, { error: "Search request failed (filtered)", status: sres.status, detail: sres.data, _diag: { baseTitle, keyword, resolvedCount: resolvedNames.length, filter } });
    }

    const hits = (sres.data && (sres.data.value || sres.data.values)) || [];
    const sources = compactSources(hits);

    if (!sources) {
      return send(context, 404, { error: "No searchable content returned for selection", _diag: { baseTitle, keyword, resolvedCount: resolvedNames.length, filteredHits: hits.length } });
    }

    // ---- AOAI: call + repair ----
    const reqId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

    const system =
      "You generate practice exams from provided sources.\n" +
      "Return ONLY valid JSON (no markdown, no code fences, no extra text).\n" +
      "Do not invent facts not present in the sources.\n" +
      "Every question must be answerable from the sources.\n" +
      "If you cannot comply, return: {\"items\":[]}";

    const schema =
      `Return JSON exactly like:\n` +
      `{"items":[{"id":"1","type":"mcq","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],` +
      `"answer":"A","cite":"<one of the [source] labels>","explanation":"..."}]}\n` +
      `Rules:\n` +
      `- items length MUST be exactly ${count}\n` +
      `- answer MUST be one of "A","B","C","D"\n` +
      `- cite MUST match one of the bracketed source labels exactly\n` +
      `- Finish the JSON (no truncation).`;

    const user =
      `Create exactly ${count} MCQs.\n\n` +
      `${schema}\n\n` +
      `SOURCES:\n${sources}`;

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

      if (!r.ok) return { ok: false, status: r.status, detail: r.data };

      const content = r.data?.choices?.[0]?.message?.content;
      const parsed = tryParseJsonLoose(content);
      return { ok: true, parsed, raw: content };
    }

    let a1 = await callAoai(user);
    if (!a1.ok) {
      return send(context, 502, { error: "AOAI request failed", status: a1.status, detail: a1.detail, _diag: { requestId: reqId, deployment: AOAI_DEPLOYMENT } });
    }

    let parsed = a1.parsed;
    let items = parsed && parsed.items;
    let v = validateItems(items, count);

    if (!v.ok) {
      const repair =
        `Your previous output was invalid (${v.reason}).\n` +
        `Return ONLY valid JSON and EXACTLY ${count} items. No code fences. No extra text.\n\n` +
        `${schema}\n\n` +
        `SOURCES:\n${sources}`;

      const a2 = await callAoai(repair);
      if (a2.ok) {
        parsed = a2.parsed;
        items = parsed && parsed.items;
        v = validateItems(items, count);
      }
    }

    if (!v.ok) {
      return send(context, 500, {
        error: "Model returned non-JSON or wrong/short shape",
        detail: v.reason,
        raw: a1.raw,
        _diag: { requestId: reqId, deployment: AOAI_DEPLOYMENT, baseTitle, keyword, resolvedCount: resolvedNames.length }
      });
    }

    const finalItems = items.slice(0, count).map((q, i) => ({
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
        mode: "resolve-names-then-searchin",
        baseTitle,
        keyword,
        resolvedCount: resolvedNames.length,
        filteredHits: hits.length,
        sourceChars: sources.length,
        requestId: reqId
      }
    });
  } catch (e) {
    return send(context, 500, { error: "Unhandled exception", detail: e?.message ? e.message : String(e) });
  }
};
