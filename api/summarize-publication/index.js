const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    const {
      fileName,
      indexName = process.env.SEARCH_INDEX,
      endpoint  = process.env.SEARCH_ENDPOINT,
      key       = process.env.SEARCH_API_KEY,
      top       = 1000
    } = req.body || {};

    if (!fileName) throw new Error("fileName required");

    const url = `${endpoint}/indexes/${indexName}/docs/search?api-version=2023-07-01-Preview`;

    const body = {
      search: "*",
      queryType: "simple",
      searchMode: "any",
      top,
      select: "metadata_storage_name,content"
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": key },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text().catch(()=>"");
      throw new Error(`Search error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const hits = (data.value || []).filter(
      d => (d.metadata_storage_name || "").toLowerCase() === String(fileName).toLowerCase()
    );

    context.res = { status: 200, body: { ok: true, hits } };
  } catch (e) {
    context.res = { status: 500, body: { error: "Search error", details: String(e.message || e) } };
  }
};
