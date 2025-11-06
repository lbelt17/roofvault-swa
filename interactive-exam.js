/* interactive-exam.js (null-safe, delegated events)
   Renders AOAI items[] interactively inside #qList and never touches null elements.
*/
(function(){
  function $(id){ return document.getElementById(id); }
  const mount = $("qList");

  // minimal styles
  const style = document.createElement("style");
  style.textContent = `
  .rvx-card{background:#0c0f14;border:1px solid #2a2f3a;border-radius:12px;padding:16px}
  .rvx-h{margin:0 0 10px 0;font-size:16px}
  .rvx-opt{display:flex;flex-direction:column;gap:8px;margin:12px 0}
  .rvx-btn{background:#0f131a;border:1px solid #2a2f3a;color:#e6e9ef;border-radius:8px;padding:10px;text-align:left;cursor:pointer}
  .rvx-btn:hover{filter:brightness(1.08)}
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

    // single delegated click handler (no direct getElementById)
    host.addEventListener("click", (e)=>{
      const btn = e.target.closest("button");
      if (!btn) return;
      const act = btn.getAttribute("data-act");
      if (act === "opt"){
        const q = items[idx];
        if (!q) return;
        if (answers[q.id]) return; // already answered
        const pick = btn.getAttribute("data-id");
        answers[q.id] = pick;
        if (pick === q.answer) score++;
        drawQuestion(); // re-render to show correctness colors
      } else if (act === "prev"){
        if (idx > 0){ idx--; drawQuestion(); }
      } else if (act === "next"){
        if (idx < total-1){ idx++; drawQuestion(); }
        else { drawSummary(); }
      } else if (act === "restart"){
        idx = 0; score = 0;
        for (const k in answers) delete answers[k];
        drawQuestion();
      } else if (act === "toggle-key"){
        const key = host.querySelector("#rvxKey");
        if (!key) return;
        const showing = key.style.display !== "none";
        key.style.display = showing ? "none" : "block";
        btn.textContent = showing ? "Show Answer Key" : "Hide Answer Key";
        if (!showing && !key.textContent){
          const lines = items.map((q,i)=>`Q${i+1}: ${q.answer}  —  ${q.cite||"N/A"}`);
          key.textContent = lines.join("\n");
        }
      }
    });

    function drawSummary(){
      host.innerHTML = `
        <h3 class="rvx-h">🎯 Exam complete</h3>
        <div class="rvx-row">
          <span class="rvx-pill rvx-good">Score: ${Object.keys(answers).filter(qid=>{
            const q = items.find(x=>x.id===qid);
            return q && answers[qid]===q.answer;
          }).length}/${total}</span>
          <button class="rvx-cta" data-act="restart">Restart</button>
          <button class="rvx-ghost" data-act="toggle-key">Show Answer Key</button>
        </div>
        <pre id="rvxKey" class="rvx-key" style="display:none;margin-top:12px"></pre>
      `;
    }

    function drawQuestion(){
      const q = items[idx];
      if(!q){ drawSummary(); return; }

      const chosen = answers[q.id];
      host.innerHTML = `
        <div>
          <div class="rvx-row" style="justify-content:space-between">
            <span class="rvx-pill">Question ${idx+1} of ${total}</span>
            <span class="rvx-pill">Score ${score}</span>
          </div>
          <h3 class="rvx-h">${q.question}</h3>
          <div class="rvx-opt">
            ${q.options.map(o=>{
              const isCorrect = o.id===q.answer;
              const picked = chosen===o.id;
              let cls = "rvx-btn";
              if (chosen){
                if (picked && isCorrect) cls += " rvx-good";
                else if (picked) cls += " rvx-bad";
                else if (isCorrect) cls += " rvx-good";
              }
              return `<button class="${cls}" data-act="opt" data-id="${o.id}">${o.id}. ${o.text}</button>`;
            }).join("")}
          </div>
          <div class="rvx-row">
            <button class="rvx-ghost" data-act="prev">Back</button>
            <button class="rvx-cta" data-act="next">${idx===total-1 ? "Finish" : "Next"}</button>
          </div>
          <div class="rvx-meta">📘 Source: ${q.cite || "N/A"}</div>
        </div>
      `;
    }

    drawQuestion();
  }

  // expose
  window.renderQuiz = render;
})();
