// rvchat.js
// Frontend for RoofVault Chat – nice markdown-style rendering

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Very small markdown-ish renderer: handles ### headings, bold, and line breaks
function renderMarkdown(md) {
  let html = escapeHtml(String(md || "").trim());

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Convert double newlines to paragraph breaks, single newlines to <br>
  html = html.replace(/\n{2,}/g, "<br><br>");
  html = html.replace(/\n/g, "<br>");

  return html;
}

document.addEventListener("DOMContentLoaded", () => {
  const qEl = document.getElementById("q");
  const askBtn = document.getElementById("ask");
  const statusEl = document.getElementById("status");
  const outEl = document.getElementById("out");
  const answerEl = document.getElementById("answer");
  const sourcesEl = document.getElementById("sources");

  async function askRoofVault() {
    const question = (qEl.value || "").trim();
    if (!question) {
      qEl.focus();
      return;
    }

    askBtn.disabled = true;
    statusEl.textContent = "Thinking...";
    outEl.style.display = "block";
    answerEl.innerHTML = "";
    sourcesEl.innerHTML = "";

    try {
      const res = await fetch("/api/rvchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { ok: false, error: "Could not parse response JSON." };
      }

      if (!data.ok) {
        answerEl.textContent =
          data.error || "There was an error answering your question.";
        sourcesEl.textContent = "";
        return;
      }

      // Render the answer with markdown styling
      const html = renderMarkdown(data.answer || "");
      answerEl.innerHTML = html;

      // Render sources nicely as a bulleted list
      if (Array.isArray(data.sources) && data.sources.length) {
        const items = data.sources
          .map((s) => {
            const label = escapeHtml(
              `[${s.id}] ${s.source || "Unknown source"}`
            );
            return `<li>${label}</li>`;
          })
          .join("");

        sourcesEl.innerHTML = `
          <div style="font-weight:600;margin-bottom:4px;">Sources</div>
          <ul style="margin:4px 0 0 18px;padding:0;">
            ${items}
          </ul>
        `;
      } else {
        sourcesEl.innerHTML = "";
      }
    } catch (e) {
      answerEl.textContent = "Network or server error: " + String(e);
      sourcesEl.textContent = "";
    } finally {
      askBtn.disabled = false;
      statusEl.textContent = "";
    }
  }

  askBtn.addEventListener("click", askRoofVault);

  // Allow Enter+Ctrl / Enter+Cmd to submit
  qEl.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      askRoofVault();
    }
  });
});
