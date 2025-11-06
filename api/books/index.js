/**
 * /api/books — list distinct doc names from Azure Cognitive Search using facets.
 * Env required:
 *   SEARCH_ENDPOINT=https://roofvaultsearch.search.windows.net
 *   SEARCH_API_KEY=<<your key>>
 *   SEARCH_INDEX=azureblob-index
 *
 * Tries common blob/ingestion fields: docName, documentName, fileName, metadata_storage_name, metadata_storage_path.
 */
const https = require("https");

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers }
      },
      (res) => {
        let buf = "";
        res.on("data", (d) => (buf += d));
        res.on("end", () => {
          try {
            const json = JSON.parse(buf || "{}");
            resolve({ status: res.statusCode, body: json });
          } catch (e) {
            resolve({ status: res.statusCode, body: { raw: buf } });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(JSON.stringify(body || {}));
    req.end();
  });
}

module.exports = async function (context, req) {
  try {
    const endpoint = process.env.SEARCH_ENDPOINT;
    const key = process.env.SEARCH_API_KEY;
    const index = process.env.SEARCH_INDEX || "azureblob-index";
    if (!endpoint || !key || !index) {
      throw new Error("Missing SEARCH_ENDPOINT, SEARCH_API_KEY, or SEARCH_INDEX");
    }

    // Try these fields in order; first one that returns facet values wins
    const candidateFields = [
      "docName",
      "documentName",
      "fileName",
      "metadata_storage_name",
      "metadata_storage_path"
    ];

    const apiVersion = "2023-11-01";
    const url = `${endpoint}/indexes/${encodeURIComponent(index)}/docs/search?api-version=${apiVersion}`;

    let pickedField = null;
    let values = [];

    for (const field of candidateFields) {
      const { status, body } = await postJson(
        url,
        { "api-key": key },
        {
          search: "*",
          facets: [`${field},count:1000`],
          top: 0
        }
      );

      if (status >= 200 && status < 300 && body && body["@search.facets"] && body["@search.facets"][field]) {
        const items = body["@search.facets"][field];
        const names = (items || [])
          .map((x) => (x && (x.value || x["@search.value"])) || null)
          .filter(Boolean);

        if (names.length) {
          pickedField = field;
          // unique + sorted
          values = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
          break;
        }
      }
    }

    // Fallback: empty list but still respond OK so UI loads
    context.res = {
      headers: { "Content-Type": "application/json" },
      body: { field: pickedField || "docName", values }
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: String(e && e.message || e) }
    };
  }
};
