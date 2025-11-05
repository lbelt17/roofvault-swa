const fetch = require("node-fetch");

// --- AOAI config (auto detect) ---
const ENDPOINT =
  process.env.AZURE_OPENAI_ENDPOINT ||
  process.env.OPENAI_ENDPOINT ||
  process.env.AOAI_ENDPOINT;

const DEPLOYMENT =
  process.env.AZURE_OPENAI_DEPLOYMENT ||
  process.env.OPENAI_GPT4O_MINI ||
  process.env.AOAI_DEPLOYMENT ||
  process.env.OPENAI_GPT41;

const AOAI_KEY =
  process.env.AZURE_OPENAI_API_KEY ||
  process.env.AOAI_API_KEY ||
  process.env.OPENAI_API_KEY;

// Azure Search
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX    = process.env.SEARCH_INDEX;
const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

// ---------------- helpers ----------------
function makeFilter(field, value) {
  if (!field || !value) return undefined;
  const safe = String(value).replace(/'/g, "''");
  return `${field} eq '${safe}'`;
}

async function doSearch(body) {
  const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
    body: JSON.stringify(body)
  });
  return r;
}

function normalize(doc) {
  return {
    title: doc.title,
    page: doc.page,
    book: doc.book,
    url: doc.url,
    content: doc.content,
    file: doc.file || doc.filename || doc.name || doc.metadata_storage_name
  };
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (!seen.has(k)) { seen.add(k); out.push(x); }
  }
  return out;
}
function mergeLimit(passagesList, n = 30) {
  const merged = uniqBy([].concat(...passagesList), p => (p.title||"")+"|"+(p.page||"")+"|"+(p.file||""));
  return merged.slice(0, n);
}

async function retrievePassages(filterField, filterValue, query) {
  if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
    throw new Error("Missing SEARCH_ENDPOINT/SEARCH_INDEX/SEARCH_API_KEY app settings.");
  }

  const attempts = [];

  // A) Server-side filter
  if (filterField && filterValue) {
    for (const mode of ["semantic","simple"]) {
      const body = {
        queryType: mode,
        search: (query && query.trim()) ? query : "*",
        top: 30,
        ...(mode === "semantic" ? { semanticConfiguration:"default", captions:"extractive", answers:"extractive" } : {}),
        filter: makeFilter(filterField, filterValue)
      };
      try {
        const r = await doSearch(body);
        if (r.ok) {
          const data = await r.json();
          attempts.push((data.value || []).map(normalize));
        }
      } catch {}
    }
  }

  // B) Exact phrase of the selected value (often filename)
  if (filterValue) {
    for (const mode of ["semantic","simple"]) {
      const body = {
        queryType: mode,
        search: `"${filterValue}"`,
        top: 30,
        ...(mode === "semantic" ? { semanticConfiguration:"default", captions:"extractive", answers:"extractive" } : {})
      };
      try {
        const r = await doSearch(body);
        if (r.ok) {
          const data = await r.json();
          attempts.push((data.value || []).map(normalize));
        }
      } catch {}
    }
  }

  // C) Fuzzy keywords
  if (filterValue) {
    for (const mode of ["semantic","simple"]) {
      const body = {
        queryType: mode,
        search: String(filterValue).replace(/[_\-]/g, " "),
        top: 30,
        ...(mode === "semantic" ? { semanticConfiguration:"default", captions:"extractive", answers:"extractive" } : {})
      };
      try {
        const r = await doSearch(body);
        if (r.ok) {
          const data = await r.json();
          attempts.push((data.value || []).map(normalize));
        }
      } catch {}
    }
  }

  return mergeLimit(attempts, 30);
}

function makeGrounding(passages) {
  return passages.map((p,i) => ({
    id: i + 1,
    title: p.title || p.file || "Untitled",
    page: p.page || null,
    url: p.url || null,
    excerpt: (p.content || "").slice(0, 2000)
  }));
}

function systemPrompt() {
  return {
    role: "system",
    content:
`You are an exam generator for roofing and waterproofing professional practice.

Return STRICT JSON with this shape:
{
  "items":[
    {
      "question": string,
      "choices": {"A":string,"B":string,"C":string,"D":string},
      "answer": "A"|"B"|"C"|"D",
      "rationale": string,
      "citations": [{"title":string,"page":string|null,"url":string|null}]
    }
  ]
}
Rules:
- Generate EXACTLY 50 items.
- Base EVERY item ONLY on the provided source passages.
- Rationale must be one or two sentences max.
- Citations should reference the most relevant passage(s) by title and page when available.
- Output ONLY JSON, no extra text.`
  };
}

// Find the first {...} JSON object in a string
function extractJsonObject(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  if (start < 0) return null;
  // crude bracket matching
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = text.slice(start, i + 1);
        try { return JSON.parse(candidate); } catch {}
      }
    }
  }
  return null;
}

async function callAOAI(messages, maxTokens=6000) {
  const url = `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`;
  const payload = {
    messages,
    temperature: 0.4,
    max_tokens: maxTokens
    // NOTE: No response_format to avoid 400/500s on some AOAI configs.
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": AOAI_KEY },
    body: JSON.stringify(payload)
  });
  const raw = await r.text();
  if (!r.ok) {
    throw new Error(`AOAI error: ${r.status} ${raw}`);
  }
  // Parse the chat response
  let content = null;
  try {
    const data = JSON.parse(raw);
    content = data?.choices?.[0]?.message?.content || "";
  } catch {
    // If AOAI returned non-JSON (shouldn't happen), just propagate
    content = raw;
  }
  // Try direct JSON first, then fallback to extract
  try {
    return JSON.parse(content);
  } catch {
    const extracted = extractJsonObject(content);
    return extracted || {};
  }
}

module.exports = async function (context, req) {
  try {
    const { book, filterField, query } = req.body || {};

    if (!ENDPOINT)  throw new Error("Missing Azure OpenAI endpoint.");
    if (!DEPLOYMENT) throw new Error("Missing Azure OpenAI deployment.");
    if (!AOAI_KEY)   throw new Error("Missing Azure OpenAI key.");

    const passages = await retrievePassages(filterField, book, query);
    const grounding = makeGrounding(passages);

    const baseUser = {
      role: "user",
      content: JSON.stringify({
        selection: { field: filterField || "(none)", value: book || "(all)" },
        sources: grounding
      })
    };

    // Call once; if empty, retry with a stronger hint
    let parsed = await callAOAI([systemPrompt(), baseUser]);

    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      const retryUser = {
        role: "user",
        content: JSON.stringify({
          selection: { field: filterField || "(none)", value: book || "(all)" },
          sources: grounding,
          note: "Previous attempt returned 0. You MUST output exactly 50 items strictly based on the provided sources."
        })
      };
      parsed = await callAOAI([systemPrompt(), retryUser]);
    }

    const items = Array.isArray(parsed.items) ? parsed.items.slice(0, 50) : [];

    if (items.length === 0) {
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          items: [],
          modelDeployment: DEPLOYMENT,
          error: "No items generated. Try another book or re-index to ensure passages exist."
        }
      };
      return;
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { items, modelDeployment: DEPLOYMENT }
    };
  } catch (e) {
    // Return a detailed error body so the browser shows it
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error: e.message,
        hint: "Check AOAI endpoint/deployment/key, and ensure your selected book returns passages from Azure Search."
      }
    };
  }
};
