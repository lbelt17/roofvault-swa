// books.js — RoofVault grouped book dropdown + search (CLEAN + FIXED)
// Uses /api/books -> body.books[] when available (grouped), fallback to body.values[] (raw)
//
// Goal: Blobs named like "Example Book - Part 01", "Example Book - Part 02", ...
// This script shows ONE clean title and stores the full parts list in window.__rvSelectedBook

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

  // ---------- Normalize parts ----------
  // Ensures we always store an array of STRING blob names in selection.parts
  // Supports books-v2 parts objects like:
  // { raw: "BlobName", fileName: "BlobName", partLabel: null }
  function normalizeParts(parts) {
    if (!Array.isArray(parts)) return [];

    return parts
      .map((p) => {
        // already a string
        if (typeof p === "string") return p;

        // object: pick best-known fields
        if (p && typeof p === "object") {
          return (
            p.fileName ||               // ✅ books-v2
            p.raw ||                    // ✅ books-v2
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

    // Map cleaned title -> grouped entry
    const map = new Map();

    vals.forEach((v) => {
      const raw = String(v || "").trim();
      if (!raw) return;

      const title = cleanDisplayTitle(raw);
      if (!title) return;

      if (!map.has(title)) {
        map.set(title, {
          bookGroupId: title, // stable id in fallback mode
          displayTitle: title,
          parts: []
        });
      }

      map.get(title).parts.push(raw);
    });

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

    const sorted = options.slice().sort((a, b) =>
      a.displayTitle.localeCompare(b.displayTitle)
    );
    const byId = new Map(sorted.map((b) => [b.bookGroupId, b]));

    function fill(list) {
      select.length = 1; // keep placeholder
      list.forEach((b) => {
        select.appendChild(
          el("option", { value: b.bookGroupId, text: b.displayTitle })
        );
      });
    }

    fill(sorted);

    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      if (!q) return fill(sorted);
      fill(sorted.filter((b) => b.displayTitle.toLowerCase().includes(q)));
    });

    select.addEventListener("change", () => {
      const picked = byId.get(select.value) || null;

      const selection = picked
        ? {
            bookGroupId: picked.bookGroupId || "",
            displayTitle: picked.displayTitle || "",
            parts: normalizeParts(picked.parts)
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

      // 1) Build grouped options if available
      const grouped = buildGroupedOptions(json);

      // 2) If grouped exists but some books have no parts, rebuild missing parts from values[]
      if (grouped.length && Array.isArray(json?.values) && json.values.length) {
        const raw = json.values
          .map((v) => String(v || "").trim())
          .filter(Boolean);

        // map normalizedTitle -> list of raw part strings
        const titleToParts = new Map();

        raw.forEach((name) => {
          const title = cleanDisplayTitle(name);
          const key = keyifyTitle(title);
          if (!key) return;

          if (!titleToParts.has(key)) titleToParts.set(key, []);
          titleToParts.get(key).push(name);
        });

        grouped.forEach((b) => {
          if (!Array.isArray(b.parts) || b.parts.length === 0) {
            const guessTitle = cleanDisplayTitle(b.displayTitle);
            const key = keyifyTitle(guessTitle);
            const parts = titleToParts.get(key) || [];
            b.parts = parts; // ✅ now single-file books get a 1-item parts array
          }
        });
      }

      const options = grouped.length ? grouped : buildFallbackOptions(json);
      renderDropdown(mount, options);

      // Initialize selection empty (keeps state consistent)
      window.__rvSelectedBook = { bookGroupId: "", displayTitle: "", parts: [] };
      window.__rvBookSelection = window.__rvSelectedBook;
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
