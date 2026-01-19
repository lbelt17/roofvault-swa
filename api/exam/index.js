// api/exam/index.js
// RoofVault /api/exam — multi-part guaranteed + fresh mixes + no-repeat support
//
// Fixes / Features:
// - Uses ALL body.parts (not just parts[0])
// - Pulls sources PER PART and generates questions PER PART (quota / round-robin)
// - Seeded RNG based on attemptNonce for fresh mixes
// - Shuffles options and remaps correct answer so answer isn't always A/B
// - Adds `ref` to each item (same as cite label) so UI always shows correct Part
// - Supports excludeQuestions[] to prevent repeats across "New 25Q" attempts
// - Avoids TOC/meta "which chapter/section/page" style questions
// - If unique questions exhausted returns: {"items":[],"message":"No additional unique questions remain..."}

const crypto = require("crypto");

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

// How many chunks to fetch per part
const TOP_PER_PART = 40;

// Total max chars fed to the model (split across parts)
const MAX_SOURCE_CHARS_TOTAL = 11000;

// Timeouts
const SEARCH_TIMEOUT_MS = 15000;
const AOAI_TIMEOUT_MS = 90000;

// Fields where text might live
const TEXT_FIELDS = ["content", "text", "chunk", "chunkText", "pageText", "merged_content"];

// Retry behavior to enforce "no repeats"
const NOREPEAT_MAX_ATTEMPTS = 4;

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

