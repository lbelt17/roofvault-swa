(function(){
  // Minimal styles injected once for feedback/explanations
  const STYLE_ID = "rv-exam-inline-style";
  if (!document.getElementById(STYLE_ID)) {
    const css = `
      .rv-q { border:1px solid #2a2f3a; border-radius:12px; padding:14px; margin:10px 0; background:#0c0f14; }
      .rv-q h3 { margin:0 0 10px 0; font-size:16px; line-height:1.35; }
      .rv-opt { display:flex; flex-direction:column; gap:8px; margin:10px 0; }
      .rv-btn { display:block; text-align:left; padding:10px 12px; border:1px solid #2a2f3a; background:#0f131a; color:#e6e9ef; border-radius:10px; cursor:pointer; }
      .rv-btn.correct { border-color:#20e3b2; box-shadow:0 0 0 1px rgba(32,227,178,.25) inset; }
      .rv-btn.incorrect { border-color:#ff5a5a; box-shadow:0 0 0 1px rgba(255,90,90,.25) inset; }
      .rv-btn.selected { border-color:#2aa9ff; box-shadow:0 0 0 1px rgba(42,169,255,.25) inset; }
      .rv-btn:disabled { opacity:.8; cursor:default; }
      .rv-exp { margin-top:10px; font-size:13px; color:#a7b0c0; border-top:1px dashed #2a2f3a; padding-top:10px; }
      .rv-ctr { display:flex; gap:8px; justify-content:flex-end; margin-top:10px; flex-wrap:wrap; }
      .rv-nav { padding:8px 12px; border:none; border-radius:10px; background:#2aa9ff; color:#071018; font-weight:600; cursor:pointer; }
      .rv-tag { font-size:11px; color:#a7b0c0; margin-top:4px; }
      .rv-why { background:transparent; border:none; color:#a7b0c0; text-decoration:underline; cursor:pointer; padding:0; margin-left:10px; font-size:12px; }
      .rv-hint { font-size:12px; color:#ffb347; margin-top:6px; }
      .rv-img-wrap { margin:10px 0; }
      .rv-img-wrap img { max-width:100%; border-radius:12px; border:1px solid #2a2f3a; display:block; }
      .rv-score { margin-top:12px; padding:10px 12px; border-radius:10px; background:#111520; border:1px solid #2a2f3a; font-size:13px; color:#e6e9ef; }
    `;
    const s = document.createElement("style");
    s.id = STYLE_ID; s.textContent = css;
    document.head.appendChild(s);
  }

  function $(id){ return document.getElementById(id); }
  function el(tag, attrs={}, children=[]){
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach(c=>{
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else if (c) n.appendChild(c);
    });
    return n;
  }

  // Letter grade mapping
  function gradeFromPercent(pct){
    if (pct >= 97) return "A+";
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 60) return "D";
    return "F";
  }

  function renderOne(mount, item, idx, total, onNav, state, updateScore){
    mount.innerHTML = "";

    const optionsArr = Array.isArray(item.options) ? item.options : [];
    const correctIdxs = Array.isArray(item.correctIndexes) ? item.correctIndexes : [];
    let correctLetters = [];

    // Derive correct letters either from correctIndexes or answer string
    if (correctIdxs.length && optionsArr.length) {
      correctLetters = correctIdxs
        .map(i => {
          const opt = optionsArr[i];
          if (!opt) return null;
          return String(opt.id || ["A","B","C","D"][i] || "").trim().toUpperCase();
        })
        .filter(Boolean);
    } else if (typeof item.answer === "string" && item.answer.trim()) {
      correctLetters = item.answer
        .split(",")
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
    }
    if (!correctLetters.length && optionsArr.length) {
      // Fallback: first option
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

    let tagText = `Question ${idx+1} of ${total} • Source: ${item.cite || "source"}`;
    if (isMulti) {
      tagText += ` • Multi-select: choose ${expectedSelections}`;
    }
    const tag = el("div", { class:"rv-tag", text: tagText });

    const optsWrap = el("div", { class:"rv-opt" });

    let answered = false;
    const exp = el("div", { class:"rv-exp" });
    exp.style.display = "none";
    let expShown = false;

    const whyBtn = el("button", { class:"rv-why", text:"Why?" });
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

    function toggleSelection(letter, btnEl){
      const idx = selectedLetters.indexOf(letter);
      if (idx >= 0) {
        selectedLetters.splice(idx, 1);
        btnEl.classList.remove("selected");
      } else {
        selectedLetters.push(letter);
        btnEl.classList.add("selected");
      }
    }

    // Build options
    (item.options || []).forEach(opt=>{
      const letter = String(opt.id || "").trim().toUpperCase();
      const b = el("button", { class:"rv-btn" });
      b.setAttribute("data-letter", letter);
      b.innerHTML = `<strong>${letter}.</strong> ${opt.text || ""}`;

      if (isMulti) {
        // Multi-select: toggle selections, grade on "Check answer"
        b.onclick = () => {
          if (answered) return;
          toggleSelection(letter, b);
        };
      } else {
        // Single-choice: grade immediately
        b.onclick = () => {
          if (answered) return;
          answered = true;
          const chosenLetter = letter;
          const isChosenCorrect = correctSet.has(chosenLetter);

          // Mark correct answer(s) green; only the chosen wrong option red
          [...optsWrap.querySelectorAll(".rv-btn")].forEach(btn => {
            const l = String(btn.getAttribute("data-letter") || "").toUpperCase();

            if (correctSet.has(l)) {
              btn.classList.add("correct");
            }
            if (!correctSet.has(l) && l === chosenLetter) {
              btn.classList.add("incorrect");
            }

            btn.disabled = true;
          });

          // 🔹 Update score state
          if (state && state.results) {
            state.results[idx] = { answered: true, correct: isChosenCorrect };
            updateScore && updateScore();
          }

          if (!isChosenCorrect) {
            exp.textContent = item.explanation || "No explanation provided.";
            exp.style.display = "block";
            expShown = true;
          } else {
            exp.textContent = "Correct!";
            exp.style.display = "block";
            exp.appendChild(whyBtn);
          }
        };
      }

      optsWrap.appendChild(b);
    });

    const ctrls = el("div", { class:"rv-ctr" });
    let checkBtn = null;

    // Multi-select grading button
    if (isMulti) {
      checkBtn = el("button", { class:"rv-nav", text:"Check answer" });
      checkBtn.onclick = () => {
        if (answered) return;

        if (!selectedLetters.length) {
          exp.textContent = `Select at least one option (expected ~${expectedSelections}).`;
          exp.style.display = "block";
          expShown = true;
          return;
        }

        answered = true;
        const selSet = new Set(selectedLetters);

        const allCorrect =
          correctLetters.length === selectedLetters.length &&
          correctLetters.every(l => selSet.has(l));

        [...optsWrap.querySelectorAll(".rv-btn")].forEach(btn => {
          const l = String(btn.getAttribute("data-letter") || "").toUpperCase();

          // Clear blue selection so red/green is obvious
          btn.classList.remove("selected");

          // Show all correct answers in green
          if (correctSet.has(l)) {
            btn.classList.add("correct");
          }

          // Only your chosen wrong answers in red
          if (!correctSet.has(l) && selSet.has(l)) {
            btn.classList.add("incorrect");
          }

          btn.disabled = true;
        });

        // 🔹 Update score state
        if (state && state.results) {
          state.results[idx] = { answered: true, correct: allCorrect };
          updateScore && updateScore();
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
      };
      ctrls.appendChild(checkBtn);
    }

    const backBtn = el("button", { class:"rv-nav", text:"Back" });
    const nextBtn = el("button", { class:"rv-nav", text:"Next" });

    backBtn.onclick = () => onNav(idx-1);
    nextBtn.onclick = () => onNav(idx+1);

    ctrls.appendChild(backBtn);
    ctrls.appendChild(nextBtn);

    // Assemble card
    box.appendChild(title);

    // 🔹 Exhibit image block (for questions with diagrams)
    if (item.imageRef) {
      const imgWrap = el("div", { class: "rv-img-wrap" });
      const img = el("img", {
        src: item.imageRef,
        alt: "Exhibit",
      });
      imgWrap.appendChild(img);
      box.appendChild(imgWrap);
    }

    box.appendChild(tag);
    box.appendChild(optsWrap);
    box.appendChild(exp);
    box.appendChild(ctrls);
    mount.appendChild(box);
  }

  // Exposed renderer
  window.renderQuiz = function(items){
    const mount = $("qList") || (function(){
      const div = el("div"); div.id = "qList";
      document.body.appendChild(div);
      return div;
    })();

    if (!Array.isArray(items) || items.length === 0){
      mount.textContent = "(No items)";
      return;
    }

    // 🔹 Score state for this 25-question run
    const state = {
      results: new Array(items.length).fill(null)
    };

    // 🔹 Score box
    let scoreBox = document.getElementById("rv-score");
    if (!scoreBox) {
      scoreBox = el("div", { id: "rv-score", class: "rv-score" });
      if (mount.parentNode) {
        mount.parentNode.insertBefore(scoreBox, mount.nextSibling);
      } else {
        document.body.appendChild(scoreBox);
      }
    }

    function updateScore(){
      const total = items.length;
      let answered = 0;
      let correct = 0;

      for (const r of state.results) {
        if (r && r.answered) {
          answered++;
          if (r.correct) correct++;
        }
      }

      if (answered === 0) {
        scoreBox.textContent = `No questions answered yet.`;
        return;
      }

      if (answered < total) {
        const pctAnswered = Math.round((correct / answered) * 100);
        scoreBox.textContent =
          `Progress: ${answered} / ${total} answered • Current score: ${correct} / ${answered} (${pctAnswered}%).`;
      } else {
        const pct = Math.round((correct / total) * 100);
        const grade = gradeFromPercent(pct);
        scoreBox.textContent =
          `Final score: ${correct} / ${total} (${pct}%) — Grade: ${grade}`;
      }
    }

    let i = 0;
    const nav = (next) => {
      if (next < 0) next = 0;
      if (next > items.length - 1) next = items.length - 1;
      i = next;
      renderOne(mount, items[i], i, items.length, nav, state, updateScore);
      const sb = $("summaryBlock");
      if (sb) {
        const key = items.map(it => `${it.id || "Q"}: ${it.answer}`).join(", ");
        sb.innerHTML = `<span class="muted">Answer key hidden. Click/check each question to reveal feedback. (Key: ${key})</span>`;
      }
    };
    nav(0);
  };
})();
