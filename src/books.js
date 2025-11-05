(function(){
  async function loadBooks(){
    const mount = document.getElementById("bookMount");
    if (!mount) return;

    // clear any previous UI
    mount.innerHTML = "";

    const res = await fetch("/api/books");
    const data = await res.json(); // { field, values }
    const field = data.field || null;
    const values = Array.isArray(data.values) ? data.values : [];

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
    values.forEach(v=>{
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
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
    window.getSelectedBook = () => ({ value: sel.value, field });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadBooks);
  } else {
    loadBooks();
  }
})();
