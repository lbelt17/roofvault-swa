(function () {
  const $ = (sel) => document.querySelector(sel);

  // Guard/rehydrate required nodes
  function ensureNode(id, tag) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement(tag || "div");
      el.id = id;
      document.body.appendChild(el);
    }
    return el;
  }

  const q = $("#q") || ensureNode("q", "textarea");
  const ask = $("#ask") || ensureNode("ask", "button");
  const out = $("#out") || ensureNode("out", "div");
  const ans = $("#answer") || ensureNode("answer", "div");
  const src = $("#sources") || ensureNode("sources", "div");
  const status = $("#status") || ensureNode("status", "div");

  // Basic styling fallback so layout is visible even if CSS changed
  out.style.border = out.style.border || "1px solid #e6e6e6";
  out.style.borderRadius = out.style.borderRadius || "12px";
  out.style.padding = out.style.padding || "14px";
  out.style.marginTop = out.style.marginTop || "10px";
  out.style.background = out.style.background || "#fff";
  out.style.width = out.style.width || "100%";

  function showOut() { out.style.display = "block"; }
  function hideOut() { out.style.display = "none"; }

  function setBusy(b) {
    ask.disabled = !!b;
    status.textContent = b ? "Working…" : "";
  }

  async function callRvChat(question) {
    setBusy(true);
    ans.textContent = "";
    src.textContent = "";
    // Show a placeholder immediately so user sees activity
    showOut();
    ans.textContent = "Thinking…";

    try {
      const resp = await fetch("/api/rvchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      // Try to read JSON; if fails, capture raw text
      let json = null, raw = null;
      try { json = await resp.json(); } catch { try { raw = await resp.text(); } catch {} }

      if (!resp.ok || !json || json.ok === false) {
        const msg = (json && (json.error || json.message)) || raw || ("HTTP " + resp.status);
        ans.textContent = "Error: " + msg;
        src.textContent = "";
        showOut();
        return;
      }

      // Success
      ans.textContent = json.answer || "(no answer)";
      if (Array.isArray(json.sources) && json.sources.length) {
        const lines = json.sources.map(s => {
          const tag = `[${s.id ?? "?"}]`;
          const where = s.page ? ` (p.${s.page})` : "";
          return `${tag} ${s.source}${where}`;
        });
        src.textContent = "Sources:\n" + lines.join("\n");
      } else {
        src.textContent = "Sources: (none returned)";
      }
      showOut();
    } catch (e) {
      ans.textContent = "Error: " + String(e && e.message || e);
      src.textContent = "";
      showOut();
    } finally {
      setBusy(false);
    }
  }

  // Wire up Ask button (create label if we had to inject)
  if (ask && !ask.dataset.wired) {
    ask.dataset.wired = "1";
    if (!ask.textContent.trim()) ask.textContent = "Ask";
    ask.addEventListener("click", () => {
      const question = (q.value || "").trim();
      if (!question) { q.focus(); return; }
      callRvChat(question);
    });
  }

  // Ctrl/Cmd + Enter submits
  if (q && !q.dataset.wired) {
    q.dataset.wired = "1";
    q.addEventListener("keydown", (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
        ask.click();
      }
    });
  }
})();
