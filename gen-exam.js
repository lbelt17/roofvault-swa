// gen-exam.js — generate a 25-question practice exam for the selected book
(function () {
  const QUESTION_COUNT = 25;

  function $(id) {
    return document.getElementById(id);
  }

  const statusEl = $("status");
  const diagEl = $("diag");

  function setStatus(t) {
    if (statusEl) statusEl.textContent = t || "Ready";
  }

  function showDiag(o) {
    if (!diagEl) return;
    try {
      diagEl.textContent =
        typeof o === "string" ? o : JSON.stringify(o, null, 2);
    } catch {
      diagEl.textContent = String(o);
    }
  }

  // Ensure the output area and button exist so the exam can render safely
  function ensureUI() {
    let qList = $("qList");
    if (!qList) {
      qList = document.createElement("div");
      qList.id = "qList";
      qList.style.minHeight = "240px";
      qList.style.border = "1px solid #2a2f3a";
      qList.style.borderRadius = "12px";
      qList.style.padding = "14px";
      qList.style.background = "#0c0f14";

      const bm = $("bookMount");
      if (bm && bm.parentNode) {
        bm.parentNode.appendChild(qList);
      } else {
        document.body.appendChild(qList);
      }
    }
let btn = $("btnGenExam50ByBook");
if (!btn) {
  const holder = document.createElement("div");
  holder.style.margin = "10px 0";

  btn = document.createElement("button");
  btn.id = "btnGenExam50ByBook";
  btn.textContent = "Generate 25Q Practice Exam";

  // Lock by default unless logged in
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

      const bm2 = $("bookMount");
      if (bm2 && bm2.parentNode) {
        bm2.parentNode.insertBefore(holder, qList.nextSibling);
      } else {
        document.body.insertBefore(holder, document.body.firstChild);
      }
    }

    return { qList, btn };
  }

  // 🔍 Helper: is this the IIBEC RWC Study Guide book?
  function isRwcStudyGuide(pick) {
    if (!pick) return false;
    const name = (pick.label || pick.text || pick.value || "").toLowerCase();
    // Relaxed match in case you tweak naming
    return name.includes("rwc") && name.includes("study") && name.includes("guide");
  }

  // 🔧 Helper: for RWC Study Guide ONLY, mark "choose two / pick two" questions as multi-select
  function markRwcMultiSelect(items, pick) {
    if (!Array.isArray(items) || !isRwcStudyGuide(pick)) return items;

    const multiRegex = /(choose\s*two|pick\s*two|pick\s*2)/i;

    return items.map((item) => {
      // Try a few common property names for the question text
      const qText =
        (item.question ??
          item.prompt ??
          item.q ??
          item.text ??
          "") + "";

      if (multiRegex.test(qText)) {
        return {
          ...item,
          // These flags can be used by renderQuiz() to show checkboxes, etc.
          type: item.type || "multi",
          multi: true,
          expectedSelections: item.expectedSelections || 2
        };
      }

      return item;
    });
  }

  // 🧹 Normalize + filter questions to reduce hallucinations and enforce book-only semantics
  function normalizeAndFilterItems(rawItems, pick) {
    const items = Array.isArray(rawItems) ? rawItems.slice() : [];
    const removed = [];

    // Resolve metadata for this book so we can attach a consistent citation
    let meta = null;
    try {
      if (window.getBookMetadata && pick && pick.value != null) {
        meta = window.getBookMetadata(pick.value);
      }
    } catch (e) {
      console.warn("Error reading BOOK_METADATA:", e);
    }

    const defaultSourceTitle =
      (meta && meta.title) || pick.label || pick.text || "Selected book";
    const defaultSourceYear =
      (meta && meta.year) || "Year not specified";

    // Heuristic for market-share style questions we want to be very strict about
    const MARKET_REGEX =
      /(market share|% of the market|percent of roofs|dominates\s+the\s+market|portion of the market)/i;

    const cleaned = items.filter((item) => {
      if (!item || typeof item !== "object") return false;

      const sourceStatus = String(item.sourceStatus || "").toUpperCase();
      const fromBook =
        item.fromBook === true ||
        sourceStatus === "FROM_BOOK" ||
        sourceStatus === "IN_BOOK";

      // 🚫 1) If backend explicitly said this is NOT in the book, drop it
      if (
        sourceStatus === "NOT_IN_BOOK" ||
        sourceStatus === "OUT_OF_SCOPE" ||
        sourceStatus === "UNKNOWN"
      ) {
        removed.push({
          reason: sourceStatus,
          question: item.question || ""
        });
        return false;
      }

      // Text we use to check for risky/statistical language
      const qText =
        ((item.question ||
          item.prompt ||
          item.text ||
          "") + "").trim();
      const expText = ((item.explanation || "") + "").trim();

      // 🚫 2) Drop market-share style questions unless backend explicitly marks them as "from book"
      if (MARKET_REGEX.test(qText) || MARKET_REGEX.test(expText)) {
        if (!fromBook) {
          removed.push({
            reason: "market-share-heuristic",
            question: qText
          });
          return false;
        }
      }

      // ✅ 3) Attach default source/citation fields if missing
      if (!item.sourceTitle) item.sourceTitle = defaultSourceTitle;
      if (!item.sourceYear) item.sourceYear = defaultSourceYear;

      // If backend provided a page or section, build a short cite
      if (!item.cite) {
        if (item.page) {
          item.cite = `p. ${item.page}`;
        } else if (item.section) {
          item.cite = `Section ${item.section}`;
        }
      }

      return true;
    });

    if (removed.length && diagEl) {
      showDiag({
        removedCount: removed.length,
        removed
      });
    }

    return cleaned;
  }

  // Fetch with timeout + retry
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

  async function genExam() {
    const { qList } = ensureUI();

    if (!window.getSelectedBook) {
      showDiag("Book selector not ready.");
      setStatus("Error");
      return;
    }

    const pick = window.getSelectedBook();
    if (!pick) {
      showDiag("No book selected");
      setStatus("Error");
      return;
    }

    const bookName = pick.label || pick.text || pick.value || "selected book";

    try {
      const btn = $("btnGenExam50ByBook");
      if (btn) {
        btn.disabled = true;
        btn.classList.add("busy");
      }

      setStatus(`Generating ${QUESTION_COUNT}-question exam…`);
      qList.classList.add("mono");
      qList.textContent = `⏳ Generating a ${QUESTION_COUNT}-question practice exam for "${bookName}" from /api/exam (book-only mode)…`;

      // Each click calls the API again → fresh 25Q set each time
      const res = await safeFetch(
        "/api/exam",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book: pick.value, // which file to use (from dropdown)
            filterField: pick.field, // whatever your API expects
            count: QUESTION_COUNT, // 25 questions, not 50
            // Hint for backend: be strict about using ONLY this document
            mode: "BOOK_ONLY",
            bookLabel: bookName
          })
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

      let items = Array.isArray(data.items) ? data.items : [];

      if (items.length === 0) {
        showDiag({
          status: res.status,
          body: data,
          hint: "API responded but no items[] returned"
        });
        qList.textContent = "(No questions returned)";
        setStatus("Error");
        return;
      }

      // 🧹 Normalize + filter questionable items (market share, NOT_IN_BOOK, etc.)
      items = normalizeAndFilterItems(items, pick);

      if (!items.length) {
        showDiag({
          status: res.status,
          hint: "All generated questions were filtered out as unsafe or out-of-book."
        });
        qList.textContent =
          "(Questions were generated but filtered out — no safe, in-book questions available. Try another book or adjust the exam settings.)";
        setStatus("Error");
        return;
      }

      // 🔑 RWC-only tweak: mark "choose two / pick two" questions as multi-select
      items = markRwcMultiSelect(items, pick);

      // If you have a fancy quiz renderer, use it; otherwise dump JSON
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
      const msg =
        e && e.name === "AbortError"
          ? "timeout"
          : e?.message || String(e);

      showDiag({ error: msg, hint: "Request aborted or network error" });

      const { qList: qList2 } = ensureUI();
      qList2.textContent = `{ "error": "${msg}" }`;
      setStatus("Error");
    } finally {
      const btn = $("btnGenExam50ByBook");
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("busy");
      }
      setTimeout(() => setStatus("Ready"), 900);
    }
  }

  // Expose manual trigger for Console debugging
  window.__genExam = genExam;

  // Wire the button once DOM + UI are ready
  function wire(attempt = 0) {
    const maxAttempts = 25; // ~5s with 200ms backoff
    const { btn } = ensureUI();
    if (btn) {
      try {
        btn.onclick = genExam;
      } catch {}
      return;
    }
    if (attempt < maxAttempts) {
      setTimeout(() => wire(attempt + 1), 200);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => wire());
  } else {
    wire();
  }
})();
