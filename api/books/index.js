const fetch = require("node-fetch");
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX = process.env.SEARCH_INDEX;
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;

// Try these fields in order until we get non-empty facet results
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

async function facetOn(field) {
  const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;
  const body = { search: "*", top: 0, facets: [`${field},count:200`] };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Search facet error: ${r.status} ${t}`);
  }
  const data = await r.json();
  const arr = (data?.facets?.[field] || [])
    .map(x => x.value)
    .filter(Boolean);
  return arr;
}

module.exports = async function (context, req) {
  try {
    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
      throw new Error("Missing SEARCH_ENDPOINT/SEARCH_INDEX/SEARCH_API_KEY app settings.");
    }

    let fieldFound = null;
    let values = [];

    for (const f of CANDIDATE_FIELDS) {
      try {
        const v = await facetOn(f);
        if (v.length) {
          fieldFound = f;
          values = v.sort((a,b)=>String(a).localeCompare(String(b)));
          break;
        }
      } catch (_ignored) {
        // ignore and try next field
      }
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { field: fieldFound, values }
    };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: { error: e.message } };
  }
};
