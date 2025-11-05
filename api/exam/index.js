const fetch = require("node-fetch");

// --- Auto-detect AOAI config from your env ---
const ENDPOINT =
  process.env.AZURE_OPENAI_ENDPOINT ||
  process.env.OPENAI_ENDPOINT ||
  process.env.AOAI_ENDPOINT;

const DEPLOYMENT =
  process.env.AZURE_OPENAI_DEPLOYMENT ||
  process.env.OPENAI_GPT4O_MINI ||   // e.g. "gpt-4o-mini"
  process.env.AOAI_DEPLOYMENT ||     // e.g. "gpt-4o-mini"
  process.env.OPENAI_GPT41;          // e.g. "roofvault-turbo"

const AOAI_KEY =
  process.env.AZURE_OPENAI_API_KEY ||
  process.env.AOAI_API_KEY ||
  process.env.OPENAI_API_KEY;

// Azure Search
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX    = process.env.SEARCH_INDEX;
const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

// Helpers
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

function clientFilter(docs, field, value) {
  if (!field || !value) return docs;
  const needle = String(value).toLowerCase();
  return docs.filter(d => {
    const raw = d[field] || d.title || d.file || d.url || "";
    return String(raw).toLowerCase().includes(needle);
  });
}

async function searchPassages(filterField, filterValue, query) {
  if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
    throw new Error("Missing SEARCH_ENDPOINT/SEARCH_INDEX/SEARCH_API_KEY app settings.");
  }

  // Try semantic; fall back to simple; then client-side filter.
  let body = {
    queryType: "semantic",
    search: (query && query.trim()) ? query : "*",
    top: 20,
    semanticConfiguration: "default",
    captions: "extractive",
    answers: "extractive",
    filter: makeFilter(filterField, filterValue)
  };

  let r = await doSearch(body);
  if (!r.ok) {
    body = { queryType: "simple", search: (query && query.trim()) ? query : "*", top: 20, filter: makeFilter(filterField, filterValue) };
    r = await doSearch(body);
    if (!r.ok) {
      delete body.filter;
      r = await doSearch(body);
      if (!r.ok) throw new Error(`Search error: ${r.status} ${await r.text()}`);
      const data = await r.json();
      const docs = (data.value || []).map(normalize);
      return clientFilter(docs, filterField, filterValue);
    }
  }

  const data = await r.json();
  return (data.value || []).map(normalize);
}

function makeGrounding(passages) {
  // Short, clean grounding for the model to cite from.
  return passages.map((p,i) => ({
    id: i + 1,
    title: p.title || p.file || "Untitled",
    page: p.page || null,
    url: p.url || null,
    excerpt: (p.content || "").slice(0, 1800) // keep token use modest
  }));
}

module.exports = async function (context, req) {
  try {
    const { book, filterField, query } = req.body || {};

    if (!ENDPOINT)  throw new Error("Missing Azure OpenAI endpoint.");
    if (!DEPLOYMENT) throw new Error("Missing Azure OpenAI deployment.");
    if (!AOAI_KEY)   throw new Error("Missing Azure OpenAI key.");

    // 1) Pull passages from Azure Search
    const passages = await searchPassages(filterField, book, query);
    const grounding = makeGrounding(passages);

    // 2) Build JSON-first prompt
    const system = {
      role: "system",
      content:
`You are an exam generator for roofing and waterproofing professional practice.

Return STRICT JSON with this schema:
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
- Vary difficulty; keep questions precise and unambiguous.
- Rationale must be one or two sentences max.
- Citations should reference the most relevant passage(s) by title and page when available.
- NO prose outside the JSON.`
    };

    const user = {
      role: "user",
      content: JSON.stringify({
        selection: { field: filterField || "(none)", value: book || "(all)" },
        sources: grounding
      })
    };

    // 3) Call AOAI with JSON response enforced
    const url = `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`;
    const payload = {
      messages: [system, user],
      temperature: 0.4,
      max_tokens: 6000,
      response_format: { type: "json_object" }
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": AOAI_KEY },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      throw new Error(`AOAI error: ${r.status} ${t}`);
    }

    const data = await r.json();
    let parsed;
    try {
      parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    } catch {
      // Fallback: if model misbehaved, wrap as single text item
      parsed = { items: [] };
    }

    if (!Array.isArray(parsed.items) || parsed.items.length !== 50) {
      // Soft guard: try to coerce if items missing or length wrong
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        parsed.items = parsed.items.slice(0, 50);
      } else {
        parsed.items = [];
      }
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { items: parsed.items, modelDeployment: DEPLOYMENT }
    };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: { error: e.message } };
  }
};
