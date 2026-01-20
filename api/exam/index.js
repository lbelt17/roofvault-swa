// api/exam/index.js
// RoofVault /api/exam — multi-part guaranteed + fresh mixes + NO-REPEAT support
//
// Guarantees:
// - Uses ALL body.parts (no baseTitle keyword guessing when parts provided)
// - Pulls sources PER PART and generates questions PER PART using quotas (fair distribution)
// - Adds ref = cite so UI shows correct Part label
// - Shuffles answer choices and remaps correct answer (A/B/C/D distributed)
// - Supports excludeQuestions (client memory) and avoids repeats across "New 25Q" attempts
// - Avoids "chapter/section/page/where is..." meta questions
// - If exhausted, returns items:[] with a professional message

const crypto = require("crypto");

// ---- fetch (polyfill safety) ----
let fetchFn = globalThis.fetch;
try {
  if (!fetchFn) fetchFn = require("node-fetch");
} catch (_) {
  // If node-fetch isn't available, Azure Functions Node 18+ should have fetch.
}
const fetch = (...args) => fetchFn(...args);

// ======= CONFIG =======
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;

const TOP_PER_PART = 40; // chunks per part
const MAX_SOURCE_CHARS_TOTAL = 11000; // total chars fed to model (split across parts)

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
  const isNoContent = status === 204;
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      ...extraHeaders
    },
    body: isNoContent ? "" : obj
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

// Normalize question for no-repeat comparisons
function normQ(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\?\.\,\-]/g, "")
    .trim();
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
        // treat as text
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

// Build compact sources string capped to limit chars
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

// Seeded rng for freshness
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
  const newOptions = indexed.map((x, i) => ({ id: letters[i], text: String(x.opt.text || "") }));

  return { ...item, options: newOptions, answer: letters[newCorrectIndex] };
}

// Quotas: distribute count across parts fairly, shuffle part order per attempt
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

// Safe parse req.body if it arrives as string
function parseBody(req) {
  const b = req && req.body;
  if (!b) return {};
  if (typeof b === "object") return b;
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return {};
}

