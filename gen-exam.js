// gen-exam.js — RoofVault Practice Exam wiring (stable + "New 25Q" works + no-repeat memory)
// Contract fix (CRITICAL):
// - /api/exam expects ONLY: { parts: [...], count: 25 }
// - Do NOT send bookGroupId, displayTitle, mode, excludeQuestions, attemptNonce, etc.
//
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

  function setVisibleError(message, extra) {
    // Prefer #status for a human-facing message, and #diag for detail
    setStatus(message || "Error");
    if (extra) showDiag(extra);
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
          fix: "Make sure your auth script is loaded before gen-exam.js",
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

    // Fallback to bookGroupId (only if present)
    return [String(selection?.bookGroupId || "").trim()].filter(Boolean);
  }

  // ================== NO-REPEAT MEMORY (client-side only) ==================
  // We KEEP this, but we DO NOT send excludeQuestions to the backend anymore.
  function normQ(s) {
    return String(s || "")
      .toLowerCase()
      .replace(
        /\b(what|which|who|when|where|why|how|according to|in the|of the|is|are|was|were|does|do|did|a|an|the|and|or|to|for|with|in|on|at|by|from)\b/g,
        " "
      )
      .replace(/[^\w\s]/g, " ")
      .replace(/\d+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .slice(0, 18)
      .join(" ");
  }

  function seenKey(bookGroupId) {
    return `rv_seen_q_v1:${String(bookGroupId || "").trim().toLowerCase()}`;
  }

  function loadSeen(bookGroupId) {
    try {
      const raw = localStorage.getItem(seenKey(bookGroupId));
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function saveSeen(bookGroupId, arr) {
    try {
      localStorage.setItem(seenKey(bookGroupId), JSON.stringify(arr.slice(-400)));
    } catch {
      // ignore
    }
  }

  function addSeen(bookGroupId, items) {
    const prev = loadSeen(bookGroupId);
    const set = new Set(prev.map(normQ));

    for (const q of items || []) {
      const nq = normQ(q?.question || q?.prompt);
      if (nq) set.add(nq);
    }

    const next = Array.from(set);
    saveSeen(bookGroupId, next);
    return next;
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
        sourceTitle: q.sourceTitle || selection.displayTitle,
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

  function clearResults(qList) {
    if (qList) qList.textContent = "";
  }

  // ================== MAIN ==================
  async function genExam(options = {}) {
    const ui = ensureUI();
    if (!ui) return;

    const { qList, btn } = ui;

    // Auth gate
    const authed = await refreshButtonAuth(btn);
    if (!authed) return;

    // Book selection
    const selection = getBookSelection();
    if (!selection || !selection.bookGroupId) {
      setVisibleError("Error: No book selected.", {
        error: "No valid book selection found for exam generation.",
        fix: "Expose window.__rvSelectedBook (or window.getSelectedBook()) with {bookGroupId, displayTitle, parts?}.",
        hint: "Your dropdown is working, but gen-exam.js needs a JS object representing the selected book.",
      });
      return;
    }

    const parts = normalizeParts(selection);

    // HARD-FAIL: parts[] must exist and be non-empty
    if (!Array.isArray(parts) || parts.length === 0) {
      clearResults(qList);
      setVisibleError("Error: This book has no parts[] available.", {
        error: "parts[] is missing/empty after normalization.",
        selection,
        normalizedParts: parts,
        fix: "Ensure books.js sets selectedBook.parts as an array (strings or objects with metadata_storage_name/name/id).",
      });
      return;
    }

    // Note: we keep no-repeat memory client-side, but do NOT send excludeQuestions anymore.
    const isNewAttempt = options.newAttempt === true;
    const seen = isNewAttempt ? loadSeen(selection.bookGroupId).slice(-200) : [];

    try {
      btn.disabled = true;
      btn.classList.add("busy");
      setStatus("Generating…");
      clearResults(qList);

      // ✅ CONTRACT FIX: send ONLY { parts, count }
      const payload = {
        parts,
        count: QUESTION_COUNT,
      };

      // Log payload before sending (requested)
      console.log("[RoofVault] /api/exam payload:", payload);

      showDiag({
        selection: {
          bookGroupId: selection.bookGroupId,
          displayTitle: selection.displayTitle,
        },
        partsCount: parts.length,
        newAttempt: isNewAttempt,
        seenCountClientOnly: seen.length,
        payloadSent: payload,
      });

      const res = await safeFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setVisibleError("Error: Exam API request failed.", {
          error: "API request failed",
          status: res.status,
          statusText: res.statusText || "",
          body: txt,
          payloadSent: payload,
        });
        return;
      }

      // Try JSON parse; if it fails, surface raw text
      let data;
      try {
        data = await res.json();
      } catch (e) {
        const raw = await res.text().catch(() => "");
        setVisibleError("Error: API returned non-JSON response.", {
          error: "Non-JSON response",
          message: e?.message || String(e),
          raw,
        });
        return;
      }

      // ✅ Require items[]
      let items = Array.isArray(data?.items) ? data.items : (Array.isArray(data?.questions) ? data.questions : []);
      items = normalizeAndFilterItems(items, selection);
      items = markRwcMultiSelect(items, selection);

      if (!Array.isArray(items) || items.length === 0) {
        clearResults(qList);
        setVisibleError("Error: Exam API returned no questions.", {
          error: "Missing/empty items[]",
          receivedKeys: data && typeof data === "object" ? Object.keys(data) : typeof data,
          dataPreview: data,
          payloadSent: payload,
          note: "If the response is echoing payload, backend is short-circuiting due to contract mismatch. Payload is now minimized—if echo still happens, backend routing/deploy may be wrong.",
        });
        return;
      }

      // Save these questions as “seen” AFTER successful response
      addSeen(selection.bookGroupId, items);

      // Render
      if (typeof window.renderQuiz === "function") {
        window.renderQuiz(items);
      } else {
        qList.textContent = JSON.stringify(items, null, 2);
      }

      setStatus(`Ready • ${items.length} questions`);
      showDiag({
        ok: true,
        message: "✅ Exam generated.",
        itemsCount: items.length,
        sourcesCount: Array.isArray(data?.sources) ? data.sources.length : 0,
        debug: data?.debug || null,
      });
    } catch (e) {
      clearResults(qList);
      setVisibleError("Error: Exam generation failed.", { error: "genExam failed", message: e?.message || String(e) });
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

    // Main Generate button = FIRST EXAM
    ui.btn.onclick = () => genExam({ newAttempt: false });

    // "New 25Q Practice Exam" button = NEW ATTEMPT
    // Note: no-repeat exclusion is currently client-only; backend does not accept excludeQuestions.
    if (!window.__rvNewExamClickWired) {
      window.__rvNewExamClickWired = true;

      document.addEventListener("click", (e) => {
        const t = e.target;
        const b = t && t.closest ? t.closest("button") : null;
        if (!b) return;

        const idOk = b.id === "btnNewExam25";
        const text = (b.textContent || "").trim().toLowerCase();
        const textOk = text === "new 25q practice exam" || text.includes("new 25q");

        if (!idOk && !textOk) return;

        e.preventDefault();
        genExam({ newAttempt: true });
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
