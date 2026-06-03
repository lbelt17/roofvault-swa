(function () {
  // ---------- Simple styles ----------
  const STYLE_ID = "rv-exam-inline-style";
  if (!document.getElementById(STYLE_ID)) {
    const css = `
      .rv-q {
        border: 1px solid rgba(15, 23, 42, 0.10);
        border-radius: 14px;
        padding: 16px;
        margin: 10px 0;
        background: #ffffff;
        color: #0b0d12;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
      }
      .rv-q h3 { margin: 0 0 10px 0; font-size: 17px; font-weight: 650; line-height: 1.4; color: #0b0d12; }
      .rv-img { margin: 10px 0 6px 0; max-width: 100%; border-radius: 10px; border: 1px solid rgba(15, 23, 42, 0.12); box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06); }
      .rv-img-caption { font-size: 13px; color: #5b6b82; margin-bottom: 6px; }
      .rv-opt { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; }
      .rv-btn {
        display: block;
        text-align: left;
        padding: 11px 13px;
        border: 1px solid rgba(15, 23, 42, 0.12);
        background: #ffffff;
        color: #0b0d12;
        font-size: 15px;
        line-height: 1.45;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        transition: border-color 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;
      }
      .rv-btn:hover:not(:disabled) { background: #f5f7fb; border-color: rgba(22, 121, 255, 0.22); }
      .rv-btn.correct {
        border-color: #20e3b2;
        background: rgba(32, 227, 178, 0.10);
        box-shadow: 0 0 0 1px rgba(32, 227, 178, 0.28) inset;
      }
      .rv-btn.incorrect {
        border-color: #ff5a5a;
        background: rgba(255, 90, 90, 0.08);
        box-shadow: 0 0 0 1px rgba(255, 90, 90, 0.22) inset;
      }
      .rv-btn.selected {
        border-color: #1679ff;
        background: rgba(33, 179, 255, 0.08);
        box-shadow: 0 0 0 1px rgba(22, 121, 255, 0.22) inset;
      }
      .rv-btn:disabled { opacity: 0.88; cursor: default; }
      .rv-exp {
        margin-top: 12px;
        font-size: 14px;
        line-height: 1.55;
        color: #5b6b82;
        border-top: 1px dashed rgba(15, 23, 42, 0.14);
        padding: 12px 12px 2px;
        background: #eef1f6;
        border-radius: 0 0 10px 10px;
      }
      .rv-ctr { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; flex-wrap: wrap; }
      .rv-nav {
        padding: 9px 14px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 999px;
        font-size: 15px;
        font-weight: 650;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.96);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.06)),
          linear-gradient(135deg, #2cc3ff, #1679ff);
        box-shadow: 0 8px 20px rgba(22, 121, 255, 0.24);
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
        transition: transform 0.05s ease-out, box-shadow 0.08s ease-out, filter 0.12s ease-out;
      }
      .rv-nav:hover { filter: brightness(1.03); box-shadow: 0 10px 24px rgba(22, 121, 255, 0.30); }
      .rv-nav:active { filter: brightness(0.98); }
      .rv-tag { font-size: 13px; color: #5b6b82; margin-top: 6px; line-height: 1.4; }
      .rv-why {
        background: transparent;
        border: none;
        color: #1679ff;
        text-decoration: underline;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
        font-size: 13px;
        font-weight: 600;
      }
      .rv-hint { font-size: 14px; color: #b45309; margin-top: 8px; line-height: 1.45; }
      .rv-progress { font-size: 14px; color: #5b6b82; margin-top: 8px; line-height: 1.45; }
      .rv-progress strong { color: #0b0d12; font-weight: 650; }
      .rv-summary {
        border: 1px solid rgba(15, 23, 42, 0.10);
        border-radius: 14px;
        padding: 22px 18px;
        margin: 10px 0;
        background: #ffffff;
        color: #0b0d12;
        text-align: center;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
      }
      .rv-grade-big { font-size: 34px; font-weight: 800; margin-bottom: 8px; color: #0b0d12; letter-spacing: -0.02em; }
      .rv-summary-text { font-size: 15px; color: #5b6b82; margin: 6px 0; line-height: 1.5; }
      .rv-summary-actions { margin-top: 16px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
    `;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

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
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else if (c) n.appendChild(c);
    });
    return n;
  }

  // ---------- Quality helpers (safe UI-only) ----------
  function normalizeText(s) {
    return String(s || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function fingerprintItem(item) {
    const q = normalizeText(item && item.question);
    const opts = Array.isArray(item && item.options) ? item.options : [];
    const optSig = opts
      .map((o) => normalizeText((o && o.text) || ""))
      .filter(Boolean)
      .join("|");
    const img = normalizeText((item && (item.imageRef || item.exhibitImage)) || "");
    return `${q}::${optSig}::${img}`;
  }

  function dedupeItems(items) {
    const seen = new Set();
    const kept = [];
    let removed = 0;

    for (const it of items) {
      const key = fingerprintItem(it);

      if (!normalizeText(it && it.question)) {
        kept.push(it);
        continue;
      }

      if (seen.has(key)) {
        removed += 1;
        continue;
      }
      seen.add(key);
      kept.push(it);
    }

    return { kept, removed };
  }

  // NEW: shuffle questions so "New 25Q" feels fresh even for bank mode
  function cryptoRandInt(maxExclusive) {
    // maxExclusive must be > 0
    if (maxExclusive <= 1) return 0;
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      // Avoid modulo bias (simple rejection sampling)
      const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
      let x;
      do {
        window.crypto.getRandomValues(buf);
        x = buf[0];
      } while (x >= limit);
      return x % maxExclusive;
    }
    // Fallback (still fine for demo)
    return Math.floor(Math.random() * maxExclusive);
  }

  function shuffleCopy(arr) {
    const a = Array.isArray(arr) ? arr.slice() : [];
    for (let i = a.length - 1; i > 0; i--) {
      const j = cryptoRandInt(i + 1);
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  // ---------- Scoring helpers ----------
  function letterGrade(pct) {
    if (isNaN(pct)) return "-";
    if (pct >= 97) return "A+";
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 67) return "D+";
    if (pct >= 63) return "D";
    if (pct >= 60) return "D-";
    return "F";
  }

  // Global-ish state for the current exam
  const ExamState = {
    items: [],
    results: [],
    currentIndex: 0,
    sourceTitle: null,
    sourceYear: null,
    dedupeRemoved: 0
  };

  function ensureProgressElement() {
    let p = $("examProgress");
    if (!p) {
      p = el("div", { id: "examProgress", class: "rv-progress" });
      const qList = $("qList");
      if (qList && qList.parentElement) qList.parentElement.appendChild(p);
      else document.body.appendChild(p);
    }
    return p;
  }

  function updateProgress() {
    const p = ensureProgressElement();
    const total = ExamState.items.length || 0;
    const answered = ExamState.results.filter((r) => r.answered).length;
    const correct = ExamState.results.filter((r) => r.correct).length;
    const pct = answered ? Math.round((correct / answered) * 100) : 0;
    const grade = answered ? letterGrade(pct) : "-";

    if (!total) {
      p.textContent = "";
      return;
    }

    const dedupeNote =
      ExamState.dedupeRemoved > 0 ? ` • Deduped: ${ExamState.dedupeRemoved}` : "";

    if (!answered) {
      p.textContent = `Progress: 0 / ${total} answered • Current score: 0 / 0 (0%) • Grade: -${dedupeNote}`;
    } else {
      p.innerHTML = `Progress: <strong>${answered} / ${total}</strong> answered • Current score: <strong>${correct} / ${answered}</strong> (${pct}%) • Grade: <strong>${grade}</strong>${dedupeNote}`;
    }
  }

  function renderSummary(mount) {
    const total = ExamState.items.length || 0;
    const answered = ExamState.results.filter((r) => r.answered).length;
    const correct = ExamState.results.filter((r) => r.correct).length;
    const pctTotal = total ? Math.round((correct / total) * 100) : 0;
    const grade = letterGrade(pctTotal);

    mount.innerHTML = "";

    const box = el("div", { class: "rv-summary" });
    const big = el("div", { class: "rv-grade-big", text: grade });
    const line1 = el("div", {
      class: "rv-summary-text",
      text: `You answered ${correct} out of ${total} questions correctly (${pctTotal}%).`
    });
    const line2 = el("div", {
      class: "rv-summary-text",
      text: `Questions attempted: ${answered} / ${total}`
    });

    const actions = el("div", { class: "rv-summary-actions" });
    const newBtn = el("button", { class: "rv-nav", text: "New 25Q Practice Exam" });

    newBtn.onclick = () => {
      const genBtn = document.getElementById("btnGenExam50ByBook");
      if (genBtn) {
        genBtn.click();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        console.warn("Generate button not found (btnGenExam50ByBook).");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    actions.appendChild(newBtn);
    box.appendChild(big);
    box.appendChild(line1);
    box.appendChild(line2);
    box.appendChild(actions);
    mount.appendChild(box);
  }

  function renderOne(mount, item, idx, total, onNav, onFinish) {
    mount.innerHTML = "";

    const optionsArr = Array.isArray(item.options) ? item.options : [];
    const hasOptions = optionsArr.length > 0;

    let correctLetters = [];
    const correctIdxs = Array.isArray(item.correctIndexes) ? item.correctIndexes : [];

    if (correctIdxs.length && optionsArr.length) {
      correctLetters = correctIdxs
        .map((i) => {
          const opt = optionsArr[i];
          if (!opt) return null;
          return String(opt.id || ["A", "B", "C", "D"][i] || "")
            .trim()
            .toUpperCase();
        })
        .filter(Boolean);
    } else if (typeof item.answer === "string" && item.answer.trim()) {
      correctLetters = item.answer
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
    }
    if (!correctLetters.length && optionsArr.length) {
      correctLetters = [
        String(optionsArr[0].id || "A")
          .trim()
          .toUpperCase()
      ];
    }

    const hasMultiFlag = !!item.multi || correctIdxs.length > 1;
    const isMulti = hasMultiFlag || correctLetters.length > 1;
    const expectedSelectionsRaw =
      typeof item.expectedSelections === "number" && item.expectedSelections > 0
        ? item.expectedSelections
        : isMulti
        ? correctLetters.length || 2
        : 1;

    const correctSet = new Set(correctLetters);

    const box = el("div", { class: "rv-q" });
    const title = el("h3", { text: item.question || "(no question)" });

    const tagParts = [`Question ${idx + 1} of ${total}`];

    if (ExamState.sourceTitle) {
      if (ExamState.sourceYear && ExamState.sourceYear !== "Year not specified") {
        tagParts.push(`Source: ${ExamState.sourceTitle} (${ExamState.sourceYear})`);
      } else {
        tagParts.push(`Source: ${ExamState.sourceTitle}`);
      }
    }

    if (item.cite) tagParts.push(`Ref: ${item.cite}`);
    if (isMulti) tagParts.push(`Multi-select: choose ${expectedSelectionsRaw}`);

    const tag = el("div", { class: "rv-tag", text: tagParts.join(" • ") });

    box.appendChild(title);

    const imgSrc = item.imageRef || item.exhibitImage;
    if (imgSrc) {
      const img = el("img", { src: imgSrc, alt: "Exhibit image", class: "rv-img" });
      const cap = el("div", {
        class: "rv-img-caption",
        text: "Refer to this exhibit while answering the question."
      });
      box.appendChild(img);
      box.appendChild(cap);
    }

    box.appendChild(tag);

    const optsWrap = el("div", { class: "rv-opt" });
    const exp = el("div", { class: "rv-exp" });
    exp.style.display = "none";

    let expShown = false;
    let answeredHere = false;

    const whyBtn = el("button", { class: "rv-why", text: "Why?" });
    whyBtn.onclick = () => {
      if (!expShown) {
        exp.textContent = item.explanation || "No explanation provided.";
        expShown = true;
        exp.style.display = "block";
      } else {
        exp.style.display = exp.style.display === "none" ? "block" : "none";
      }
    };

    const selectedLetters = [];
    function toggleSelection(letter, btnEl) {
      const i = selectedLetters.indexOf(letter);
      if (i >= 0) {
        selectedLetters.splice(i, 1);
        btnEl.classList.remove("selected");
      } else {
        selectedLetters.push(letter);
        btnEl.classList.add("selected");
      }
    }

    if (!hasOptions) {
      const msg = el("div", {
        class: "rv-hint",
        text:
          "This question in the original study guide is scenario/short-answer only, so it is shown here for review but not graded."
      });
      box.appendChild(msg);
    } else {
      optionsArr.forEach((opt) => {
        const letter = String(opt.id || "").trim().toUpperCase();
        const b = el("button", { class: "rv-btn" });
        b.setAttribute("data-letter", letter);
        b.innerHTML = `<strong>${letter}.</strong> ${opt.text || ""}`;

        if (isMulti) {
          b.onclick = () => {
            if (answeredHere) return;
            toggleSelection(letter, b);
          };
        } else {
          b.onclick = () => {
            if (answeredHere) return;
            answeredHere = true;
            const chosenLetter = letter;
            const isChosenCorrect = correctSet.has(chosenLetter);

            [...optsWrap.querySelectorAll(".rv-btn")].forEach((btn) => {
              const l = String(btn.getAttribute("data-letter") || "").toUpperCase();
              if (correctSet.has(l)) btn.classList.add("correct");
              if (!correctSet.has(l) && l === chosenLetter) btn.classList.add("incorrect");
              btn.disabled = true;
            });

            exp.textContent = isChosenCorrect
              ? "Correct!"
              : (item.explanation || "No explanation provided.");
            exp.style.display = "block";

            if (isChosenCorrect) exp.appendChild(whyBtn);
            else expShown = true;

            ExamState.results[idx].answered = true;
            ExamState.results[idx].correct = isChosenCorrect;
            updateProgress();
          };
        }

        optsWrap.appendChild(b);
      });
    }

    box.appendChild(optsWrap);
    box.appendChild(exp);

    const ctrls = el("div", { class: "rv-ctr" });

    if (isMulti && hasOptions) {
      const checkBtn = el("button", { class: "rv-nav", text: "Check answer" });
      checkBtn.onclick = () => {
        if (answeredHere) return;

        if (!selectedLetters.length) {
          exp.textContent = `Select at least one option (expected ~${expectedSelectionsRaw}).`;
          exp.style.display = "block";
          expShown = true;
          return;
        }

        answeredHere = true;
        const selSet = new Set(selectedLetters);

        const allCorrect =
          correctLetters.length === selectedLetters.length &&
          correctLetters.every((l) => selSet.has(l));

        [...optsWrap.querySelectorAll(".rv-btn")].forEach((btn) => {
          const l = String(btn.getAttribute("data-letter") || "").toUpperCase();
          btn.classList.remove("selected");
          if (correctSet.has(l)) btn.classList.add("correct");
          if (!correctSet.has(l) && selSet.has(l)) btn.classList.add("incorrect");
          btn.disabled = true;
        });

        exp.textContent = allCorrect
          ? "Correct!"
          : (item.explanation || "Review the correct combination based on the study guide.");
        exp.style.display = "block";

        if (allCorrect) exp.appendChild(whyBtn);
        else expShown = true;

        ExamState.results[idx].answered = true;
        ExamState.results[idx].correct = allCorrect;
        updateProgress();
      };
      ctrls.appendChild(checkBtn);
    }

    const backBtn = el("button", { class: "rv-nav", text: "Back" });
    const isLast = idx === total - 1;
    const nextBtn = el("button", { class: "rv-nav", text: isLast ? "Finish" : "Next" });

    backBtn.onclick = () => onNav(idx - 1);
    nextBtn.onclick = () => {
      if (isLast && typeof onFinish === "function") onFinish();
      else onNav(idx + 1);
    };

    ctrls.appendChild(backBtn);
    ctrls.appendChild(nextBtn);
    box.appendChild(ctrls);

    mount.appendChild(box);
  }

  // ---------- Public hook ----------
  window.renderQuiz = function (items) {
    const mount =
      $("qList") ||
      (function () {
        const div = el("div");
        div.id = "qList";
        document.body.appendChild(div);
        return div;
      })();

    if (!Array.isArray(items) || items.length === 0) {
      mount.textContent = "(No items)";
      ExamState.items = [];
      ExamState.results = [];
      ExamState.dedupeRemoved = 0;
      updateProgress();
      return;
    }

    // NEW: shuffle first so “New 25Q” doesn’t feel identical (especially bank mode)
    const shuffled = shuffleCopy(items);

    // UI-only: remove duplicates after shuffle (keeps variety high)
    const { kept, removed } = dedupeItems(shuffled);
    ExamState.dedupeRemoved = removed;

    ExamState.items = kept;
    ExamState.results = kept.map(() => ({ answered: false, correct: false }));
    ExamState.currentIndex = 0;

    try {
      const selectedBook = window.getSelectedBook ? window.getSelectedBook() : null;
      const meta =
        selectedBook && window.getBookMetadata
          ? window.getBookMetadata(selectedBook.value)
          : null;

      ExamState.sourceTitle =
        (meta && meta.title) || (selectedBook && selectedBook.label) || "Selected book";

      ExamState.sourceYear = (meta && meta.year) || "Year not specified";
    } catch (e) {
      console.warn("Unable to resolve book metadata for citations:", e);
      ExamState.sourceTitle = "Selected book";
      ExamState.sourceYear = "Year not specified";
    }

    const nav = (next) => {
      const lastIdx = ExamState.items.length - 1;
      if (next < 0) next = 0;
      if (next > lastIdx) next = lastIdx;
      ExamState.currentIndex = next;
      renderOne(
        mount,
        ExamState.items[next],
        next,
        ExamState.items.length,
        nav,
        () => {
          renderSummary(mount);
          updateProgress();
        }
      );
      updateProgress();
    };

    nav(0);
  };
})();
