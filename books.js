// books.js — RoofVault grouped book dropdown + search (PERF-OPT SAFE)
// Uses /api/books -> body.books[] when available (grouped), fallback to body.values[] (raw)
//
// Goal: Blobs named like "Example Book - Part 01", "Example Book - Part 02", ...
// This script shows ONE clean title and stores the full parts list in window.__rvSelectedBook
//
// PERF NOTES:
// - Avoids building a full title->parts index for ALL values[] when only a few grouped books are missing parts.
// - Batches <option> creation with DocumentFragment to reduce DOM churn.

(function () {
  "use strict";

  // ---------- DOM helpers ----------
  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);

    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    });

    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });

    return n;
  }

  // ---------- API ----------
  async function fetchBooks() {
    const res = await fetch("/api/books", { cache: "no-store" });
    if (!res.ok) throw new Error(`books api failed: ${res.status}`);
    return await res.json();
  }

  // ---------- Title cleaning ----------
  // Only strips a TRAILING " - Part 01" / " - Part 1" etc. and optional .pdf
  function cleanDisplayTitle(raw) {
    let s = String(raw || "").trim();
    s = s.replace(/\.pdf$/i, "").trim();
    s = s.replace(/\s*-\s*Part\s*\d+\s*$/i, "").trim();
    s = s.replace(/\s{2,}/g, " ").trim();
    return s;
  }

  // Normalize titles so these match:
  // "IIBEC-Manual-of-Practice-Glossary-Section"
  // "IIBEC - Manual - of - Practice - Glossary - Section"
  function keyifyTitle(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\.pdf$/i, "")
      .replace(/\s+/g, "")        // remove all spaces
      .replace(/[^a-z0-9]/g, ""); // remove punctuation/hyphens
  }

  // IMPORTANT:
  // NRCA has two naming conventions in your system for the same books:
  // - "NRCA - Membrane Roof Systems 2019"
  // - "NRCA-Roofing-Manual-Membrane-Roof-Systems-2019"
  //
  // They refer to the same material, but keyifyTitle() produces different keys because of "roofingmanual".
  // canonicalKey() normalizes that difference for NRCA titles ONLY (low risk).
  function canonicalKey(title) {
    const k = keyifyTitle(title);

    // If the key starts with "nrcaroofingmanual...", treat it as "nrca..."
    // This makes:
    //   nrcaroofingmanualmembraneroofsystems2019
    // match
    //   nrcamembraneroofsystems2019
    if (k.startsWith("nrcaroofingmanual")) {
      return "nrca" + k.slice("nrcaroofingmanual".length);
    }

    return k;
  }

  // ---------- Normalize parts ----------
  // Ensures we always store an array of STRING blob names in selection.parts
  // Supports books-v2 parts objects like:
  // { raw: "BlobName", fileName: "BlobName", partLabel: null }
  function normalizeParts(parts) {
    if (!Array.isArray(parts)) return [];

    return parts
      .map((p) => {
        if (typeof p === "string") return p;

        if (p && typeof p === "object") {
          return (
            p.fileName ||
            p.raw ||
            p.metadata_storage_name ||
            p.name ||
            p.id ||
            p.partId ||
            p.blobName ||
            p.ref ||
            p.key ||
            ""
          );
        }

        return "";
      })
      .map((s) => String(s).trim())
      .filter(Boolean);
  }

  // Try to sort parts by trailing "Part NN" if present, otherwise keep original order
  function sortParts(parts) {
    const copy = normalizeParts(parts);

    function partNum(s) {
      const m = String(s).match(/part\s*0*([0-9]+)\s*$/i);
      if (!m) return Number.POSITIVE_INFINITY;
      const n = parseInt(m[1], 10);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    }

    return copy.slice().sort((a, b) => partNum(a) - partNum(b));
  }

  // ---------- Build options from /api/books (grouped) ----------
  function buildGroupedOptions(json) {
    const books = Array.isArray(json?.books) ? json.books : [];
    // Expect each: { bookGroupId, displayTitle, parts[] }
    return books
      .map((b) => ({
        bookGroupId: String(b?.bookGroupId || "").trim(),
        displayTitle: cleanDisplayTitle(b?.displayTitle || ""),
        parts: normalizeParts(b?.parts)
      }))
      .filter((b) => b.bookGroupId && b.displayTitle);
  }

  // ---------- Fallback if /api/books only returns raw filenames ----------
  function buildFallbackOptions(json) {
    const vals = Array.isArray(json?.values) ? json.values : [];
    const map = new Map();

    for (let i = 0; i < vals.length; i++) {
      const raw = String(vals[i] || "").trim();
      if (!raw) continue;

      const title = cleanDisplayTitle(raw);
      if (!title) continue;

      let entry = map.get(title);
      if (!entry) {
        entry = {
          bookGroupId: title, // stable id in fallback mode
          displayTitle: title,
          parts: []
        };
        map.set(title, entry);
      }

      entry.parts.push(raw);
    }

    return Array.from(map.values()).sort((a, b) =>
      a.displayTitle.localeCompare(b.displayTitle)
    );
  }

  // ---------- Render dropdown ----------
  function renderDropdown(mount, options) {
    mount.innerHTML = "";

    const label = el("div", { class: "rv-book-label", text: "Select a book" });

    const search = el("input", {
      class: "rv-book-search",
      type: "text",
      placeholder: "Search books…",
      autocomplete: "off"
    });

    const select = el("select", { class: "rv-book-select" }, [
      el("option", { value: "", text: "Select a book…" })
    ]);

    // Sort once
    const sorted = options.slice().sort((a, b) =>
      a.displayTitle.localeCompare(b.displayTitle)
    );

    // Map for selection lookup (same as before)
    const byId = new Map(sorted.map((b) => [b.bookGroupId, b]));

    // Precompute lowercase titles once for filtering
    const sortedWithLC = sorted.map((b) => ({
      b,
      lc: (b.displayTitle || "").toLowerCase()
    }));

    function fill(list) {
      // keep placeholder
      select.length = 1;

      const frag = document.createDocumentFragment();
      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        frag.appendChild(new Option(b.displayTitle, b.bookGroupId));
      }
      select.appendChild(frag);
    }

    fill(sorted);

    // Simple, safe filter (same behavior)
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      if (!q) return fill(sorted);

      const out = [];
      for (let i = 0; i < sortedWithLC.length; i++) {
        const item = sortedWithLC[i];
        if (item.lc.includes(q)) out.push(item.b);
      }
      fill(out);
    });

    select.addEventListener("change", () => {
      const picked = byId.get(select.value) || null;

      const selection = picked
        ? {
            bookGroupId: picked.bookGroupId || "",
            displayTitle: picked.displayTitle || "",
            parts: sortParts(picked.parts)
          }
        : { bookGroupId: "", displayTitle: "", parts: [] };

      // ✅ Contract used by gen-exam.js and other pages
      window.__rvSelectedBook = selection;
      window.__rvBookSelection = selection;

      // ✅ Notify listeners
      window.dispatchEvent(new CustomEvent("rv:bookChanged", { detail: selection }));
    });

    mount.appendChild(label);
    mount.appendChild(search);
    mount.appendChild(select);
  }

  // ---------- Init ----------
  async function init() {
    const mount = $("bookMount");
    if (!mount) return;

    try {
      const json = await fetchBooks();
      console.time("books.js:build");

      // Initialize selection empty (keeps state consistent)
      window.__rvSelectedBook = { bookGroupId: "", displayTitle: "", parts: [] };
      window.__rvBookSelection = window.__rvSelectedBook;

      const grouped = buildGroupedOptions(json);

      // If grouped exists and we have values[], merge parts from values[] (not only when empty)
      // This is important because grouped may be missing Part 02, etc.
      if (grouped.length && Array.isArray(json?.values) && json.values.length) {
        const vals = json.values;

        // Only build an index for titles that are actually present in grouped
        const neededKeys = new Set();
        for (let i = 0; i < grouped.length; i++) {
          const b = grouped[i];
          const key = canonicalKey(cleanDisplayTitle(b.displayTitle));
          if (key) neededKeys.add(key);
        }

        const titleToParts = new Map(); // key -> string[]
        for (let i = 0; i < vals.length; i++) {
          const name = String(vals[i] || "").trim();
          if (!name) continue;

          const title = cleanDisplayTitle(name);
          const key = canonicalKey(title);
          if (!key || !neededKeys.has(key)) continue;

          let arr = titleToParts.get(key);
          if (!arr) {
            arr = [];
            titleToParts.set(key, arr);
          }
          arr.push(name);
        }

        // Merge (union) discovered parts into grouped parts
        for (let i = 0; i < grouped.length; i++) {
          const b = grouped[i];
          const key = canonicalKey(cleanDisplayTitle(b.displayTitle));
          const found = titleToParts.get(key) || [];

          if (found.length) {
  const existing = normalizeParts(b.parts);
  const set = new Set(existing);
  for (let j = 0; j < found.length; j++) set.add(String(found[j]).trim());

  // ✅ Keep ONLY one naming family (the family already used by grouped data)
  // Use the first existing part as the "truth" for the desired prefix
  const first = existing[0] || "";
  const desiredPrefix = first.split(" - Part")[0]; // everything before " - Part"

  const filtered = Array.from(set).filter((p) => {
    // must match the same prefix family
    return desiredPrefix && p.startsWith(desiredPrefix);
  });

  b.parts = sortParts(filtered);
} else {
  b.parts = sortParts(b.parts);
}

        }
      }

      const options = grouped.length ? grouped : buildFallbackOptions(json);
      console.timeEnd("books.js:build");
      renderDropdown(mount, options);
    } catch (e) {
      console.error(e);
      mount.innerHTML = "";
      mount.appendChild(
        el("div", {
          class: "rv-book-error",
          text: "Book list failed to load. Refresh and try again."
        })
      );
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
