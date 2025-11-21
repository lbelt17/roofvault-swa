(function () {
  // ---------- Small helpers ----------
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else if (c) n.appendChild(c);
    });
    return n;
  }

  // ---------- Inject styles once ----------
  const STYLE_ID = "rv-exam-inline-style";
  if (!document.getElementById(STYLE_ID)) {
    const css = `
      .rv-q { border:1px solid #2a2f3a; border-radius:12px; padding:14px; margin:10px 0; background:#0c0f14; }
      .rv-q h3 { margin:0 0 10px 0; font-size:16px; line-height:1.35; }
      .rv-tag { font-size:11px; color:#a7b0c0; margin-top:4px; }

      .rv-opt { display:flex; flex-direction:column; gap:8px; margin:12px 0; }
      .rv-btn { display:block; text-align:left; padding:10px 12px; border:1px solid #2a2f3a; background:#0f131a; color:#e6e9ef; border-radius:10px; cursor:pointer; }
      .rv-btn.correct { border-color:#20e3b2; box-shadow:0 0 0 1px rgba(32,227,178,.25) inset; }
      .rv-btn.incorrect { border-color:#ff5a5a; box-shadow:0 0 0 1px rgba(255,90,90,.25) inset; }
      .rv-btn.selected { border-color:#2aa9ff; box-shadow:0 0 0 1px rgba(42,169,255,.25) inset; }
      .rv-btn:disabled { opacity:.8; cursor:default; }

      .rv-exp { margin-top:10px; font-size:13px; color:#a7b0c0; border-top:1px dashed #2a2f3a; padding-top:10px; }

      .rv-ctr { display:flex; gap:8px; justify-content:flex-end; margin-top:10px; flex-wrap:wrap; }
      .rv-nav { padding:8px 12px; border:none; border-radius:10px; background:#2aa9ff; color:#071018; font-weight:600; cursor:pointer; }

      .rv-why { background:transparent; border:none; color:#a7b0c0; text-decoration:underline; cursor:pointer; padding:0; margin-left:10px; font-size:12px; }

      .rv-scorebar { margin-top:8px; font-size:13px; color:#a7b0c0; }

      /* Thumbnail + lightbox */
      .rv-img-wrap { margin:8px 0 4px 0; text-align:center; }
      .rv-img-thumb { max-width:220px; max-height:160px; border-radius:10px; border:1px solid #2a2f3a; cursor:pointer; display:inline-block; object-fit:contain; }
      .rv-img-caption { font-size:11px; color:#a7b0c0; margin-top:4px; }

      .rv-lightbox {
        position:fixed; inset:0; background:rgba(0,0,0,.8);
        display:flex; align-items:center; justify-content:center;
        z-index:9999;
      }
      .rv-lightbox img {
        max-width:90vw; max-height:90vh;
        border-radius:12px; border:1px solid #3a3f4a;
        background:#000;
      }
      .rv-lightbox-close {
        position:absolute; top:18px; right:24px;
        background:rgba(0,0,0,.6); color:#fff;
        border:none; border-radius:999px;
        padding:6px 10px; cursor:pointer; font-size:13px;
      }
    `;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- Scoring helpers ----------
  function gradeFromPercent(pct) {
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

  function ensureScoreBar() {
    let scoreEl = $("examScore");
    if (!scoreEl) {
      scoreEl = el("div", { id: "examScore", class: "rv-scorebar" });
      const qList = $("qList");
      if (qList && qList.parentNode) {
        qList.parentNode.appendChild(scoreEl);
      } else {
        document.body.appendChild(scoreEl);
      }
    }
    return scoreEl;
  }

  function updateScoreBar(state) {
    const scoreEl = ensureScoreBar();
    const total = state.items.length;
    const answered = state.answered;
    const correct = state.correct;
    const pct = answered ? Math.round((correct / answered) * 100) : 0;
    const grade = answered ? gradeFromPercent(pct) : "–";
    scoreEl.textContent =
      `Progress: ${answered} / ${total} answered · ` +
      `Current score: ${correct} / ${answered || "0"} (${pct}%) · Grade: ${grade}`;
  }

  // ---------- Lightbox ----------
  function showLightbox(src) {
    const overlay = el("div", { class: "rv-lightbox" });
    const img = el("img");
    img.src = src;

    const closeBtn = el("button", { class: "rv-lightbox-close", text: "Close ×" });

    const close = () => {
      overlay.remove();
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      close();
    };

    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
  }

  // ---------- Render a single question ----------
  function renderOne(mount, item, idx, total, onNav, state) {
    mount.innerHTML = "";

    const optionsArr = Array.isArray(item.options) ? item.options : [];
    const correctIdxs = Array.isArray(item.correctIndexes) ? item.correctIndexes : [];
    let correctLetters = [];

    // derive correct letters
    if (correctIdxs.length && optionsArr.length) {
      correctLetters = correctIdxs
        .map(i => {
          const opt = optionsArr[i];
          if (!opt) return null;
          return String(opt.id || ["A", "B", "C", "D"][i] || "").trim().toUpperCase();
        })
        .filter(Boolean);
    } else if (typeof item.answer === "string" && item.answer.trim()) {
      correctLetters = item.answer
        .split(",")
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
    }
    if (!correctLetters.length && optionsArr.length) {
      correctLetters = [String(optionsArr[0].id || "A").trim().toUpperCase()];
    }

    const hasMultiFlag = !!item.multi || (correctIdxs.length > 1);
    const isMulti = hasMultiFlag || correctLetters.length > 1;
    const expectedSelections =
      typeof item.expectedSelections === "number" && item.expectedSelections > 0
        ? item.expectedSelections
        : (isMulti ? (correctLetters.length || 2) : 1);

    const correctSet = new Set(correctLetters);

    const box = el("div", { class: "rv-q" });
    const title = el("h3", { text: item.question || "(no question)" });

    let tagText = `Question ${idx + 1} of ${total} • Source: ${item.cite || "source"}`;
    if (isMulti) {
      tagText += ` • Multi-select: choose ${expectedSelections}`;
    }
    const tag = el("div", { class: "rv-tag", text: tagText });

    box.appendChild(title);
    box.appendChild(tag);

    // ---------- optional diagram image ----------
    if (item.imageRef) {
      const imgWrap = el("div", { class: "rv-img-wrap" });
      const thumb = el("img", {
        class: "rv-img-thumb",
        src: item.imageRef
      });
      thumb.onclick = () => showLightbox(item.imageRef);
      imgWrap.appendChild(thumb);
      imgWrap.appendChild(el("div", {
        class: "rv-img-caption",
        text: "Click to enlarge exhibit"
      }));
      box.appendChild(imgWrap);
    }

    const optsWrap = el("div", { class: "rv-opt" });

    const exp = el("div", { class: "rv-exp" });
    exp.style.display = "none";

    let expShown = false;
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
    let finishedThisQuestion = !!item.__graded;

    function toggleSelection(letter, btnEl) {
      const ix = selectedLetters.indexOf(letter);
      if (ix >= 0) {
        selectedLetters.splice(ix, 1);
        btnEl.classList.remove("selected");
      } else {
        selectedLetters.push(letter);
        btnEl.classList.add("selected");
      }
    }

    (optionsArr || []).forEach(opt => {
      const letter = String(opt.id || "").trim().toUpperCase();
      const b = el("button", { class: "rv-btn" });
      b.setAttribute("data-letter", letter);
      b.innerHTML = `<strong>${letter}.</strong> ${opt.text || ""}`;

      if (isMulti) {
        b.onclick = () => {
          if (finishedThisQuestion) return;
          toggleSelection(letter, b);
        };
      } else {
        b.onclick = () => {
          if (finishedThisQuestion) return;
          finishedThisQuestion = true;
          const chosenLetter = letter;
          const isCorrect = correctSet.has(chosenLetter);

          // mark all buttons
          [...optsWrap.querySelectorAll(".rv-btn")].forEach(btn => {
            const l = String(btn.getAttribute("data-letter") || "").toUpperCase();

            if (correctSet.has(l)) btn.classList.add("correct");
            if (!correctSet.has(l) && l === chosenLetter) btn.classList.add("incorrect");

            btn.disabled = true;
          });

          if (!item.__graded) {
            state.answered++;
            if (isCorrect) state.correct++;
            item.__graded = true;
            item.__isCorrect = isCorrect;
          }

          if (isCorrect) {
            exp.textContent = "Correct!";
            exp.style.display = "block";
            exp.appendChild(whyBtn);
          } else {
            exp.textContent = item.explanation || "No explanation provided.";
            exp.style.display = "block";
            expShown = true;
          }

          updateScoreBar(state);
        };
      }

      optsWrap.appendChild(b);
    });

    const ctrls = el("div", { class: "rv-ctr" });

    if (isMulti) {
      const checkBtn = el("button", { class: "rv-nav", text: "Check answer" });
      checkBtn.onclick = () => {
        if (finishedThisQuestion) return;

        if (!selectedLetters.length) {
          exp.textContent = `Select at least one option (expected ~${expectedSelections}).`;
          exp.style.display = "block";
          expShown = true;
          return;
        }

        finishedThisQuestion = true;
        const selSet = new Set(selectedLetters);

        const allCorrect =
          correctLetters.length === selectedLetters.length &&
          correctLetters.every(l => selSet.has(l));

        [...optsWrap.querySelectorAll(".rv-btn")].forEach(btn => {
          const l = String(btn.getAttribute("data-letter") || "").toUpperCase();

          btn.classList.remove("selected");

          if (correctSet.has(l)) btn.classList.add("correct");
          if (!correctSet.has(l) && selSet.has(l)) btn.classList.add("incorrect");

          btn.disabled = true;
        });

        if (!item.__graded) {
          state.answered++;
          if (allCorrect) state.correct++;
          item.__graded = true;
          item.__isCorrect = allCorrect;
        }

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

        updateScoreBar(state);
      };
      ctrls.appendChild(checkBtn);
    }

    const backBtn = el("button", { class: "rv-nav", text: "Back" });
    const nextBtn = el("button", { class: "rv-nav", text: "Next" });

    backBtn.onclick = () => onNav(idx - 1);
    nextBtn.onclick = () => onNav(idx + 1);

    ctrls.appendChild(backBtn);
    ctrls.appendChild(nextBtn);

    box.appendChild(optsWrap);
    box.appendChild(exp);
    box.appendChild(ctrls);
    mount.appendChild(box);
  }

  // ---------- Exposed renderer ----------
  window.renderQuiz = function (items) {
    const mount = $("qList") || (function () {
      const div = el("div"); div.id = "qList";
      document.body.appendChild(div);
      return div;
    })();

    if (!Array.isArray(items) || items.length === 0) {
      mount.textContent = "(No items)";
      return;
    }

    // exam state
    const state = {
      items,
      answered: 0,
      correct: 0
    };
    items.forEach(it => { it.__graded = false; it.__isCorrect = false; });

    updateScoreBar(state);

    let i = 0;
    const nav = (next) => {
      if (next < 0) next = 0;
      if (next > items.length - 1) next = items.length - 1;
      i = next;
      renderOne(mount, items[i], i, items.length, nav, state);
    };
    nav(0);

    const sb = $("summaryBlock");
    if (sb) {
      const key = items.map(it => `${it.id || "Q"}: ${it.answer || "?"}`).join(", ");
      sb.innerHTML =
        `<span class="muted">Answer key hidden. ` +
        `Check each question to reveal feedback. (Key: ${key})</span>`;
    }
  };
})();
