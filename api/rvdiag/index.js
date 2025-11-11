const { SearchClient } = require("@azure/search-documents");
const { AzureKeyCredential } = require("@azure/core-auth");

const { SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX } = process.env;

function cors(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = cors({ ok: true });
    return;
  }

  const missing = [];
  if (!SEARCH_ENDPOINT) missing.push("SEARCH_ENDPOINT");
  if (!SEARCH_KEY) missing.push("SEARCH_KEY");
  if (!SEARCH_INDEX) missing.push("SEARCH_INDEX");
  if (missing.length) {
    context.res = cors({ ok:false, error:"Missing env", missing }, 500);
    return;
  }

  try {
    const client = new SearchClient(
      SEARCH_ENDPOINT,
      SEARCH_INDEX,
      new AzureKeyCredential(SEARCH_KEY)
    );

    // Try to estimate count (SDK has getDocumentCount in newer versions; fall back to search "*")
    let count = null;
    try { count = await client.getDocumentCount(); } catch { /* ignore */ }

    const hits = [];
    try {
      const resp = client.search("*", { top: 3, queryType: "simple" });
      if (resp && typeof resp[Symbol.asyncIterator] === "function") {
        for await (const h of resp) { hits.push(h?.document ?? h); }
      } else if (resp && typeof resp.byPage === "function") {
        const pg = await resp.byPage({ maxPageSize: 3 }).next();
        const vals = pg?.value?.results || pg?.value?.value || [];
        for (const v of vals) hits.push(v?.document ?? v);
      }
    } catch (e) {
      context.log("diag search failed:", e.message||e);
    }

    // Summarize fields
    const samples = hits.map((d, i) => {
      const doc = d || {};
      const fieldNames = Object.keys(doc).sort();
      // Try common content fields
      const contentField = ["content","text","chunk","pageContent","body","passage"]
        .find(k => typeof doc[k] === "string" && doc[k].trim().length > 0) || null;
      const srcField = ["source","file","book","path","url","metadata_storage_name"]
        .find(k => doc[k]) || null;
      const pageField = ["page","pageNumber","pageno","page_num"]
        .find(k => doc[k] !== undefined) || null;

      return {
        idx: i+1,
        fieldNames,
        detectedFields: { contentField, srcField, pageField },
        preview: contentField ? String(doc[contentField]).slice(0, 400) : null,
        sourcePreview: srcField ? String(doc[srcField]) : null,
        pagePreview: pageField ? doc[pageField] : null
      };
    });

    context.res = cors({
      ok: true,
      index: SEARCH_INDEX,
      count,
      sampleDocs: samples
    });
  } catch (e) {
    context.res = cors({ ok:false, error:String(e?.message||e) }, 500);
  }
};
