const fetch = require("node-fetch");

const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;   // e.g. https://<name>.search.windows.net
const SEARCH_INDEX   = process.env.SEARCH_INDEX;       // e.g. roofvault
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;     // Query key (not admin key)

module.exports = async function (context, req) {
  try {
    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
      throw new Error("Missing SEARCH_ENDPOINT/SEARCH_INDEX/SEARCH_API_KEY app settings.");
    }

    const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;
    const body = { search: "*", top: 0, facets: ["book,count:200"] };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": SEARCH_API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Search facet error: ${r.status} ${t}`);
    }

    const data = await r.json();
    const books = (data?.facets?.book || [])
      .map(x => x.value)
      .filter(Boolean)
      .sort((a,b)=>String(a).localeCompare(String(b)));

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { books }
    };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: { error: e.message } };
  }
};
