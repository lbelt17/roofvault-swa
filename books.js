// books.js — RoofVault grouped book dropdown + search
// Uses /api/books -> body.books[] when available (grouped), fallback to body.values[] (raw)

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

  // If filename is like "NRCA - Roofing - Manual - Metal - Panel - ... - Part1"
  // collapse the excessive " - " separators into spaces, but keep a nice "ORG - Title" prefix.
  function cleanDisplayTitle(s) {
    s = String(s || "").trim();

    // If there are a TON of " - " separators, it's usually "word - word - word - ..."
    const dashCount = (s.match(/\s-\s/g) || []).length;
    if (dashCount >= 6) {
      s = s.replace(/\s-\s/g, " ");
      s = s.replace(/\s+/g, " ").trim();
    }

    // Restore a clean "PREFIX - rest" for common org prefixes
    const m = s.match(/^(NRCA|IIBEC|ASTM|ANSI|ASCE|FM|RCI|SMACNA|NCCER|EDCO)\s+(.*)$/i);
    if (m) {
      const prefix = m[1].toUpperCase();
      const rest = (m[2] || "").trim();
      if (rest) s = `${prefix} - ${rest}`;
      else s = prefix;
    }

    return s;
  }

  function buildGroupedOptions(json) {
    const books = Array.isArray(json.books) ? json.books : [];
    // Expect: { bookGroupId, displayTitle, parts[] }
    return books
      .map((b) => ({
        bookGroupId: b.bookGroupId,
        displayTitle: cleanDisplayTitle(b.displayTitle),
        parts: Array.isArray(b.parts) ? b.parts : []
      }))
      .filter((b) => b.bookGroupId && b.displayTitle);
  }

  function buildFallbackOptions(json) {
    const vals = Array.isArray(json.values) ? json.values : [];
    // raw filenames, no grouping
    return vals
      .map((v) => ({
        bookGroupId: String(v),
        displayTitle: cleanDisplayTitle(String(v)),
        parts: [String(v)]
      }))
      .filter((b) => b.bookGroupId && b.displayTitle);
  }

  function renderDropdown(mount, options) {
    mount.innerHTML = "";

    const label = el("div", { class: "rv-book-label", text: "Select a book" });

    // Search bar (this is the one you wanted back)
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
      // keep first option, reset rest
      select.length = 1;
      list.forEach((b) => {
        select.appendChild(el("option", { value: b.bookGroupId, text: b.displayTitle }));
      });
    }

    fill(options);

    // Quick index for lookup on selection
    const byId = new Map(options.map((b) => [b.bookGroupId, b]));

    // Filter dropdown based on search
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      if (!q) return fill(options);
      fill(options.filter((b) => b.displayTitle.toLowerCase().includes(q)));
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

      // Save for other pages/scripts
      window.__rvBookSelection = selection;

      // Notify exam/chat/library scripts
      window.dispatchEvent(new CustomEvent("rv:bookChanged", { detail: selection }));
    });

    mount.appendChild(label);
    mount.appendChild(search);
    mount.appendChild(select);
  }

  async function init() {
    const mount = $("bookMount");
    if (!mount) return; // only render where the page includes #bookMount

    try {
      const json = await fetchBooks();
      const grouped = buildGroupedOptions(json);
      const options = grouped.length ? grouped : buildFallbackOptions(json);
      renderDropdown(mount, options);
    } catch (e) {
      mount.innerHTML = "";
      mount.appendChild(
        el("div", { class: "rv-book-error", text: "Book list failed to load. Refresh and try again." })
      );
      console.error(e);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
