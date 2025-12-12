// books.js — searchable book dropdown for RoofVault (robust grouping + cleanup)
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

  let ALL_BOOKS = [];
  let CURRENT_BOOKS = [];

  // Optional metadata
  const BOOK_METADATA = {
    "Roofing-Design-and-Practice-Part1.pdf": { title: "Roofing Design and Practice – Part One", year: "????" },
    "Roofing-Design-and-Practice-Part2.pdf": { title: "Roofing Design and Practice – Part Two", year: "????" }
  };

  window.getBookMetadata = function (bookValue) {
    if (!bookValue) return null;
    return BOOK_METADATA[String(bookValue)] || null;
  };

  window.getSelectedBook = function () {
    const sel = $("bookSelect");
    if (!sel) return null;

    const value = sel.value;
    if (!value) return null;

    const found =
      CURRENT_BOOKS.find((b) => String(b.value) === String(value)) ||
      ALL_BOOKS.find((b) => String(b.value) === String(value));

    if (!found) {
      return {
        value,
        label: sel.options[sel.selectedIndex]?.text || value,
        field: "metadata_storage_name",
        parts: [],
        groupId: value
      };
    }

    return {
      value: found.value,                         // IMPORTANT: stays as a real filename for your existing /api/exam
      label: found.label || found.value,
      field: found.field || "metadata_storage_name",
      parts: Array.isArray(found.parts) ? found.parts : [],
      groupId: found.groupId || found.value       // used later when we upgrade backend to use all parts
    };
  };

  // ---------- cleanup + grouping helpers ----------
  function stripExtension(name) {
    return String(name || "").replace(/\.(pdf|docx|doc|pptx|ppt|xlsx|xls|txt)$/i, "");
  }

  function prettifyLabel(raw) {
    // Keep original punctuation, just remove extension and trim
    return stripExtension(raw).trim();
  }

  // Build a "group key" by removing common part/pt suffix patterns
  function makeGroupKey(raw) {
    let s = stripExtension(String(raw || "")).trim();

    // Normalize separators
    s = s.replace(/[_]+/g, "-").replace(/\s+/g, " ").trim();

    // Remove common "part/pt" suffixes at the end
    // examples:
    //  - "Manual Part1" / "Manual - Part 2" / "Manual_Part3"
    //  - "Manual pt. 1" / "Manual - pt 2" / "Manual Pt3"
    //  - "Manual (Part 1)" / "Manual – Part 1"
    s = s.replace(/\s*[\(\[\{]?\s*(part|pt)\.?\s*[-_ ]*\s*\d+\s*[\)\]\}]?\s*$/i, "").trim();

    // Remove endings like "-details_part4" or "_details_part4"
    s = s.replace(/\s*[-_ ]*details?\s*[-_ ]*part\s*\d+\s*$/i, "").trim();

    // Also handle "Part 3 of 7" style endings
    s = s.replace(/\s*(part|pt)\.?\s*\d+\s*of\s*\d+\s*$/i, "").trim();

    // Collapse spaces
    s = s.replace(/\s+/g, " ").trim();

    // Lowercase key, hyphenate
    const key = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return key || stripExtension(String(raw || "")).toLowerCase();
  }

  function groupLegacyValues(values) {
    // values = ["Book-Part1.pdf","Book-Part2.pdf","Other.pdf", ...]
    const map = new Map();

    for (const v of values) {
      const raw = String(v || "").trim();
      if (!raw) continue;

      const groupId = makeGroupKey(raw);
      const labelBase = prettifyLabel(raw);

      if (!map.has(groupId)) {
        map.set(groupId, {
          groupId,
          label: labelBase,   // we’ll possibly improve this below
          parts: [raw]
        });
      } else {
        map.get(groupId).parts.push(raw);
      }
    }

    // Improve labels: if multiple parts, use the shortest cleaned label (usually the “base” title)
    const out = [];
    for (const g of map.values()) {
      const cleaned = g.parts.map(prettifyLabel);
      cleaned.sort((a, b) => a.length - b.length);
      const bestLabel = cleaned[0] || g.label;

      out.push({
        // IMPORTANT: keep value as the FIRST REAL FILE so your existing backend filter still works today
        value: g.parts[0],
        label: bestLabel,
        parts: g.parts.slice(),
        groupId: g.groupId,
        field: "metadata_storage_name"
      });
    }

    // Sort alphabetically
    out.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    return out;
  }

  // ---------- API loader ----------
  async function fetchBooks() {
    const res = await fetch("/api/books", { method: "GET" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();

    // If your API ever returns { books:[...] } grouped format
    if (Array.isArray(json.books)) {
      const items = json.books
        .map((b) => {
          const bookGroupId = String(b.bookGroupId || "").trim();
          const displayTitle = String(b.displayTitle || b.bookGroupId || "").trim();
          const parts = Array.isArray(b.parts) ? b.parts.slice() : [];
          if (!bookGroupId && !displayTitle) return null;

          // Keep value = first part filename (safe for current backend)
          const safeValue = (parts[0] || displayTitle || bookGroupId);

          return {
            value: safeValue,
            label: displayTitle ? prettifyLabel(displayTitle) : prettifyLabel(safeValue),
            parts,
            groupId: bookGroupId || makeGroupKey(displayTitle || safeValue),
            field: "bookGroupId"
          };
        })
        .filter(Boolean);

      return items;
    }

    // Legacy { field, values:[...] }
    const vals = Array.isArray(json.values) ? json.values : [];
    return groupLegacyValues(vals);
  }

  // ---------- UI ----------
  function renderUI(mount) {
    mount.innerHTML = "";

    const wrapper = el("div");

    const label = el("label", { for: "bookSelect", text: "Book" });
    label.style.display = "block";
    label.style.marginBottom = "4px";

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

    select.appendChild(
      el("option", {
        value: "",
        text: books.length ? "Select a book…" : "No books found"
      })
    );

    books.forEach((b) => {
      select.appendChild(
        el("option", {
          value: b.value,
          text: b.label || b.value
        })
      );
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
    const mount = $("bookMount");
    if (!mount) return; // don't auto-inject into random pages

    const { search, select } = renderUI(mount);

    try {
      const books = await fetchBooks();
      ALL_BOOKS = books;
      populateSelect(select, books);
    } catch (e) {
      console.error("Failed to load books", e);
      select.innerHTML = "";
      select.appendChild(el("option", { value: "", text: "Error loading books" }));
      const diag = $("diag");
      if (diag) diag.textContent = "Failed to load books: " + String(e?.message || e);
      return;
    }

    search.addEventListener("input", () => {
      populateSelect(select, applyFilter(search.value));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
