// books.js — RoofVault grouped book dropdown + search (CLEAN)
// Uses /api/books -> body.books[] when available (grouped), fallback to body.values[] (raw)
//
// Goal: Your blobs are named: "Example Book - Part 01", "Example Book - Part 02", ...
// This script shows ONE clean title: "Example Book" (no Part, no .pdf, no weird "- -")

(function () {
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

  async function fetchBooks() {
    const res = await fetch("/api/books", { cache: "no-store" });
    if (!res.ok) throw new Error(`books api failed: ${res.status}`);
    return await res.json();
  }

  // ✅ Only strip trailing " - Part 01" / " - Part 1" etc. (and optional .pdf)
  // ✅ Does NOT touch hyphens in the middle of titles (prevents "- -" weirdness)
  function cleanDisplayTitle(raw) {
    let s = String(raw || "").trim();

    // remove file extension if it ever appears
    s = s.replace(/\.pdf$/i, "").trim();

    // remove ONLY a trailing part suffix
    // Examples:
    // "Architectural sheet metal manual - Part 01" -> "Architectural sheet metal manual"
    // "ASCE - Minimum Design Loads ... - Part 10" -> "ASCE - Minimum Design Loads ..."
    s = s.replace(/\s*-\s*Part\s*\d+\s*$/i, "").trim();

    // collapse accidental double spaces
    s = s.replace(/\s{2,}/g, " ").trim();

    return s;
  }

  function buildGroupedOptions(json) {
    const books = Array.isArray(json.books) ? json.books : [];
    // Expect: { bookGroupId, displayTitle, parts[] }
    return books
      .map((b) => ({
        bookGroupId: String(b.bookGroupId || "").trim(),
        displayTitle: cleanDisplayTitle(b.displayTitle),
        parts: Array.isArray(b.parts) ? b.parts.map(String) : []
      }))
      .filter((b) => b.bookGroupId && b.displayTitle);
  }

  function buildFallbackOptions(json) {
    const vals = Array.isArray(json.values) ? json.values : [];

    // Fallback is raw filenames; we still show a clean grouped title and keep "parts" for the scripts.
    // We also dedupe titles so you don’t see Part 01/02/03 as separate options.
    const map = new Map(); // displayTitle -> { bookGroupId, displayTitle, parts[] }

    vals.forEach((v) => {
      const raw = String(v || "").trim();
      if (!raw) return;

      const title = cleanDisplayTitle(raw);
      if (!title) return;

      if (!map.has(title)) {
        map.set(title, {
          // Stable ID: use the cleaned title (so selection is consistent)
          bookGroupId: title,
          displayTitle: title,
          parts: []
        });
      }
      map.get(title).parts.push(raw);
    });

    return Array.from(map.values()).sort((a, b) => a.displayTitle.localeCompare(b.displayTitle));
  }

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

    function fill(list) {
      select.length = 1; // keep placeholder
      list.forEach((b) => {
        select.appendChild(el("option", { value: b.bookGroupId, text: b.displayTitle }));
      });
    }

    // Sort once for a clean dropdown
    const sorted = options.slice().sort((a, b) => a.displayTitle.localeCompare(b.displayTitle));
    fill(sorted);

    const byId = new Map(sorted.map((b) => [b.bookGroupId, b]));

    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      if (!q) return fill(sorted);
      fill(sorted.filter((b) => b.displayTitle.toLowerCase().includes(q)));
    });

    select.addEventListener("change", () => {
  const picked = byId.get(select.value);

  const selection = picked
    ? {
        bookGroupId: picked.bookGroupId,
        displayTitle: picked.displayTitle,
        parts: picked.parts || []
      }
    : { bookGroupId: "", displayTitle: "", parts: [] };

  // ✅ Make gen-exam.js happy (permanent contract)
  window.__rvSelectedBook = selection;

  // (optional) keep your existing variable too, if other code uses it
  window.__rvBookSelection = selection;

  // ✅ notify listeners
  window.dispatchEvent(new CustomEvent("rv:bookChanged", { detail: selection }));
});


    mount.appendChild(label);
    mount.appendChild(search);
    mount.appendChild(select);
  }

  async function init() {
    const mount = $("bookMount");
    if (!mount) return;

    try {
      const json = await fetchBooks();
      const grouped = buildGroupedOptions(json);
      const options = grouped.length ? grouped : buildFallbackOptions(json);
      renderDropdown(mount, options);
    } catch (e) {
      mount.innerHTML = "";
      mount.appendChild(
        el("div", {
          class: "rv-book-error",
          text: "Book list failed to load. Refresh and try again."
        })
      );
      console.error(e);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
