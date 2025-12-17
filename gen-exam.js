(function () {
  "use strict";

  // ================== CONFIG ==================
  const QUESTION_COUNT = 25;
  const API_URL = "/api/exam";

  // ================== DOM HELPERS ==================
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

  // ================== STATUS / DIAG ==================
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

  // ================== UI ==================
  function ensureUI() {
    const bookMount = $("bookMount");
    if (!bookMount) {
      showDiag("❌ Missing #bookMount on this page.");
      return null;
    }

    // Ensure qList exists (your HTML already has it, but we keep this safe)
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

    // IMPORTANT: We do NOT create the button. We require the HTML button to exist.
    const btn = $("btnGenExam25ByBook");
    if (!btn) {
      showDiag("❌ Missing #btnGenExam25ByBook in index.html. Add id to your existing button.");
      return null;
    }

    return { bookMount, qList, btn };
  }

  // ================== AUTH ==================
  async function refreshButtonAuth(btn) {
    try {
      if (typeof window.getAuthState !== "function") {
        btn.disabled = true;
        btn.title = "Auth system not loaded (getAuthState missing).";
        showDiag({
          error: "getAuthState is not defined on this page.",
          fix: "Make sure your auth script is loaded before gen-exam.js"
        });
        return false;
      }

      const auth = await window.getAuthState();
      const ok = !!auth?.isAuthenticated;

      btn.disabled = !ok;
      btn.title = ok ? "" : "Please log in to generate exams.";

      if (!ok) showDiag({ message: "Not logged in.", auth });
      return ok;
    } catch (e) {
      btn.disabled = true;
      btn.title = "Auth check failed.";
      showDiag({ error: "refreshButtonAuth failed", message: e?.message || String(e) });
      return false;
    }
  }

  // ================== BOOK SELECTION ==================
  // Your app must provide a "selected book" object with:
  // { bookGroupId, displayTitle, parts?: [] }
  // We try a few common locations; if none exist we show a clear error.
  function getBookSelection() {
    // Preferred: you expose a custom selection function (recommended)
    if (typeof window.getSelectedBook === "function") return window.getSelectedBook();
    if (typeof window.getBookSelection === "function") return window.getBookSelection();

    // Common: selection stored globally by books.js / interactive-exam.js
    if (window.__rvSelectedBook) return window.__rvSelectedBook;
    if (window.rvSelectedBook) return window.rvSelectedBook;

    // If someone accidentally relied on native window.getSelection(), it won't have bookGroupId.
    // We DO NOT call it here.

    return null;
  }

  // ================== HELPERS ==================
  function markRwcMultiSelect(items, selection) {
    if (!Array.isArray(items)) return items;
    const name = String(selection?.displayTitle || "").toLowerCase();
    if (!name.includes("rwc")) return items;

    return items.map((q) => {
      const txt = String(q.question || q.prompt || "");
      if (/choose\s*two|pick\s*two|pick\s*2/i.test(txt)) {
        return { ...q, type: "multi", expectedSelections: 2 };
      }
      return q;
    });
  }

  function normalizeAndFilterItems(items, selection) {
    if (!Array.isArray(items)) return [];
    return items
      .filter(Boolean)
      .map((q) => ({
        ...q,
        sourceTitle: q.sourceTitle || selection.displayTitle
      }));
  }

  async function safeFetch(url, opts = {}, timeoutMs = 45000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetch(url, { ...opts, signal: ctrl.signal });
    } finally {
      clearTimeout(t);
    }
  }

  // ================== MAIN ==================
  async function genExam() {
    const ui = ensureUI();
    if (!ui) return;

    const { qList, btn } = ui;

    // Auth gate
    const authed = await refreshButtonAuth(btn);
    if (!authed) return;

    // Book selection
    const selection = getBookSelection();
    if (!selection || !selection.bookGroupId) {
      showDiag({
        error: "No valid book selection found for exam generation.",
        fix: "Expose window.__rvSelectedBook (or window.getSelectedBook()) with {bookGroupId, displayTitle, parts?}.",
        hint: "Your dropdown is working, but gen-exam.js needs a JS object representing the selected book."
      });
      return;
    }

    const parts =
      Array.isArray(selection.parts) && selection.parts.length
        ? selection.parts
        : [selection.bookGroupId];

    try {
      btn.disabled = true;
      btn.classList.add("busy");
      setStatus("Generating…");

      const payload = {
        bookGroupId: selection.bookGroupId,
        displayTitle: selection.displayTitle,
        parts,
        count: QUESTION_COUNT,
        mode: "BOOK_ONLY",
        attemptNonce: `${Date.now()}-${Math.random().toString(16).slice(2)}`
      };

      const res = await safeFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // If API returns non-200, show body for debugging
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        showDiag({
          error: "API request failed",
          status: res.status,
          statusText: res.statusText,
          body: txt
        });
        setStatus("Error");
        return;
      }

      const data = await res.json();

      let items = Array.isArray(data.items) ? data.items : data.questions;
      items = normalizeAndFilterItems(items, selection);
      items = markRwcMultiSelect(items, selection);

      qList.textContent = "";

      if (typeof window.renderQuiz === "function") {
        window.renderQuiz(items);
      } else {
        qList.textContent = JSON.stringify(items, null, 2);
      }

      setStatus(`Ready • ${items.length} questions`);
      showDiag("✅ Exam generated.");
    } catch (e) {
      showDiag({ error: "genExam failed", message: e?.message || String(e) });
      setStatus("Error");
    } finally {
      btn.disabled = false;
      btn.classList.remove("busy");
    }
  }

  // ================== WIRING ==================
  window.__genExam = genExam;

  async function wire() {
    const ui = ensureUI();
    if (!ui) return;

    // Confirm file loaded
    showDiag("✅ gen-exam.js loaded. Click Generate to test.");

    // Direct click wiring (simple + reliable)
    ui.btn.onclick = () => genExam();

    // Initialize auth state
    await refreshButtonAuth(ui.btn);

    // If your app triggers book change events, keep auth state accurate
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
