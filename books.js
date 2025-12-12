// books.js — searchable book dropdown for RoofVault (grouped-books compatible)
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
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else if (c) n.appendChild(c);
    });
    return n;
  }

  let ALL_BOOKS = [];     // full list from API
  let CURRENT_BOOKS = []; // filtered list

  // Optional: metadata for nicer citations on the quiz screen
  // Key should match the "value" you send to the API (bookGroupId in grouped mode OR filename in legacy mode)
  const BOOK_METADATA = {
    // Example legacy filename keys:
    "Roofing-Design-and-Practice-Part1.pdf": {
      title: "Roofing Design and Practice – Part One",
      year: "????"
    },
    "Roofing-Design-and-Practice-Part2.pdf": {
      title: "Roofing Design and Practice – Part Two",
      year: "????"
    }

    // Example grouped key (bookGroupId):
    // "roofing-design-and-practice": { title:"Roofing Design and Practice", year:"2020" }
  };

  // Helper so other scripts can look this up
  window.getBookMetadata = function (bookValue) {
    if (!bookValue) return null;
    return BOOK_METADATA[String(bookValue)] || null;
  };

  // Exposed helper used by other scripts (interactive-exam.js, gen-exam, rvchat)
  window.getSelectedBook = function () {
    const sel = $("bookSelect");
    if (!sel) return null;

    const value = sel.value;
    if (!value) return null;

    const found =
      CURRENT_BOOKS.find((b) => String(b.value) === String(value)) ||
      ALL_BOOKS.find((b) => String(b.value) === String(value));

    // Fallback if not found
    if (!found) {
      return {
        value,
        label: sel.options[sel.selectedIndex]?.text || value,
        field: "metadata_storage_name",
        parts: []
      };
    }

    return {
      value: found.value,
      label: found.label || found.value,
      field: found.field || "metadata_storage_name",
      parts: Array.isArray(found.parts) ? found.parts : []
    };
  };

  // Load books from /api/books
  // Supports BOTH shapes:
  // 1) Grouped: { books:[{ bookGroupId, displayTitle, parts:[...] }] }
  // 2) Legacy:  { field, values:[string,...] }
  async function fetchBooks() {
    const res = await fetch("/api/books", { method: "GET" });
    if (!res.ok) throw new Error("HTTP " + res.status);

    const json = await res.json();

    // ✅ NEW grouped shape
    if (Array.isArray(json.books)) {
      const items = json.books
        .map((b) => {
          const bookGroupId = String(b.bookGroupId || "").trim();
          const displayTitle = String(b.displayTitle || b.bookGroupId || "").trim();
          const parts = Array.isArray(b.parts) ? b.parts.slice() : [];

          if (!bookGroupId && !displayTitle) return null;

          return {
            value: bookGroupId || displayTitle, // what we store/send to API
            label: displayTitle || bookGroupId, // what user sees
            parts,
            field: "bookGroupId"
          };
        })
        .filter(Boolean);

      if (!items.length) {
        const diag = $("diag");
        if (diag) {
          diag.textContent =
            "No grouped books parsed from /api/books. Raw response:\n" +
            JSON.stringify(json, null, 2);
        }
      }

      return items;
    }

    // ✅ Legacy shape
    const field = json.field || "metadata_storage_name";
    const vals = Array.isArray(json.values) ? json.values : [];

    const items = vals.map((v) => {
      const label = String(v || "").trim();
      return {
        value: label, // what we send to /api/exam
        label: label, // shown in dropdown
        parts: [],    // none in legacy mode
        field: field
      };
    });

    if (!items.length) {
      const diag = $("diag");
      if (diag) {
        diag.textContent =
          "No books parsed from /api/books. Raw response:\n" +
          JSON.stringify(json, null, 2);
      }
    }

    return items;
  }

  function renderUI(mount) {
    mount.innerHTML = "";

    const wrapper = el("div");

    // Label
    const label = el("label", { for: "bookSelect", text: "Book" });
    label.style.display = "block";
    label.style.marginBottom = "4px";

    // Search input
    const search = el("input", {
      id: "bookSearchInput",
      type: "text",
      placeholder: "Type to search books (e.g., study guide)…"
    });
    search.style.width = "100%";
    search.style.marginBottom = "6px";
    search.style.padding = "6px 8px";
    search.style.borderRadius = "6px";
    search.style.border = "1px solid #2a2f3a";
    search.style.background = "#05070a";
    search.style.color = "#e6e9ef";

    // Select dropdown
    const select = el("select", { id: "bookSelect" });
    select.style.width = "100%";
    select.style.padding = "6px 8px";
    select.style.borderRadius = "6px";
    select.style.border = "1px solid #2a2f3a";
    select.style.background = "#05070a";
    select.style.color = "#e6e9ef";

    wrapper.appendChild(label);
    wrapper.appendChild(search);
    wrapper.appendChild(select);
    mount.appendChild(wrapper);

    return { search, select };
  }

  function populateSelect(select, books) {
    CURRENT_BOOKS = books.slice();
    select.innerHTML = "";

    // Placeholder option
    const placeholder = el("option", {
      value: "",
      text: books.length ? "Select a book…" : "No books found"
    });
    select.appendChild(placeholder);

    books.forEach((b) => {
      const opt = el("option", {
        value: b.value,
        text: b.label || b.value
      });
      select.appendChild(opt);
    });
  }

  function applyFilter(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return ALL_BOOKS.slice();

    return ALL_BOOKS.filter((b) => {
      const label = (b.label || "").toLowerCase();
      const value = (b.value || "").toLowerCase();
      return label.includes(q) || value.includes(q);
    });
  }

  async function init() {
    const mount =
      $("bookMount") ||
      (function () {
        const div = el("div");
        div.id = "bookMount";
        document.body.insertBefore(div, document.body.firstChild);
        return div;
      })();

    const { search, select } = renderUI(mount);

    try {
      const books = await fetchBooks();
      ALL_BOOKS = books;
      populateSelect(select, books);
    } catch (e) {
      console.error("Failed to load books", e);
      select.innerHTML = "";
      select.appendChild(
        el("option", { value: "", text: "Error loading books" })
      );
      const diag = $("diag");
      if (diag) diag.textContent = "Failed to load books: " + String(e?.message || e);
      return;
    }

    // Live filter on input (case-insensitive)
    search.addEventListener("input", () => {
      const filtered = applyFilter(search.value);
      populateSelect(select, filtered);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
