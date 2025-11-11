const { OpenAIClient, AzureKeyCredential: AOAICred } = require("@azure/openai");
const { SearchClient, AzureKeyCredential: SearchCred } = require("@azure/search-documents");

// ENV VARS
const {
  AOAI_ENDPOINT,          // e.g. https://theroofvaultopenai1.openai.azure.com/
  AOAI_KEY,
  AOAI_DEPLOYMENT,        // e.g. roofvault-turbo
  SEARCH_ENDPOINT,        // e.g. https://roofvaultsearch.search.windows.net
  SEARCH_KEY,
  SEARCH_INDEX            // e.g. azureblob-index
} = process.env;

// Small CORS helper
function cors(body, status = 200) {
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

// Validate env (without leaking secrets)
function validateEnv(context) {
  const all = {
    AOAI_ENDPOINT, AOAI_KEY, AOAI_DEPLOYMENT,
    SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX
  };
  const missing = Object.entries(all)
    .filter(([k, v]) => !v || !String(v).trim())
    .map(([k]) => k);

  // Log what we see (booleans only)
  const seen = Object.fromEntries(
    Object.entries(all).map(([k, v]) => [k, !!(v && String(v).trim())])
  );
  context.log("[rvchat] env seen:", seen);

  return { missing, seen };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = cors({ ok: true });
    return;
  }

  const { missing, seen } = validateEnv(context);
  if (missing.length) {
    context.res = cors({
      ok: false,
      error: "Missing required environment variables.",
      missing,
      seen
    }, 500);
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
      context.res = cors({ ok: false, error: "No question provided." }, 400);
      return;
    }

    // 2) Search top documents from Azure AI Search
    const searchClient = new SearchClient(
      SEARCH_ENDPOINT,
      SEARCH_INDEX,
      new SearchCred(SEARCH_KEY)
    );

    const results = searchClient.search(question, {
      top: 6,
      includeTotalCount: false,
      queryType: "simple"
    });

    const snippets = [];
    for await (const r of results) {
      const text = (r.document.content || "").toString().slice(0, 1200);
      const src = r.document.source || r.document.file || r.document.book || "unknown";
      const page = r.document.page || r.document.pageno || r.document.pageNumber || null;
      if (text.trim()) snippets.push({ text, source: src, page });
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
    ], { temperature: 0.2, maxTokens: 900 });

    const answer =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "No answer generated.";

    // 4) Return structured payload
    context.res = cors({
      ok: true,
      question,
      answer,
      sources: snippets.map((s, i) => ({ id: i + 1, source: s.source, page: s.page })),
      envSeen: seen  // booleans only; safe for debugging
    });
  } catch (e) {
    context.log.error("[rvchat] Error:", e);
    context.res = cors({ ok: false, error: String(e?.message || e) }, 500);
  }
};
