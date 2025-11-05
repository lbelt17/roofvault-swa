const fetch = require("node-fetch");
const AZURE_OPENAI_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_KEY    = process.env.AZURE_OPENAI_API_KEY;   // <-- NEW
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX    = process.env.SEARCH_INDEX;
const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

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

  // Try semantic first; fall back to simple; then client-side filtering if needed.
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
  const docs = (data.value || []).map(normalize);
  return docs;
}

function groundingBlock(passages) {
  if (!passages || passages.length === 0) return "";
  const items = passages.map((p, i) => {
    const where = [p.book, p.title, p.page || "", p.file || ""].filter(Boolean).join(" · ");
    return `(${i + 1}) ${where}\n${p.content}`;
  }).join("\n\n---\n\n");
  return `

=== SOURCE PASSAGES (selected filter) ===
${items}

=== END SOURCES ===
`;
}

module.exports = async function (context, req) {
  try {
    const { book, filterField, query } = req.body || {};

    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_DEPLOYMENT) {
      throw new Error("Missing AZURE_OPENAI_ENDPOINT/AZURE_OPENAI_DEPLOYMENT app settings.");
    }
    if (!AZURE_OPENAI_API_KEY) {
      throw new Error("Missing AZURE_OPENAI_API_KEY app setting.");
    }

    const passages = await searchPassages(filterField, book, query);

    const system = {
      role: "system",
      content:
`You are an exam generator for roofing and waterproofing professional practice.
Generate EXACTLY 50 study questions based ONLY on the selected source set.

Rules:
- Mix question types: [MCQ], [T/F], and [Short].
- For [MCQ], include 1 correct answer and 3 plausible distractors labeled A–D.
- Keep questions precise; avoid ambiguity.
- After the 50 questions, include an "Answer Key" listing Q# and the correct answer only.
- If sources are insufficient for certain topics, state that briefly at the end.`
    };

    const user = {
      role: "user",
      content: `Selected filter: ${filterField || "(none)"} = ${book || "(all)"}\nGenerate the 50-question exam now.${groundingBlock(passages)}`
    };

    const payload = { messages: [system, user], temperature: 0.4, max_tokens: 4000 };

    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY        // <-- NEW (fixes 401)
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      throw new Error(`AOAI error: ${r.status} ${t}`);
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "(no content)";
    const modelDeployment = AZURE_OPENAI_DEPLOYMENT;

    context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { content, modelDeployment } };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: { error: e.message } };
  }
};
