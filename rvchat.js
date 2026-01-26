// rvchat.js
// Frontend for RoofVault Chat – markdown-style rendering + session-only memory + mode badge

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
  const modeBadgeEl = document.getElementById("modeBadge");
  const answerEl = document.getElementById("answer");
  const sourcesEl = document.getElementById("sources");

  // ===== Session-only memory (frontend) =====
  // Stores the conversation in memory only (page refresh clears it).
  const chatHistory = []; // items: { role: "user"|"assistant", content: string }

  // Keep last N messages to control token size
  const MAX_HISTORY = 10;

  function pushHistory(role, content) {
    const text = String(content || "").trim();
    if (!text) return;
    chatHistory.push({ role, content: text });

    // Keep only last MAX_HISTORY
    if (chatHistory.length > MAX_HISTORY) {
      chatHistory.splice(0, chatHistory.length - MAX_HISTORY);
    }
  }

  function setModeBadge(mode) {
    const m = String(mode || "").toLowerCase();
    let label = "";

    if (m === "doc") label = "Document Answer";
    else if (m === "general") label = "General Answer";

    if (!modeBadgeEl) return;

    if (!label) {
      modeBadgeEl.innerHTML = "";
      return;
    }

    modeBadgeEl.innerHTML = `<span class="rv-badge">${escapeHtml(label)}</span>`;
  }

  async function askRoofVault() {
    const question = (qEl.value || "").trim();
    if (!question) {
      qEl.focus();
      return;
    }

    askBtn.disabled = true;
    statusEl.textContent = "Thinking...";
    outEl.style.display = "block";
    if (modeBadgeEl) modeBadgeEl.innerHTML = "";
    answerEl.innerHTML = "";
    sourcesEl.innerHTML = "";

    // Add the user message to session history
    pushHistory("user", question);

    try {
      const res = await fetch("/api/rvchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // Send both question (keeps backward compatibility) + messages (session memory)
        body: JSON.stringify({
          question,
          messages: chatHistory
        })
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
        if (modeBadgeEl) modeBadgeEl.innerHTML = "";

        // If server failed, remove last user message so history stays clean
        if (chatHistory.length && chatHistory[chatHistory.length - 1]?.role === "user") {
          chatHistory.pop();
        }
        return;
      }

      // Show mode badge (doc vs general)
      setModeBadge(data.mode);

      // Render the answer with markdown styling
      const answerText = String(data.answer || "");
      const html = renderMarkdown(answerText);
      answerEl.innerHTML = html;

      // Add assistant reply to session history
      pushHistory("assistant", answerText);

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
      if (modeBadgeEl) modeBadgeEl.innerHTML = "";

      // Remove last user message on network failure
      if (chatHistory.length && chatHistory[chatHistory.length - 1]?.role === "user") {
        chatHistory.pop();
      }
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
