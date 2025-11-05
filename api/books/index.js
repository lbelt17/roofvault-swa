const fetch = require("node-fetch");
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX = process.env.SEARCH_INDEX;
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;

// Candidate fields we prefer, in order
const PREFERRED = [
  "book",
  "title",
  "source",
  "document",
  "collection",
  "folder",
  "container",
  "file",
  "filename",
  "name",
  "metadata_storage_name",   // often NOT retrievable; we'll only use it if present
  "url"
];

async function searchTopN(n = 150) {
  const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;
  // IMPORTANT: omit select/semantic stuff so we only get retrievable fields and avoid 400s
  const body = { search: "*", top: Math.min(n, 200) };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`books: searchTopN ${r.status} ${await r.text()}`);
  const data = await r.json();
  return Array.isArray(data.value) ? data.value : [];
}

function pickField(docs) {
  if (!docs.length) return { field: null, values: [] };

  // Gather all keys that look stringy and useful
  const allKeys = new Set();
  for (const d of docs) Object.keys(d || {}).forEach(k => allKeys.add(k));

  // Try preferred keys that actually exist
  const keysInDocs = PREFERRED.filter(k => allKeys.has(k));

  // From candidates, pick the one with the most distinct values (>= 2)
  let bestField = null;
  let bestValues = [];
  for (const k of keysInDocs) {
    const vals = new Set();
    for (const d of docs) {
      const v = d?.[k];
      if (typeof v === "string" && v.trim()) vals.add(v.trim());
    }
    if (vals.size > bestValues.length) {
      bestField = k;
      bestValues = Array.from(vals);
    }
  }

  // As a last resort, if we have a "url" with paths, try to derive filenames
  if (!bestField && allKeys.has("url")) {
    const vals = new Set();
    for (const d of docs) {
      const u = d?.url;
      if (typeof u === "string" && u.includes("/")) {
        const fname = u.split("/").pop();
        if (fname) vals.add(fname);
      }
    }
    if (vals.size >= 2) {
      bestField = "url";
      bestValues = Array.from(vals);
    }
  }

  // Sort for UX and limit to 200
  bestValues.sort((a,b)=>String(a).localeCompare(String(b)));
  return { field: bestField, values: bestValues.slice(0,200) };
}

module.exports = async function (context) {
  try {
    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
      throw new Error("Missing SEARCH_ENDPOINT/SEARCH_INDEX/SEARCH_API_KEY app settings.");
    }
    const docs = await searchTopN(150);
    const { field, values } = pickField(docs);
    context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { field, values } };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, body: { error: e.message } };
  }
};
