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
    try {
      const res = await fetch("/api/books", { method: "POST" });
      const data = await res.json();
      return Array.isArray(data.books) ? data.books : [];
    } catch (e) {
      console.warn("books facet error:", e);
      return [];
    }
  }

  async function insertBookPicker() {
    const toolbar = document.querySelector(".toolbar");
    if (!toolbar) return;

    // Build label + select
    const label = makeEl("label", {}, [
      document.createTextNode("Book "),
      makeEl("select", { id: "bookSelect", style: "min-width:240px;max-width:100%;" })
    ]);

    // Insert before the buttons row if present, else at end
    const btnbar = toolbar.querySelector(".btnbar");
    if (btnbar) toolbar.insertBefore(label, btnbar); else toolbar.appendChild(label);

    // Populate options
    const sel = label.querySelector("#bookSelect");
    sel.innerHTML = "";
    const first = makeEl("option", { value: "" }, ["(All books)"]);
    sel.appendChild(first);

    const books = await fetchBooks();
    books.forEach(b => sel.appendChild(makeEl("option", { value: b }, [b])));

    // Expose helper so later steps can read the current selection
    window.getSelectedBook = () => (sel.value || "");
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertBookPicker);
  } else {
    insertBookPicker();
  }
})();
