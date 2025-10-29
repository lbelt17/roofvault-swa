/**
 * Azure Functions (Node 18+). Exposed at POST /api/chat
 * Uses env vars from your Static Web App (AOAI_* and SEARCH_*).
 */
module.exports = async function (context, req) {
  try {
    const userPrompt = (req.body && req.body.prompt) || "";

    // --- Environment variables ---
    const AOAI_ENDPOINT            = process.env.AOAI_ENDPOINT;            // e.g. https://theroofvaultopenai1.openai.azure.com/
    const AOAI_DEPLOYMENT          = process.env.AOAI_DEPLOYMENT;          // e.g. gpt-4o-mini
    const AOAI_DEPLOYMENT_TURBO    = process.env.AOAI_DEPLOYMENT_TURBO;    // e.g. roofvault-turbo (gpt-4.1 or similar)
    const AOAI_API_KEY             = process.env.AOAI_API_KEY;

    const SEARCH_ENDPOINT          = process.env.SEARCH_ENDPOINT;          // e.g. https://roofvaultsearch.search.windows.net
    const SEARCH_INDEX             = process.env.SEARCH_INDEX;             // e.g. azureblob-index
    const SEARCH_API_KEY           = process.env.SEARCH_API_KEY;           // Query key (NOT admin key)

    if (!AOAI_ENDPOINT || !AOAI_DEPLOYMENT || !AOAI_API_KEY ||
        !SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
      context.log.error("Missing required env vars.");
      return { status: 500, body: { error: "Server missing configuration." } };
    }

    // --- Choose model (use Turbo for heavy tasks) ---
    let chosenDeployment = AOAI_DEPLOYMENT;
    const heavyKeywords = [
      "summary","summarize","outline","100 questions","100 q&a","batch",
      "group","divide","analyze","exam-style","practice questions"
    ];
    if (AOAI_DEPLOYMENT_TURBO && userPrompt && heavyKeywords.some(k => userPrompt.toLowerCase().includes(k))) {
      chosenDeployment = AOAI_DEPLOYMENT_TURBO;
      context.log(`Using turbo model for complex task: ${chosenDeployment}`);
    } else {
      context.log(`Using mini model: ${chosenDeployment}`);
    }

    // --- AOAI chat completions endpoint ---
    const url = `${AOAI_ENDPOINT.replace(/\/+$/,"")}/openai/deployments/${chosenDeployment}/chat/completions?api-version=2024-06-01`;

    // --- Request body with On-Your-Data (Azure Search) ---
    const body = {
      messages: [
        {
          role: "system",
          content:
            "You are RoofVault. Answer ONLY using the provided sources via Azure AI Search. " +
            "If the sources do not contain it, say you cannot find it in the RoofVault data. " +
            "Always include inline citations like [<title> p.xx] or a document identifier."
        },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      top_p: 0.95,
      data_sources: [{
        type: "azure_search",
        parameters: {
          endpoint: SEARCH_ENDPOINT,
          index_name: SEARCH_INDEX,
          authentication: { type: "api_key", key: SEARCH_API_KEY },

          // Match your Search Explorer behavior
          query_type: "semantic",
          semantic_configuration: "default",

          // Bring in more candidates and be a bit lenient
          top_n_documents: 15,
          strictness: 2,

          // Help produce readable citations/titles
          fields_mapping: {
            content_fields: ["content"],
            title_field: "metadata_storage_name",
            url_field: "metadata_storage_path",
            filepath_field: "metadata_storage_name"
          }
        }
      }]
    };

    // Node 18+ has global fetch
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": AOAI_API_KEY },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const text = await resp.text();
      context.log.error("AOAI error:", resp.status, text);
      return { status: resp.status, body: { error: text } };
    }

    const json = await resp.json();

    // Extract answer
    const answer = json?.choices?.[0]?.message?.content || "";

    // Extract simple citations if AOAI returned them in tool messages
    const toolMsgs = json?.choices?.[0]?.message?.context?.messages || [];
    const citations = [];
    for (const m of toolMsgs) {
      if (m?.role === "tool" && Array.isArray(m?.content)) {
        for (const c of m.content) {
          if (c?.type === "citations" && Array.isArray(c?.citations)) {
            for (const ci of c.citations) {
              citations.push({
                id: ci?.id,
                title: ci?.title,
                source: ci?.source
              });
            }
          }
        }
      }
    }

    const modelUsed = chosenDeployment;

    return {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer, citations, modelUsed })
    };
  } catch (e) {
    context.log.error(e);
    return { status: 500, body: { error: String(e) } };
  }
};
