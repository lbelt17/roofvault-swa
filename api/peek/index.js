const fetch = require("node-fetch");

const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX    = process.env.SEARCH_INDEX;
const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

async function searchDocs(query, select="*", top=20){
  const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2024-07-01`;
  const body = { search: query, searchMode:"all", queryType:"simple", top, select };
  const r = await fetch(url, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "api-key": SEARCH_API_KEY },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`search ${r.status}`);
  return await r.json();
}

module.exports = async function (context, req) {
  try {
    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
      context.res = { status: 200, body: { ok:false, error:"no-search-config" } }; return;
    }

    const method = (req.method || "GET").toUpperCase();
    const book =
      (method === "POST"
        ? (req.body && (req.body.book || req.body.fileName))
        : (req.query && (req.query.book || req.query.fileName))) || "Unknown.pdf";

    // 1) Try quoted filename first
    const q = `"${book.replace(/"/g,'\\"')}"`;
    const first = await searchDocs(q, "*", 10).catch(()=>({ value:[] }));
    const candidates = Array.isArray(first.value) ? first.value : [];

    // If none found, 2) list mode: show top docs and common fields
    if (!candidates.length){
      const listed = await searchDocs("*", "metadata_storage_name,content,text,merged_content,pages_content", 20).catch(()=>({ value:[] }));
      const names = (listed.value||[]).map(d => d.metadata_storage_name).filter(Boolean);
      // collect field sizes on first hit (if any)
      const sample = (listed.value||[])[0] || {};
      const fieldSizes = {};
      for (const [k,v] of Object.entries(sample)){
        let kind = Array.isArray(v) ? "array" : typeof v;
        let size = (typeof v === "string") ? v.length
                 : (Array.isArray(v) ? v.filter(x=>typeof x==="string").join("\n").length
                 : 0);
        fieldSizes[k] = { kind, size: size>0 ? size : undefined };
      }
      context.res = {
        status: 200,
        headers: { "Content-Type":"application/json" },
        body: { ok:true, mode:"list", book, total:0, used:0, docName:null, names, fieldSizes }
      };
      return;
    }

    // Summarize fields for first matching doc
    const firstDoc = candidates[0];
    const fields = {};
    for (const [k,v] of Object.entries(firstDoc)) {
      let kind = Array.isArray(v) ? "array" : typeof v;
      let size = (typeof v === "string") ? v.length
               : (Array.isArray(v) ? v.filter(x=>typeof x==="string").join("\n").length
               : 0);
      fields[k] = { kind, size, sample: (typeof v === "string" ? v.slice(0,200) : v) };
    }

    context.res = {
      status: 200,
      headers: { "Content-Type":"application/json" },
      body: {
        ok:true, mode:"exact", book,
        total: (first.value||[]).length, used: candidates.length,
        docName: firstDoc.metadata_storage_name || null,
        fields
      }
    };
  } catch (e) {
    context.res = { status: 200, body: { ok:false, error:String(e && e.message || e) } };
  }
};
