/**
 * Field-agnostic generator: only assumes your index has "content" text.
 * Falls back to metadata_storage_name for a title when available.
 */
const fetch = global.fetch || require("node-fetch");

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    const count = Math.min(Math.max(parseInt(body.count || 50, 10), 1), 100);
    const topics = Array.isArray(body.topics) ? body.topics : [];
    const broadQuery = (topics.join(" ") || "IIBEC sheet metal roofing building enclosure");

    // ---- 1) Azure AI Search (no $select, no semantic config; be index-agnostic) ----
    const searchEndpoint = process.env.SEARCH_ENDPOINT;
    const searchIndex    = process.env.SEARCH_INDEX;
    const searchKey      = process.env.SEARCH_API_KEY;

    const searchUrl = `${searchEndpoint}/indexes/${searchIndex}/docs/search?api-version=2024-07-01`;
    const sRes = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": searchKey },
      body: JSON.stringify({
        search: broadQuery,
        queryType: "simple",   // safest
        top: 40                // grab plenty; we’ll trim
      })
    });
    if (!sRes.ok) {
      const txt = await sRes.text();
      throw new Error(`Search error ${sRes.status}: ${txt}`);
    }
    const sJson = await sRes.json();
    const docs = Array.isArray(sJson.value) ? sJson.value : [];

    // Try to find the text field that actually has the content.
    function pickContentField(d) {
      if (typeof d.content === "string" && d.content.trim()) return d.content;
      // Common field from blob indexers:
      if (typeof d["merged_content"] === "string" && d["merged_content"].trim()) return d["merged_content"];
      // Fall back to concatenating string-ish fields:
      const pieces = Object.entries(d)
        .filter(([k,v]) => typeof v === "string" && v.length > 0)
        .map(([k,v]) => `${k}: ${v}`);
      return pieces.join("\n");
    }
    function pickTitle(d) {
      return d.title || d.document_title || d.metadata_storage_name || "Document";
    }

    const excerpts = docs
      .map((d, i) => {
        const content = pickContentField(d) || "";
        const title = pickTitle(d);
        const ref = `${title} | item-${i+1}`;
        return { ref, title, content };
      })
      .filter(x => x.content && x.content.trim().length > 0)
      .slice(0, 25);

    if (excerpts.length === 0) {
      context.res = { status: 200, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [], note: "No text content found in index. Ensure your index has a text field (e.g., content or merged_content)." }) };
      return;
    }

    // ---- 2) Prompt for question generation ----
    const sys = `
You write exam-style questions for roofing/building enclosure based on IIBEC-type materials.
Use ONLY the provided excerpts.
Return STRICT JSON: {"items":[{ "question": "...", "choices": {"A":"...","B":"...","C":"...","D":"..."}, "answer":"A|B|C|D", "rationale":"...", "citations":[{"title":"..."}]}]}
Rules:
- Create ${count} items total.
- 1 correct option, 3 plausible distractors; vary difficulty (easy/medium/hard).
- Prefer precise technical language drawn from the excerpts.
- Each item MUST include at least one citation with the document title.
- No extra keys or markdown.
`.trim();

    const user = "Excerpts:\\n\\n" + excerpts.map((e,i)=>`[${i+1}] REF=${e.ref}\\n${e.content}`).join("\\n\\n");

    // ---- 3) Azure OpenAI call ----
    const modelName = (process.env.DEFAULT_MODEL === "gpt-4.1") ? process.env.OPENAI_GPT41 : process.env.OPENAI_GPT4O_MINI;
    const aoaiUrl = `${process.env.OPENAI_ENDPOINT}/openai/deployments/${modelName}/chat/completions?api-version=2024-10-01-preview`;

    const aoaiRes = await fetch(aoaiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": process.env.OPENAI_API_KEY },
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

    context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: content };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
