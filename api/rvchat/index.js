const { OpenAIClient, AzureKeyCredential: AOAICred } = require("@azure/openai");
const { SearchClient, AzureKeyCredential: SearchCred } = require("@azure/search-documents");

// ENV VARS (set these in SWA config or GitHub secrets; see notes below)
const {
  AOAI_ENDPOINT,          // e.g. https://<your-aoai>.openai.azure.com/
  AOAI_KEY,
  AOAI_DEPLOYMENT,        // e.g. roofvault-turbo
  SEARCH_ENDPOINT,        // e.g. https://<your-search>.search.windows.net
  SEARCH_KEY,
  SEARCH_INDEX            // e.g. roofvault-index
} = process.env;

// Small CORS helper
function cors(res, body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = cors({}, { ok: true });
    return;
  }

  try {
    // 1) Parse input
    const body = (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const question =
      body.question ||
      (messages.length ? (messages[messages.length - 1].content || "") : "");

    if (!question) {
      context.res = cors({}, { ok: false, error: "No question provided." }, 400);
      return;
    }

    // 2) Search top documents from Azure AI Search
    const searchClient = new SearchClient(
      SEARCH_ENDPOINT,
      SEARCH_INDEX,
      new SearchCred(SEARCH_KEY)
    );

    // Simple keyword search; you can swap to semantic or vector later
    const results = searchClient.search(question, {
      top: 6,
      includeTotalCount: false,
      queryType: "simple"
    });

    const snippets = [];
    for await (const r of results) {
      // Adjust field names if your index differs
      const text = (r.document.content || "").toString().slice(0, 1200);
      const src = r.document.source || r.document.file || r.document.book || "unknown";
      const page = r.document.page || r.document.pageno || r.document.pageNumber || null;
      if (text.trim()) {
        snippets.push({ text, source: src, page });
      }
    }

    const sourcesBlock = snippets
      .map((s, i) => `[[${i + 1}]] Source: ${s.source}${s.page ? ` (p.${s.page})` : ""}\n${s.text}`)
      .join("\n\n");

    const systemPrompt = [
      "You are RoofVault AI, a roofing standards assistant.",
      "Answer ONLY from the provided sources (NRCA, IIBEC, ASTM, etc.).",
      "If the answer is not clearly supported, say you are unsure and suggest the most relevant source sections.",
      "Cite sources inline using [#] matching the list below."
    ].join(" ");

    const userPrompt = [
      `Question: ${question}`,
      "",
      "Sources:",
      sourcesBlock || "(no sources found)"
    ].join("\n");

    // 3) Call Azure OpenAI (chat)
    const aoai = new OpenAIClient(AOAI_ENDPOINT, new AOAICred(AOAI_KEY));
    const completion = await aoai.getChatCompletions(AOAI_DEPLOYMENT, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], {
      temperature: 0.2,
      maxTokens: 900
    });

    const answer =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "No answer generated.";

    // 4) Return structured payload
    context.res = cors({}, {
      ok: true,
      question,
      answer,
      sources: snippets.map((s, i) => ({
        id: i + 1,
        source: s.source,
        page: s.page
      }))
    });
  } catch (e) {
    context.res = cors({}, {
      ok: false,
      error: String(e?.message || e)
    }, 500);
  }
};
