const fetch = global.fetch || require("node-fetch");

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function fetchWithRetry(url, options, delays=[1500,3000,5000]) {
  for (let i=0;i<=delays.length;i++){
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    if (i===delays.length) return res;
    await sleep(delays[i]);
  }
}

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    const publication = (body.publication || "").toString();
    const onlyIIBEC   = !!body.onlyIIBEC;

    const iibecBias = onlyIIBEC
      ? 'IIBEC OR "Institute of Building Enclosure Consultants" OR "IIBEC Manual" OR "Sheet Metal Manual"'
      : '';

    const terms = [iibecBias, publication].filter(Boolean).join(" ").trim() || "IIBEC sheet metal manual roofing";
    const searchEndpoint = process.env.SEARCH_ENDPOINT;
    const searchIndex    = process.env.SEARCH_INDEX;
    const searchKey      = process.env.SEARCH_API_KEY;

    const searchUrl = `${searchEndpoint}/indexes/${searchIndex}/docs/search?api-version=2024-07-01`;
    const sRes = await fetchWithRetry(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": searchKey },
      body: JSON.stringify({ search: terms, queryType: "simple", searchMode: "any", top: 20 })
    });
    if (!sRes.ok) throw new Error(`Search error ${sRes.status}: ${await sRes.text()}`);
    const sJson = await sRes.json();
    const docs = Array.isArray(sJson.value) ? sJson.value : [];

    const pickContentField = (d) => {
      if (typeof d.content === "string" && d.content.trim()) return d.content;
      if (typeof d.merged_content === "string" && d.merged_content.trim()) return d.merged_content;
      const pieces = Object.entries(d).filter(([k,v]) => typeof v === "string" && v.length > 0).map(([k,v]) => `${k}: ${v}`);
      return pieces.join("\n");
    };
    const pickTitle = (d) => d.title || d.document_title || d.metadata_storage_name || "Document";

    const excerpts = docs
      .map((d,i) => {
        const content = (pickContentField(d) || "").slice(0, 3500);
        const title = pickTitle(d);
        const ref = `${title} | item-${i+1}`;
        return { ref, title, content };
      })
      .filter(x => x.content && x.content.trim())
      .slice(0, 8);

    if (excerpts.length === 0) {
      context.res = { status: 200, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline: [], summary: "", sources: [], note: "No text found for that publication query." }) };
      return;
    }

    const sys = `
You are an editor for IIBEC-style training. Using ONLY the provided excerpts, produce:
1) A concise outline (sections and bullets) of the publication's key topics.
2) A one-paragraph summary (what it covers / when to use it).
3) A "where to find answers" list mapping likely exam topics to the most relevant source titles from the excerpts.

Return STRICT JSON:
{"outline":[{"section":"...","bullets":["...","..."]}], "summary":"...", "sources":[{"title":"..."}], "where_to_find":[{"topic":"...","titles":["...","..."]}]}
No markdown, no extra keys.
`.trim();

    const user = "Excerpts:\\n\\n" + excerpts.map((e,i)=>`[${i+1}] REF=${e.ref}\\n${e.content}`).join("\\n\\n");

    const modelName = (process.env.DEFAULT_MODEL === "gpt-4.1") ? process.env.OPENAI_GPT41 : process.env.OPENAI_GPT4O_MINI;
    const aoaiUrl = `${process.env.OPENAI_ENDPOINT}/openai/deployments/${modelName}/chat/completions?api-version=2024-10-01-preview`;

    const aoaiRes = await fetchWithRetry(aoaiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": process.env.OPENAI_API_KEY },
      body: JSON.stringify({
        messages: [
          { role: "system", content: sys },
          { role: "user",   content: user }
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      })
    });
    if (!aoaiRes.ok) throw new Error(`OpenAI error ${aoaiRes.status}: ${await aoaiRes.text()}`);

    const aoaiJson = await aoaiRes.json();
    const content = aoaiJson?.choices?.[0]?.message?.content || '{"outline":[],"summary":"","sources":[],"where_to_find":[]}';
    context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: content };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
