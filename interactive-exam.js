(function () {
  // ---------- Simple styles ----------
  const STYLE_ID = "rv-exam-inline-style";
  if (!document.getElementById(STYLE_ID)) {
    const css = `
      .rv-q { border:1px solid #2a2f3a; border-radius:12px; padding:14px; margin:10px 0; background:#0c0f14; }
      .rv-q h3 { margin:0 0 10px 0; font-size:16px; line-height:1.35; }
      .rv-img { margin:10px 0 6px 0; max-width:100%; border-radius:10px; border:1px solid #2a2f3a; }
      .rv-img-caption { font-size:11px; color:#a7b0c0; margin-bottom:6px; }
      .rv-opt { display:flex; flex-direction:column; gap:8px; margin:10px 0; }
      .rv-btn { display:block; text-align:left; padding:10px 12px; border:1px solid #2a2f3a; background:#0f131a; color:#e6e9ef; border-radius:10px; cursor:pointer; }
      .rv-btn.correct { border-color:#20e3b2; box-shadow:0 0 0 1px rgba(32,227,178,.25) inset; }
      .rv-btn.incorrect { border-color:#ff5a5a; box-shadow:0 0 0 1px rgba(255,90,90,.25) inset; }
      .rv-btn.selected { border-color:#2aa9ff; box-shadow:0 0 0 1px rgba(42,169,255,.25) inset; }
      .rv-btn:disabled { opacity:.85; cursor:default; }
      .rv-exp { margin-top:10px; font-size:13px; color:#a7b0c0; border-top:1px dashed #2a2f3a; padding-top:10px; }
      .rv-ctr { display:flex; gap:8px; justify-content:flex-end; margin-top:10px; flex-wrap:wrap; }
      .rv-nav { padding:8px 12px; border:none; border-radius:10px; background:#2aa9ff; color:#071018; font-weight:600; cursor:pointer; }
      .rv-tag { font-size:11px; color:#a7b0c0; margin-top:4px; }
      .rv-why { background:transparent; border:none; color:#a7b0c0; text-decoration:underline; cursor:pointer; padding:0; margin-left:10px; font-size:12px; }
      .rv-hint { font-size:12px; color:#ffb347; margin-top:6px; }
      .rv-progress { font-size:12px; color:#a7b0c0; margin-top:6px; }
      .rv-progress strong { color:#e6e9ef; }
      .rv-summary { border:1px solid #2a2f3a; border-radius:12px; padding:18px; margin:10px 0; background:#0c0f14; text-align:center; }
      .rv-grade-big { font-size:32px; font-weight:800; margin-bottom:8px; }
      .rv-summary-text { font-size:13px; color:#a7b0c0; margin:4px 0; }
      .rv-summary-actions { margin-top:14px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap; }
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
    results: [], // { answered: bool, correct: bool }
    currentIndex: 0
  };

  function ensureProgressElement() {
    let p = $("examProgress");
    if (!p) {
      p = el("div", { id: "examProgress", class: "rv-progress" });
      // Put it under qList if possible
      const qList = $("qList");
      if (qList && qList.parentElement) {
        qList.parentElement.appendChild(p);
      } else {
        document.body.appendChild(p);
      }
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

    if (!answered) {
      p.textContent = `Progress: 0 / ${total} answered • Current score: 0 / 0 (0%) • Grade: -`;
    } else {
      p.innerHTML = `Progress: <strong>${answered} / ${total}</strong> answered • Current score: <strong>${correct} / ${answered}</strong> (${pct}%) • Grade: <strong>${grade}</strong>`;
    }
  }

  // ---------- Summary / finish screen ----------
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
    const newBtn = el("button", {
      class: "rv-nav",
      text: "New 25Q Practice Exam"
    });
    newBtn.onclick = () => {
      // Try to click the generate button if it exists
      const genBtn =
        document.getElementById("generateExamBtn") ||
        document.getElementById("btnGenerate25") ||
        document.querySelector("button[data-role='generate-exam']") ||
        document.querySelector("button[data-exam-generate='25']");
      if (genBtn) {
        genBtn.click();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Fallback: just scroll to top so the user can click it
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

  // ---------- Core renderer ----------
  function renderOne(mount, item, idx, total, onNav, onFinish) {
    mount.innerHTML = "";

    const optionsArr = Array.isArray(item.options) ? item.options : [];
    const hasOptions = optionsArr.length > 0;

    // Correct letters / multi-select metadata
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

    const hasMultiFlag = !!item.multi || (correctIdxs.length > 1);
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

    let tagText = `Question ${idx + 1} of ${total} • Source: ${item.cite || "source"}`;
    if (isMulti) {
      tagText += ` • Multi-select: choose ${expectedSelectionsRaw}`;
    }
    const tag = el("div", { class: "rv-tag", text: tagText });

    box.appendChild(title);

    // Optional image for exhibit questions
    if (item.imageRef) {
      const img = el("img", {
        src: item.imageRef,
        alt: "Exhibit",
        class: "rv-img"
      });
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
      const idx = selectedLetters.indexOf(letter);
      if (idx >= 0) {
        selectedLetters.splice(idx, 1);
        btnEl.classList.remove("selected");
      } else {
        selectedLetters.push(letter);
        btnEl.classList.add("selected");
      }
    }

    // If this question has no options, show a note and don't try to grade it.
    if (!hasOptions) {
      const msg = el("div", {
        class: "rv-hint",
        text:
          "This question in the original study guide is scenario/short-answer only, so it is shown here for review but not graded."
      });
      box.appendChild(msg);
    } else {
      // Build answer buttons
      (optionsArr || []).forEach((opt) => {
        const letter = String(opt.id || "").trim().toUpperCase();
        const b = el("button", { class: "rv-btn" });
        b.setAttribute("data-letter", letter);
        b.innerHTML = `<strong>${letter}.</strong> ${opt.text || ""}`;

        if (isMulti) {
          // Multi-select: toggle, grading happens on "Check answer"
          b.onclick = () => {
            if (answeredHere) return;
            toggleSelection(letter, b);
          };
        } else {
          // Single-choice: grade immediately on click
          b.onclick = () => {
            if (answeredHere) return;
            answeredHere = true;
            const chosenLetter = letter;
            const isChosenCorrect = correctSet.has(chosenLetter);

            [...optsWrap.querySelectorAll(".rv-btn")].forEach((btn) => {
              const l = String(btn.getAttribute("data-letter") || "").toUpperCase();

              if (correctSet.has(l)) {
                btn.classList.add("correct");
              }
              if (!correctSet.has(l) && l === chosenLetter) {
                btn.classList.add("incorrect");
              }
              btn.disabled = true;
            });

            if (!isChosenCorrect) {
              exp.textContent = item.explanation || "No explanation provided.";
              exp.style.display = "block";
              expShown = true;
            } else {
              exp.textContent = "Correct!";
              exp.style.display = "block";
              exp.appendChild(whyBtn);
            }

            // record result
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

    // Multi-select "Check answer" button (only if we have options)
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

          if (correctSet.has(l)) {
            btn.classList.add("correct");
          }
          if (!correctSet.has(l) && selSet.has(l)) {
            btn.classList.add("incorrect");
          }

          btn.disabled = true;
        });

        if (allCorrect) {
          exp.textContent = "Correct!";
          exp.style.display = "block";
          exp.appendChild(whyBtn);
        } else {
          exp.textContent =
            item.explanation ||
            "Review the correct combination based on the study guide.";
          exp.style.display = "block";
          expShown = true;
        }

        ExamState.results[idx].answered = true;
        ExamState.results[idx].correct = allCorrect;
        updateProgress();
      };
      ctrls.appendChild(checkBtn);
    }

    const backBtn = el("button", { class: "rv-nav", text: "Back" });
    const isLast = idx === total - 1;
    const nextLabel = isLast ? "Finish" : "Next";
    const nextBtn = el("button", { class: "rv-nav", text: nextLabel });

    backBtn.onclick = () => onNav(idx - 1);
    nextBtn.onclick = () => {
      if (isLast && typeof onFinish === "function") {
        onFinish();
      } else {
        onNav(idx + 1);
      }
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
      updateProgress();
      return;
    }

    ExamState.items = items;
    ExamState.results = items.map(() => ({ answered: false, correct: false }));
    ExamState.currentIndex = 0;

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