// ======= MAIN =======
module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") return send(context, 204, "");
    if (req.method === "GET") {
      return send(context, 200, { ok: true, name: "exam", time: new Date().toISOString() });
    }

    // ---- ENV (support both your "debug" env names and older names) ----
    const SEARCH_ENDPOINT =
      process.env.SEARCH_ENDPOINT || process.env.AZURE_SEARCH_ENDPOINT || process.env.SEARCH_SERVICE_ENDPOINT;

    const SEARCH_API_KEY =
      process.env.SEARCH_API_KEY || process.env.AZURE_SEARCH_API_KEY || process.env.SEARCH_ADMIN_KEY;

    // Your deployed env shows SEARCH_INDEX, not SEARCH_INDEX_CONTENT
    const SEARCH_INDEX_CONTENT =
      process.env.SEARCH_INDEX_CONTENT || process.env.SEARCH_INDEX || "azureblob-index-content";

    // Your deployed env shows AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_DEPLOYMENT
    const AOAI_ENDPOINT = process.env.AOAI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
    const AOAI_API_KEY =
      process.env.AOAI_API_KEY || process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    const AOAI_DEPLOYMENT =
      process.env.AOAI_DEPLOYMENT ||
      process.env.AZURE_OPENAI_DEPLOYMENT ||
      process.env.EXAM_OPENAI_DEPLOYMENT ||
      "gpt-4o-mini";

    const AOAI_API_VERSION =
      process.env.AOAI_API_VERSION || process.env.OPENAI_API_VERSION || "2024-06-01";

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) {
      return send(context, 500, {
        error: "Missing SEARCH_ENDPOINT or SEARCH_API_KEY",
        _diag: { hasSearchEndpoint: !!SEARCH_ENDPOINT, hasSearchKey: !!SEARCH_API_KEY }
      });
    }
    if (!AOAI_ENDPOINT || !AOAI_API_KEY) {
      return send(context, 500, {
        error: "Missing AOAI endpoint/key (AOAI_ENDPOINT/AZURE_OPENAI_ENDPOINT and AOAI_API_KEY/AZURE_OPENAI_API_KEY)",
        _diag: { hasAoaiEndpoint: !!AOAI_ENDPOINT, hasAoaiKey: !!AOAI_API_KEY }
      });
    }

    const body = parseBody(req);

    const count = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    const attemptNonce = safeString(body.attemptNonce || "");
    const requestId =
      (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex")) +
      (attemptNonce ? `-${attemptNonce}` : "");

    const partsRaw = Array.isArray(body.parts) ? body.parts : [];
    const parts = partsRaw.map((p) => String(p).trim()).filter(Boolean);

    if (!parts.length) {
      return send(context, 400, { error: 'Provide {parts:["Book - Part 01", ...]}' });
    }

    // NO-REPEAT input (cap to prevent giant prompts)
    const excludeQuestionsRaw = Array.isArray(body.excludeQuestions) ? body.excludeQuestions : [];
    const excludeQuestions = excludeQuestionsRaw.map(normQ).filter(Boolean).slice(-120);
    const excludeSet = new Set(excludeQuestions);

    const rand = seededRng(requestId);
    const quotaPlan = buildQuotas(parts, count, rand);

    const searchUrl =
      `${String(SEARCH_ENDPOINT).replace(/\/+$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}` +
      `/docs/search?api-version=2023-11-01`;

    async function runSearchForPart(partName, top) {
      // Resolve real metadata_storage_name to avoid slug/case mismatch
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
          headers: { "Content-Type": "application/json", "api-key": SEARCHSEARCH_API_KEY(SEARCH_API_KEY) },
          body: JSON.stringify(resolveBody)
        },
        SEARCH_TIMEOUT_MS
      );

      let resolvedName = partName;

      if (resolveRes.ok) {
        const vals = (resolveRes.data && (resolveRes.data.value || resolveRes.data.values)) || [];
        const targetLower = String(partName).toLowerCase();
        const exact = vals.find((h) => String(h.metadata_storage_name || "").toLowerCase() === targetLower);
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

    // Pull sources per part with total budget split across parts
    const partCount = quotaPlan.parts.length || 1;
    const perPartBudget = Math.max(900, Math.floor(MAX_SOURCE_CHARS_TOTAL / partCount));

    const partSources = [];
    const partDiag = [];

    for (const partName of quotaPlan.parts) {
      const sres = await runSearchForPart(partName, TOP_PER_PART);
      if (!sres.ok) {
        return send(context, 502, {
          error: "Search request failed (per-part)",
          status: sres.status,
          detail: sres.data,
          _diag: { partName, requestId, index: SEARCH_INDEX_CONTENT }
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
        _diag: { requestId, parts: quotaPlan.parts, partDiag, index: SEARCH_INDEX_CONTENT }
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
      'If you cannot comply, return: {"items":[],"message":"No additional unique questions remain for this book based on the current indexed content."}';

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
      `${String(AOAI_ENDPOINT).replace(/\/+$/, "")}` +
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

    function filterNoRepeats(items) {
      const out = [];
      for (const q of items || []) {
        const nq = normQ(q?.question);
        if (!nq) continue;
        if (excludeSet.has(nq)) continue;
        excludeSet.add(nq); // prevent duplicates within the same response too
        out.push(q);
      }
      return out;
    }

    async function generateExact(batchCount, idOffset, sourcesText) {
      const schema = makeSchema(batchCount, idOffset);

      const excludePreview =
        excludeQuestions.length > 0
          ? `\n\nEXCLUDE (do not repeat these questions):\n- ${excludeQuestions.slice(-60).join("\n- ")}\n`
          : "\n\nEXCLUDE: (none)\n";

      const user =
        `Create exactly ${batchCount} MCQs numbered ${idOffset + 1} to ${idOffset + batchCount}.\n` +
        `Use ONLY the sources below. Every question must cite the correct [source] label.\n` +
        `Do NOT write chapter/section navigation questions.\n` +
        excludePreview +
        `\n${schema}\n\nSOURCES:\n${sourcesText}`;

      // attempt 1
      const a1 = await callAoai(user);
      if (!a1.ok) return { ok: false, detail: a1.detail, raw: a1.raw };

      let items = a1.parsed && a1.parsed.items;
      items = filterNoRepeats(items);

      // If the model gave fewer because of exclude, retry once asking for more unique ones
      if (!Array.isArray(items) || items.length < batchCount) {
        const needed = batchCount;
        const repair =
          `Your previous output did not contain enough UNIQUE questions.\n` +
          `Return ONLY valid JSON and EXACTLY ${needed} UNIQUE items.\n` +
          `Do NOT repeat any excluded questions.\n` +
          `${schema}\n\n` +
          `EXCLUDE (do not repeat):\n- ${excludeQuestions.slice(-60).join("\n- ")}\n\n` +
          `SOURCES:\n${sourcesText}`;

        const a2 = await callAoai(repair);
        if (a2.ok) {
          let items2 = a2.parsed && a2.parsed.items;
          items2 = filterNoRepeats(items2);

          if (Array.isArray(items2) && items2.length >= batchCount) {
            return { ok: true, items: items2.slice(0, batchCount) };
          }
        }

        // exhausted for this part
        return { ok: true, items: [] };
      }

      return { ok: true, items: items.slice(0, batchCount) };
    }

    // Build per-part tasks by quota
    const tasks = [];
    let idOffset = 0;
    for (let i = 0; i < quotaPlan.parts.length; i++) {
      const partName = quotaPlan.parts[i];
      const qCount = quotaPlan.quotas[i] || 0;
      if (qCount <= 0) continue;

      const src = partSources.find((p) => p.partName === partName);
      const sourcesText = src && src.sources ? src.sources : "";
      if (!sourcesText || sourcesText.length < 50) continue;

      tasks.push({ partName, n: qCount, idOffset });
      idOffset += qCount;
    }

    let allGenerated = [];
    let usedMode = "per-part-quotas";

    if (!tasks.length) {
      usedMode = "merged-fallback";
      const merged = partSources.map((p) => p.sources).filter(Boolean).join("\n\n");
      const b = await generateExact(count, 0, merged);
      if (!b.ok) {
        return send(context, 500, {
          error: "Model returned invalid output",
          detail: b.detail || "batch failed",
          raw: b.raw,
          _diag: { requestId, deployment: AOAI_DEPLOYMENT, usedMode, partDiag }
        });
      }
      allGenerated = b.items;
    } else {
      // mini-batches of 5 to avoid truncation
      for (const t of tasks) {
        let remaining = t.n;
        let localOffset = t.idOffset;

        while (remaining > 0) {
          const n = remaining >= 5 ? 5 : remaining;

          const src = partSources.find((p) => p.partName === t.partName);
          const sourcesText = src && src.sources ? src.sources : "";

          const b = await generateExact(n, localOffset, sourcesText);
          if (!b.ok) {
            return send(context, 500, {
              error: "Model returned invalid output",
              detail: b.detail || "batch failed",
              raw: b.raw,
              _diag: { requestId, deployment: AOAI_DEPLOYMENT, usedMode, task: t, partDiag }
            });
          }

          allGenerated = allGenerated.concat(b.items);
          remaining -= n;
          localOffset += n;
        }
      }
    }

    // If we couldn't get enough unique items, return professional exhaustion message
    if (!Array.isArray(allGenerated) || allGenerated.length < 1) {
      return send(context, 200, {
        items: [],
        message: "No additional unique questions remain for this book based on the current indexed content.",
        modelDeployment: AOAI_DEPLOYMENT,
        returned: 0,
        _diag: { requestId, usedMode, count, partsUsed: quotaPlan.parts, quotas: quotaPlan.quotas, partDiag }
      });
    }

    // Normalize + shuffle answers + add ref
    const finalItems = allGenerated
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

    // Shuffle question order for variety, then assign ids
    const shuffled = finalItems.slice();
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
        excludeCount: excludeQuestions.length,
        partDiag,
        index: SEARCH_INDEX_CONTENT
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

// Small helper to avoid accidental typo usage in headers (keeps linter happy in some setups)
function SEARCH_API_KEY(_) {
  return _;
}
