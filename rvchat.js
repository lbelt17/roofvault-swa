// rvchat.js
// RoofVault Chat – session-only memory + newest-at-top threading
// Adds: Clear Chat button + "Session memory: ON" indicator
// Adds: Web consent modal flow (opt-in only) + session web credits tracking
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
  const rowEl = (askBtn && askBtn.parentElement) ? askBtn.parentElement : null;

  let memEl = null;
  let clearBtn = null;

  if (rowEl) {
    memEl = document.createElement("span");
    memEl.textContent = "Session memory: ON";
    memEl.style.fontSize = "12px";
    memEl.style.color = "#6b7280";
    memEl.style.marginLeft = "10px";

    clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.textContent = "Clear chat";
    clearBtn.style.marginLeft = "auto";
    clearBtn.style.border = "1px solid #e5e7eb";
    clearBtn.style.background = "#ffffff";
    clearBtn.style.color = "#111827";
    clearBtn.style.boxShadow = "none";
    clearBtn.style.fontWeight = "600";

    rowEl.style.display = "flex";
    rowEl.style.alignItems = "center";
    rowEl.style.gap = "8px";

    rowEl.appendChild(memEl);
    rowEl.appendChild(clearBtn);
  }

  // Transcript container
  outEl.innerHTML = `<div id="thread"></div>`;
  const threadEl = document.getElementById("thread");

  // ===== Session-only memory (frontend) =====
  const chatHistory = []; // { role: "user"|"assistant", content: string }
  const MAX_HISTORY = 10;

  // ===== Session web credits =====
  // Start unknown; we’ll initialize from server when it first returns web.creditsMax
  let webCreditsMax = 5;
  let webCreditsRemaining = null; // null means "unknown yet"

  function setCreditsFromServer(webObj) {
    if (!webObj || typeof webObj !== "object") return;
    if (Number.isFinite(Number(webObj.creditsMax))) webCreditsMax = Number(webObj.creditsMax);

    if (Number.isFinite(Number(webObj.creditsRemaining))) {
      webCreditsRemaining = Number(webObj.creditsRemaining);
      return;
    }

    // If server doesn’t send remaining, initialize once to max
    if (webCreditsRemaining === null && Number.isFinite(Number(webCreditsMax))) {
      webCreditsRemaining = Number(webCreditsMax);
    }
  }

  function decrementWebCredit() {
    if (webCreditsRemaining === null) webCreditsRemaining = Number(webCreditsMax) || 5;
    webCreditsRemaining = Math.max(0, Number(webCreditsRemaining) - 1);
    return webCreditsRemaining;
  }

  function pushHistory(role, content) {
    const text = String(content || "").trim();
    if (!text) return;
    chatHistory.push({ role, content: text });
    if (chatHistory.length > MAX_HISTORY) {
      chatHistory.splice(0, chatHistory.length - MAX_HISTORY);
    }
  }

  function clearHistoryAndUI() {
    chatHistory.length = 0;
    if (threadEl) threadEl.innerHTML = "";
    outEl.style.display = "none";
    statusEl.textContent = "";
    qEl.value = "";
    qEl.focus();

    // reset credits for this session
    webCreditsRemaining = null;
    webCreditsMax = 5;

    // close modal if open
    hideConsentModal();
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
    if (m === "web") return "Web Answer";
    return "";
  }

  // Create a new "turn" container at the TOP (newest first)
  function prependTurn(questionText) {
    const turnId = "turn-" + Date.now() + "-" + Math.random().toString(16).slice(2);

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

    threadEl.insertAdjacentHTML("afterbegin", html);
    outEl.scrollTop = 0;
    return turnId;
  }

  function renderAssistantIntoTurn(turnId, answerText, mode, sources) {
    const turn = document.getElementById(turnId);
    if (!turn) return;

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

  function renderAssistantLoading(turnId, label) {
    const turn = document.getElementById(turnId);
    if (!turn) return;
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
          <div style="color:#6b7280;font-size:12px;">${escapeHtml(label || "Thinking…")}</div>
        </div>
      </div>
    `;
  }

  // ===== Consent modal (no HTML changes required) =====
  let consentOverlayEl = null;
  let consentState = null; // { turnId, question, note, creditsMax, creditsRemaining }

  function ensureConsentModal() {
    if (consentOverlayEl) return;

    consentOverlayEl = document.createElement("div");
    consentOverlayEl.style.position = "fixed";
    consentOverlayEl.style.inset = "0";
    consentOverlayEl.style.background = "rgba(15, 23, 42, 0.45)";
    consentOverlayEl.style.display = "none";
    consentOverlayEl.style.alignItems = "center";
    consentOverlayEl.style.justifyContent = "center";
    consentOverlayEl.style.zIndex = "9999";
    consentOverlayEl.innerHTML = `
      <div style="
        width: min(620px, 92vw);
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 24px 60px rgba(15,23,42,0.24);
        padding: 16px 16px 14px;
      ">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 12px;
            background: linear-gradient(135deg, #111827, #4b5563);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#fff;
            font-weight:800;
            font-size:14px;
          ">RV</div>
          <div>
            <div style="font-weight:800;font-size:14px;color:#111827;" id="rvConsentTitle">No direct RoofVault doc support</div>
            <div style="font-size:12px;color:#6b7280;margin-top:2px;" id="rvConsentSubtitle"></div>
          </div>
        </div>

        <div style="
          margin: 10px 0 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          color: #374151;
          font-size: 13px;
          line-height: 1.5;
        " id="rvConsentNote"></div>

        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <span style="
            padding: 5px 10px;
            border-radius: 999px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            font-size: 12px;
            color: #374151;
            font-weight: 700;
          " id="rvConsentCredits"></span>

          <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" id="rvConsentStay" style="
              padding: 8px 14px;
              border-radius: 999px;
              border: 1px solid #e5e7eb;
              background: #ffffff;
              color: #111827;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              box-shadow: none;
            ">Stay doc-only</button>

            <button type="button" id="rvConsentUseWeb" style="
              padding: 8px 14px;
              border-radius: 999px;
              border: 1px solid #2563eb;
              background: linear-gradient(135deg, #2563eb, #3b82f6);
              color: #ffffff;
              font-size: 13px;
              font-weight: 800;
              cursor: pointer;
              box-shadow: 0 6px 14px rgba(37,99,235,0.25);
            ">Use the web (1 credit)</button>
          </div>
        </div>

        <div style="margin-top:10px;color:#6b7280;font-size:11px;">
          Web mode is opt-in only. The server will not use the web unless you explicitly choose it.
        </div>
      </div>
    `;

    document.body.appendChild(consentOverlayEl);

    // Close on overlay click (but not modal click)
    consentOverlayEl.addEventListener("click", (e) => {
      if (e.target === consentOverlayEl) hideConsentModal();
    });

    const stayBtn = consentOverlayEl.querySelector("#rvConsentStay");
    const useWebBtn = consentOverlayEl.querySelector("#rvConsentUseWeb");

    stayBtn.addEventListener("click", () => hideConsentModal());
    useWebBtn.addEventListener("click", async () => {
      if (!consentState) return;

      // If out of credits, just close and do nothing
      if (Number(webCreditsRemaining ?? webCreditsMax) <= 0) {
        hideConsentModal();
        return;
      }

      // Decrement credit now (client-controlled)
      decrementWebCredit();

      // Call web mode and render into SAME turn
      hideConsentModal();
      await runWebForTurn(consentState.turnId, consentState.question);
    });
  }

  function showConsentModal({ turnId, question, note, web }) {
    ensureConsentModal();
    setCreditsFromServer(web);

    consentState = {
      turnId,
      question,
      note: note || "",
      creditsMax: Number.isFinite(Number(web?.creditsMax)) ? Number(web.creditsMax) : webCreditsMax,
      creditsRemaining:
        Number.isFinite(Number(web?.creditsRemaining))
          ? Number(web.creditsRemaining)
          : (webCreditsRemaining === null ? webCreditsMax : webCreditsRemaining)
    };

    const subtitle = consentOverlayEl.querySelector("#rvConsentSubtitle");
    const noteEl = consentOverlayEl.querySelector("#rvConsentNote");
    const creditsEl = consentOverlayEl.querySelector("#rvConsentCredits");
    const useWebBtn = consentOverlayEl.querySelector("#rvConsentUseWeb");

    subtitle.textContent = "Roofing-related question, but the available snippets did not directly support an answer.";
    noteEl.textContent = consentState.note || "No direct RoofVault library support found for this roofing question.";

    const remaining = Number(consentState.creditsRemaining);
    const max = Number(consentState.creditsMax);
    creditsEl.textContent = `Web credits remaining: ${Number.isFinite(remaining) ? remaining : max}`;

    // Disable button if no credits
    if (Number.isFinite(remaining) && remaining <= 0) {
      useWebBtn.disabled = true;
      useWebBtn.style.opacity = "0.65";
      useWebBtn.style.cursor = "not-allowed";
      useWebBtn.textContent = "No web credits left";
    } else {
      useWebBtn.disabled = false;
      useWebBtn.style.opacity = "1";
      useWebBtn.style.cursor = "pointer";
      useWebBtn.textContent = "Use the web (1 credit)";
    }

    consentOverlayEl.style.display = "flex";
  }

  function hideConsentModal() {
    if (!consentOverlayEl) return;
    consentOverlayEl.style.display = "none";
    consentState = null;
  }

  async function postRvchat(payload) {
    const res = await fetch("/api/rvchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { ok: false, error: "Could not parse response JSON." };
    }
    return data;
  }

  async function runWebForTurn(turnId, question) {
    // Update UI: show loading inside the same turn
    renderAssistantLoading(turnId, "Using the web…");

    // Include session history + remaining credits
    const data = await postRvchat({
      mode: "web",
      question,
      messages: chatHistory,
      webCreditsRemaining: webCreditsRemaining
    });

    if (!data.ok) {
      renderAssistantIntoTurn(
        turnId,
        data.error || "Web mode failed.",
        "general",
        []
      );
      return;
    }

    // Render web answer
    const answerText = String(data.answer || "");
    const mode = data.mode || "web";
    const sources = Array.isArray(data.sources) ? data.sources : [];
    renderAssistantIntoTurn(turnId, answerText, mode, sources);

    // Update credits from server if it returned anything
    setCreditsFromServer(data.web);

    // Memory: store assistant message
    pushHistory("assistant", answerText);
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

    // Create newest turn at top
    const turnId = prependTurn(question);

    // Memory: store user message
    pushHistory("user", question);

    try {
      // Default call: let server decide doc/general (and possibly return consent flag)
      const data = await postRvchat({
        question,
        messages: chatHistory,
        // If we already have credits in session, echo it (server can display it back in refusal)
        webCreditsRemaining: webCreditsRemaining
      });

      if (!data.ok) {
        renderAssistantIntoTurn(
          turnId,
          data.error || "There was an error answering your question.",
          "general",
          []
        );

        // Keep memory clean: remove last user message
        if (chatHistory.length && chatHistory[chatHistory.length - 1]?.role === "user") {
          chatHistory.pop();
        }
        return;
      }

      // Update credits if server provides web object
      setCreditsFromServer(data.web);

      const answerText = String(data.answer || "");
      const mode = data.mode || "";
      const sources = Array.isArray(data.sources) ? data.sources : [];

      renderAssistantIntoTurn(turnId, answerText, mode, sources);

      // If server requests consent, show modal (do NOT auto web-call)
      if (data.needsConsentForWeb) {
        showConsentModal({
          turnId,
          question,
          note: data.note || "",
          web: data.web || {}
        });

        // Store the refusal answer in memory so the conversation is coherent
        pushHistory("assistant", answerText);
        return;
      }

      // Normal: store assistant message
      pushHistory("assistant", answerText);
    } catch (e) {
      renderAssistantIntoTurn(turnId, "Network or server error: " + String(e), "general", []);

      // Keep memory clean
      if (chatHistory.length && chatHistory[chatHistory.length - 1]?.role === "user") {
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
