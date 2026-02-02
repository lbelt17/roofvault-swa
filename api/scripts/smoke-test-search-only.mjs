// scripts/smoke-test-search-only.mjs
// RoofVault: Search-only smoke test (NO OpenAI calls).
// Reads book definitions from ./books.js (root) and checks Azure AI Search top=1 per part.
// Usage:
//   SEARCH_ENDPOINT="https://<your-search>.search.windows.net" \
//   SEARCH_API_KEY="<your-key>" \
//   SEARCH_INDEX_CONTENT="azureblob-index-content" \
//   node scripts/smoke-test-search-only.mjs

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const MAX_PARTS = 8;
const BOOKS_JS_PATH = path.resolve("books.js");

const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "azureblob-index-content";

if (!SEARCH_ENDPOINT || !SEARCH_API_KEY) {
  console.error("❌ Missing env vars. Set SEARCH_ENDPOINT and SEARCH_API_KEY.");
  process.exit(2);
}

function safeRunBooksJs(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  // minimal browser-like sandbox
  const sandbox = {
    window: {},
    document: {
      // Some scripts may read document.getElementById; provide harmless stubs
      getElementById: () => null,
      querySelector: () => null,
    },
    console,
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: filePath });

  // books.js might store books on one of these
  const candidates = [
    sandbox.window.__rvBooks,
    sandbox.window.rvBooks,
    sandbox.window.BOOKS,
    sandbox.window.books,
    sandbox.window.__books,
  ];

  const books = candidates.find((x) => Array.isArray(x) && x.length);
  if (!books) {
    throw new Error(
      `Could not find a books array after running ${filePath}.
Looked for: window.__rvBooks / rvBooks / BOOKS / books / __books`
    );
  }
  return books;
}

function normalizeParts(book) {
  const parts = Array.isArray(book?.parts) ? book.parts : [];
  return parts
    .map((p) => {
      if (typeof p === "string") return p.trim();
      if (p && typeof p === "object") {
        return String(
          p.metadata_storage_name ||
            p.name ||
            p.id ||
            p.partId ||
            p.blobName ||
            p.ref ||
            p.key ||
            ""
        ).trim();
      }
      return "";
    })
    .filter(Boolean);
}

function label(book) {
  return (
    book.displayTitle ||
    book.title ||
    book.bookTitle ||
    book.bookGroupId ||
    book.id ||
    "(untitled)"
  );
}

function searchUrl() {
  const base = SEARCH_ENDPOINT.replace(/\/$/, "");
  return `${base}/indexes/${encodeURIComponent(
    SEARCH_INDEX_CONTENT
  )}/docs/search?api-version=2023-11-01`;
}

async function topHit(url, query) {
  const payload = {
    search: query,
    top: 1,
    queryType: "simple",
    select: "metadata_storage_name,metadata_storage_path,metadata_storage_url,@search.score",
  };

  const res = await fetch(url, {
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
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, status: 200, text: "Non-JSON response from search" };
  }

  const docs = Array.isArray(json.value) ? json.value : [];
  return { ok: true, status: 200, hit: docs[0] || null };
}

(async function main() {
  const books = safeRunBooksJs(BOOKS_JS_PATH);
  const url = searchUrl();

  const results = [];
  let partsChecked = 0;

  for (const b of books) {
    const name = label(b);
    const groupId = b.bookGroupId || b.id || "";

    const partsAll = normalizeParts(b);
    if (!partsAll.length) {
      results.push({ name, groupId, pass: false, reason: "NO_PARTS", hits: 0, partsUsed: 0 });
      continue;
    }

    const parts = partsAll.slice(0, MAX_PARTS);
    let hits = 0;

    for (const p of parts) {
      partsChecked++;
      const r = await topHit(url, p);
      if (r.ok && r.hit) hits++;
    }

    // pass = at least 1 part returns a hit
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
    });
  }

  const pass = results.filter((r) => r.pass);
  const fail = results.filter((r) => !r.pass);
  const weak = pass.filter((r) => r.weak);

  console.log("\n=== RoofVault Search-Only Smoke Test ===");
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
