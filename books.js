// books.js — RoofVault book dropdown (GROUPED + SEARCH BAR)
// - Prefers /api/books -> json.books[] (grouped)
// - Falls back to json.values[] (raw)
// - Renders a search input ABOVE the <select>
// - Stores selection in localStorage and emits `rv:bookChanged`

(function () {
  const API_URL = "/api/books";
  const STORAGE_KEY = "rv:selectedBook";

  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "value") n.value = v;
      else if (k === "placeholder") n.placeholder = v;
      else n.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else n.appendChild(c);
    });
    return n;
  }

  async function fetchBooks() {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load books: ${res.status}`);
    return await res.json();
  }

  function buildGroupedOptions(json) {
    const books = Array.isArray(json?.books) ? json.books : [];
    // Each book: { bookGroupId, displayTitle, parts: [...] }
    return books
      .filter((b) => b && b.displayTitle)
      .map((b) => ({
        label: b.displayTitle,
        bookGroupId: b.bookGroupId || b.displayTitle,
        parts: Array.isArray(b.parts) ? b.parts : [],
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  function buildFallbackOptions(json) {
    const values = Array.isArray(json?.values) ? json.values : [];
    return values
      .filter(Boolean)
      .map((v) => ({
        label: String(v),
        bookGroupId: String(v),
        parts: [v],
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  function loadSelection() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveSelection(sel) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
    } catch {}
  }

  function renderDropdown(mount, options) {
    mount.innerHTML = "";

    const label = el("div", { class: "rv-book-label", text: "Select a book" });

    // ✅ Search bar ABOVE the dropdown
    const search = el("input", {
      class: "rv-book-search",
      placeholder: "Search books...",
      value: "",
      type: "text",
    });

    const select = el("select", { class: "rv-book-select" });
    const placeholder = el("option", { text: "Select a book...", value: "" });
    placeholder.disabled = false;
    placeholder.selected = true;
    select.appendChild(placeholder);

    function fillSelect(filtered) {
      // keep the first placeholder option, clear the rest
      while (select.options.length > 1) select.remove(1);

      for (const opt of filtered) {
        const o = document.createElement("option");
        o.value = opt.bookGroupId;
        o.textContent = opt.label;
        // store parts on option (stringified)
        o.dataset.parts = JSON.stringify(opt.parts || []);
        select.appendChild(o);
      }
    }

    fillSelect(options);

    // restore prior selection if it exists
    const prev = loadSelection();
    if (prev && prev.bookGroupId) {
      // only set if it exists in current list
      const match = options.find((o) => o.bookGroupId === prev.bookGroupId);
      if (match) {
        select.value = prev.bookGroupId;
        // also sync search box (optional)
        search.value = "";
      }
    }

    // filter behavior
    search.addEventListener("input", () => {
      const q = (search.value || "").trim().toLowerCase();
      if (!q) return fillSelect(options);

      const filtered = options.filter((o) =>
        (o.label || "").toLowerCase().includes(q)
      );
      fillSelect(filtered);
    });

    select.addEventListener("change", () => {
      const selectedId = select.value;
      if (!selectedId) return;

      const selectedOption = select.selectedOptions?.[0];
      let parts = [];
      try {
        parts = JSON.parse(selectedOption?.dataset?.parts || "[]");
      } catch {
        parts = [];
      }

      const picked = options.find((o) => o.bookGroupId === selectedId);

      const selection = {
        bookGroupId: selectedId,
        displayTitle: picked?.label || selectedOption?.textContent || selectedId,
        parts: picked?.parts || parts || [],
      };

      saveSelection(selection);

      // Emit event for exam/chat/library to react
      window.dispatchEvent(
        new CustomEvent("rv:bookChanged", { detail: selection })
      );
    });

    mount.appendChild(label);
    mount.appendChild(search);
    mount.appendChild(select);
  }

  async function init() {
    const mount = $("bookMount");
    if (!mount) return; // don't inject on pages without mount

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
          text: "Book list failed to load. Refresh and try again.",
        })
      );
      // console.error(e);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
