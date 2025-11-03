/**
 * Generate exam-style questions grounded in your Azure AI Search index.
 * Reads settings from SWA app settings you already set:
 *  - SEARCH_ENDPOINT, SEARCH_INDEX, SEARCH_API_KEY
 *  - OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_GPT41, OPENAI_GPT4O_MINI, DEFAULT_MODEL
 *
 * POST body example:
 *  { "publication": "IIBEC Sheet Metal Manual", "count": 100, "topics": ["flashings"] }
 */
const fetch = global.fetch || require("node-fetch");

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    const publication = body.publication || "";
    const count = Math.min(Math.max(parseInt(body.count || 100, 10), 1), 100);
    const topics = Array.isArray(body.topics) ? body.topics : [];

    // ---- 1) Query Azure AI Search for grounding passages ----
    const searchEndpoint = process.env.SEARCH_ENDPOINT;
    const searchIndex    = process.env.SEARCH_INDEX;
    const searchKey      = process.env.SEARCH_API_KEY;

    const searchUrl = `${searchEndpoint}/indexes/${searchIndex}/docs/search?api-version=2024-07-01`;
    const filter = publication ? `publication eq '${publication.replace(/'/g, "''")}'` : undefined;

    const searchPayload = {
      search: (topics.join(" ") || (publication || "IIBEC sheet metal")),
      queryType: "semantic",
      semanticConfiguration: "default",
      top: 40,
      select: "content,title,publication,page,chunk_id,metadata_storage_name",
      ...(filter ? { filter } : {})
    };

    const sRes = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": searchKey
      },
      body: JSON.stringify(searchPayload)
    });

    if (!sRes.ok) {
      const txt = await sRes.text();
      throw new Error(`Search error ${sRes.status}: ${txt}`);
    }

    const sJson = await sRes.json();
    const docs = Array.isArray(sJson.value) ? sJson.value : [];

    const excerpts = docs.slice(0, 25).map((d, i) => {
      const title = d.title || d.publication || d.metadata_storage_name || "Document";
      const page = typeof d.page === "number" ? ` (p.${d.page})` : "";
      const ref = `${title}${page} | ${d.chunk_id || `chunk-${i+1}`}`;
      const content = d.content || "";
      return { ref, title, page: d.page, chunk_id: d.chunk_id, content };
    });

    if (excerpts.length === 0) {
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [], note: "No passages found in Search. Check index/filters." })
      };
      return;
    }

    // ---- 2) Compose prompt for Azure OpenAI ----
    const sys = `
You write IIBEC-style exam questions. Use ONLY the provided excerpts.
Return STRICT JSON: {"items":[{ "question": "...", "choices": {"A":"...","B":"...","C":"...","D":"..."}, "answer":"A|B|C|D", "rationale":"...", "citations":[{"title":"...","page":123,"chunk_id":"..."}]}]}
Rules:
- Create ${count} items total.
- 1 correct option, 3 plausible distractors. Vary difficulty (easy/med/hard).
- Use precise technical wording from the excerpts when appropriate.
- Include at least one citation per item (title + page if available + chunk_id).
- No extra keys, no markdown, no trailing commas.
`.trim();

    const user = "Excerpts:\\n\\n" + excerpts.map((e,i)=>`[${i+1}] REF=${e.ref}\\n${e.content}`).join("\\n\\n");

    // ---- 3) Call Azure OpenAI ----
    const modelName =
      (process.env.DEFAULT_MODEL === "gpt-4.1") ? process.env.OPENAI_GPT41 : process.env.OPENAI_GPT4O_MINI;

    const aoaiUrl = `${process.env.OPENAI_ENDPOINT}/openai/deployments/${modelName}/chat/completions?api-version=2024-10-01-preview`;

    const aoaiRes = await fetch(aoaiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user }
        ],
        temperature: 0.6,
        response_format: { type: "json_object" }
      })
    });

    if (!aoaiRes.ok) {
      const txt = await aoaiRes.text();
      throw new Error(`OpenAI error ${aoaiRes.status}: ${txt}`);
    }

    const aoaiJson = await aoaiRes.json();
    const content = (aoaiJson && aoaiJson.choices && aoaiJson.choices[0] && aoaiJson.choices[0].message && aoaiJson.choices[0].message.content) || '{"items":[]}';

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: content
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
