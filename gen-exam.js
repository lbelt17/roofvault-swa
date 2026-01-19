// gen-exam.js — RoofVault Practice Exam wiring (stable + "New 25Q" works)
// Requirements:
// - HTML has: #bookMount, #btnGenExam25ByBook, #qList (optional), #status (optional), #diag (optional)
// - books.js sets window.__rvSelectedBook = { bookGroupId, displayTitle, parts: [string|object] }
// - renderQuiz(items) exists (preferred). If not, we print JSON into #qList.

(function () {
  "use strict";

  // ================== CONFIG ==================
  const QUESTION_COUNT = 25;
  const API_URL = "/api/exam";
  const FETCH_TIMEOUT_MS = 120000;

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

    // Ensure qList exists (your HTML already has it, but keep safe)
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

    // Require the HTML button to exist
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
  function getBookSelection() {
    if (typeof window.getSelectedBook === "function") return window.getSelectedBook();
    if (typeof window.getBookSelection === "function") return window.getBookSelection();
    if (window.__rvSelectedBook) return window.__rvSelectedBook;
    if (window.rvSelectedBook) return window.rvSelectedBook;
    return null;
  }

  function normalizeParts(selection) {
    if (Array.isArray(selection?.parts) && selection.parts.length) {
      return selection.parts
        .map((p) => {
          if (typeof p === "string") return p;

          // object form: extract best identifier
          if (p && typeof p === "object") {
            return (
              p.metadata_storage_name ||
              p.name ||
              p.id ||
              p.partId ||
              p.blobName ||
              p.ref ||
              p.key ||
              ""
            );
          }

          return "";
        })
        .map((s) => String(s).trim())
        .filter(Boolean);
    }

    // Fallback to bookGroupId (works if backend resolves slugs; also ok for single-part if it matches)
    return [String(selection?.bookGroupId || "").trim()].filter(Boolean);
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

  async function safeFetch(url, opts = {}, timeoutMs = FETCH_TIMEOUT_MS) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      return await fetch(url, { ...opts, signal: ctrl.signal });
    } catch (err) {
      if (err && err.name === "AbortError") {
        throw new Error("Request timed out while generating exam");
      }
      throw err;
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

    const parts = normalizeParts(selection);

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

      // Helpful debug while you’re building
      showDiag({ selection, parts, payload });

      const res = await safeFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        showDiag({
          error: "API request failed",
          status: res.status,
          statusText: res.statusText || "",
          body: txt,
          selection,
          parts,
          payload
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

    showDiag("✅ gen-exam.js loaded. Click Generate to test.");

    // Main button
    ui.btn.onclick = () => genExam();

    // ✅ Dynamic "New 25Q Practice Exam" button (created after grading)
// Works whether the button has an id or not (matches by text as fallback).
if (!window.__rvNewExamClickWired) {
  window.__rvNewExamClickWired = true;

  document.addEventListener("click", (e) => {
    const t = e.target;
    const btn = t && t.closest ? t.closest("button") : null;
    if (!btn) return;

    const idOk = btn.id === "btnNewExam25";
    const text = (btn.textContent || "").trim().toLowerCase();
    const textOk = text === "new 25q practice exam" || text.includes("new 25q");

    if (!idOk && !textOk) return;

    e.preventDefault();
    genExam();
  });
}


    // Initialize auth state
    await refreshButtonAuth(ui.btn);

    // Keep auth state accurate on book changes
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
