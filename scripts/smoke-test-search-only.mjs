// scripts/smoke-test-search-only.mjs
// RoofVault: Search-only smoke test (NO OpenAI calls).
// Source of truth: SWA /api/books (same as frontend).
// Search strategy (per part):
//   A) Exact filename filter: search="*" + filter metadata_storage_name eq '<part>'
//   B) Fallback free-text: search="<part>"
// This prevents false FAILs when filename fields aren’t full-text searchable.
//
// Usage:
//   SWA_BASE="https://kind-flower-0fe142d0f.3.azurestaticapps.net" \
//   SEARCH_ENDPOINT="https://<your-search>.search.windows.net" \
//   SEARCH_API_KEY="<your-key>" \
//   SEARCH_INDEX_CONTENT="azureblob-index-content" \
//   node scripts/smoke-test-search-only.mjs

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
  return { ok: res.ok, status: res.status, text, json };
}

function normalizePart(p) {
  if (typeof p === "string") return p.trim();

  if (p && typeof p === "object") {
    return String(
      p.metadata_storage_name ||
      p.fileName ||
      p.name ||
      p.raw ||
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

// Escape single quotes for OData filter string literals
function escapeODataString(s) {
  return String(s).replace(/'/g, "''");
}

async function searchTopHit(searchUrl, payload) {
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
  return { ok: true, status: 200, hit: docs[0] || null, json };
}

// Attempt A: exact filename filter (fast + definitive if field is filterable)
async function hitByExactFilename(searchUrl, partName) {
  const filter = `metadata_storage_name eq '${escapeODataString(partName)}'`;
  const payload = {
    search: "*",
    top: 1,
    filter,
    queryType: "simple",
    select: "metadata_storage_name,metadata_storage_path,metadata_storage_url,@search.score",
  };
  return await searchTopHit(searchUrl, payload);
}

// Attempt B: fallback free-text search (less definitive)
async function hitByFreeText(searchUrl, partName) {
  const payload = {
    search: partName,
    top: 1,
    queryType: "simple",
    select: "metadata_storage_name,metadata_storage_path,metadata_storage_url,@search.score",
  };
  return await searchTopHit(searchUrl, payload);
}

(async function main() {
  const booksResp = await fetchJson(`${SWA_BASE}/api/books`);
  if (!booksResp.ok) {
    console.error("❌ Failed to fetch /api/books");
    console.error(`HTTP ${booksResp.status}`);
    console.error(String(booksResp.text).slice(0, 2000));
    process.exit(2);
  }

  const json = booksResp.json || {};
  const grouped = Array.isArray(json.books) ? json.books : [];
  const values = Array.isArray(json.values) ? json.values : [];

  if (!grouped.length && !values.length) {
    console.error("❌ /api/books returned no books and no values[] fallback.");
    console.error("Response keys:", Object.keys(json));
    process.exit(2);
  }

  // Prefer grouped list (it matches UI behavior)
  const books = grouped.length ? grouped : values.map(v => ({ displayTitle: String(v), parts: [String(v)] }));

  const searchUrl = buildSearchUrl();
  const results = [];
  let partsChecked = 0;

  // Quick sanity probe: we’ll print 1 debug sample if everything looks like “0 hits”
  let debugPrinted = false;

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
    let exactOk = 0;
    let exactEmpty = 0;
    let exactErrored = 0;

    for (const p of parts) {
      partsChecked++;

      // A) exact filename filter
      const a = await hitByExactFilename(searchUrl, p);
      if (a.ok) {
        if (a.hit) {
          hits++;
          exactOk++;
          continue;
        } else {
          exactEmpty++;
        }
      } else {
        exactErrored++;
      }

      // B) fallback free-text
      const b = await hitByFreeText(searchUrl, p);
      if (b.ok && b.hit) {
        hits++;
      }

      // If we’re in the “everything is failing” scenario, print a single debug sample once.
      if (!debugPrinted && hits === 0 && partsChecked <= 5) {
        debugPrinted = true;
        console.log("\n[debug] sample part that returned no hit:");
        console.log("partName:", p);
        console.log("exactFilterStatus:", a.status, "exactHit:", !!a.hit, "exactOk:", a.ok);
        if (!a.ok) console.log("exactFilterErrorBody:", String(a.text).slice(0, 400));
        console.log("freeTextStatus:", b.status, "freeTextHit:", !!b.hit, "freeTextOk:", b.ok);
        if (!b.ok) console.log("freeTextErrorBody:", String(b.text).slice(0, 400));
      }
    }

    const pass = hits > 0;
    const weak = hits < parts.length;

    results.push({
      name,
      groupId,
      pass,
      weak,
      hits,
      partsUsed: parts.length,
      partsTotal: partsAll.length,
      exact: { ok: exactOk, empty: exactEmpty, errored: exactErrored },
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
      console.log(`- ${f.name} (${f.groupId}) :: ${f.reason || "NO_HITS"}`);
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
