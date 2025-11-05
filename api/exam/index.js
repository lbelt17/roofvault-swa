// api/exam/index.js — robust: safe fetch, no searchFields, graceful AOAI fallback
// Returns { ok:true, items:[...], modelDeployment?, sourceFiles }

let _fetch = globalThis.fetch;
try { if (!_fetch) _fetch = require("node-fetch"); } catch {}
if (typeof _fetch !== "function") {
  throw new Error("No fetch available (global or node-fetch).");
}

const AZURE_SEARCH_API_VERSION = "2023-07-01-Preview";
const AZURE_OAI_API_VERSION    = "2024-06-01";

module.exports = async function (context, req) {
  try {
    const book =
      (req.body && (req.body.book || req.body.fileName)) ||
      (req.query && (req.query.book || req.query.fileName));

    if (!book) {
      context.res = { status: 400, body: { error: "book required" } };
      return;
    }

    // 1) Search for the doc (no searchFields; no $filter)
    const endpoint  = process.env.SEARCH_ENDPOINT;
    const indexName = process.env.SEARCH_INDEX;
    const apiKey    = process.env.SEARCH_API_KEY;

    if (!endpoint || !indexName || !apiKey) {
      context.res = { status: 500, body: { error: "Missing SEARCH_* env vars" } };
      return;
    }

    const searchUrl = `${endpoint}/indexes/${indexName}/docs/search?api-version=${AZURE_SEARCH_API_VERSION}`;
    const searchBody = { search: "*", queryType: "simple", searchMode: "any", top: 500, select: "metadata_storage_name,content" };

    const sres = await _fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(searchBody)
    });

    if (!sres.ok) {
      const text = await sres.text().catch(()=>"");
      context.res = { status: 500, body: { error: "Search error", details: `Search error: ${sres.status} ${text}` } };
      return;
    }

    const sdata = await sres.json();
    const docsExact = (sdata.value || []).filter(
      d => (d.metadata_storage_name || "").toLowerCase() === String(book).toLowerCase()
    );
    const usedDocs = docsExact.length ? docsExact : (sdata.value || []).slice(0, 1);
    if (!usedDocs.length) {
      context.res = { status: 404, body: { error: "Document not found in index", book } };
      return;
    }

    // 2) Build prompt input (limit length)
    const raw = usedDocs.map(d => d.content || "").join("\n\n").replace(/\u0000/g, "");
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

    const aoaiEndpoint   = process.env.AZURE_OPENAI_ENDPOINT;
    const aoaiDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const aoaiKey        = process.env.AZURE_OPENAI_API_KEY;

    // If AOAI envs missing, return a tiny sample so the UI renders (you can remove once vars are set)
    if (!aoaiEndpoint || !aoaiDeployment || !aoaiKey) {
      const sample = [
        "1. MCQ: Sanity question. Choose B.\nA. A\nB. B\nC. C\nD. D\nAnswer: B\nWhy: Check rendering.\nCites: Preview",
        "2. T/F: This should be True.\nAnswer: True\nWhy: Check rendering.\nCites: Preview",
        "3. Short Answer: Type TEST.\nAnswer: TEST\nWhy: Check rendering.\nCites: Preview"
      ];
      const sourceFiles = [...new Set(usedDocs.map(d=>d.metadata_storage_name).filter(Boolean))].slice(0,20);
      context.res = { status: 200, body: { ok: true, items: sample, modelDeployment: "(missing AOAI envs)", sourceFiles } };
      return;
    }

    // 3) Call Azure OpenAI
    const chatUrl = `${aoaiEndpoint}/openai/deployments/${aoaiDeployment}/chat/completions?api-version=${AZURE_OAI_API_VERSION}`;
    const chatBody = { messages: [ { role:"system", content: system }, { role:"user", content: user } ], temperature: 0.3, max_tokens: 4000 };

    const cres = await _fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": aoaiKey },
      body: JSON.stringify(chatBody)
    });

    if (!cres.ok) {
      const text = await cres.text().catch(()=>"");
      // Graceful fallback so UI still renders
      const sample = [
        "1. MCQ: Sanity question. Choose B.\nA. A\nB. B\nC. C\nD. D\nAnswer: B\nWhy: AOAI fallback.\nCites: Preview",
        "2. T/F: This should be True.\nAnswer: True\nWhy: AOAI fallback.\nCites: Preview",
        "3. Short Answer: Type TEST.\nAnswer: TEST\nWhy: AOAI fallback.\nCites: Preview"
      ];
      const sourceFiles = [...new Set(usedDocs.map(d=>d.metadata_storage_name).filter(Boolean))].slice(0,20);
      context.res = { status: 200, body: { ok: true, items: sample, modelDeployment: "(AOAI error fallback)", sourceFiles } };
      return;
    }

    const cdata = await cres.json();
    const content = cdata?.choices?.[0]?.message?.content || "";
    const bodyText = content.replace(/^##\s*Exam\s*Output\s*/i,"").trim();
    const blocks = bodyText.split(/\n(?=\d+\.\s)/).map(s=>s.trim()).filter(Boolean);
    const items = blocks.length ? blocks : [
      "1. MCQ: Sanity question. Choose B.\nA. A\nB. B\nC. C\nD. D\nAnswer: B\nWhy: Empty parse fallback.\nCites: Preview"
    ];

    const sourceFiles = [...new Set(usedDocs.map(d=>d.metadata_storage_name).filter(Boolean))].slice(0,20);

    context.res = { status: 200, body: { ok: true, items, modelDeployment: aoaiDeployment, sourceFiles } };
  } catch (e) {
    context.res = { status: 500, body: { error: "Exam orchestrator error", details: String(e.message || e) } };
  }
};
