const fetch = require("node-fetch");

// Required app settings (we'll set them next step if not already set)
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;   // e.g. https://<aoai>.openai.azure.com
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT; // your chat model deployment name
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;               // e.g. https://<search>.search.windows.net
const SEARCH_INDEX = process.env.SEARCH_INDEX;                     // e.g. roofvault
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;                 // Query key (not admin)

async function searchPassages(book, query) {
  if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
    throw new Error("Missing SEARCH_ENDPOINT/SEARCH_INDEX/SEARCH_API_KEY app settings.");
  }

  const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;

  const body = {
    queryType: "semantic",
    search: (query && query.trim()) ? query : "*",
    top: 12,
    semanticConfiguration: "default",
    captions: "extractive",
    answers: "extractive",
    select: "content, title, page, book, url",
    filter: book ? `book eq '${String(book).replace(/'/g, "''")}'` : undefined
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": SEARCH_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Search error: ${r.status} ${t}`);
  }

  const data = await r.json();
  return (data.value || []).map(x => ({
    title: x.title,
    page: x.page,
    book: x.book,
    url: x.url,
    content: x.content
  }));
}

function groundingBlock(passages) {
  if (!passages || passages.length === 0) return "";
  const items = passages.map((p, i) => {
    const where = [p.book, p.title, p.page].filter(Boolean).join(" · ");
    return `(${i + 1}) ${where}\n${p.content}`;
  }).join("\n\n---\n\n");
  return `

=== SOURCE PASSAGES (selected book) ===
${items}

=== END SOURCES ===
`;
}

module.exports = async function (context, req) {
  try {
    const { book, query } = req.body || {};

    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_DEPLOYMENT) {
      throw new Error("Missing AZURE_OPENAI_ENDPOINT/AZURE_OPENAI_DEPLOYMENT app settings.");
    }

    // Get some seed passages, strictly filtered to the requested book (if provided)
    const passages = await searchPassages(book, query);

    const system = {
      role: "system",
      content:
`You are an exam generator for roofing and waterproofing professional practice.
Generate EXACTLY 50 study questions based ONLY on the selected book's content.

Rules:
- Mix question types: [MCQ], [T/F], and [Short].
- For [MCQ], include 1 correct answer and 3 plausible distractors labeled A–D.
- Keep questions precise; avoid ambiguity.
- After the 50 questions, include an "Answer Key" listing Q# and the correct answer only.
- If sources are insufficient for certain topics, state that briefly at the end.`
    };

    const user = {
      role: "user",
      content: `Selected book: ${book || "(none specified)"}\nGenerate the 50-question exam now.${groundingBlock(passages)}`
    };

    const payload = {
      messages: [system, user],
      temperature: 0.4,
      max_tokens: 4000
    };

    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      throw new Error(`AOAI error: ${r.status} ${t}`);
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "(no content)";
    const modelDeployment = AZURE_OPENAI_DEPLOYMENT;

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { content, modelDeployment }
    };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: { error: e.message } };
  }
};
