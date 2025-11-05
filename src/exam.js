(function(){
  // ---------- tiny helpers ----------
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s ?? "").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m])); }
  function setStatus(t){ const s=$("status"); if(s) s.textContent=t; }
  function pill(txt, href){
    const span = document.createElement(href ? "a" : "span");
    span.className = "pill";
    span.textContent = txt;
    if (href) { span.href = href; span.target="_blank"; span.rel="noopener noreferrer"; }
    return span;
  }

  // ---------- state ----------
  let lastQuiz = [];       // [{question, choices:{A..D}, answer, rationale, citations:[]}]
  let answered = new Set(); // indices answered
  let correct = 0;

  // ---------- render ----------
  function renderQuiz(items){
    lastQuiz = Array.isArray(items) ? items : [];
    answered.clear();
    correct = 0;

    const qList = $("qList");
    if (!qList){ return; }
    if (!lastQuiz.length){
      qList.innerHTML = '<span class="muted">No questions returned. Try another book.</span>';
      return;
    }

    // Header / controls
    const header = document.createElement("div");
    header.className = "row";
    header.style.marginBottom = "8px";

    const scoreEl = document.createElement("span");
    scoreEl.id = "scoreEl";
    scoreEl.className = "chip";
    scoreEl.textContent = `Score: 0 / ${lastQuiz.length}`;
    header.appendChild(scoreEl);

    const keyBtn = document.createElement("button");
    keyBtn.className = "copy";
    keyBtn.textContent = "Show Answer Key";
    keyBtn.onclick = toggleKey;
    header.appendChild(keyBtn);

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy";
    copyBtn.textContent = "Copy as CSV";
    copyBtn.onclick = copyCSV;
    header.appendChild(copyBtn);

    qList.innerHTML = "";
    qList.classList.remove("mono"); // show nice UI instead of plain text
    qList.appendChild(header);

    // Questions
    lastQuiz.forEach((it, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "q";
      wrap.dataset.idx = idx;

      const stemRow = document.createElement("div");
      stemRow.className = "row";
      const stem = document.createElement("div");
      stem.className = "stem";
      stem.innerHTML = `Q${idx+1}. ${esc(it.question||"")}`;
      stemRow.appendChild(stem);

      const revealBtn = document.createElement("button");
      revealBtn.className = "copy right";
      revealBtn.textContent = "Reveal Answer";
      revealBtn.onclick = () => showAnswer(idx, wrap);
      stemRow.appendChild(revealBtn);

      wrap.appendChild(stemRow);

      const choices = document.createElement("div");
      choices.className = "choices";

      ["A","B","C","D"].forEach(letter => {
        const val = (it.choices||{})[letter] ?? "";
        const box = document.createElement("button");
        box.type = "button";
        box.className = "choice";
        box.style.textAlign = "left";
        box.innerHTML = `<b>${letter}.</b> ${esc(val)}`;
        box.onclick = () => grade(idx, letter, box, wrap);
        choices.appendChild(box);
      });

      wrap.appendChild(choices);

      const rationale = document.createElement("div");
      rationale.className = "muted";
      rationale.style.marginTop = "6px";
      rationale.id = `rat-${idx}`;
      rationale.textContent = ""; // hidden until answered
      wrap.appendChild(rationale);

      const citeRow = document.createElement("div");
      citeRow.className = "row";
      citeRow.style.marginTop = "6px";
      citeRow.id = `cite-${idx}`;
      wrap.appendChild(citeRow);

      qList.appendChild(wrap);
    });
  }

  function grade(idx, pick, btn, wrap){
    if (answered.has(idx)) return; // first click counts
    answered.add(idx);

    const it = lastQuiz[idx] || {};
    const correctLetter = it.answer;
    const all = wrap.querySelectorAll(".choice");

    all.forEach(el=>{
      const isCorrect = el.textContent.trim().startsWith(correctLetter + ".");
      if (isCorrect) el.classList.add("answer");
      el.disabled = true;
    });

    const isRight = (pick === correctLetter);
    if (isRight) {
      correct++;
    } else {
      btn.classList.add("bad");
    }

    updateScore();

    // Show rationale
    const rat = document.getElementById(`rat-${idx}`);
    if (rat){
      rat.innerHTML = (isRight ? '<span class="answer">Correct.</span> ' : '<span class="bad">Incorrect.</span> ')
        + esc(it.rationale || "No rationale provided.");
    }

    // Show citations as chips
    const cite = document.getElementById(`cite-${idx}`);
    if (cite){
      cite.innerHTML = "";
      const cites = Array.isArray(it.citations) ? it.citations : [];
      if (!cites.length) {
        const m = document.createElement("span");
        m.className = "muted";
        m.textContent = "No citations.";
        cite.appendChild(m);
      } else {
        cites.slice(0,3).forEach(c=>{
          const title = [c.title, c.page ? `p.${c.page}` : null].filter(Boolean).join(" · ");
          cite.appendChild(pill(title || "Source", c.url || null));
        });
      }
    }
  }

  function showAnswer(idx, wrap){
    if (answered.has(idx)) return; // grading already reveals
    const it = lastQuiz[idx] || {};
    const correctLetter = it.answer;

    const all = wrap.querySelectorAll(".choice");
    all.forEach(el=>{
      const isCorrect = el.textContent.trim().startsWith(correctLetter + ".");
      if (isCorrect) el.classList.add("answer");
      el.disabled = true;
    });
    answered.add(idx);

    // Show rationale anyway
    const rat = document.getElementById(`rat-${idx}`);
    if (rat){
      rat.innerHTML = '<span class="muted">Revealed.</span> ' + esc(it.rationale || "No rationale provided.");
    }

    // Citations
    const cite = document.getElementById(`cite-${idx}`);
    if (cite){
      cite.innerHTML = "";
      const cites = Array.isArray(it.citations) ? it.citations : [];
      if (!cites.length) {
        const m = document.createElement("span");
        m.className = "muted";
        m.textContent = "No citations.";
        cite.appendChild(m);
      } else {
        cites.slice(0,3).forEach(c=>{
          const title = [c.title, c.page ? `p.${c.page}` : null].filter(Boolean).join(" · ");
          cite.appendChild(pill(title || "Source", c.url || null));
        });
      }
    }

    updateScore(); // score unchanged, but keeps display consistent
  }

  function updateScore(){
    const el = $("scoreEl");
    if (el) el.textContent = `Score: ${correct} / ${lastQuiz.length}`;
  }

  function toggleKey(){
    // Build a quick key overlay in the Summary panel
    const block = $("summaryBlock");
    if (!block) return;

    const existing = document.getElementById("answerKey");
    if (existing){ existing.remove(); return; }

    const key = document.createElement("div");
    key.id = "answerKey";
    key.className = "mono";
    key.style.whiteSpace = "pre-wrap";
    key.style.marginTop = "8px";

    const lines = lastQuiz.map((it, i)=>`Q${i+1}: ${it.answer || "?"}`);
    key.textContent = "Answer Key\n" + lines.join("\n");
    block.appendChild(key);
  }

  function copyCSV(){
    // Question, A, B, C, D, Correct, Rationale, CitationTitle1
    const rows = [["Question","A","B","C","D","Correct","Rationale","Citation1"]];
    lastQuiz.forEach(it=>{
      const c1 = (Array.isArray(it.citations) && it.citations[0]) ? (it.citations[0].title || "") : "";
      rows.push([
        it.question || "",
        (it.choices?.A)||"",
        (it.choices?.B)||"",
        (it.choices?.C)||"",
        (it.choices?.D)||"",
        it.answer || "",
        it.rationale || "",
        c1
      ]);
    });
    const csv = rows.map(r => r.map(x=>{
      const s = String(x ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(",")).join("\n");

    navigator.clipboard.writeText(csv);
    setStatus("Copied CSV");
    setTimeout(()=>setStatus("Ready"), 800);
  }

  // ---------- request to /api/exam ----------
  async function genExam(){
    try{
      setStatus("Generating exam…");
      const pick = (window.getSelectedBook && window.getSelectedBook()) || { value:"", field:null };
      const res = await fetch("/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ book: pick.value, filterField: pick.field })
      });
      const data = await res.json();

      if (!res.ok){
        const qList = $("qList");
        if (qList){
          qList.classList.add("mono");
          qList.textContent = (data && data.error) ? data.error : `HTTP ${res.status}`;
        }
        setStatus("Error");
        return;
      }

      // Expecting { items: [...], modelDeployment: "..." }
      if (Array.isArray(data.items)){
        renderQuiz(data.items);
      } else {
        const qList = $("qList");
        if (qList){
          qList.classList.add("mono");
          qList.textContent = "(No items returned)";
        }
      }

      const model = $("model");
      if (model && data && data.modelDeployment) model.textContent = data.modelDeployment;

      setStatus(`HTTP ${res.status}`);
    }catch(e){
      console.error(e);
      setStatus("Error");
    }finally{
      setTimeout(()=>setStatus("Ready"), 800);
    }
  }

  function addButton(){
    const bar = document.querySelector(".toolbar .btnbar");
    if(!bar) return;
    let btn = document.getElementById("btnGenExam50ByBook");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "btnGenExam50ByBook";
      btn.textContent = "Generate Exam (50 by Book)";
      bar.appendChild(btn);
    }
    btn.replaceWith(btn.cloneNode(true)); // remove duplicate handlers
    document.getElementById("btnGenExam50ByBook").addEventListener("click", genExam);
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", addButton);
  } else {
    addButton();
  }
})();
