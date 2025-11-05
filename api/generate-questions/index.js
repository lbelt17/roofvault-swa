const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    const {
      fileName,                // exact file name from your dropdown (e.g., "NRCA-5005e-3384_Part3.pdf")
      indexName = process.env.SEARCH_INDEX,
      endpoint  = process.env.SEARCH_ENDPOINT,  // e.g., https://<service>.search.windows.net
      key       = process.env.SEARCH_API_KEY,   // Query key (NOT admin)
      top       = 50
    } = req.body || {};

    if (!fileName) throw new Error("fileName required");

    // Build Azure AI Search request WITHOUT $filter
    const url = `${endpoint}/indexes/${indexName}/docs/search?api-version=2023-07-01-Preview`;

    const body = {
      search: `"${fileName}"`,                    // quote to bias exact phrase
      searchFields: "metadata_storage_name,content",
      queryType: "simple",
      searchMode: "all",
      top,
      select: "metadata_storage_name,content"     // add any fields you actually need
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": key
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Search error: ${res.status} ${err}`);
    }

    const data = await res.json();

    // STRICT client-side filter to the exact file name to mimic the old $filter
    const hits = (data.value || []).filter(d => (d.metadata_storage_name || "").toLowerCase() === fileName.toLowerCase());

    // ---- Your existing logic that builds the 50 questions goes here ----
    // For now, just return the filtered docs so the UI can proceed.
    context.res = { status: 200, body: { ok: true, hits } };
  } catch (e) {
    context.res = { status: 500, body: { error: "Search error", details: String(e.message || e) } };
  }
};
