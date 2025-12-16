// books.js — RoofVault book dropdown (GROUPED)
// - Prefers /api/books -> json.books[] (grouped)
// - Falls back to json.values[] (raw)
// - Only renders if #bookMount exists (so it won't inject randomly)

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

  // Persist selection across pages
  const STORAGE_KEY = "rv_selected_book_v2";

  function saveSelection(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {}
  }

  function loadSelection() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async function fetchBooks() {
    const r = await fetch("/api/books", { cache: "no-store" });
    if (!r.ok) throw new Error("Failed to load /api/books");
    return r.json();
  }

  function buildGroupedOptions(json) {
    const books = Array.isArray(json.books) ? json.books : [];
    // books[] items look like:
    // { bookGroupId, displayTitle, parts:[ {raw,fileName,partLabel}, ... ] }
    return books
      .filter((b) => b && b.bookGroupId && b.displayTitle)
      .sort((a, b) => String(a.displayTitle).localeCompare(String(b.displayTitle)));
  }

  function buildFallbackOptions(json) {
    const vals = Array.isArray(json.values) ? json.values : [];
    return vals
      .filter(Boolean)
      .map((v) => ({
        bookGroupId: String(v),
        displayTitle: String(v),
        parts: [{ raw: String(v), fileName: String(v), partLabel: null }],
      }))
      .sort((a, b) => String(a.displayTitle).localeCompare(String(b.displayTitle)));
  }

  function renderDropdown(mount, options) {
    // Clear mount
    mount.innerHTML = "";

    const label = el("div", { class: "rv-book-label", text: "Select a book" });

    const select = el("select", { id: "rvBookSelect", class: "rv-book-select" }, [
      el("option", { value: "", text: "Select a book..." }),
    ]);

    options.forEach((b) => {
      select.appendChild(el("option", { value: b.bookGroupId, text: b.displayTitle }));
    });

    // Restore previous selection if present
    const saved = loadSelection();
    if (saved && saved.bookGroupId) {
      const exists = options.some((o) => o.bookGroupId === saved.bookGroupId);
      if (exists) select.value = saved.bookGroupId;
    }

    select.addEventListener("change", () => {
      const id = select.value;
      const picked = options.find((o) => o.bookGroupId === id) || null;

      if (!picked) {
        saveSelection(null);
        return;
      }

      // This is the IMPORTANT part:
      // - displayTitle = clean book name (one line)
      // - parts[] = all underlying blob filenames/paths that belong to it
      saveSelection({
        bookGroupId: picked.bookGroupId,
        displayTitle: picked.displayTitle,
        parts: picked.parts || [],
      });

      // Optional: fire a custom event so other scripts (exam/chat/library) can react
      window.dispatchEvent(
        new CustomEvent("rv:bookChanged", { detail: loadSelection() })
      );
    });

    mount.appendChild(label);
    mount.appendChild(select);
  }

  async function init() {
    const mount = $("bookMount");
    if (!mount) return; // do nothing unless the page has a mount

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
