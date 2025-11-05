// api/exam/index.js — orchestrates: search -> LLM -> questions
// Env required (in Function App settings):
//   SEARCH_ENDPOINT, SEARCH_INDEX, SEARCH_API_KEY
//   AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_API_KEY
//
// Returns: { ok:true, items:[ "...question 1...", "...question 2..." ], modelDeployment, sourceFiles }

const fetch = require("node-fetch");

const AZURE_SEARCH_API_VERSION = "2023-07-01-Preview";
const AZURE_OAI_API_VERSION    = "2024-06-01"; // chat/completions

module.exports = async function (context, req) {
  try {
    const book =
      (req.body && (req.body.book || req.body.fileName)) ||
      (req.query && (req.query.book || req.query.fileName));

    if (!book) {
      context.res = { status: 400, body: { error: "book required" } };
      return;
    }

    // ---- 1) Fetch doc(s) text from Azure AI Search (no searchFields; no $filter)
    const endpoint  = process.env.SEARCH_ENDPOINT;
    const indexName = process.env.SEARCH_INDEX;
    const apiKey    = process.env.SEARCH_API_KEY;

    if (!endpoint || !indexName || !apiKey) {
      throw new Error("Missing SEARCH_ENDPOINT / SEARCH_INDEX / SEARCH_API_KEY");
    }

    const searchUrl = `${endpoint}/indexes/${indexName}/docs/search?api-version=${AZURE_SEARCH_API_VERSION}`;
    const searchBody = {
      search: "*",
      queryType: "simple",
      searchMode: "any",
      top: 1000,
      select: "metadata_storage_name,content"
    };

    const sres = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(searchBody)
    });

    if (!sres.ok) {
      const text = await sres.text().catch(()=>"");
      throw new Error(`Search error: ${sres.status} ${text}`);
    }

    const sdata = await sres.json();
    const docsExact = (sdata.value || []).filter(
      d => (d.metadata_storage_name || "").toLowerCase() === String(book).toLowerCase()
    );
    const usedDocs = docsExact.length ? docsExact : (sdata.value || []).slice(0,1);
    if (!usedDocs.length) {
      context.res = { status: 404, body: { error: "Document not found in index", book } };
      return;
    }

    // ---- 2) Build prompt for LLM (trim/concat content to a safe length)
    const raw = usedDocs.map(d => d.content || "").join("\n\n").replace(/\u0000/g, "");
    // Keep ~10k chars to avoid token blowups
    const excerpt = raw.slice(0, 10000);

    const system = [
      "You are a roofing codes and standards exam generator.",
      "Create 50 questions mixed MCQ, True/False, and Short Answer.",
      "Format EXACTLY like this per question:",
      "1. MCQ: <question text>",
      "A. <option A>",
      "B. <option B>",
      "C. <option C>",
      "D. <option D>",
      "Answer: <letter or text>",
      "Why: <one sentence>",
      "Cites: <short source labels>",
      "",
      "For True/False:",
      "2. T/F: <statement>",
      "Answer: True",
      "Why: <one sentence>",
      "Cites: <...>",
      "",
      "For Short Answer:",
      "3. Short Answer: <prompt>",
      "Answer: <short text>",
      "Why: <one sentence>",
      "Cites: <...>",
      "",
      "Do not include anything else besides the numbered questions in the above format."
    ].join("\n");

    const user = [
      "Source excerpt (may be partial):",
      "-----",
      excerpt,
      "-----",
      "Generate 50 total questions now."
    ].join("\n");

    const aoaiEndpoint   = process.env.AZURE_OPENAI_ENDPOINT;      // e.g., https://<name>.openai.azure.com
    const aoaiDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;     // e.g., gpt-4o-mini / gpt-35-turbo etc (your deployed name)
    const aoaiKey        = process.env.AZURE_OPENAI_API_KEY;

    if (!aoaiEndpoint || !aoaiDeployment || !aoaiKey) {
      throw new Error("Missing AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_DEPLOYMENT / AZURE_OPENAI_API_KEY");
    }

    const chatUrl = `${aoaiEndpoint}/openai/deployments/${aoaiDeployment}/chat/completions?api-version=${AZURE_OAI_API_VERSION}`;
    const chatBody = {
      messages: [
        { role: "system", content: system },
        { role: "user",   content: user }
      ],
      temperature: 0.3,
      max_tokens: 4000
    };

    const cres = await fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": aoaiKey },
      body: JSON.stringify(chatBody)
    });

    if (!cres.ok) {
      const text = await cres.text().catch(()=>"");
      throw new Error(`AOAI error: ${cres.status} ${text}`);
    }

    const cdata = await cres.json();
    const content = cdata?.choices?.[0]?.message?.content || "";

    // ---- 3) Parse the model output into an items[] array (each item is a block string)
    const bodyText = content.replace(/^##\s*Exam\s*Output\s*/i,"").trim();
    const blocks = bodyText.split(/\n(?=\d+\.\s)/).map(s=>s.trim()).filter(Boolean);

    // If parsing fails, just return one block to avoid empty UI
    const items = blocks.length ? blocks : [
      "1. MCQ: Sanity question. Choose B.\nA. A\nB. B\nC. C\nD. D\nAnswer: B\nWhy: Check rendering.\nCites: Preview"
    ];

    const sourceFiles = [...new Set(usedDocs.map(d=>d.metadata_storage_name).filter(Boolean))].slice(0,20);

    context.res = {
      status: 200,
      body: {
        ok: true,
        items,
        modelDeployment: aoaiDeployment,
        sourceFiles,
        tookMs: undefined
      }
    };
  } catch (e) {
    context.res = { status: 500, body: { error: "Exam orchestrator error", details: String(e.message || e) } };
  }
};
