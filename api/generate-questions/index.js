/**
 * Generator with IIBEC bias toggle:
 * - If body.onlyIIBEC === true, we bias search terms to IIBEC.
 * - Still field-agnostic and light to avoid 429s.
 */
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
    const count = Math.min(Math.max(parseInt(body.count || 5, 10), 1), 50);
    const topics = Array.isArray(body.topics) ? body.topics : [];
    const onlyIIBEC = !!body.onlyIIBEC;

    // Bias query if onlyIIBEC
    const iibecBias = onlyIIBEC
      ? 'IIBEC OR "Institute of Building Enclosure Consultants" OR "IIBEC Manual" OR "Sheet Metal Manual"'
      : '';

    const userTerms = (topics.join(" ") || "roofing sheet metal flashing details building enclosure");
    const broadQuery = [iibecBias, userTerms].filter(Boolean).join(" ");

    // ---- 1) Azure AI Search (small + agnostic) ----
    const searchEndpoint = process.env.SEARCH_ENDPOINT;
    const searchIndex    = process.env.SEARCH_INDEX;
    const searchKey      = process.env.SEARCH_API_KEY;

    const searchUrl = `${searchEndpoint}/indexes/${searchIndex}/docs/search?api-version=2024-07-01`;
    const sRes = await fetchWithRetry(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": searchKey },
      body: JSON.stringify({
        search: broadQuery,
        queryType: "simple",
        searchMode: "any",
        top: 20
      })
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

    // Prefer entries that look IIBEC-ish if onlyIIBEC, otherwise keep order
    const scored = docs.map((d,i) => {
      const title = (d.title || d.document_title || d.metadata_storage_name || "").toString().toLowerCase();
      const text  = (pickContentField(d) || "").toLowerCase();
      let score = 0;
      if (title.includes("iibec")) score += 2;
      if (text.includes("iibec")) score += 2;
      if (text.includes("sheet metal")) score += 1;
      if (text.includes("flashing")) score += 1;
      return { d, score, i };
    });

    const ranked = onlyIIBEC
      ? scored.sort((a,b)=> b.score - a.score || a.i - b.i).map(x=>x.d)
      : docs;

    const excerpts = ranked
      .map((d, i) => {
        const content = (pickContentField(d) || "").slice(0, 4000);
        const title = pickTitle(d);
        const ref = `${title} | item-${i+1}`;
        return { ref, title, content };
      })
      .filter(x => x.content && x.content.trim().length > 0)
      .slice(0, 8);

    if (excerpts.length === 0) {
      context.res = { status: 200, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [], note: onlyIIBEC ? "No IIBEC-like content found. Try turning off IIBEC-only." : "No text content found in index." }) };
      return;
    }

    const sys = `
You write exam-style questions based strictly on the provided excerpts.
Return STRICT JSON: {"items":[{ "question": "...", "choices": {"A":"...","B":"...","C":"...","D":"..."}, "answer":"A|B|C|D", "rationale":"...", "citations":[{"title":"..."}]}]}
Rules:
- Create ${count} items total.
- 1 correct option, 3 plausible distractors; vary difficulty.
- Each item MUST include at least one citation with the document title.
- No extra keys or markdown.
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
          { role: "user", content: user }
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      })
    });
    if (!aoaiRes.ok) throw new Error(`OpenAI error ${aoaiRes.status}: ${await aoaiRes.text()}`);

    const aoaiJson = await aoaiRes.json();
    const content = aoaiJson?.choices?.[0]?.message?.content || '{"items":[]}';
    context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: content };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
