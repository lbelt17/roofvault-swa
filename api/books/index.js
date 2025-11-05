const fetch = require("node-fetch");
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX = process.env.SEARCH_INDEX;
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;

// Candidate fields we’ll try for grouping
const CANDIDATE_FIELDS = [
  "book",
  "title",
  "source",
  "document",
  "doc",
  "collection",
  "folder",
  "container",
  "metadata_storage_name"
];

async function httpPost(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
    body: JSON.stringify(body)
  });
  return r;
}

async function facetOn(field) {
  const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;
  const body = { search: "*", top: 0, facets: [`${field},count:200`] };
  const r = await httpPost(url, body);
  if (!r.ok) throw new Error(`facet ${field}: ${r.status} ${await r.text()}`);
  const data = await r.json();
  const arr = (data?.facets?.[field] || []).map(x => x.value).filter(Boolean);
  return arr;
}

async function sampleTop() {
  const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;
  const body = {
    search: "*",
    top: 200,
    select: "book,title,metadata_storage_name,source,document,doc,collection,folder,container"
  };
  const r = await httpPost(url, body);
  if (!r.ok) throw new Error(`sampleTop: ${r.status} ${await r.text()}`);
  const data = await r.json();
  return data?.value || [];
}

module.exports = async function (context) {
  try {
    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
      throw new Error("Missing SEARCH_ENDPOINT/SEARCH_INDEX/SEARCH_API_KEY app settings.");
    }

    // Try facets first
    for (const f of CANDIDATE_FIELDS) {
      try {
        const vals = await facetOn(f);
        if (vals.length > 1) {
          return (context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: { field: f, values: vals.sort((a,b)=>String(a).localeCompare(String(b))) }
          });
        }
      } catch (_e) { /* try next */ }
    }

    // Fallback: sample docs and pick the field with the most distinct values
    const docs = await sampleTop();
    let bestField = null;
    let bestSet = new Set();

    for (const f of CANDIDATE_FIELDS) {
      const set = new Set();
      for (const d of docs) {
        const v = d?.[f];
        if (v && typeof v === "string") set.add(v);
      }
      if (set.size > bestSet.size) { bestSet = set; bestField = f; }
    }

    const values = Array.from(bestSet).sort((a,b)=>String(a).localeCompare(String(b))).slice(0,200);
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { field: bestField, values }
    };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: { error: e.message } };
  }
};
