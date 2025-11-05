/* Interactive Exam (Vanilla JS, no build step)
   - Parses your "## Exam Output" text
   - Renders MCQ / True-False / Short Answer
   - Instant feedback + reveal + score
*/
(function () {
  const css = `
  .exam-wrap{max-width:860px;margin:24px auto;padding:0 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0f172a}
  .row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
  .h1{font-size:24px;font-weight:800;letter-spacing:-.01em}
  .btn{border-radius:10px;padding:8px 12px;font-weight:600;font-size:14px;border:1px solid #e5e7eb;background:#fff;cursor:pointer}
  .btn:hover{background:#f8fafc}
  .btn-solid{background:#0f172a;color:#fff;border-color:#0f172a}
  .btn-solid:hover{background:#111827}
  .badge{display:inline-flex;align-items:center;border:1px solid #e5e7eb;border-radius:999px;padding:2px 8px;font-size:12px;background:#fff;color:#334155;margin-right:6px}
  .card{border:1px solid #e5e7eb;border-radius:16px;padding:16px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.03)}
  .card+.card{margin-top:12px}
  .qtitle{font-size:16px;font-weight:700;margin:6px 0 0}
  .choice{display:block;width:100%;text-align:left;border:1px solid #e5e7eb;background:#fff;border-radius:12px;padding:10px 12px;margin-top:8px;cursor:pointer}
  .choice:hover{background:#f8fafc}
  .choice.selected{outline:2px solid #60a5fa;background:#eff6ff}
  .choice.locked.correct{outline:2px solid #34d399;background:#ecfdf5}
  .choice.locked.incorrect.selected{outline:2px solid #f87171;background:#fef2f2}
  .score{display:flex;align-items:center;justify-content:space-between;border:1px solid #e5e7eb;border-radius:16px;padding:10px 12px;background:#fff}
  .bar{height:8px;width:50%;background:#f1f5f9;border-radius:999px;overflow:hidden}
  .fill{height:100%;background:#0f172a}
  .input{width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:10px 12px;font-size:14px}
  .meta{margin-top:10px;font-size:12px;color:#475569}
  pre.small{margin-top:8px;background:#f8fafc;border:1px solid #e5e7eb;padding:8px;border-radius:10px;font-size:12px;overflow:auto}
  `;

  function normalize(s){return (s||"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();}
  function parseCites(line){if(!line)return;const m=line.match(/Cites:\s*(.*)$/i);if(!m)return;return m[1].split(/,|;|\|/).map(s=>s.trim()).filter(Boolean);}
  function parseAnswer(line){const m=line&&line.match(/Answer:\s*(.*)$/i);return m?m[1].trim():"";}
  function parseWhy(line){const m=line&&line.match(/Why:\s*(.*)$/i);return m?m[1].trim():undefined;}

  function parseExam(raw){
    const text=(raw||"").replace(/^##\s*Exam\s*Output\s*/i,"").trim();
    const chunks=text.split(/\n(?=\d+\.\s)/).map(c=>c.trim()).filter(Boolean);
    const out=[];
    for(const chunk of chunks){
      const head=chunk.match(/^(\d+)\.\s*(MCQ|T\/?F|True\/?False|Short\s*Answer)\s*:\s*(.*)$/is);
      if(!head)continue;
      const id=Number(head[1]); const kindRaw=head[2].toUpperCase(); const prompt=head[3].trim();
      const rest=chunk.replace(head[0],"").trim();
      const lines=rest.split(/\n/).map(l=>l.trim()).filter(Boolean);

      let choices=[], ansLine="", whyLine, citesLine;
      const packed=rest.match(/(?:^|\n)\s*(A\.|1\)|\(A\))\s*[^\n]*?(?:\n|\s+)\s*(B\.|2\)|\(B\))\s*[^\n]*?(?:\n|\s+)\s*(C\.|3\)|\(C\))\s*[^\n]*?(?:\n|\s+)\s*(D\.|4\)|\(D\))\s*[^\n]*/is);
      if(packed){
        const pcs=packed[0].replace(/\n/g," ").match(/(?:A\.|B\.|C\.|D\.)\s*[^A-D]+(?=A\.|B\.|C\.|D\.|$)/g);
        if(pcs)choices=pcs.map(s=>s.trim());
      }
      if(choices.length===0){
        for(const l of lines){ if(/^(A\.|B\.|C\.|D\.)\s+/i.test(l)) choices.push(l); }
      }
      for(const l of lines){
        if(/^Answer:/i.test(l)) ansLine=l;
        else if(/^Why:/i.test(l)) whyLine=l;
        else if(/^Cites:/i.test(l)) citesLine=l;
      }

      const explanation=parseWhy(whyLine), cites=parseCites(citesLine);
      if(kindRaw.startsWith("MCQ")){
        const ans=parseAnswer(ansLine); let idx=-1;
        if(/^[A-D]$/i.test(ans)){ idx={A:0,B:1,C:2,D:3}[ans.toUpperCase()] ?? -1; }
        else if(ans){ const norm=normalize(ans); idx=choices.findIndex(c=>normalize(c.replace(/^[A-D]\./i,"").trim())===norm); }
        out.push({id, kind:"MCQ", prompt, choices, correct: Math.max(0,idx), explanation, cites});
      } else if(kindRaw.startsWith("T") || kindRaw.includes("FALSE")){
        const ans=parseAnswer(ansLine); out.push({id, kind:"TF", prompt, correctBool:/^true$/i.test(ans), explanation, cites});
      } else {
        const ans=parseAnswer(ansLine)||""; out.push({id, kind:"SA", prompt, correctText:ans, explanation, cites});
      }
    }
    return out.sort((a,b)=>a.id-b.id);
  }

  function el(tag, attrs={}, ...children){
    const n=document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)){
      if(k==="class") n.className=v;
      else if(k==="style" && typeof v==="object") Object.assign(n.style,v);
      else if(k.startsWith("on") && typeof v==="function") n.addEventListener(k.slice(2).toLowerCase(), v);
      else n.setAttribute(k, v);
    }
    for(const c of children){
      if(c==null) continue;
      n.append(c.nodeType?c:document.createTextNode(String(c)));
    }
    return n;
  }

  function renderExam(container, rawText){
    const questions=parseExam(rawText);
    const state=new Map();

    function score(){
      let ok=0;
      for(const q of questions){
        const s=state.get(q.id)||{};
        if(q.kind==="MCQ" && s.choice===q.correct) ok++;
        if(q.kind==="TF"  && s.tf===q.correctBool) ok++;
        if(q.kind==="SA"  && s.sa && normalize(s.sa)===normalize(q.correctText)) ok++;
      }
      return ok;
    }

    function rerender(){
      container.innerHTML="";
      const header=el("div",{class:"row"},
        el("div",{class:"h1"},"Interactive Exam"),
        el("div",{},
          el("button",{class:"btn", onclick:()=>{state.clear(); rerender();}},"Reset"),
          el("button",{class:"btn btn-solid", style:{marginLeft:"8px"}, onclick:()=>{questions.forEach(q=>{const s=state.get(q.id)||{}; s.revealed=true; state.set(q.id,s);}); rerender();}},"Check All")
        )
      );

      const s=score();
      const total=questions.length, pct= total? Math.round((s/total)*100) : 0;
      const scorebar=el("div",{class:"score"},
        el("div",{},`Score: `, el("strong",{},String(s)), ` / ${total} (${pct}%)`),
        el("div",{class:"bar"}, el("div",{class:"fill", style:{width: `${pct}%`}}))
      );

      container.append(header, scorebar);

      if(questions.length===0){
        container.append(
          el("div",{class:"card"},
            el("div", {style:{fontSize:"14px", color:"#334155"}},
              'Set window.ExamText to your generated block. Expected lines like:',
              el("pre",{class:"small"},`1. MCQ: ...
A. ...
B. ...
C. ...
D. ...
Answer: B
Why: ...
Cites: ...`)
            )
          )
        );
        return;
      }

      for(const q of questions){
        const s=state.get(q.id)||{};
        const lock=!!s.revealed;
        let isCorrect=false;
        if(q.kind==="MCQ") isCorrect = s.choice===q.correct;
        if(q.kind==="TF")  isCorrect = s.tf===q.correctBool;
        if(q.kind==="SA")  isCorrect = s.sa && normalize(s.sa)===normalize(q.correctText);

        const badges = el("div",{},
          el("span",{class:"badge"}, q.kind==="MCQ"?"Multiple Choice":q.kind==="TF"?"True/False":"Short Answer"),
          lock ? el("span",{class:"badge"}, isCorrect?"Correct":"Incorrect") : null
        );

        const title = el("div",{class:"qtitle"}, `${q.id}. ${q.prompt}`);

        const rightButtons = el("div",{style:{whiteSpace:"nowrap"}},
          el("button",{class:"btn", onclick:()=>{state.set(q.id,{}); rerender();}},"Clear"),
          el("button",{class:"btn", style:{marginLeft:"8px"}, onclick:()=>{state.set(q.id,{...(state.get(q.id)||{}), revealed:true}); rerender();}},"Check")
        );

        const head = el("div",{style:{display:"flex", justifyContent:"space-between", gap:"12px"}},
          el("div",{}, badges, title), rightButtons
        );

        const card = el("div",{class:"card"}, head);

        if(q.kind==="MCQ"){
          for(let i=0;i<q.choices.length;i++){
            const c=q.choices[i];
            const letter=(c.match(/^([A-D])\./i)?.[1]||"").toUpperCase();
            const body=c.replace(/^[A-D]\.\s*/i,"").trim();
            const btn=el("button",{
              class:"choice"+(s.choice===i?" selected":"")+(lock?" locked":"")+(lock && i===q.correct?" correct":"")+(lock && s.choice===i && i!==q.correct?" incorrect":""),
              disabled:lock,
              onclick:()=>{state.set(q.id,{...(state.get(q.id)||{}), choice:i}); rerender();}
            },
              el("div",{style:{display:"flex", gap:"10px", alignItems:"flex-start"}},
                el("div",{style:{border:"1px solid #e5e7eb", borderRadius:"8px", width:"24px", height:"24px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", fontSize:"12px"}}, letter),
                el("div",{style:{fontSize:"14px"}}, body)
              )
            );
            card.append(btn);
          }
        } else if(q.kind==="TF"){
          card.append(
            el("div",{style:{display:"flex", gap:"8px", marginTop:"8px"}},
              el("button",{class:"btn"+(s.tf===true && !lock?" btn-solid":""), disabled:lock, onclick:()=>{state.set(q.id,{...(state.get(q.id)||{}), tf:true}); rerender();}}, "True"),
              el("button",{class:"btn"+(s.tf ===false&& !lock?" btn-solid":""), disabled:lock, onclick:()=>{state.set(q.id,{...(state.get(q.id)||{}), tf:false}); rerender();}}, "False"),
            )
          );
        } else {
          const input=el("input",{class:"input", type:"text", placeholder:"Type your answer", disabled:lock, value:s.sa||""});
          input.addEventListener("input",(e)=>{state.set(q.id,{...(state.get(q.id)||{}), sa: e.target.value});});
          const check=el("button",{class:"btn", onclick:()=>{state.set(q.id,{...(state.get(q.id)||{}), revealed:true}); rerender();}}, "Check");
          card.append(el("div",{style:{display:"flex", gap:"8px", marginTop:"8px"}}, input, check));
        }

        if(lock){
          card.append(el("div",{style:{marginTop:"8px", color: isCorrect ? "#059669" : "#dc2626", fontWeight:"600"}},
            isCorrect ? "✅ Correct!" : "❌ Not quite."
          ));
          const ansText = q.kind==="MCQ" ? q.choices[q.correct].replace(/^([A-D]\.)\s*/,"") : q.kind==="TF" ? (q.correctBool?"True":"False") : q.correctText;
          const ans = el("div",{style:{marginTop:"8px", fontSize:"14px"}}, el("div",{}, el("strong",{},"Answer:")," ", ansText));
          if(q.explanation) ans.append(el("div",{style:{marginTop:"6px"}}, el("strong",{},"Why:")," ", q.explanation));
          card.append(ans);
          if(q.cites && q.cites.length) card.append(el("div",{class:"meta"}, el("strong",{},"Cites:")," ", q.cites.join(", ")));
        } else {
          card.append(el("div",{style:{marginTop:"8px"}}, el("button",{class:"btn", onclick:()=>{state.set(q.id,{...(state.get(q.id)||{}), revealed:true}); rerender();}}, "Reveal answer")));
        }

        container.append(card);
      }
    }

    const mount = document.getElementById("interactive-exam");
    if(!mount) return;
    const style=document.createElement("style"); style.textContent=css; document.head.appendChild(style);

    function readText(){ return (window as any).ExamText || ""; }

    const wrapper=el("div",{class:"exam-wrap", id:"exam-root"});
    mount.appendChild(wrapper);

    function kick(){ wrapper.innerHTML=""; renderExam(wrapper, readText()); }
    kick();

    // Expose a small helper to rerender after you set window.ExamText
    (window as any).renderInteractiveExam = kick;
  })();
