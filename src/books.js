(function () {
  async function loadBooks() {
    const mount = document.getElementById("bookMount");
    if (!mount) return;

    mount.innerHTML = "";

    let data;
    try {
      const res = await fetch("/api/books", { cache: "no-store" });
      data = await res.json();
    } catch (e) {
      mount.textContent = "Could not load books.";
      window.getSelectedBook = () => null;
      return;
    }

    const field = data.field || null;

    // Prefer NEW grouped output: { books: [{bookGroupId, displayTitle, parts:[]}, ...] }
    const grouped = Array.isArray(data.books) ? data.books : null;

    // Fallback to OLD output: { values: ["file1.pdf", ...] }
    const values = Array.isArray(data.values) ? data.values : [];

    const label = document.createElement("label");
    label.textContent = "Book";
    label.style.display = "flex";
    label.style.flexDirection = "column";
    label.style.gap = "6px";

    const sel = document.createElement("select");
    sel.id = "bookSelect";
    sel.style.minWidth = "260px";

    // Top option
    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = "(All Books)";
    sel.appendChild(optAll);

    // Build options
    const bookMap = new Map(); // value -> book object we expose
    if (grouped && grouped.length) {
      grouped.forEach((b) => {
        const displayTitle = b.displayTitle || b.bookGroupId || "Untitled";
        const parts = Array.isArray(b.parts) ? b.parts : [];

        // IMPORTANT:
        // Use the FIRST PART as the "value" so your existing /api/exam (which expects a real filename)
        // still works today, BUT we ALSO expose b.parts so we can upgrade /api/exam next.
        const value = parts[0] || displayTitle;

        const o = document.createElement("option");
        o.value = value;
        o.textContent = displayTitle;
        sel.appendChild(o);

        bookMap.set(value, {
          bookGroupId: b.bookGroupId || null,
          displayTitle,
          parts,
          value,
          field
        });
      });
    } else {
      values.forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);

        bookMap.set(v, { value: v, displayTitle: v, parts: [v], field });
      });
    }

    const meta = document.createElement("div");
    meta.className = "muted";
    meta.style.fontSize = "12px";
    meta.textContent = field ? `field: ${field}` : "field: ?";

    label.appendChild(sel);
    label.appendChild(meta);
    mount.appendChild(label);

    // Expose selection for other scripts
    window.getSelectedBook = () => {
      const v = sel.value;
      if (!v) return { value: "", field, displayTitle: "(All Books)", parts: [] };
      return bookMap.get(v) || { value: v, field, displayTitle: v, parts: [v] };
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadBooks);
  } else {
    loadBooks();
  }
})();
