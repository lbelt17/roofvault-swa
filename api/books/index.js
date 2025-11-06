/**
 * /api/books — query Azure Cognitive Search to list distinct document names.
 * Requires env vars:
 *   SEARCH_ENDPOINT=https://roofvaultsearch.search.windows.net
 *   SEARCH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   SEARCH_INDEX=roofvault-index  (whatever your index is called)
 */
const https = require("https");

module.exports = async function (context, req) {
  try {
    const endpoint = process.env.SEARCH_ENDPOINT;
    const key      = process.env.SEARCH_API_KEY;
    const index    = process.env.SEARCH_INDEX;
    if (!endpoint || !key || !index) {
      throw new Error("Missing SEARCH_ENDPOINT, SEARCH_API_KEY, or SEARCH_INDEX app setting");
    }

    const url = `${endpoint}/indexes/${index}/docs?api-version=2023-07-01-Preview&$select=docName&$top=1000`;

    const data = await new Promise((resolve, reject) => {
      const opts = new URL(url);
      opts.method = "GET";
      opts.headers = {
        "api-key": key,
        "Content-Type": "application/json"
      };
      https.get(opts, res => {
        let buf = "";
        res.on("data", d => buf += d);
        res.on("end", () => {
          try {
            const json = JSON.parse(buf);
            resolve(json);
          } catch(e){ reject(e); }
        });
      }).on("error", reject);
    });

    // collect unique names
    const names = Array.from(new Set((data.value || []).map(d => d.docName).filter(Boolean))).sort();

    context.res = {
      headers: { "Content-Type": "application/json" },
      body: { field: "docName", values: names }
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok:false, error:String(e && e.message || e) }
    };
  }
};
