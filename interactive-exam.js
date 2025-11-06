/* interactive-exam.js
   Renders AOAI items[] interactively inside #qList
   Uses existing DOM IDs: #qList, #summaryBlock (optional)
*/
(function(){
  function $(id){ return document.getElementById(id); }
  const mount = $("qList");

  // Tiny CSS so it looks decent without touching your HTML/CSS files
  const style = document.createElement("style");
  style.textContent = `
  .rvx-card{background:#0c0f14;border:1px solid #2a2f3a;border-radius:12px;padding:16px}
  .rvx-h{margin:0 0 10px 0;font-size:16px}
  .rvx-opt{display:flex;flex-direction:column;gap:8px;margin:12px 0}
  .rvx-opt button{background:#0f131a;border:1px solid #2a2f3a;color:#e6e9ef;border-radius:8px;padding:10px;text-align:left;cursor:pointer}
  .rvx-opt button:hover{filter:brightness(1.08)}
  .rvx-row{display:flex;gap:10px;align-items:center;margin-top:12px;flex-wrap:wrap}
  .rvx-pill{border:1px solid #2a2f3a;border-radius:999px;padding:6px 10px;font-size:12px;color:#a7b0c0}
  .rvx-good{border-color:#20e3b2;color:#20e3b2}
  .rvx-bad{border-color:#ff6b6b;color:#ff6b6b}
  .rvx-cta{background:linear-gradient(180deg,#2aa9ff,#0ec0ff);color:#071018;border:none;border-radius:8px;padding:10px 14px;cursor:pointer;font-weight:700}
  .rvx-ghost{background:#0f131a;border:1px solid #2a2f3a;color:#e6e9ef;border-radius:8px;padding:10px 14px;cursor:pointer}
  .rvx-meta{font-size:12px;color:#a7b0c0;margin-top:8px}
  .rvx-key{white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:12px;color:#a7b0c0}
  `;
  document.head.appendChild(style);

  function render(items){
    if(!mount){ console.warn("qList mount not found"); return; }
    if(!Array.isArray(items) || items.length===0){
      mount.classList.add("mono");
      mount.textContent = "(No questions to render)";
      return;
    }

    // state
    let idx = 0;
    let score = 0;
    const total = items.length;
    const answers = {}; // qid -> picked

    const host = document.createElement("div");
    host.className = "rvx-card";
    mount.innerHTML = "";
    mount.classList.remove("mono");
    mount.appendChild(host);

    function renderSummary(){
      const correctCount = Object.keys(answers).filter(qid=>{
        const q = items.find(x=>x.id===qid);
        return q && answers[qid]===q.answer;
      }).length;

      host.innerHTML = `
        <h3 class="rvx-h">🎯 Exam complete</h3>
        <div class="rvx-row">
          <span class="rvx-pill rvx-good">Score: ${correctCount}/${total}</span>
          <button id="rvxRestart" class="rvx-cta">Restart</button>
          <button id="rvxShowKey" class="rvx-ghost">Show Answer Key</button>
        </div>
        <div id="rvxKey" class="rvx-key" style="display:none;margin-top:12px"></div>
      `;
      $("#rvxRestart").onclick = ()=> render(items);
      $("#rvxShowKey").onclick = ()=>{
        const k = $("#rvxKey");
        if(!k) return;
        if (k.style.display==="none"){
          const lines = items.map((q,i)=>`Q${i+1}: ${q.answer}  —  ${q.cite||"N/A"}`);
          k.textContent = lines.join("\n");
          k.style.display="block";
          $("#rvxShowKey").textContent = "Hide Answer Key";
        } else {
          k.style.display="none";
          $("#rvxShowKey").textContent = "Show Answer Key";
        }
      };
    }

    function renderQ(){
      const q = items[idx];
      if(!q){ renderSummary(); return; }

      host.innerHTML = `
        <div>
          <div class="rvx-row" style="justify-content:space-between">
            <span class="rvx-pill">Question ${idx+1} of ${total}</span>
            <span class="rvx-pill">Score ${score}</span>
          </div>
          <h3 class="rvx-h">${q.question}</h3>
          <div class="rvx-opt">
            ${q.options.map(o=>{
              const chosen = answers[q.id];
              const isCorrect = o.id===q.answer;
              const picked = chosen===o.id;
              let cls = "";
              if (chosen){
                if (picked && isCorrect) cls = "rvx-good";
                else if (picked) cls = "rvx-bad";
                else if (isCorrect) cls = "rvx-good";
              }
              return `<button class="${cls}" data-id="${o.id}">${o.id}. ${o.text}</button>`;
            }).join("")}
          </div>
          <div class="rvx-row">
            <button id="rvxPrev" class="rvx-ghost">Back</button>
            <button id="rvxNext" class="rvx-cta">${idx===total-1 ? "Finish" : "Next"}</button>
          </div>
          <div class="rvx-meta">📘 Source: ${q.cite || "N/A"}</div>
        </div>
      `;

      // wire options
      host.querySelectorAll(".rvx-opt button").forEach(btn=>{
        btn.onclick = ()=>{
          if (answers[q.id]) return; // lock after first pick
          const pick = btn.getAttribute("data-id");
          answers[q.id] = pick;
          if (pick===q.answer) score++;
          renderQ(); // re-render to show colors
        };
      });

      $("#rvxPrev").onclick = ()=>{
        if (idx>0){ idx--; renderQ(); }
      };
      $("#rvxNext").onclick = ()=>{
        if (idx<total-1){ idx++; renderQ(); }
        else { renderSummary(); }
      };
    }

    renderQ();
  }

  // Expose to existing generate code
  window.renderQuiz = render;
})();
