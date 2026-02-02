// scripts/smoke-test-search-only.mjs
// RoofVault: Search-only smoke test (NO OpenAI calls).
// Source of truth for book lists: SWA /api/books (same as frontend books.js)
// For each book (grouped) we test up to 8 parts in Azure AI Search (top=1).
//
// Usage:
//   SWA_BASE="https://kind-flower-0fe142d0f.3.azurestaticapps.net" \
//   SEARCH_ENDPOINT="https://<your-search>.search.windows.net" \
//   SEARCH_API_KEY="<your-key>" \
//   SEARCH_INDEX_CONTENT="azureblob-index-content" \
//   node scripts/smoke-test-search-only.mjs
//
// Notes:
// - Does NOT require auth; /api/books should be public. If yours is gated, tell me.
// - Does NOT call OpenAI.

const MAX_PARTS = 8;

const SWA_BASE = (process.env.SWA_BASE || "https://kind-flower-0fe142d0f.3.azurestaticapps.net").replace(/\/$/, "");
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "azureblob-index-content";

if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) {
  console.error("❌ Missing env vars. Set SEARCH_ENDPOINT and SEARCH_API_KEY.");
  process.exit(2);
}

function buildSearchUrl() {
  const base = SEARCH_ENDPOINT.replace(/\/$/, "");
  return `${base}/indexes/${encodeURIComponent(
    SEARCH_INDEX_CONTENT
  )}/docs/search?api-version=2023-11-01`;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  let json = null;
  try { json = JSON.parse(text); } catch {}

  if (!res.ok) {
    return { ok: false, status: res.status, text: text.slice(0, 2000), json };
  }
  return { ok: true, status: res.status, text, json };
}

function normalizePart(p) {
  if (typeof p === "string") return p.trim();

  if (p && typeof p === "object") {
    return String(
      p.metadata_storage_name ||
      p.fileName || // books-v2
      p.name ||
      p.raw ||      // books-v2
      p.id ||
      p.partId ||
      p.blobName ||
      p.ref ||
      p.key ||
      ""
    ).trim();
  }
  return "";
}

function normalizePartsArray(parts) {
  if (!Array.isArray(parts)) return [];
  return parts.map(normalizePart).filter(Boolean);
}

// Build fallback grouped books from raw filenames (json.values[]) if needed.
// This mirrors the intent of books.js fallback behavior (grouping by cleaned title).
function cleanTitleFromFilename(s) {
  const x = String(s || "").replace(/\.[^.]+$/, ""); // remove extension
  return x
    .replace(/\s*-\s*part\s*\d+\s*$/i, "")
    .replace(/\s*\(\s*part\s*\d+\s*\)\s*$/i, "")
    .trim();
}

function groupFromValues(values) {
  const map = new Map(); // title -> { displayTitle, parts[] }
  for (const v of values || []) {
    const filename = normalizePart(v);
    if (!filename) continue;

    const title = cleanTitleFromFilename(filename);
    const key = title.toLowerCase();

    if (!map.has(key)) {
      map.set(key, { displayTitle: title, parts: [] });
    }
    map.get(key).parts.push(filename);
  }

  // Sort parts so Part 01..Part 10 are ordered
  const out = Array.from(map.values());
  for (const b of out) {
    b.parts = b.parts.sort((a, c) => a.localeCompare(c, undefined, { numeric: true, sensitivity: "base" }));
  }
  return out;
}

async function topHit(searchUrl, query) {
  const payload = {
    search: query,
    top: 1,
    queryType: "simple",
    select: "metadata_storage_name,metadata_storage_path,metadata_storage_url,@search.score",
  };

  const res = await fetch(searchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": SEARCH_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) return { ok: false, status: res.status, text };

  let json;
  try { json = JSON.parse(text); } catch { return { ok: false, status: 200, text: "Non-JSON response from search" }; }

  const docs = Array.isArray(json.value) ? json.value : [];
  return { ok: true, status: 200, hit: docs[0] || null };
}

(async function main() {
  const booksResp = await fetchJson(`${SWA_BASE}/api/books`);
  if (!booksResp.ok) {
    console.error("❌ Failed to fetch /api/books");
    console.error(`HTTP ${booksResp.status}`);
    console.error(booksResp.text);
    process.exit(2);
  }

  const json = booksResp.json || {};
  const grouped = Array.isArray(json.books) ? json.books : [];
  const values = Array.isArray(json.values) ? json.values : [];

  // Prefer grouped books. If empty, build from raw values.
  let books = grouped;
  if (!books.length && values.length) {
    books = groupFromValues(values);
  }

  if (!books.length) {
    console.error("❌ /api/books returned no grouped books and no values[] fallback.");
    console.error("Response keys:", Object.keys(json));
    process.exit(2);
  }

  const searchUrl = buildSearchUrl();
  const results = [];

  let partsChecked = 0;

  for (const book of books) {
    const name = String(book.displayTitle || book.title || book.bookTitle || "(untitled)").trim();
    const groupId = String(book.bookGroupId || book.id || "").trim();

    const partsAll = normalizePartsArray(book.parts);
    if (!partsAll.length) {
      results.push({ name, groupId, pass: false, reason: "NO_PARTS", hits: 0, partsUsed: 0 });
      continue;
    }

    const parts = partsAll.slice(0, MAX_PARTS);
    let hits = 0;

    for (const p of parts) {
      partsChecked++;
      const r = await topHit(searchUrl, p);
      if (r.ok && r.hit) hits++;
    }

    const pass = hits > 0;               // at least 1 part searchable
    const weak = hits < parts.length;    // some parts missing hits

    results.push({
      name,
      groupId,
      pass,
      weak,
      hits,
      partsUsed: parts.length,
      partsTotal: partsAll.length,
    });
  }

  const pass = results.filter((r) => r.pass);
  const fail = results.filter((r) => !r.pass);
  const weak = pass.filter((r) => r.weak);

  console.log("\n=== RoofVault Search-Only Smoke Test ===");
  console.log(`SWA_BASE: ${SWA_BASE}`);
  console.log(`Books: ${results.length}`);
  console.log(`Parts checked (max ${MAX_PARTS}/book): ${partsChecked}`);
  console.log(`PASS (>=1 part searchable): ${pass.length}`);
  console.log(`FAIL (no searchable parts): ${fail.length}`);
  console.log(`PASS but weak (some parts missing hits): ${weak.length}`);

  if (fail.length) {
    console.log("\n--- FAILURES ---");
    for (const f of fail) {
      console.log(`- ${f.name} (${f.groupId}) :: ${f.reason}`);
    }
  }

  if (weak.length) {
    console.log("\n--- WEAK (hits < partsUsed) ---");
    for (const w of weak) {
      console.log(`- ${w.name} (${w.groupId}) :: hits=${w.hits}/${w.partsUsed} (partsTotal=${w.partsTotal})`);
    }
  }

  process.exit(fail.length ? 1 : 0);
})().catch((e) => {
  console.error("❌ Script crashed:", e?.message || String(e));
  process.exit(2);
});
