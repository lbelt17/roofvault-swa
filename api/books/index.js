/**
 * /api/books — list distinct document names by SELECTing likely fields.
 * Env:
 *   SEARCH_ENDPOINT=https://roofvaultsearch.search.windows.net
 *   SEARCH_API_KEY=xxxxx
 *   SEARCH_INDEX=azureblob-index
 *
 * Strategy:
 * 1) Try GET /docs?$select=<field>&$top=1000&search=*
 *    for these fields in order:
 *      - docName
 *      - documentName
 *      - fileName
 *      - metadata_storage_name   <-- common for Azure Blob indexer
 *      - metadata_storage_path
 * 2) First field that yields values wins.
 * 3) If still empty, inspect schema and pick the first retrievable string field,
 *    then try again with $select.
 */
const https = require("https");

function groupFromName(rawName) {
  let name = (rawName || "").trim();

  // drop .pdf if present
  name = name.replace(/\.pdf$/i, "");

  // strip Part/Pt suffixes like: " Part1", "_Part_01", " - Part 2 of 10", " pt-3"
  name = name.replace(
    /(\s*[-–—_]\s*|\s+)(part|pt)\s*[_-]?\s*\d+\s*(of\s*\d+)?\s*$/i,
    ""
  );

  const displayTitle = name.replace(/\s+/g, " ").trim();

  const bookGroupId = displayTitle
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return { bookGroupId, displayTitle };
}

function getJson(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        headers: { "Content-Type": "application/json", ...headers }
      },
      (res) => {
        let buf = "";
        res.on("data", (d) => (buf += d));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(buf || "{}") }); }
          catch (e) { resolve({ status: res.statusCode, body: { raw: buf } }); }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function trySelect(endpoint, key, index, field) {
  const apiVersion = "2023-11-01";
  const url =
    `${endpoint}/indexes/${encodeURIComponent(index)}/docs` +
    `?api-version=${apiVersion}&search=*` +
    `&$select=${encodeURIComponent(field)}&$top=1000`;
  const { status, body } = await getJson(url, { "api-key": key });
  if (status >= 200 && status < 300 && body && Array.isArray(body.value)) {
    const vals = body.value
      .map(x => (x && x[field]) || null)
      .filter(Boolean);
    const uniq = Array.from(new Set(vals)).sort((a,b)=>a.localeCompare(b));
    return uniq;
  }
  return [];
}

module.exports = async function (context, req) {
  try {
    const endpoint = process.env.SEARCH_ENDPOINT;
    const key      = process.env.SEARCH_API_KEY;
    const index    = process.env.SEARCH_INDEX || "azureblob-index";
    if (!endpoint || !key || !index) throw new Error("Missing SEARCH_ENDPOINT / SEARCH_API_KEY / SEARCH_INDEX");

    // 1) Try common fields in order
    const candidates = [
      "docName",
      "documentName",
      "fileName",
      "metadata_storage_name",
      "metadata_storage_path"
    ];

    let picked = null;
    let values = [];
    for (const f of candidates) {
      const list = await trySelect(endpoint, key, index, f);
      if (list.length) { picked = f; values = list; break; }
    }

    // 2) If still empty, inspect schema and try first retrievable string field
    if (!values.length) {
      const schemaUrl = `${endpoint}/indexes/${encodeURIComponent(index)}?api-version=2023-11-01`;
      const { status, body } = await getJson(schemaUrl, { "api-key": key });
      if (status >= 200 && status < 300 && body && Array.isArray(body.fields)) {
        const field = body.fields.find(f =>
          (f.type === "Edm.String") &&
          (f.retrievable !== false) &&
          // prefer something that looks like a name/path
          /name|file|doc|path|title/i.test(f.name)
        ) || body.fields.find(f => f.type === "Edm.String" && f.retrievable !== false);

        if (field && field.name) {
          const list = await trySelect(endpoint, key, index, field.name);
          if (list.length) { picked = field.name; values = list; }
        }
      }
    }

    // Group the raw values into unified books
const groups = new Map();

for (const raw of values) {
  const { bookGroupId, displayTitle } = groupFromName(raw);
  if (!bookGroupId) continue;

  if (!groups.has(bookGroupId)) {
    groups.set(bookGroupId, {
      bookGroupId,
      displayTitle,
      parts: []
    });
  }
  groups.get(bookGroupId).parts.push(raw);
}

// Sort groups by displayTitle
const groupedBooks = Array.from(groups.values()).sort((a, b) =>
  a.displayTitle.localeCompare(b.displayTitle)
);

// Sort parts inside each group
for (const g of groupedBooks) {
  g.parts = Array.from(new Set(g.parts)).sort((a, b) => a.localeCompare(b));
}

context.res = {
  headers: { "Content-Type": "application/json" },
  body: {
    field: picked || "metadata_storage_name",
    books: groupedBooks
  }
};

  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok:false, error: String(e && e.message || e) }
    };
  }
};
