const fetch = require("node-fetch");

const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX    = process.env.SEARCH_INDEX;
const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

module.exports = async function (context, req) {
  try {
    const method = (req.method || "GET").toUpperCase();
    const book =
      (method === "POST"
        ? (req.body && (req.body.book || req.body.fileName))
        : (req.query && (req.query.book || req.query.fileName))) || "Unknown.pdf";

    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
      context.res = { status: 200, body: { ok:false, error:"no-search-config" } }; return;
    }

    const q = `"${book.replace(/"/g,'\\"')}"`;
    const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2024-07-01`;
    const body = { search:q, searchMode:"all", queryType:"simple", top: 5, select: "*" };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type":"application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify(body)
    });

    const j = await r.json().catch(()=>({}));
    const value = Array.isArray(j.value) ? j.value : [];
    const exact = value.filter(d => (d.metadata_storage_name||"").toLowerCase() === book.toLowerCase());
    const docs  = exact.length ? exact : value;

    // summarize fields
    const fields = {};
    const first  = docs[0] || {};
    for (const [k,v] of Object.entries(first)) {
      let kind = Array.isArray(v) ? "array" : typeof v;
      let size = (typeof v === "string") ? v.length
               : (Array.isArray(v) ? v.filter(x=>typeof x==="string").join("\n").length
               : 0);
      fields[k] = { kind, size, sample: (typeof v === "string" ? v.slice(0,200) : v) };
    }

    context.res = {
      status: 200,
      headers: { "Content-Type":"application/json" },
      body: { ok:true, book, total:value.length, used:docs.length, fields, docName:first.metadata_storage_name || null }
    };
  } catch (e) {
    context.res = { status: 200, body: { ok:false, error:String(e && e.message || e) } };
  }
};
