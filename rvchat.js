// rvchat.js
// RoofVault Chat – session-only threaded chat UI + mode badge + citations list
// Enter sends, Shift+Enter newline. Refresh clears session.

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

  // Paragraph-ish breaks
  html = html.replace(/\n{2,}/g, "<br><br>");
  html = html.replace(/\n/g, "<br>");

  return html;
}

document.addEventListener("DOMContentLoaded", () => {
  const qEl = document.getElementById("q");
  const askBtn = document.getElementById("ask");
  const statusEl = document.getElementById("status");
  const outEl = document.getElementById("out");

  // We will turn #out into a transcript container
  // (keep it simple: inject transcript HTML once)
  outEl.innerHTML = `<div id="thread"></div>`;
  const threadEl = document.getElementById("thread");

  // ===== Session-only memory (frontend) =====
  const chatHistory = []; // items: { role: "user"|"assistant", content: string }
  const MAX_HISTORY = 10;

  function pushHistory(role, content) {
    const text = String(content || "").trim();
    if (!text) return;
    chatHistory.push({ role, content: text });
    if (chatHistory.length > MAX_HISTORY) {
      chatHistory.splice(0, chatHistory.length - MAX_HISTORY);
    }
  }

  function modeLabel(mode) {
    const m = String(mode || "").toLowerCase();
    if (m === "doc") return "Document Answer";
    if (m === "general") return "General Answer";
    return "";
  }

  function appendUserBubble(text) {
    const html = `
      <div style="display:flex;justify-content:flex-end;margin:10px 0;">
        <div style="
          max-width: 85%;
          background: #2563eb;
          color: white;
          padding: 10px 12px;
          border-radius: 14px;
          line-height: 1.5;
          font-size: 14px;
          box-shadow: 0 6px 14px rgba(37,99,235,0.18);
          white-space: pre-wrap;
        ">${escapeHtml(text)}</div>
      </div>
    `;
    threadEl.insertAdjacentHTML("beforeend", html);
  }

  function appendAssistantBubble(answerText, mode, sources) {
    const badge = modeLabel(mode);
    const badgeHtml = badge
      ? `<div style="margin-bottom:8px;"><span class="rv-badge">${escapeHtml(badge)}</span></div>`
      : "";

    let sourcesHtml = "";
    if (Array.isArray(sources) && sources.length) {
      const items = sources
        .map((s) => {
          const label = escapeHtml(`[${s.id}] ${s.source || "Unknown source"}`);
          return `<li>${label}</li>`;
        })
        .join("");
      sourcesHtml = `
        <div style="
          margin-top:10px;
          border-top:1px solid #e5e7eb;
          padding-top:8px;
          color:#6b7280;
          font-size:12px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
        ">
          <div style="font-weight:600;margin-bottom:4px;color:#374151;">Sources</div>
          <ul style="margin:4px 0 0 18px;padding:0;">
            ${items}
          </ul>
        </div>
      `;
    }

    const html = `
      <div style="display:flex;justify-content:flex-start;margin:10px 0;">
        <div style="
          max-width: 85%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 12px 12px;
          border-radius: 14px;
          line-height: 1.6;
          font-size: 14px;
          box-shadow: 0 8px 18px rgba(15,23,42,0.06);
        ">
          ${badgeHtml}
          <div>${renderMarkdown(answerText)}</div>
          ${sourcesHtml}
        </div>
      </div>
    `;
    threadEl.insertAdjacentHTML("beforeend", html);
  }

  function scrollToBottom() {
    // Keep it simple: scroll the page to bottom
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function askRoofVault() {
    const question = (qEl.value || "").trim();
    if (!question) {
      qEl.focus();
      return;
    }

    // ChatGPT-like: clear input immediately
    qEl.value = "";
    qEl.focus();

    askBtn.disabled = true;
    statusEl.textContent = "Thinking...";
    outEl.style.display = "block";

    // UI: append user bubble immediately
    appendUserBubble(question);
    scrollToBottom();

    // Memory: store user message
    pushHistory("user", question);

    try {
      const res = await fetch("/api/rvchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        appendAssistantBubble(
          data.error || "There was an error answering your question.",
          "general",
          []
        );

        // Keep memory clean: remove last user message if server failed
        if (chatHistory.length && chatHistory[chatHistory.length - 1]?.role === "user") {
          chatHistory.pop();
        }
        scrollToBottom();
        return;
      }

      const answerText = String(data.answer || "");
      const mode = data.mode || "";
      const sources = Array.isArray(data.sources) ? data.sources : [];

      // UI: append assistant bubble
      appendAssistantBubble(answerText, mode, sources);
      scrollToBottom();

      // Memory: store assistant message
      pushHistory("assistant", answerText);
    } catch (e) {
      appendAssistantBubble("Network or server error: " + String(e), "general", []);

      // Keep memory clean on network failure
      if (chatHistory.length && chatHistory[chatHistory.length - 1]?.role === "user") {
        chatHistory.pop();
      }
      scrollToBottom();
    } finally {
      askBtn.disabled = false;
      statusEl.textContent = "";
    }
  }

  askBtn.addEventListener("click", askRoofVault);

  // Enter sends, Shift+Enter new line
  qEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askRoofVault();
    }
  });
});
