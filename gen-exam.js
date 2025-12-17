// gen-exam.js — RoofVault practice exam generator (25Q, grouped books, backend-ready for "no repeats")
(function () {
  "use strict";

  const QUESTION_COUNT = 25;
  const API_URL = "/api/exam";

  // ---------- DOM helpers ----------
  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  // ---------- Status + diagnostics ----------
  const statusEl = $("status");
  const diagEl = $("diag");

  function setStatus(t) {
    if (statusEl) statusEl.textContent = t || "Ready";
  }

  function showDiag(o) {
    if (!diagEl) return;
    try {
      diagEl.textContent = typeof o === "string" ? o : JSON.stringify(o, null, 2);
    } catch {
      diagEl.textContent = String(o);
    }
  }

  // ---------- Ensure UI exists (ONLY where #bookMount exists) ----------
  function ensureUI() {
    const bookMount = $("bookMount");
    if (!bookMount) return null; // do not inject on pages without the book selector mount

    let qList = $("qList");
    if (!qList) {
      qList = el("div", { id: "qList" });
      qList.style.minHeight = "240px";
      qList.style.border = "1px solid #2a2f3a";
      qList.style.borderRadius = "12px";
      qList.style.padding = "14px";
      qList.style.background = "#0c0f14";
      qList.style.marginTop = "10px";
      bookMount.parentNode?.appendChild(qList);
    }

    let btn = $("btnGenExam25ByBook");
    if (!btn) {
      const holder = el("div", { id: "examBtnHolder" });
      holder.style.margin = "10px 0";

      btn = el("button", { id: "btnGenExam25ByBook", text: `Generate ${QUESTION_COUNT}Q Practice Exam` });

      // locked by default; we'll enable once auth is confirmed
      btn.disabled = true;
      btn.title = "Please log in to generate exams.";

      btn.style.padding = "10px 14px";
      btn.style.borderRadius = "8px";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.background = "linear-gradient(180deg,#2aa9ff,#0ec0ff)";
      btn.style.color = "#071018";
      btn.style.fontWeight = "700";

      holder.appendChild(btn);

      // put button right after the dropdown mount, before questions list
      if (bookMount.parentNode) {
        bookMount.parentNode.insertBefore(holder, qList);
      } else {
        document.body.insertBefore(holder, document.body.firstChild);
      }
    }

    return { qList, btn };
  }

  // ---------- Auth: enable button only if logged in ----------
  async function getAuthState() {
    // Try your existing auth function first, then SWA /.auth/me fallback
    const tries = ["/api/auth-me", "/.auth/me"];

    for (const url of tries) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const json = await res.json();

        // /api/auth-me often returns { isAuthenticated: true, ... }
        if (json && typeof json.isAuthenticated === "boolean") return json;

        // /.auth/me returns { clientPrincipal: {...} } or an array depending on SWA version
        if (Array.isArray(json) && json[0]?.clientPrincipal) {
          return { isAuthenticated: true, clientPrincipal: json[0].clientPrincipal };
        }
        if (json?.clientPrincipal) {
          return { isAuthenticated: true, clientPrincipal: json.clientPrincipal };
        }
      } catch {
        // ignore and try next
      }
    }
    return { isAuthenticated: false };
  }

  async function refreshButtonAuth(btn) {
    const auth = await getAuthState();
    if (auth?.isAuthenticated) {
      btn.disabled = false;
      btn.title = "";
      return true;
    } else {
      btn.disabled = true;
      btn.title = "Please log in to generate exams.";
      return false;
    }
  }

  // ---------- Selection: prefer grouped selection from books.js ----------
  function getSelection() {
    // Preferred: books.js sets window.__rvBookSelection = { bookGroupId, displayTitle, parts[] }
    const s = window.__rvBookSelection;
    if (s && s.bookGroupId && (s.displayTitle || s.bookGroupId)) {
      return {
        bookGroupId: String(s.bookGroupId),
        displayTitle: String(s.displayTitle || s.bookGroupId),
        parts: Array.isArray(s.parts) ? s.parts.map(String) : []
      };
    }

    // Fallback: legacy selector API
    if (typeof window.getSelectedBook === "function") {
      const pick = window.getSelectedBook();
      if (!pick) return null;

      const label = pick.label || pick.text || pick.value || "Selected book";
      const value = pick.value || pick.label || pick.text;

      return {
        bookGroupId: String(value),
        displayTitle: String(label),
        parts: [String(value)]
      };
    }

    return null;
  }

  // ---------- RWC multi-select helper ----------
  function isRwcStudyGuide(selection) {
    const name = String(selection?.displayTitle || selection?.bookGroupId || "").toLowerCase();
    return name.includes("rwc") && name.includes("study") && name.includes("guide");
  }

  function markRwcMultiSelect(items, selection) {
    if (!Array.isArray(items) || !isRwcStudyGuide(selection)) return items;

    const multiRegex = /(choose\s*two|pick\s*two|pick\s*2)/i;
    return items.map((item) => {
      const qText = String(item.question ?? item.prompt ?? item.q ?? item.text ?? "");
      if (multiRegex.test(qText)) {
        return {
          ...item,
          type: item.type || "multi",
          multi: true,
          expectedSelections: item.expectedSelections || 2
        };
      }
      return item;
    });
  }

  // ---------- Normalize/filter (keep your safety heuristics) ----------
  function normalizeAndFilterItems(rawItems, selection) {
    const items = Array.isArray(rawItems) ? rawItems.slice() : [];
    const removed = [];

    const defaultSourceTitle = selection?.displayTitle || "Selected book";
    const defaultSourceYear = "Year not specified";

    const MARKET_REGEX =
      /(market share|% of the market|percent of roofs|dominates\s+the\s+market|portion of the market)/i;

    const cleaned = items.filter((item) => {
      if (!item || typeof item !== "object") return false;

      const sourceStatus = String(item.sourceStatus || "").toUpperCase();
      const fromBook =
        item.fromBook === true || sourceStatus === "FROM_BOOK" || sourceStatus === "IN_BOOK";

      if (sourceStatus === "NOT_IN_BOOK" || sourceStatus === "OUT_OF_SCOPE" || sourceStatus === "UNKNOWN") {
        removed.push({ reason: sourceStatus, question: item.question || "" });
        return false;
      }

      const qText = String(item.question || item.prompt || item.text || "").trim();
      const expText = String(item.explanation || "").trim();

      if (MARKET_REGEX.test(qText) || MARKET_REGEX.test(expText)) {
        if (!fromBook) {
          removed.push({ reason: "market-share-heuristic", question: qText });
          return false;
        }
      }

      if (!item.sourceTitle) item.sourceTitle = defaultSourceTitle;
      if (!item.sourceYear) item.sourceYear = defaultSourceYear;

      if (!item.cite) {
        if (item.page) item.cite = `p. ${item.page}`;
        else if (item.section) item.cite = `Section ${item.section}`;
      }

      return true;
    });

    if (removed.length && diagEl) {
      showDiag({ removedCount: removed.length, removed });
    }

    return cleaned;
  }

  // ---------- Fetch with timeout + retry ----------
  async function safeFetch(url, opts = {}, timeoutMs = 45000, retries = 1) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(t);
      return res;
    } catch (e) {
      clearTimeout(t);
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 800));
        return safeFetch(url, opts, timeoutMs, retries - 1);
      }
      throw e;
    }
  }

  // ---------- Main generator ----------
  async function genExam() {
    const ui = ensureUI();
    if (!ui) return;

    const { qList, btn } = ui;

    // Make sure auth is still valid right now
    const authed = await refreshButtonAuth(btn);
    if (!authed) {
      showDiag("Not logged in. Please log in first.");
      setStatus("Error");
      return;
    }

    const selection = getSelection();
    if (!selection) {
      showDiag("No book selected (selector not ready or nothing chosen).");
      setStatus("Error");
      return;
    }

    // If parts[] is empty (shouldn't be), fall back to bookGroupId as the single part
    const parts = Array.isArray(selection.parts) && selection.parts.length
      ? selection.parts
      : [selection.bookGroupId];

    const bookTitle = selection.displayTitle || selection.bookGroupId;

    try {
      btn.disabled = true;
      btn.classList.add("busy");

      setStatus(`Generating ${QUESTION_COUNT}-question exam…`);
      qList.classList.add("mono");
      qList.textContent =
        `⏳ Generating a ${QUESTION_COUNT}-question practice exam for "${bookTitle}"\n` +
        `Using ONLY this book (all parts) • Backend will enforce "no repeats" per user.\n\n` +
        `Calling ${API_URL}…`;

      // IMPORTANT:
      // - bookGroupId identifies the grouped book the user selected
      // - parts is the exact list of blob filenames (Part 01, Part 02, etc.)
      // Backend should:
      //  1) look up seen questions for (userId + bookGroupId) from TRVExamSeen
      //  2) avoid repeats
      //  3) save new questions as seen
      const payload = {
        bookGroupId: selection.bookGroupId,
        displayTitle: selection.displayTitle,
        parts,
        count: QUESTION_COUNT,
        mode: "BOOK_ONLY",
        // just a small nudge to encourage variety across clicks:
        attemptNonce: `${Date.now()}-${Math.random().toString(16).slice(2)}`
      };

      const res = await safeFetch(
        API_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        },
        45000,
        1
      );

      const txt = await res.text();
      let data;
      try {
        data = JSON.parse(txt);
      } catch {
        data = { error: txt };
      }

      if (!res.ok) {
        showDiag({ status: res.status, body: data });
        qList.textContent = data?.error || `HTTP ${res.status}`;
        setStatus("Error");
        return;
      }

      let items = Array.isArray(data.items) ? data.items : (Array.isArray(data.questions) ? data.questions : []);

      if (!items.length) {
        showDiag({ status: res.status, body: data, hint: "API responded but no items/questions returned" });
        qList.textContent = "(No questions returned)";
        setStatus("Error");
        return;
      }

      items = normalizeAndFilterItems(items, selection);
      if (!items.length) {
        showDiag({
          status: res.status,
          hint: "All generated questions were filtered out as unsafe or out-of-book."
        });
        qList.textContent =
          "(Questions were generated but filtered out — no safe, in-book questions available. Try another book.)";
        setStatus("Error");
        return;
      }

      items = markRwcMultiSelect(items, selection);

      if (typeof window.renderQuiz === "function") {
        qList.classList.remove("mono");
        qList.textContent = "";
        window.renderQuiz(items);
      } else {
        qList.classList.add("mono");
        qList.textContent = JSON.stringify(items, null, 2);
      }

      setStatus(`Ready • ${items.length} questions generated`);
    } catch (e) {
      const msg = e?.name === "AbortError" ? "timeout" : (e?.message || String(e));
      showDiag({ error: msg, hint: "Request aborted or network error" });

      const ui2 = ensureUI();
      if (ui2?.qList) ui2.qList.textContent = `{ "error": "${msg}" }`;
      setStatus("Error");
    } finally {
      // Re-check auth; only re-enable if still logged in
      const ui3 = ensureUI();
      if (ui3?.btn) {
        await refreshButtonAuth(ui3.btn);
        ui3.btn.classList.remove("busy");
      }
      setTimeout(() => setStatus("Ready"), 900);
    }
  }

  // Expose manual trigger for Console debugging
  window.__genExam = genExam;

  // Wire once DOM is ready; also update auth state when book changes
  async function wire() {
    const ui = ensureUI();
    if (!ui) return;

    ui.btn.onclick = genExam;

    // initial auth check
    await refreshButtonAuth(ui.btn);

    // when user selects a different book, keep button state accurate
    window.addEventListener("rv:bookChanged", async () => {
      const ui2 = ensureUI();
      if (ui2?.btn) await refreshButtonAuth(ui2.btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
