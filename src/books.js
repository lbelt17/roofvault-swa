(function(){
  function makeEl(tag, attrs={}, children=[]) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if (k === "class") el.className = v; else el.setAttribute(k, v);
    });
    children.forEach(c => el.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return el;
  }

  async function fetchBooks() {
    const res = await fetch("/api/books", { method: "POST" });
    const data = await res.json(); // { field, values }
    return data;
  }

  async function insertBookPicker() {
    const toolbar = document.querySelector(".toolbar");
    if (!toolbar) return;

    const label = makeEl("label", {}, [
      document.createTextNode("Book "),
      makeEl("select", { id: "bookSelect", style: "min-width:240px;max-width:100%;" })
    ]);

    const badge = makeEl("span", { class: "pill", id: "facetBadge", title: "Facet/field used to group books" }, ["field: ?"]);

    const btnbar = toolbar.querySelector(".btnbar");
    if (btnbar) {
      toolbar.insertBefore(label, btnbar);
      toolbar.insertBefore(badge, btnbar);
    } else {
      toolbar.appendChild(label);
      toolbar.appendChild(badge);
    }

    const sel = label.querySelector("#bookSelect");
    sel.innerHTML = "";
    const first = makeEl("option", { value: "" }, ["(All books)"]);
    sel.appendChild(first);

    let field = null;
    try {
      const result = await fetchBooks(); // { field, values }
      field = result.field || null;
      const badgeEl = document.getElementById("facetBadge");
      if (badgeEl) badgeEl.textContent = "field: " + (field || "?");

      const books = Array.isArray(result.values) ? result.values : [];
      books.forEach(b => sel.appendChild(makeEl("option", { value: b }, [b])));
    } catch (e) {
      console.warn("books facet error:", e);
    }

    window.getSelectedBook = () => ({ value: sel.value || "", field });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertBookPicker);
  } else {
    insertBookPicker();
  }
})();
