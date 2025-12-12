(function () {
  async function loadBooks() {
    const mount = document.getElementById("bookMount");
    if (!mount) return;

    // clear any previous UI
    mount.innerHTML = "";

    const res = await fetch("/api/books");
    const data = await res.json(); // { field, values, books }
    const field = data.field || null;

    // Prefer grouped books, fallback to legacy values
    const hasGrouped = Array.isArray(data.books) && data.books.length > 0;

    const items = hasGrouped
      ? data.books.map(b => ({
          value: b.bookGroupId,                         // stable id
          label: b.displayTitle,                        // clean title shown to user
          parts: Array.isArray(b.parts) ? b.parts : []  // real part filenames
        }))
      : (Array.isArray(data.values) ? data.values : []).map(v => ({
          value: v,
          label: v,
          parts: [v]
        }));

    const label = document.createElement("label");
    label.textContent = "Book";
    label.style.display = "flex";
    label.style.flexDirection = "column";
    label.style.gap = "6px";

    const sel = document.createElement("select");
    sel.id = "bookSelect";
    sel.style.minWidth = "260px";

    // All books option
    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = "(All Books)";
    optAll.dataset.parts = "[]";
    sel.appendChild(optAll);

    // Add grouped/legacy options
    items.forEach(item => {
      const o = document.createElement("option");
      o.value = item.value;
      o.textContent = item.label;
      o.dataset.parts = JSON.stringify(item.parts || []);
      sel.appendChild(o);
    });

    const meta = document.createElement("div");
    meta.className = "muted";
    meta.style.fontSize = "12px";
    meta.textContent = field ? `field: ${field}` : "field: ?";

    label.appendChild(sel);
    label.appendChild(meta);
    mount.appendChild(label);

    // expose a single selector for other scripts
    window.getSelectedBook = () => {
      const opt = sel.options[sel.selectedIndex];
      let parts = [];
      try { parts = JSON.parse(opt?.dataset?.parts || "[]"); } catch (_) {}
      return {
        value: sel.value,                         // bookGroupId (or raw filename fallback)
        label: opt?.textContent || sel.value,     // what user sees
        field,                                    // keep existing behavior
        parts                                     // real part filenames for future step
      };
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadBooks);
  } else {
    loadBooks();
  }
})();
