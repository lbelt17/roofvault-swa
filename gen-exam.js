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
    if (!bookMount) return null;

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
      const holder = el("div");
      btn = el("button", {
        id: "btnGenExam25ByBook",
        text: `Generate ${QUESTION_COUNT}Q Practice Exam`
      });

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
      bookMount.parentNode.appendChild(holder);
    }

    return { qList, btn };
  }

  // ================== AUTH ==================
    async function refreshButtonAuth(btn) {
    try {
      if (typeof getAuthState !== "function") {
        // Don’t silently fail
        btn.disabled = true;
        btn.title = "Auth system not loaded (getAuthState missing).";
        showDiag({ error: "getAuthState is not defined on this page." });
        return false;
      }

      const auth = await getAuthState();
      const ok = !!auth?.isAuthenticated;

      btn.disabled = !ok;
      btn.title = ok ? "" : "Please log in to generate exams.";

      if (!ok) showDiag({ auth });
      return ok;
    } catch (e) {
      btn.disabled = true;
      btn.title = "Auth check failed.";
      showDiag({ error: "refreshButtonAuth failed", message: e?.message || String(e) });
      return false;
    }
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
    return items.filter(Boolean).map((q) => ({
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

    const authed = await refreshButtonAuth(btn);
    if (!authed) {
      showDiag("Not logged in.");
      return;
    }

    const selection = getSelection();
    if (!selection) {
      showDiag("No book selected.");
      return;
    }

    const parts = selection.parts.length ? selection.parts : [selection.bookGroupId];

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

      const data = await res.json();

      let items = Array.isArray(data.items) ? data.items : data.questions;
      items = normalizeAndFilterItems(items, selection);
      items = markRwcMultiSelect(items, selection);

      qList.classList.remove("mono");
      qList.textContent = "";

      if (typeof window.renderQuiz === "function") {
        window.renderQuiz(items);
      } else {
        qList.textContent = JSON.stringify(items, null, 2);
      }

      setStatus(`Ready • ${items.length} questions`);
    } catch (e) {
      showDiag(e.message || String(e));
      setStatus("Error");
    } finally {
      btn.disabled = false;
      btn.classList.remove("busy");
    }
  }

  // ================== WIRING ==================
  window.__genExam = genExam;

  function isExamButton(target) {
    if (!target) return false;

    // Most reliable: the id we expect
    const byId = target.closest && target.closest("#btnGenExam25ByBook");
    if (byId) return true;

    // Fallback: sometimes HTML uses a different id, but same label
    const btn = target.closest && target.closest("button");
    if (!btn) return false;

    const txt = (btn.textContent || "").toLowerCase();
    return txt.includes("generate 25q") && txt.includes("practice exam");
  }

  async function wire() {
    const ui = ensureUI();
    if (!ui?.btn) return;

    // Prove the script is actually running on this page
    showDiag("✅ gen-exam.js loaded. Waiting for click…");

    // Make sure the button is clickable even if auth wiring is weird
    ui.btn.onclick = () => genExam();

    // Auth enable/disable
    await refreshButtonAuth(ui.btn);

    // Event delegation: catches clicks even if the button is replaced/re-rendered
    if (!window.__rvExamDelegatedClick) {
      window.__rvExamDelegatedClick = true;

      document.addEventListener(
        "click",
        (e) => {
          if (isExamButton(e.target)) {
            showDiag("🖱️ CLICK DETECTED → calling genExam()");
            genExam();
          }
        },
        true // capture phase so nothing can swallow it
      );
    }

    // Keep auth accurate when book changes
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
