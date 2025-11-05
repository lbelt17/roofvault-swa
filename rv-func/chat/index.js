/**
 * Minimal RAG HTTP endpoint
 * GET/POST /api/chat?q=your+question
 * Body alternative: { "q": "your question" }
 */
module.exports = async function (context, req) {
  try {
    const question = (req.query && req.query.q) || (req.body && req.body.q);
    if (!question) {
      context.res = { status: 400, body: "Missing question parameter 'q'." };
      return;
    }

    // Env config (set in App Settings)
    const OPENAI_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT;
    const OPENAI_API_KEY    = process.env.AZURE_OPENAI_API_KEY;
    const OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "roofvault-turbo";
    const OPENAI_API_VER    = process.env.AZURE_OPENAI_API_VERSION || "2024-05-01-preview";

    const SEARCH_ENDPOINT   = process.env.AZURE_SEARCH_ENDPOINT;
    const SEARCH_API_KEY    = process.env.AZURE_SEARCH_API_KEY;
    const SEARCH_INDEX      = process.env.ROOFVAULT_SEARCH_INDEX || "roofvault-index";

    // 1) Retrieve top docs from Azure AI Search
    const searchUrl = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-11-01`;
    const searchPayload = {
      search: question,
      top: 5,
      select: "*"
    };
    const searchResp = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": SEARCH_API_KEY
      },
      body: JSON.stringify(searchPayload)
    });
    if (!searchResp.ok) {
      const t = await searchResp.text();
      throw new Error(`Search error ${searchResp.status}: ${t}`);
    }
    const searchJson = await searchResp.json();
    const snippets = (searchJson.value || [])
      .map((d, i) => `Doc ${i+1}:\n` + (d.content || d.text || JSON.stringify(d)).slice(0, 1800))
      .join("\n\n");

    // 2) Ask GPT-4.1 Turbo with the retrieved context
    const chatUrl = `${OPENAI_ENDPOINT}/openai/deployments/${encodeURIComponent(OPENAI_DEPLOYMENT)}/chat/completions?api-version=${encodeURIComponent(OPENAI_API_VER)}`;

    // System prompt keeps model grounded in roofing manuals
    const messages = [
      {
        role: "system",
        content:
          "You are RoofVaultGPT, a roofing technical assistant. Answer ONLY using the provided documents. If unknown, say you don't know. Be concise and cite the doc numbers (Doc 1, Doc 2...) when relevant."
      },
      {
        role: "user",
        content:
          `Question: ${question}\n\nRelevant Documents:\n${snippets}`
      }
    ];

    const chatResp = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4.1-turbo",
        temperature: 0.2,
        max_tokens: 600,
        messages
      })
    });

    if (!chatResp.ok) {
      const t = await chatResp.text();
      throw new Error(`OpenAI error ${chatResp.status}: ${t}`);
    }
    const chatJson = await chatResp.json();
    const answer = chatJson.choices?.[0]?.message?.content ?? "(no content)";

    // CORS + JSON response
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ answer })
    };
  } catch (err) {
    context.log.error(err);
    context.res = {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: `Server error: ${err.message || err}`
    };
  }
};
