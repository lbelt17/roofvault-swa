const { SearchClient, SearchIndexClient } = require("@azure/search-documents");
const { AzureKeyCredential } = require("@azure/core-auth");

const { SEARCH_ENDPOINT, SEARCH_KEY } = process.env;

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
  if (req.method === "OPTIONS") { context.res = cors({ ok:true }); return; }
  if (!SEARCH_ENDPOINT || !SEARCH_KEY) { context.res = cors({ ok:false, error:"Missing SEARCH_ENDPOINT/SEARCH_KEY" }, 500); return; }

  const cred = new AzureKeyCredential(SEARCH_KEY);
  const idxClient = new SearchIndexClient(SEARCH_ENDPOINT, cred);

  try {
    const indexes = [];
    for await (const def of idxClient.listIndexes()) {
      indexes.push({ name: def.name, fields: def.fields?.map(f => ({ name: f.name, type: f.type })) || [] });
    }

    // For each index: count + sample docs (up to 2)
    const details = [];
    for (const ix of indexes) {
      const sc = new SearchClient(SEARCH_ENDPOINT, ix.name, cred);
      let count = null;
      try { count = await sc.getDocumentCount(); } catch {}
      const docs = [];
      try {
        const resp = sc.search("*", { top: 2, queryType: "simple" });
        if (resp && typeof resp[Symbol.asyncIterator] === "function") {
          for await (const h of resp) { docs.push(h.document ?? h); }
        } else if (resp && typeof resp.byPage === "function") {
          const pg = await resp.byPage({ maxPageSize: 2 }).next();
          const vals = pg?.value?.results || pg?.value?.value || [];
          for (const v of vals) docs.push(v.document ?? v);
        }
      } catch (e) {}

      const samples = docs.map(d => {
        const keys = Object.keys(d || {}).sort();
        const contentField = ["content","text","chunk","pageContent","body","passage"]
          .find(k => typeof d?.[k] === "string" && d[k].trim().length) || null;
        const srcField = ["source","file","book","path","url","metadata_storage_name"]
          .find(k => d?.[k] !== undefined) || null;
        const pageField = ["page","pageNumber","pageno","page_num"]
          .find(k => d?.[k] !== undefined) || null;
        return {
          keys,
          detectedFields: { contentField, srcField, pageField },
          preview: contentField ? String(d[contentField]).slice(0, 300) : null,
          sourcePreview: srcField ? String(d[srcField]) : null,
          pagePreview: pageField ? d[pageField] : null
        };
      });

      details.push({ name: ix.name, count, fieldCount: ix.fields.length, samples });
    }

    context.res = cors({ ok:true, indexes: details });
  } catch (e) {
    context.res = cors({ ok:false, error: String(e?.message || e) }, 500);
  }
};
