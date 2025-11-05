// api/exam/index.js — no searchFields; fetch many then post-filter by filename
const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    const book =
      (req.body && (req.body.book || req.body.fileName)) ||
      (req.query && (req.query.book || req.query.fileName));

    if (!book) {
      context.res = { status: 400, body: { error: "book required" } };
      return;
    }

    const endpoint  = process.env.SEARCH_ENDPOINT;
    const indexName = process.env.SEARCH_INDEX;
    const apiKey    = process.env.SEARCH_API_KEY;

    if (!endpoint || !indexName || !apiKey) {
      throw new Error("Missing SEARCH_ENDPOINT / SEARCH_INDEX / SEARCH_API_KEY");
    }

    const url = `${endpoint}/indexes/${indexName}/docs/search?api-version=2023-07-01-Preview`;

    const body = {
      // No searchFields (metadata_storage_name isn't searchable in your index)
      search: "*",
      queryType: "simple",
      searchMode: "any",
      top: 1000,
      select: "metadata_storage_name,content"
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Search error: ${res.status} ${text}`);
    }

    const data = await res.json();

    // Strict post-filter by exact filename (case-insensitive)
    const docs = (data.value || []).filter(
      d => (d.metadata_storage_name || "").toLowerCase() === String(book).toLowerCase()
    );

    const used = docs.length ? docs : (data.value || []).slice(0, 1);

    context.res = {
      status: 200,
      body: {
        ok: true,
        count: used.length,
        docs: used.map(d => ({
          metadata_storage_name: d.metadata_storage_name,
          content: d.content
        }))
      }
    };
  } catch (e) {
    context.res = { status: 500, body: { error: "Search error", details: String(e.message || e) } };
  }
};
