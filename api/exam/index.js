// api/exam/index.js
// RoofVault /api/exam — SWA-friendly exam generation
// - Stable under SWA timeout
// - Returns EXACT count or fails loudly
// - Consistent schema: options[{id,text}], answer, cite, explanation
// - Azure AI Search via REST

const crypto = require("crypto");

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

// Tune these to avoid truncation
const SEARCH_TOP = 45;            // was 60; too much text increases truncation risk
const MAX_SOURCE_CHARS = 11000;   // was 14000; keep smaller so model finishes JSON
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

// Robust JSON parser:
// - removes ``` fences
// - extracts first {...} block
// - parses once
// - if result is a JSON string, parses AGAIN (your current failure case)
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

  if (first >= 0 && last > first) {
    candidate = cleaned.slice(first, last + 1);
  }

  let parsed = null;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return null;
    }
  }

  // Double-parse if the model returned a JSON-encoded string
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      // leave as string (will fail validation)
    }
  }

  return parsed;
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
    const bookGroupId = body.bookGroupId ? String(body.bookGroupId) : null;

    if ((!parts || parts.length === 0) && !book && !bookGroupId) {
      return send(context, 400, { error: "Provide {parts:[...]} or {book:\"...\"} or {bookGroupId:\"...\"}" });
    }

    let baseTitle = "";
    if (parts && parts.length) baseTitle = baseTitleFromPartName(parts[0]);
    else if (book) baseTitle = baseTitleFromPartName(book);
    else baseTitle = String(bookGroupId);

    const searchQuery = baseTitle || "*";

    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/+$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}` +
      `/docs/search?api-version=2023-11-01`;

    const filterTry = `startswith(metadata_storage_name, '${escODataString(baseTitle)}')`;

    const commonSearchBody = {
      search: searchQuery,
      top: SEARCH_TOP,
      select: "content,metadata_storage_name",
      queryType: "simple"
    };

    // Try constrained search first; fallback if filter invalid
    let sres = await fetchJson(
      searchUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
        body: JSON.stringify({ ...commonSearchBody, filter: filterTry })
      },
      SEARCH_TIMEOUT_MS
    );

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
      return send(context, 502, { error: "Search request failed", status: sres.status, detail: sres.data, _diag: { searchQuery, triedFilter: filterTry } });
    }

    const hits = (sres.data && (sres.data.value || sres.data.values)) || [];
    const sources = compactSources(hits);

    if (!sources) {
      return send(context, 404, { error: "No searchable content returned for selection", _diag: { searchQuery } });
    }

    const reqId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

    const system =
      "You generate practice exams from provided sources.\n" +
      "Return ONLY valid JSON (no markdown, no code fences, no extra text).\n" +
      "Do not invent facts not present in the sources.\n" +
      "Every question must be answerable from the sources.\n" +
      "If you cannot comply, return: {\"items\":[]}";

    const schemaInstruction =
      `Return JSON exactly like:\n` +
      `{"items":[` +
      `{"id":"1","type":"mcq","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],` +
      `"answer":"A","cite":"<one of the [source] labels>","explanation":"..."}]}\n` +
      `Rules:\n` +
      `- items length MUST be exactly ${count}\n` +
      `- answer MUST be one of "A","B","C","D"\n` +
      `- cite MUST match one of the bracketed source labels exactly (example: IIBEC - ... Part 03)\n` +
      `- No truncation. Finish the JSON.`;

    const user =
      `Create exactly ${count} MCQs.\n\n` +
      `${schemaInstruction}\n\n` +
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

    // 1) attempt
    let a1 = await callAoai(user);
    if (!a1.ok) {
      return send(context, 502, { error: "AOAI request failed", status: a1.status, detail: a1.detail, _diag: { requestId: reqId, deployment: AOAI_DEPLOYMENT } });
    }

    let parsed = a1.parsed;
    let items = parsed && parsed.items;
    let v = validateItems(items, count);

    // 2) one repair attempt if needed
    if (!v.ok) {
      const repair =
        `Your previous output was invalid (${v.reason}).\n` +
        `Return ONLY valid JSON and EXACTLY ${count} items. No code fences. No extra text.\n\n` +
        `${schemaInstruction}\n\n` +
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
        _diag: { requestId: reqId, deployment: AOAI_DEPLOYMENT, searchQuery, hits: hits.length }
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
        mode: "text-search-single-call",
        requested: count,
        returned: finalItems.length,
        searchQuery,
        hits: hits.length,
        sourceChars: sources.length,
        requestId: reqId
      }
    });
  } catch (e) {
    return send(context, 500, { error: "Unhandled exception", detail: e?.message ? e.message : String(e) });
  }
};
