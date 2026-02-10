// gen-exam.js — RoofVault Practice Exam wiring (stable + "New 25Q" works + no-repeat memory)
//
// CRITICAL CONTRACT (NORMAL MODE):
// - /api/exam expects ONLY: { parts: [...], count: 25 }
// - Do NOT send bookGroupId, displayTitle, mode, excludeQuestions, attemptNonce, etc.
//
// SPECIAL CASE (BANK MODE):
// - If selected book is the RWC Study Guide, call:
//   GET /api/exam?bank=rwc&count=25
// - If selected book is the RRC Study Guide (exam-only injected option), call:
//   GET /api/exam?bank=rrc&count=25
// - Items may include exhibitImage (render it).
//
// DEMO MODE:
// - If window.DEMO_MODE_DISABLE_EXAM_AUTH === true, do NOT block generation on auth.

(function () {
  "use strict";

  // ================== CONFIG ==================
  const QUESTION_COUNT = 25;
  const API_URL = "/api/exam";
  const FETCH_TIMEOUT_MS = 120000;

  // Exam-only injected entries (NOT from /api/books)
  const EXAM_ONLY_BANK_ENTRIES = [
    {
      key: "__rv_bank_rrc__",
      label: "RRC Study Guide (Bank)",
      selection: { bookGroupId: "rrc-study-guide", displayTitle: "RRC Study Guide" },
    },
  ];

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

    // Ensure qList exists
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

    const btn = $("btnGenExam25ByBook");
    if (!btn) {
      showDiag("❌ Missing #btnGenExam25ByBook. Add id to your existing button.");
      return null;
    }

    return { bookMount, qList, btn };
  }

  // ================== EXAM-ONLY DROPDOWN INJECTION ==================
  function findBookSelect(bookMount) {
    if (!bookMount) return null;
    // Try common patterns: select inside mount
    const sel = bookMount.querySelector("select");
    return sel || null;
  }

  function injectExamOnlyBankOptions() {
    const ui = ensureUI();
    if (!ui) return;

    const sel = findBookSelect(ui.bookMount);
    if (!sel) {
      // If the page uses a custom dropdown (not <select>), we do nothing safely.
      // User can still set window.__rvSelectedBook manually if needed.
      return;
    }

    // Avoid double-injecting
    for (const entry of EXAM_ONLY_BANK_ENTRIES) {
      const exists = Array.from(sel.options || []).some((o) => o && o.value === entry.key);
      if (!exists) {
        const opt = document.createElement("option");
        opt.value = entry.key;
        opt.textContent = entry.label;
        sel.appendChild(opt);
      }
    }

    // Wire a change handler that sets a synthetic selection when our exam-only option is chosen
    if (!sel.__rvBankInjectedHandler) {
      sel.__rvBankInjectedHandler = true;

      sel.addEventListener("change", () => {
        const v = String(sel.value || "");
        const match = EXAM_ONLY_BANK_ENTRIES.find((e) => e.key === v);

        if (match) {
          // Set synthetic selection (exam-only)
          window.__rvSelectedBook = {
            ...match.selection,
            // parts intentionally omitted: bank mode doesn't need it
          };
          // Notify any listeners
          try {
            window.dispatchEvent(new CustomEvent("rv:bookChanged"));
          } catch {
            // ignore
          }
        }
      });
    }
  }

  // ================== LOADER (SAFE, FRONTEND-ONLY) ==================
  function ensureSpinnerStyles() {
    if (document.getElementById("rvSpinnerStyles")) return;

    const style = document.createElement("style");
    style.id = "rvSpinnerStyles";
    style.textContent = `
      @keyframes rv-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes rv-pulse { 0% { opacity: .55; } 50% { opacity: 1; } 100% { opacity: .55; } }
    `;
    document.head.appendChild(style);
  }

  function showLoader(qList, message) {
    if (!qList) return { hide() {} };

    ensureSpinnerStyles();

    // Make qList a positioning context
    const prevPos = qList.style.position;
    if (!prevPos || prevPos === "static") qList.style.position = "relative";

    // Remove any existing loader
    const existing = qList.querySelector(".rv-loading-overlay");
    if (existing) existing.remove();

    const overlay = el("div", { class: "rv-loading-overlay" });
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "18px";
    overlay.style.borderRadius = "12px";
    overlay.style.background = "rgba(10, 12, 18, 0.78)";
    overlay.style.backdropFilter = "blur(10px)";
    overlay.style.webkitBackdropFilter = "blur(10px)";
    overlay.style.border = "1px solid rgba(70, 80, 110, 0.25)";
    overlay.style.zIndex = "5";

    const card = el("div", { class: "rv-loading-card" });
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";
    card.style.gap = "10px";
    card.style.padding = "16px 18px";
    card.style.borderRadius = "14px";
    card.style.background = "rgba(15, 19, 30, 0.72)";
    card.style.border = "1px solid rgba(120,135,170,0.25)";
    card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
    card.style.minWidth = "240px";
    card.style.maxWidth = "520px";
    card.style.textAlign = "center";

    const spinner = el("div", { class: "rv-spinner" });
    spinner.style.width = "34px";
    spinner.style.height = "34px";
    spinner.style.borderRadius = "50%";
    spinner.style.border = "3px solid rgba(160, 180, 220, 0.25)";
    spinner.style.borderTopColor = "rgba(160, 180, 220, 0.9)";
    spinner.style.animation = "rv-spin 0.9s linear infinite";

    const title = el("div", { class: "rv-loading-title", text: message || "Generating exam…" });
    title.style.fontSize = "14px";
    title.style.fontWeight = "600";
    title.style.letterSpacing = "0.2px";
    title.style.color = "rgba(235, 245, 255, 0.92)";

    const sub = el("div", { class: "rv-loading-sub", text: "This can take ~10–20 seconds depending on the book." });
    sub.style.fontSize = "12.5px";
    sub.style.color = "rgba(210, 220, 240, 0.75)";
    sub.style.animation = "rv-pulse 1.6s ease-in-out infinite";

    card.appendChild(spinner);
    card.appendChild(title);
    card.appendChild(sub);
    overlay.appendChild(card);

    qList.appendChild(overlay);

    let dots = 0;
    const base = message || "Generating exam";
    const dotTimer = setInterval(() => {
      dots = (dots + 1) % 4;
      title.textContent = base + ".".repeat(dots);
    }, 450);

    let slowTimer = setTimeout(() => {
      sub.textContent = "Still working… pulling the best questions from the selected book.";
    }, 8500);

    function hide() {
      clearInterval(dotTimer);
      clearTimeout(slowTimer);
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    return { hide };
  }

  // ================== DEMO / AUTH (DISABLED) ==================
  // For demo stability: exam generation is ALWAYS allowed.
  function isDemoMode() {
    return true;
  }

  async function refreshButtonAuth(btn) {
    if (btn) {
      btn.disabled = false;
      btn.title = "Generate a 25-question practice exam.";
      btn.style.cursor = "pointer";
    }
    return true;
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

    return [String(selection?.bookGroupId || "").trim()].filter(Boolean);
  }

  // ================== BANK DETECTION ==================
  function isRwcStudyGuide(selection) {
    const title = String(selection?.displayTitle || "").toLowerCase();
    const group = String(selection?.bookGroupId || "").toLowerCase();

    // bookGroupId: "iibec-rwc-study-guide-docx"
    // displayTitle: "IIBEC - RWC Study Guide.docx"
    if (group === "iibec-rwc-study-guide-docx") return true;
    if (title.includes("iibec") && title.includes("rwc") && title.includes("study guide")) return true;

    return false;
  }

  function isRrcStudyGuide(selection) {
    const title = String(selection?.displayTitle || "").toLowerCase();
    const group = String(selection?.bookGroupId || "").toLowerCase();

    // Exam-only injected selection
    if (group === "rrc-study-guide") return true;
    if (title.includes("rrc") && title.includes("study")) return true;

    return false;
  }

  function bankKeyForSelection(selection) {
    if (isRwcStudyGuide(selection)) return "rwc";
    if (isRrcStudyGuide(selection)) return "rrc";
    return "";
  }

  // ================== NO-REPEAT MEMORY (client-side only) ==================
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

  // ================== RENDER (SAFE + EXHIBIT SUPPORT) ==================
  function renderItemsFallback(qList, items) {
    if (!qList) return;
    qList.innerHTML = "";

    const wrap = el("div", { class: "rv-qwrap" });
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "10px";

    items.forEach((q, idx) => {
      const card = el("div", { class: "rv-qcard" });
      card.style.border = "1px solid rgba(70,80,110,0.6)";
      card.style.background = "rgba(20, 26, 40, 0.96)";
      card.style.borderRadius = "12px";
      card.style.padding = "12px";

      const title = el("div", { class: "rv-qtitle" }, [
        el("strong", { text: `${idx + 1}. ` }),
        el("span", { text: String(q.question || "") }),
      ]);
      title.style.marginBottom = "10px";
      title.style.lineHeight = "1.45";

      card.appendChild(title);

      const imgUrl = (q.exhibitImage || q.imageRef || "").trim();
      if (imgUrl) {
        const imgBox = el("div", { class: "rv-exhibit" });
        imgBox.style.margin = "10px 0 12px 0";
        imgBox.style.padding = "10px";
        imgBox.style.borderRadius = "10px";
        imgBox.style.border = "1px solid rgba(120,135,170,0.35)";
        imgBox.style.background = "rgba(15, 19, 30, 0.65)";

        const img = el("img", {
          src: imgUrl,
          alt: `Exhibit for question ${idx + 1}`,
        });
        img.style.width = "100%";
        img.style.maxWidth = "720px";
        img.style.display = "block";
        img.style.borderRadius = "8px";

        imgBox.appendChild(img);
        card.appendChild(imgBox);
      }

      const opts = el("div", { class: "rv-opts" });
      opts.style.display = "grid";
      opts.style.gridTemplateColumns = "1fr";
      opts.style.gap = "8px";

      (Array.isArray(q.options) ? q.options : []).forEach((o) => {
        const row = el("div", { class: "rv-opt" }, [
          el("strong", { text: `${String(o.id || "").toUpperCase()}. ` }),
          el("span", { text: String(o.text || "") }),
        ]);
        row.style.padding = "10px";
        row.style.borderRadius = "10px";
        row.style.background = "rgba(12, 15, 20, 0.75)";
        row.style.border = "1px solid rgba(37, 42, 54, 0.9)";
        opts.appendChild(row);
      });

      card.appendChild(opts);
      wrap.appendChild(card);
    });

    qList.appendChild(wrap);
  }

  function renderItems(qList, items) {
    if (typeof window.renderQuiz === "function") {
      try {
        window.renderQuiz(items);
        return;
      } catch (e) {
        showDiag({ warning: "renderQuiz failed; using fallback renderer.", message: e?.message || String(e) });
      }
    }
    renderItemsFallback(qList, items);
  }

  // ================== MAIN ==================
  async function genExam(options = {}) {
    const ui = ensureUI();
    if (!ui) return;

    const { qList, btn } = ui;

    const authed = await refreshButtonAuth(btn);
    if (!authed) return;

    const selection = getBookSelection();
    if (!selection || !selection.bookGroupId) {
      setVisibleError("Error: No book selected.", {
        error: "No valid book selection found for exam generation.",
        fix: "Select a book OR choose the injected 'RRC Study Guide (Bank)' option.",
      });
      return;
    }

    const isNewAttempt = options.newAttempt === true;
    const seen = isNewAttempt ? loadSeen(selection.bookGroupId).slice(-200) : [];

    let loader = null;

    try {
      btn.disabled = true;
      btn.classList.add("busy");
      btn.setAttribute("aria-busy", "true");

      setStatus("Generating…");
      clearResults(qList);

      loader = showLoader(qList, "Generating exam");

      const bankKey = bankKeyForSelection(selection);
      const useBank = !!bankKey;

      let res;
      let payload = null;

      if (useBank) {
        const url = `${API_URL}?bank=${encodeURIComponent(bankKey)}&count=${encodeURIComponent(QUESTION_COUNT)}`;
        console.log("[RoofVault] /api/exam (BANK) url:", url);

        showDiag({
          mode: "bank",
          bank: bankKey,
          selection: { bookGroupId: selection.bookGroupId, displayTitle: selection.displayTitle },
          newAttempt: isNewAttempt,
          seenCountClientOnly: seen.length,
          url,
        });

        res = await safeFetch(url, { method: "GET" });
      } else {
        const parts = normalizeParts(selection);

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

        payload = { parts, count: QUESTION_COUNT };

        console.log("[RoofVault] /api/exam payload:", payload);

        showDiag({
          mode: "normal",
          selection: { bookGroupId: selection.bookGroupId, displayTitle: selection.displayTitle },
          partsCount: parts.length,
          newAttempt: isNewAttempt,
          seenCountClientOnly: seen.length,
          payloadSent: payload,
        });

        res = await safeFetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setVisibleError("Error: Exam API request failed.", {
          error: "API request failed",
          status: res.status,
          statusText: res.statusText || "",
          body: txt,
          payloadSent: payload,
          bankMode: useBank,
        });
        return;
      }

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

      let items = Array.isArray(data?.items)
        ? data.items
        : (Array.isArray(data?.questions) ? data.questions : []);

      items = normalizeAndFilterItems(items, selection);
      items = markRwcMultiSelect(items, selection);

      if (!Array.isArray(items) || items.length === 0) {
        clearResults(qList);
        setVisibleError("Error: Exam API returned no questions.", {
          error: "Missing/empty items[]",
          receivedKeys: data && typeof data === "object" ? Object.keys(data) : typeof data,
          dataPreview: data,
          payloadSent: payload,
          bankMode: useBank,
        });
        return;
      }

      addSeen(selection.bookGroupId, items);

      renderItems(qList, items);

      setStatus(`Ready • ${items.length} questions`);
      showDiag({
        ok: true,
        mode: useBank ? "bank" : "normal",
        bank: useBank ? bankKey : "",
        message: "✅ Exam generated.",
        itemsCount: items.length,
        hasAnyExhibitImages: !!items.some((q) => (q.exhibitImage || q.imageRef || "").trim()),
        debug: data?.debug || null,
      });
    } catch (e) {
      clearResults(qList);
      setVisibleError("Error: Exam generation failed.", {
        error: "genExam failed",
        message: e?.message || String(e),
      });
    } finally {
      try { loader?.hide?.(); } catch {}
      btn.disabled = false;
      btn.classList.remove("busy");
      btn.removeAttribute("aria-busy");
    }
  }

  // ================== WIRING ==================
  window.__genExam = genExam;

  async function wire() {
    const ui = ensureUI();
    if (!ui) return;

    // Inject the exam-only RRC option if the dropdown is a <select>
    injectExamOnlyBankOptions();

    showDiag("✅ gen-exam.js loaded. Click Generate to test.");

    ui.btn.onclick = () => genExam({ newAttempt: false });

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

    await refreshButtonAuth(ui.btn);

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
