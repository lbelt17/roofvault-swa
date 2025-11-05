<<<<<<< HEAD
﻿/**
 * Summarize selected publications with keyword-aware search and optional IIBEC bias.
 * Request body:
 *   { publication?: string, keywords?: string, onlyIIBEC?: boolean }
 * Returns:
 *   { outline:[{section,bullets[]}], summary:string, sources:[{title}], where_to_find:[{topic,titles[]}] }
 */
const fetch = globalThis.fetch;

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function fetchWithRetry(url, options, delays=[1500,3000,5000,8000]) {
  for (let i=0;i<=delays.length;i++){
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    if (i===delays.length) return res;
    await sleep(delays[i]);
  }
}

function buildSearchText({ publication, keywords, onlyIIBEC }) {
  const parts = [];
  if (publication && String(publication).trim()) parts.push(`"${String(publication).trim()}"`);
  if (keywords && String(keywords).trim()) parts.push(String(keywords).trim());
  if (!parts.length) parts.push("roofing sheet metal waterproofing building enclosure NRCA IIBEC ASTM membrane deck flashing");
  if (onlyIIBEC) parts.push('(IIBEC OR "Institute of Building Enclosure Consultants" OR "Sheet Metal Manual" OR "Manual of Practice")');
  return parts.join(" ");
}

// Pick best text from a search doc
function pickContentField(d) {
  if (typeof d.content === "string" && d.content.trim()) return d.content;
  if (typeof d.merged_content === "string" && d.merged_content.trim()) return d.merged_content;
  // fall back: join all short strings
  const pieces = Object.entries(d)
    .filter(([k,v]) => typeof v === "string" && v.length > 0)
    .map(([k,v]) => `${k}: ${v}`);
  return pieces.join("\n");
}

module.exports = async function (context, req) {
  try {
    const publication = (req.body?.publication ?? "").toString();
    const keywords    = (req.body?.keywords ?? "").toString();
    const onlyIIBEC   = !!req.body?.onlyIIBEC;

    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_INDEX    = process.env.SEARCH_INDEX;
    const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

    const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT;
    const DEFAULT_MODEL   = process.env.DEFAULT_MODEL; // "gpt-4.1" or "gpt-4o-mini"
    const DEPLOY_41       = process.env.OPENAI_GPT41;
    const DEPLOY_4O_MINI  = process.env.OPENAI_GPT4O_MINI;
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;

    const deploymentName  = (DEFAULT_MODEL === "gpt-4.1") ? (DEPLOY_41 || DEPLOY_4O_MINI) : (DEPLOY_4O_MINI || DEPLOY_41);
    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY || !OPENAI_ENDPOINT || !OPENAI_API_KEY || !deploymentName) {
      return context.res = { status: 500, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ error: "Missing required settings (Search or OpenAI)." }) };
    }

    // 1) Search with keywords / publication / bias
    const searchText = buildSearchText({ publication, keywords, onlyIIBEC });
    const searchUrl  = `${SEARCH_ENDPOINT}/indexes/${SEARCH_INDEX}/docs/search?api-version=2024-07-01`;
    const sRes = await fetchWithRetry(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify({
        search: searchText,
        queryType: "simple",
        searchMode: "any",
        top: 8
      })
    });
    if (!sRes || !sRes.ok) {
      const txt = sRes ? await sRes.text() : "(no response)";
      return context.res = { status: 500, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ error: `Search error ${sRes?.status||'??'}: ${txt}` }) };
    }
    const sJson = await sRes.json();
    const docs = Array.isArray(sJson.value) ? sJson.value : [];
    if (!docs.length) {
      return context.res = { status: 200, headers:{"Content-Type":"application/json"}, body: JSON.stringify({
        outline: [], summary: "No matching documents found.", sources: [], where_to_find: [], searchText
      })};
    }

    // 2) Build context + titles
    const contextChunks = docs
      .map(d => (pickContentField(d) || "").slice(0, 1500))
      .filter(x => x && x.trim())
      .slice(0, 4);
    const titles = docs
      .map(d => (d.title || d.metadata_storage_name || d['@search.highlights'] || 'Document'))
      .slice(0, 6);
    const contextBlob = contextChunks.join("\n\n---\n\n");

    // 3) Ask AOAI for outline, summary, and where-to-find
    const aoaiUrl = `${OPENAI_ENDPOINT}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-10-01-preview`;
    const systemPrompt = `
You create concise study aids from roofing/waterproofing documents (NRCA/IIBEC/ASTM/IBC/etc.).
Strictly return JSON in this shape:

{
  "outline": [{"section":"...","bullets":["...","..."]}],
  "summary": "2-4 sentences max, plain language.",
  "sources": [{"title":"..."}],
  "where_to_find": [{"topic":"...","titles":["...","..."]}]
}

Rules:
- Use only the provided excerpts & plausible titles from them.
- Keep bullets short (<=8 words).
- No markdown, no extra keys.
`.trim();

    const userPrompt = `
Build an outline + short summary + where_to_find table from the following excerpts.
If a "publication" name was provided, bias toward content that fits that label.

Publication (hint): ${publication || "(none)"}
Keywords: ${keywords || "(none)"}
Candidate titles: ${titles.join("; ")}

Excerpts:
${contextBlob}
`.trim();

    const body = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: "json_object" }
    };

    const r = await fetchWithRetry(aoaiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": OPENAI_API_KEY },
      body: JSON.stringify(body)
    });
    if (!r || !r.ok) {
      const txt = r ? await r.text() : "(no response)";
      return context.res = { status: 500, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ error: `OpenAI error ${r?.status||'??'}: ${txt}` }) };
    }

    const j = await r.json();
    const content = j?.choices?.[0]?.message?.content || "{}";
    let parsed;
    try { parsed = JSON.parse(content); }
    catch { parsed = { outline:[], summary:"", sources:[], where_to_find:[] }; }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed, searchText, modelDeployment: deploymentName })
    };
  } catch (err) {
    context.res = { status: 500, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
=======
﻿export default async function (context, req) {
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, endpoint: "summarize-publication" })
  };
}
>>>>>>> 53ab868 (SWA skeleton with three API endpoints)
