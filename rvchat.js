(function () {
  const $ = (sel) => document.querySelector(sel);
  const q = $("#q");
  const ask = $("#ask");
  const out = $("#out");
  const ans = $("#answer");
  const src = $("#sources");
  const status = $("#status");

  function setBusy(b) {
    ask.disabled = b;
    status.textContent = b ? "Working…" : "";
  }

  async function callRvChat(question) {
    setBusy(true);
    ans.textContent = "";
    src.textContent = "";
    out.style.display = "none";

    try {
      const resp = await fetch("/api/rvchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const json = await resp.json().catch(() => ({}));
      if (!resp.ok || !json.ok) {
        throw new Error(json?.error || ("HTTP " + resp.status));
      }

      ans.textContent = json.answer || "(no answer)";
      if (Array.isArray(json.sources) && json.sources.length) {
        const lines = json.sources.map(s => {
          const tag = `[${s.id}]`;
          const where = s.page ? ` (p.${s.page})` : "";
          return `${tag} ${s.source}${where}`;
        });
        src.textContent = "Sources:\n" + lines.join("\n");
      } else {
        src.textContent = "Sources: (none returned)";
      }
      out.style.display = "block";
    } catch (e) {
      ans.textContent = "Error: " + String(e.message || e);
      out.style.display = "block";
    } finally {
      setBusy(false);
    }
  }

  ask.addEventListener("click", () => {
    const question = (q.value || "").trim();
    if (!question) {
      q.focus();
      return;
    }
    callRvChat(question);
  });

  });

  // Allow Ctrl+Enter to submit
  q.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
      ask.click();
    }
  });
})();

