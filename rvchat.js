// rvchat.js
// RoofVault Chat – session-only memory + newest-at-top threading
// Adds: Clear Chat button + "Session memory: ON" indicator
// Adds: Web-consent modal (opt-in only) + simple 5-credit tracking (frontend only)
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

  // ---- Add UI: session indicator + clear button (no HTML changes required) ----
  const rowEl = askBtn && askBtn.parentElement ? askBtn.parentElement : null;

  let memEl = null;
  let clearBtn = null;

  if (rowEl) {
    // Session indicator
    memEl = document.createElement("span");
    memEl.textContent = "Session memory: ON";
    memEl.style.fontSize = "12px";
    memEl.style.color = "#6b7280";
    memEl.style.marginLeft = "10px";

    // Clear button
    clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.textContent = "Clear chat";
    clearBtn.style.marginLeft = "auto";
    clearBtn.style.border = "1px solid #e5e7eb";
    clearBtn.style.background = "#ffffff";
    clearBtn.style.color = "#111827";
    clearBtn.style.boxShadow = "none";
    clearBtn.style.fontWeight = "600";

    // Keep the row layout nice
    rowEl.style.display = "flex";
    rowEl.style.alignItems = "center";
    rowEl.style.gap = "8px";

    // Insert in row
    rowEl.appendChild(memEl);
    rowEl.appendChild(clearBtn);
  }

  // Turn #out into a transcript container
  outEl.innerHTML = `<div id="thread"></div>`;
  const threadEl = document.getElementById("thread");

  // ===== Session-only memory (frontend) =====
  const chatHistory = []; // { role: "user"|"assistant", content: string }
  const MAX_HISTORY = 10;

  function pushHistory(role, content) {
    const text = String(content || "").trim();
    if (!text) return;
    chatHistory.push({ role, content: text });
    if (chatHistory.length > MAX_HISTORY) {
      chatHistory.splice(0, chatHistory.length - MAX_HISTORY);
    }
  }

  // ===== Web credits (frontend-only for now) =====
  // This is intentionally not stored in localStorage to keep it "session-only".
  let webCreditsRemaining = 5;

  // ===== Consent modal (created dynamically) =====
  function ensureConsentModal() {
    if (document.getElementById("rv-consent-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "rv-consent-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(15,23,42,0.55)";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "18px";
    overlay.style.zIndex = "9999";

    const modal = document.createElement("div");
    modal.id = "rv-consent-modal";
    modal.style.width = "min(560px, 96vw)";
    modal.style.background = "#ffffff";
    modal.style.border = "1px solid #e5e7eb";
    modal.style.borderRadius = "16px";
    modal.style.boxShadow = "0 18px 50px rgba(15,23,42,0.25)";
    modal.style.padding = "16px";

    modal.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="
          width:40px;height:40px;border-radius:12px;
          background: linear-gradient(135deg, #111827, #4b5563);
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-weight:800;
        ">RV</div>

        <div style="flex:1;">
          <div style="font-weight:800;font-size:15px;color:#111827;">
            No direct RoofVault doc support
          </div>
          <div id="rv-consent-note" style="margin-top:6px;color:#4b5563;font-size:13px;line-height:1.5;">
            This roofing question doesn’t have a grounded answer in your RoofVault documents.
            You can keep doc-only mode, or explicitly opt in to a web answer.
          </div>

          <div style="
            margin-top:10px;
            display:flex;gap:8px;flex-wrap:wrap;align-items:center;
          ">
            <span id="rv-consent-credits" style="
              font-size:12px;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;
              padding:5px 10px;border-radius:999px;
            ">Web credits remaining: 5</span>
          </div>

          <div style="margin-top:14px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
            <button id="rv-consent-cancel" type="button" style="
              padding:8px 14px;border-radius:999px;border:1px solid #e5e7eb;
              background:#ffffff;color:#111827;font-size:13px;font-weight:700;
              box-shadow:none;cursor:pointer;
            ">Stay doc-only</button>

            <button id="rv-consent-web" type="button" style="
              padding:8px 14px;border-radius:999px;border:1px solid #3b82f6;
              background: linear-gradient(135deg, #2563eb, #3b82f6);
              color:#ffffff;font-size:13px;font-weight:700;cursor:pointer;
              box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
            ">Use the web (1 credit)</button>
          </div>

          <div style="margin-top:10px;font-size:11px;color:#6b7280;line-height:1.45;">
            Web mode is opt-in only. The server will not use the web unless you explicitly choose it.
          </div>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // close on overlay click (outside modal)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        hideConsentModal();
        if (consentResolver) consentResolver({ choice: "cancel" });
      }
    });
  }

  let consentResolver = null;

  function showConsentModal({ noteText = "", creditsRemaining = webCreditsRemaining } = {}) {
    ensureConsentModal();
    const overlay = document.getElementById("rv-consent-overlay");
    const noteEl = document.getElementById("rv-consent-note");
    const creditsEl = document.getElementById("rv-consent-credits");
    const webBtn = document.getElementById("rv-consent-web");
    const cancelBtn = document.getElementById("rv-consent-cancel");

    if (!overlay || !noteEl || !creditsEl || !webBtn || !cancelBtn) return;

    const safeNote =
      String(noteText || "").trim() ||
      "This roofing question doesn’t have a grounded answer in your RoofVault documents.";

    noteEl.textContent = safeNote;
    creditsEl.textContent = `Web credits remaining: ${Number.isFinite(Number(creditsRemaining)) ? Number(creditsRemaining) : webCreditsRemaining}`;

    // Disable web button if no credits
    const creditsNum = Number.isFinite(Number(creditsRemaining))
      ? Number(creditsRemaining)
      : webCreditsRemaining;

    webBtn.disabled = !(creditsNum > 0);
    webBtn.style.opacity = webBtn.disabled ? "0.6" : "1";
    webBtn.style.cursor = webBtn.disabled ? "not-allowed" : "pointer";

    overlay.style.display = "flex";

    return new Promise((resolve) => {
      consentResolver = resolve;

      // Ensure we don't stack handlers
      webBtn.onclick = () => {
        hideConsentModal();
        resolve({ choice: "web" });
      };

      cancelBtn.onclick = () => {
        hideConsentModal();
        resolve({ choice: "cancel" });
      };
    });
  }

  function hideConsentModal() {
    const overlay = document.getElementById("rv-consent-overlay");
    if (overlay) overlay.style.display = "none";
    consentResolver = null;
  }

  function clearHistoryAndUI() {
    chatHistory.length = 0;
    webCreditsRemaining = 5; // session reset
    if (threadEl) threadEl.innerHTML = "";
    outEl.style.display = "none";
    statusEl.textContent = "";
    qEl.value = "";
    qEl.focus();
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearHistoryAndUI();
    });
  }

  function modeLabel(mode) {
    const m = String(mode || "").toLowerCase();
    if (m === "doc") return "Document Answer";
    if (m === "general") return "General Answer";
    if (m === "web") return "Web Answer (Opt-in)";
    return "";
  }

  // Create a new "turn" container at the TOP (newest first)
  function prependTurn(questionText) {
    const turnId =
      "turn-" + Date.now() + "-" + Math.random().toString(16).slice(2);

    const html = `
      <div id="${turnId}" style="
        border: 1px solid #e5e7eb;
        background: #ffffff;
        border-radius: 14px;
        padding: 12px;
        box-shadow: 0 8px 18px rgba(15,23,42,0.05);
        margin: 10px 0;
      ">
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
          <div style="
            max-width: 90%;
            background: #2563eb;
            color: white;
            padding: 10px 12px;
            border-radius: 14px;
            line-height: 1.5;
            font-size: 14px;
            box-shadow: 0 6px 14px rgba(37,99,235,0.16);
            white-space: pre-wrap;
          ">${escapeHtml(questionText)}</div>
        </div>

        <div class="rv-assistant-slot" style="display:flex;justify-content:flex-start;">
          <div style="
            max-width: 90%;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 12px;
            border-radius: 14px;
            line-height: 1.6;
            font-size: 14px;
            width: 100%;
          ">
            <div style="color:#6b7280;font-size:12px;">Thinking…</div>
          </div>
        </div>
      </div>
    `;

    // Prepend newest turn at the top
    threadEl.insertAdjacentHTML("afterbegin", html);

    // Keep view at the top so newest stays near input
    outEl.scrollTop = 0;

    return turnId;
  }

  function renderAssistantIntoTurn(turnId, answerText, mode, sources) {
    const turn = document.getElementById(turnId);
    if (!turn) return;

    const badge = modeLabel(mode);
    const badgeHtml = badge
      ? `<div style="margin-bottom:8px;"><span class="rv-badge">${escapeHtml(
          badge
        )}</span></div>`
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

    const slot = turn.querySelector(".rv-assistant-slot");
    if (!slot) return;

    slot.innerHTML = `
      <div style="display:flex;justify-content:flex-start;">
        <div style="
          max-width: 90%;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 12px;
          border-radius: 14px;
          line-height: 1.6;
          font-size: 14px;
          width: 100%;
        ">
          ${badgeHtml}
          <div>${renderMarkdown(answerText)}</div>
          ${sourcesHtml}
        </div>
      </div>
    `;

    outEl.scrollTop = 0;
  }

  async function callRvChat({ question, mode, allowWeb }) {
    const body = {
      question,
      messages: chatHistory
    };

    if (mode) body.mode = mode;
    if (allowWeb) body.allowWeb = true;

    // Send remaining credits so server can echo it back for UI (optional)
    body.webCreditsRemaining = webCreditsRemaining;

    const res = await fetch("/api/rvchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { ok: false, error: "Could not parse response JSON." };
    }

    return data;
  }

  async function askRoofVault() {
    const question = (qEl.value || "").trim();
    if (!question) {
      qEl.focus();
      return;
    }

    // Clear input immediately
    qEl.value = "";
    qEl.focus();

    askBtn.disabled = true;
    if (clearBtn) clearBtn.disabled = true;
    statusEl.textContent = "Thinking...";
    outEl.style.display = "block";

    // UI: create newest turn at top
    const turnId = prependTurn(question);

    // Memory: store user message
    pushHistory("user", question);

    try {
      // 1) Default request (doc/general routing on server)
      const data = await callRvChat({ question });

      if (!data.ok) {
        renderAssistantIntoTurn(
          turnId,
          data.error || "There was an error answering your question.",
          "general",
          []
        );

        // Keep memory clean: remove last user message
        if (
          chatHistory.length &&
          chatHistory[chatHistory.length - 1]?.role === "user"
        ) {
          chatHistory.pop();
        }
        return;
      }

      // 2) If server requests consent (roofing + no doc support)
      if (data.needsConsentForWeb) {
        const noteText = String(data.note || data.answer || "").trim();
        const serverCredits =
          data?.web && Number.isFinite(Number(data.web.creditsRemaining))
            ? Number(data.web.creditsRemaining)
            : webCreditsRemaining;

        // Keep our local number in sync (if server echoed it)
        webCreditsRemaining = Number.isFinite(Number(serverCredits))
          ? Number(serverCredits)
          : webCreditsRemaining;

        // Show the refusal as the assistant message (doc mode refusal)
        renderAssistantIntoTurn(
          turnId,
          String(data.answer || "No support in the provided sources."),
          data.mode || "doc",
          Array.isArray(data.sources) ? data.sources : []
        );

        // Prompt user for consent
        const choice = await showConsentModal({
          noteText,
          creditsRemaining: webCreditsRemaining
        });

        if (!choice || choice.choice !== "web") {
          // User stayed doc-only; DO NOT add assistant refusal to memory (keeps history cleaner)
          statusEl.textContent = "";
          return;
        }

        // No credits left safeguard
        if (!(webCreditsRemaining > 0)) {
          // Replace assistant with message about credits
          renderAssistantIntoTurn(
            turnId,
            "Web mode is unavailable because you have 0 web credits remaining for this session.",
            "general",
            []
          );

          // Clean memory: remove last user message since we didn't provide a real answer
          if (
            chatHistory.length &&
            chatHistory[chatHistory.length - 1]?.role === "user"
          ) {
            chatHistory.pop();
          }
          return;
        }

        // Spend 1 credit (frontend-controlled)
        webCreditsRemaining = Math.max(0, webCreditsRemaining - 1);

        // 3) Re-ask in explicit web mode (opt-in)
        statusEl.textContent = "Using web mode…";
        const webData = await callRvChat({ question, mode: "web" });

        if (!webData.ok) {
          renderAssistantIntoTurn(
            turnId,
            webData.error || "There was an error answering your question in web mode.",
            "general",
            []
          );

          // Revert credit spend on failure (optional but nice)
          webCreditsRemaining = webCreditsRemaining + 1;

          // Clean memory
          if (
            chatHistory.length &&
            chatHistory[chatHistory.length - 1]?.role === "user"
          ) {
            chatHistory.pop();
          }
          return;
        }

        // Render web response (overwrite the assistant slot in the same turn)
        renderAssistantIntoTurn(
          turnId,
          String(webData.answer || ""),
          webData.mode || "web",
          Array.isArray(webData.sources) ? webData.sources : []
        );

        // Memory: store assistant message (web answer)
        pushHistory("assistant", String(webData.answer || ""));
        statusEl.textContent = "";
        return;
      }

      // 3) Normal answer
      const answerText = String(data.answer || "");
      const mode = data.mode || "";
      const sources = Array.isArray(data.sources) ? data.sources : [];

      renderAssistantIntoTurn(turnId, answerText, mode, sources);

      // Memory: store assistant message
      pushHistory("assistant", answerText);
    } catch (e) {
      renderAssistantIntoTurn(
        turnId,
        "Network or server error: " + String(e),
        "general",
        []
      );

      // Keep memory clean
      if (
        chatHistory.length &&
        chatHistory[chatHistory.length - 1]?.role === "user"
      ) {
        chatHistory.pop();
      }
    } finally {
      askBtn.disabled = false;
      if (clearBtn) clearBtn.disabled = false;
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