function safeString(x, fallback = "") {
  if (typeof x === "string") return x;
  if (x == null) return fallback;
  return String(x);
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
    return val
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
      .filter(Boolean)
      .join("\n");
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

// Build a compact source string with [label] blocks, capped to limit chars
function compactSourcesLimit(hits, limitChars) {
  let out = "";
  for (const h of hits) {
    const cite = safeString(h.metadata_storage_name || "source");
    const text = (pickText(h) || "").trim();
    if (!text) continue;

    const header = `\n\n[${cite}]\n`;
    const remaining = limitChars - out.length;
    if (remaining <= header.length + 50) break;

    const allow = remaining - header.length;
    const chunk = text.length > allow ? text.slice(0, allow) : text;

    out += header + chunk;
    if (out.length >= limitChars) break;
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

function shuffleOptionsAndRemapAnswer(item, rand) {
  if (!item || !Array.isArray(item.options) || item.options.length !== 4) return item;

  const letters = ["A", "B", "C", "D"];
  const correctLetter = String(item.answer || "").toUpperCase();
  const correctIndex = letters.indexOf(correctLetter);
  if (correctIndex === -1) return item;

  const indexed = item.options.map((opt, i) => ({ opt, originalIndex: i }));

  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }

  const newCorrectIndex = indexed.findIndex((x) => x.originalIndex === correctIndex);

  const newOptions = indexed.map((x, i) => ({
    id: letters[i],
    text: String((x.opt && x.opt.text) || "")
  }));

  return {
    ...item,
    options: newOptions,
    answer: letters[Math.max(0, newCorrectIndex)]
  };
}

function isValidAnswer(a) {
  const x = safeString(a).toUpperCase().trim();
  return x === "A" || x === "B" || x === "C" || x === "D";
}

function validateItems(items, count) {
  if (!Array.isArray(items)) return { ok: false, reason: "items not array" };
  if (items.length !== count) return { ok: false, reason: `items length ${items.length} != ${count}` };

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

// Seeded RNG
function seededRng(seedStr) {
  const h = crypto.createHash("sha256").update(String(seedStr)).digest();
  let idx = 0;
  return function rand() {
    const a = h[idx % h.length];
    const b = h[(idx + 7) % h.length];
    const c = h[(idx + 13) % h.length];
    idx++;
    const x = (a << 16) ^ (b << 8) ^ c ^ (idx * 2654435761);
    return (x >>> 0) / 4294967296;
  };
}

function shuffleInPlace(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Quota: guarantee distribution across parts
function buildQuotas(parts, count, rand) {
  const uniq = Array.from(new Set(parts.map((p) => String(p).trim()).filter(Boolean)));
  if (!uniq.length) return { parts: [], quotas: [] };

  const order = uniq.slice();
  shuffleInPlace(order, rand);

  const k = order.length;

  if (k >= count) {
    return { parts: order.slice(0, count), quotas: order.slice(0, count).map(() => 1) };
  }

  const base = Math.floor(count / k);
  let rem = count - base * k;

  const quotas = order.map(() => base);
  for (let i = 0; i < quotas.length && rem > 0; i++, rem--) quotas[i]++;

  return { parts: order, quotas };
}

function normQ(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\?\.\,\-]/g, "")
    .trim();
}

function hashQ(q) {
  const txt = normQ(q && (q.question || q.prompt || ""));
  const cite = normQ(q && (q.cite || q.ref || ""));
  return crypto.createHash("sha256").update(`${txt}||${cite}`).digest("hex");
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
    const AOAI_API_VERSION =
      process.env.AOAI_API_VERSION || process.env.OPENAI_API_VERSION || "2024-06-01";

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) {
      return send(context, 500, { error: "Missing SEARCH_ENDPOINT or SEARCH_API_KEY" });
    }
    if (!AOAI_ENDPOINT || !AOAI_API_KEY) {
      return send(context, 500, { error: "Missing AOAI_ENDPOINT or AOAI_API_KEY" });
    }

    // Request body
    const body = req.body || {};
    const count = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    const attemptNonce = safeString(body.attemptNonce || "");
    const requestId =
      (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex")) +
      (attemptNonce ? `-${attemptNonce}` : "");

    // Parts required
    const partsRaw = Array.isArray(body.parts) ? body.parts : [];
    const parts = partsRaw.map((p) => String(p).trim()).filter(Boolean);

    if (!parts.length) {
      return send(context, 400, { error: 'Provide {parts:["Book - Part 01", ...]}' });
    }

    // No-repeat list from client
    const excludeQuestionsRaw = Array.isArray(body.excludeQuestions) ? body.excludeQuestions : [];
    const excludeQuestions = excludeQuestionsRaw.map(normQ).filter(Boolean);
    const excludeSet = new Set(excludeQuestions);

    const rand = seededRng(requestId);
    const quotaPlan = buildQuotas(parts, count, rand);

    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/+$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}` +
      `/docs/search?api-version=2023-11-01`;

    // Resolve the REAL metadata_storage_name by searching, then filter exactly
    async function runSearchForPart(partName, top) {
      const resolveBody = {
        search: `"${partName}"`,
        top: 5,
        select: "metadata_storage_name",
        queryType: "simple"
      };

      const resolveRes = await fetchJson(
        searchUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
          body: JSON.stringify(resolveBody)
        },
        SEARCH_TIMEOUT_MS
      );

      let resolvedName = partName;

      if (resolveRes.ok) {
        const vals = (resolveRes.data && (resolveRes.data.value || resolveRes.data.values)) || [];
        const targetLower = String(partName).toLowerCase();
        const exact = vals.find(
          (h) => String(h.metadata_storage_name || "").toLowerCase() === targetLower
        );
        const first = vals[0];

        if (exact && exact.metadata_storage_name) resolvedName = String(exact.metadata_storage_name);
        else if (first && first.metadata_storage_name) resolvedName = String(first.metadata_storage_name);
      }

      const filter = buildSearchInFilter("metadata_storage_name", [resolvedName]);

      const searchBody = {
        search: "*",
        top: top || TOP_PER_PART,
        select: "metadata_storage_name,content",
        queryType: "simple",
        filter
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

    // Pull sources per part with char budget split across parts
    const partCount = quotaPlan.parts.length || 1;
    const perPartBudget = Math.max(800, Math.floor(MAX_SOURCE_CHARS_TOTAL / partCount));

    const partSources = [];
    const partDiag = [];

    for (const partName of quotaPlan.parts) {
      const sres = await runSearchForPart(partName, TOP_PER_PART);
      if (!sres.ok) {
        return send(context, 502, {
          error: "Search request failed (per-part)",
          status: sres.status,
          detail: sres.data,
          _diag: { partName, requestId }
        });
      }

      const hits = (sres.data && (sres.data.value || sres.data.values)) || [];
      const sources = compactSourcesLimit(hits, perPartBudget);

      partDiag.push({ partName, hits: hits.length, sourceChars: sources.length });
      partSources.push({ partName, sources });
    }

    const totalChars = partSources.reduce((sum, p) => sum + (p.sources ? p.sources.length : 0), 0);
    if (totalChars < 50) {
      return send(context, 404, {
        error: "No searchable content returned for selection",
        _diag: { requestId, parts: quotaPlan.parts, partDiag }
      });
    }

    // ======= AOAI =======
    const system =
      "You generate practice exams from provided sources.\n" +
      "Return ONLY valid JSON (no markdown, no code fences, no extra text).\n" +
      "Do not invent facts not present in the sources.\n" +
      "Every question must be answerable from the sources.\n" +
      "\n" +
      "QUALITY RULES:\n" +
      "- Do NOT write meta/navigation questions such as: 'Which chapter/section discusses...', 'In which part can you find...', 'What page...', 'Where is...', 'Which section contains...'.\n" +
      "- Prefer practical, content-based questions: definitions, requirements, procedures, concepts, correct applications, and common pitfalls.\n" +
      "\n" +
      "NO-REPEAT RULE:\n" +
      "- You will be given an EXCLUDE list of previously asked questions.\n" +
      "- Do NOT repeat any question that is the same or substantially similar to an excluded question.\n" +
      "- If you cannot produce enough unique questions, return a JSON object with items:[] AND include a message field explaining exhaustion.\n" +
      'If you cannot comply, return: {"items":[],"message":"No additional unique questions remain for this book based on the current indexed content."}';

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
            temperature: 0.25,
            response_format: { type: "json_object" },
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

    async function generateExact(batchCount, idOffset, sourcesText, attemptNoRepeat) {
      const schema = makeSchema(batchCount, idOffset);

      const excludeBlock =
        attemptNoRepeat && excludeQuestions.length
          ? `\n\nEXCLUDE (do NOT repeat these questions or close paraphrases):\n- ${excludeQuestions
              .slice(-250)
              .join("\n- ")}\n`
          : "\n";

      const user =
        `Create exactly ${batchCount} MCQs numbered ${idOffset + 1} to ${idOffset + batchCount}.\n` +
        `Use ONLY the sources below. Every question must cite the correct [source] label.\n` +
        `Avoid meta/navigation questions (chapters/sections/pages).\n` +
        excludeBlock +
        `\n${schema}\n\n` +
        `SOURCES:\n${sourcesText}`;

      const a1 = await callAoai(user);
      if (!a1.ok) return { ok: false, detail: a1.detail, raw: a1.raw };

      const parsed = a1.parsed;
      const items = parsed && parsed.items;
      const v = validateItems(items, batchCount);

      if (!v.ok) {
        return { ok: false, detail: v.reason, raw: a1.raw };
      }

      return { ok: true, items, message: parsed && parsed.message ? parsed.message : "" };
    }

    function filterNoRepeat(items) {
      const out = [];
      for (const q of items || []) {
        const nq = normQ(q && q.question);
        if (!nq) continue;
        if (excludeSet.has(nq)) continue;
        out.push(q);
      }
      return out;
    }

    // Build generation tasks per part (quota)
    const tasks = [];
    let idOffset = 0;

    for (let i = 0; i < quotaPlan.parts.length; i++) {
      const partName = quotaPlan.parts[i];
      const q = quotaPlan.quotas[i] || 0;
      if (q <= 0) continue;

      const src = partSources.find((p) => p.partName === partName);
      const sourcesText = src && src.sources ? src.sources : "";
      if (!sourcesText || sourcesText.length < 50) continue;

      tasks.push({ partName, n: q, idOffset });
      idOffset += q;
    }

    // If tasks empty, fall back to merged sources
    let allGenerated = [];
    let usedMode = "per-part-quotas";

    async function generateWithNoRepeat(countNeeded, sourcesText) {
      let acc = [];
      let attempt = 0;

      while (attempt < NOREPEAT_MAX_ATTEMPTS && acc.length < countNeeded) {
        attempt++;

        const want = countNeeded - acc.length;
        const b = await generateExact(want, 0, sourcesText, true);
        if (!b.ok) break;

        let got = Array.isArray(b.items) ? b.items : [];
        got = filterNoRepeat(got);

        // also dedupe within this run
        const seenHashes = new Set(acc.map(hashQ));
        for (const q of got) {
          const h = hashQ(q);
          if (!h || seenHashes.has(h)) continue;
          seenHashes.add(h);
          acc.push(q);
          if (acc.length >= countNeeded) break;
        }
      }

      return acc;
    }

    if (!tasks.length) {
      usedMode = "merged-fallback";
      const merged = partSources.map((p) => p.sources).filter(Boolean).join("\n\n");
      allGenerated = await generateWithNoRepeat(count, merged);
    } else {
      // Generate each part’s quota in mini-batches (up to 5) to avoid truncation
      for (const t of tasks) {
        let remaining = t.n;

        while (remaining > 0) {
          const n = remaining >= 5 ? 5 : remaining;

          const src = partSources.find((p) => p.partName === t.partName);
          const sourcesText = src && src.sources ? src.sources : "";
          if (!sourcesText || sourcesText.length < 50) break;

          const got = await generateWithNoRepeat(n, sourcesText);
          allGenerated = allGenerated.concat(got);

          // if we couldn't generate any new unique items for this part, stop early
          if (!got.length) break;

          remaining -= got.length;
        }
      }
    }

    // If we still don't have enough unique questions, return exhaustion message
    if (allGenerated.length < Math.min(5, count) && excludeQuestions.length) {
      return send(context, 200, {
        items: [],
        message: "No additional unique questions remain for this book based on the current indexed content.",
        modelDeployment: AOAI_DEPLOYMENT,
        returned: 0,
        _diag: { requestId, usedMode, count, partsUsed: quotaPlan.parts, quotas: quotaPlan.quotas, partDiag }
      });
    }

    // Normalize + shuffle answers + add ref + then shuffle questions
    const normalized = allGenerated
      .slice(0, count)
      .map((q) => {
        const cite = safeString(q.cite).replace(/^\[|\]$/g, "").trim();
        return {
          question: safeString(q.question),
          options: normalizeOptions(q.options),
          answer: safeString(q.answer).toUpperCase().trim(),
          cite,
          ref: cite,
          explanation: safeString(q.explanation)
        };
      })
      .map((q) => shuffleOptionsAndRemapAnswer(q, rand));

    const shuffled = normalized.slice();
    shuffleInPlace(shuffled, rand);

    const out = shuffled.map((q, i) => ({
      id: String(i + 1),
      type: "mcq",
      question: q.question,
      options: q.options,
      answer: q.answer,
      cite: q.cite,
      ref: q.ref,
      explanation: q.explanation
    }));

    return send(context, 200, {
      items: out,
      modelDeployment: AOAI_DEPLOYMENT,
      returned: out.length,
      _diag: {
        requestId,
        usedMode,
        count,
        partsProvided: parts.length,
        partsUsed: quotaPlan.parts,
        quotas: quotaPlan.quotas,
        partDiag,
        excludeCount: excludeQuestions.length
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
