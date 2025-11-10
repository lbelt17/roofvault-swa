const fetch = global.fetch || require("node-fetch");

module.exports = async function (context, req) {
  try {
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const fileName = String(body.fileName || "").trim();
    if (!fileName) {
      return context.res = { status: 400, body: { error: "fileName required" } };
    }

    // Env
    const rawEndpoint = process.env.SEARCH_ENDPOINT || "";
    const endpointHost = rawEndpoint.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const indexName = process.env.SEARCH_INDEX;
    const apiKey    = process.env.SEARCH_API_KEY;

    if (!endpointHost || !indexName || !apiKey) {
      return context.res = { status: 500, body: { error: "Search env missing." } };
    }

    // Build URL (stable API)
    const url = `https://${endpointHost}/indexes/${encodeURIComponent(indexName)}/docs/search?api-version=2023-11-01`;

    // Exact match filter on filename (escape single quotes)
    const safeName = fileName.replace(/'/g, "''");

    const payload = {
      search: "*",
      queryType: "simple",
      searchMode: "any",
      filter: `metadata_storage_name eq '${safeName}'`,
      top: 1000,
      select: "metadata_storage_name,content"
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(payload)
    });

    const txt = await res.text();
    if (!res.ok) {
      return context.res = { status: 500, body: { error: `Search HTTP ${res.status}`, raw: txt } };
    }

    let json; try { json = JSON.parse(txt); } catch { json = { value: [] }; }
    const hits = Array.isArray(json.value) ? json.value : [];

    // Filter again client-side (defensive)
    const lc = fileName.toLowerCase();
    const filtered = hits.filter(h => (h.metadata_storage_name || "").toLowerCase() === lc);

    return context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { ok: true, count: filtered.length, hits: filtered, _diag: { requested: fileName, endpointHost, indexName } }
    };
  } catch (e) {
    return context.res = { status: 500, body: { error: "Search error", details: String(e && e.message || e) } };
  }
};
