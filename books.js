// books.js — searchable book dropdown for RoofVault
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

  let ALL_BOOKS = []; // full list from API
  let CURRENT_BOOKS = []; // filtered list
// Optional: metadata for nicer citations on the quiz screen
// Fill in years as you confirm them from each book.
const BOOK_METADATA = {
  // example key: whatever value we use for metadata_storage_name for this book
  // You can add more entries over time.
  "Roofing-Design-and-Practice-Part1.pdf": {
    title: "Roofing Design and Practice – Part One",
    year: "????" // <-- replace with real year when you know it
  },
  "Roofing-Design-and-Practice-Part2.pdf": {
    title: "Roofing Design and Practice – Part Two",
    year: "????"
  }
  // Add more books here as needed
};

// Helper so other scripts (interactive-exam.js) can look this up
window.getBookMetadata = function (bookValue) {
  if (!bookValue) return null;
  return BOOK_METADATA[String(bookValue)] || null;
};

  // Exposed helper used by other scripts (gen-exam, rvchat)
  window.getSelectedBook = function () {
    const sel = $("bookSelect");
    if (!sel) return null;
    const value = sel.value;
    if (!value) return null;

    const found =
      CURRENT_BOOKS.find((b) => String(b.value) === value) ||
      ALL_BOOKS.find((b) => String(b.value) === value);

    if (!found) {
      return {
        value,
        label: sel.options[sel.selectedIndex]?.text || value,
        field: "metadata_storage_name"
      };
    }

    return {
      value: found.value,
      label: found.label || found.value,
      field: found.field || "metadata_storage_name"
    };
  };

     // Load books from /api/books (shape: { field, values:[string,...] })
  async function fetchBooks() {
    const res = await fetch("/api/books", { method: "GET" });
    if (!res.ok) throw new Error("HTTP " + res.status);

    const json = await res.json();

    const field = json.field || "metadata_storage_name";
    const vals = Array.isArray(json.values) ? json.values : [];

    const items = vals.map((v) => {
      const label = String(v || "").trim();
      return {
        value: label,          // this is what we send to /api/exam
        label: label,          // shown in the dropdown
        field: field           // passed as filterField
      };
    });

    // Optional: if nothing parsed, show raw response in DIAGNOSTICS
    if (!items.length) {
      const diag = document.getElementById("diag");
      if (diag) {
        diag.textContent =
          "No books parsed from /api/books. Raw response: " +
          JSON.stringify(json, null, 2);
      }
    }

    return items;
  }



  function renderUI(mount) {
    mount.innerHTML = "";

    const wrapper = el("div");

    // Label
    const label = el("label", {
      for: "bookSelect",
      text: "Book"
    });
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
      const opt = el("option", {
        value: "",
        text: "Error loading books"
      });
      select.appendChild(opt);
      return;
    }

    // Live filter on keyup (case-insensitive)
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
