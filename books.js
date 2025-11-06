(function(){
  async function loadBooks(){
    const mount = document.getElementById("bookMount");
    if (!mount) return;
    mount.innerHTML = "<div class='muted'>Loading books…</div>";

    try {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const field = data.field || "docName";
      const values = Array.isArray(data.values) ? data.values : [];

      // build label + dropdown
      const label = document.createElement("label");
      label.textContent = "Book";
      label.style.display = "flex";
      label.style.flexDirection = "column";
      label.style.gap = "6px";

      const sel = document.createElement("select");
      sel.id = "bookSelect";
      sel.style.minWidth = "260px";

      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "(All Books)";
      sel.appendChild(optAll);

      values.forEach(v => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });

      label.appendChild(sel);
      const meta = document.createElement("div");
      meta.className = "muted";
      meta.style.fontSize = "12px";
      meta.textContent = "field: " + field;
      label.appendChild(meta);

      mount.innerHTML = "";
      mount.appendChild(label);

      // expose selector globally
      window.getSelectedBook = () => ({ value: sel.value, field });
      console.log("✅ Book dropdown rendered with", values.length, "items");
    } catch (err) {
      console.error("books.js error:", err);
      mount.innerHTML = "<div class='muted'>Failed to load books (" + err.message + ")</div>";
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", loadBooks);
  else
    loadBooks();
})();
