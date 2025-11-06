(function(){
  // Minimal styles injected once for feedback/explanations
  const STYLE_ID = "rv-exam-inline-style";
  if (!document.getElementById(STYLE_ID)) {
    const css = `
      .rv-q { border:1px solid #2a2f3a; border-radius:12px; padding:14px; margin:10px 0; background:#0c0f14; }
      .rv-q h3 { margin:0 0 10px 0; font-size:16px; line-height:1.35; }
      .rv-opt { display:flex; flex-direction:column; gap:8px; margin:10px 0; }
      .rv-btn { text-align:left; padding:10px 12px; border:1px solid #2a2f3a; background:#0f131a; color:#e6e9ef; border-radius:10px; cursor:pointer; }
      .rv-btn.correct { border-color:#20e3b2; box-shadow:0 0 0 1px rgba(32,227,178,.25) inset; }
      .rv-btn.incorrect { border-color:#ff5a5a; box-shadow:0 0 0 1px rgba(255,90,90,.25) inset; }
      .rv-btn:disabled { opacity:.8; cursor:default; }
      .rv-exp { margin-top:10px; font-size:13px; color:#a7b0c0; border-top:1px dashed #2a2f3a; padding-top:10px; }
      .rv-ctr { display:flex; gap:8px; justify-content:flex-end; margin-top:10px; }
      .rv-nav { padding:8px 12px; border:none; border-radius:10px; background:#2aa9ff; color:#071018; font-weight:600; cursor:pointer; }
      .rv-tag { font-size:11px; color:#a7b0c0; }
      .rv-why { background:transparent; border:none; color:#a7b0c0; text-decoration:underline; cursor:pointer; padding:0; margin-left:10px; font-size:12px; }
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

  function renderOne(mount, item, idx, total, onNav){
    mount.innerHTML = "";
    const box = el("div", { class: "rv-q" });
    const title = el("h3", { text: item.question || "(no question)" });
    const tag = el("div", { class:"rv-tag", text:`Question ${idx+1} of ${total} • Source: ${item.cite || "source"}` });

    const optsWrap = el("div", { class:"rv-opt" });

    let answered = false;
    const exp = el("div", { class:"rv-exp" });
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

    (item.options || []).forEach(opt=>{
      const b = el("button", { class:"rv-btn" });
      b.innerHTML = `<strong>${opt.id}.</strong> ${opt.text}`;
      b.onclick = () => {
        if (answered) return;
        answered = true;
        const correct = String(opt.id).trim().toUpperCase() === String(item.answer).trim().toUpperCase();

        // mark all buttons & lock
        [...optsWrap.querySelectorAll(".rv-btn")].forEach(btn=>{
          const isAns = String(btn.textContent.trim().charAt(0)).toUpperCase() === String(item.answer).trim().toUpperCase();
          if (isAns) btn.classList.add("correct"); else btn.classList.add("incorrect");
          btn.disabled = true;
        });

        // explanation behavior
        if (!correct) {
          exp.textContent = item.explanation || "No explanation provided.";
          exp.style.display = "block";
          expShown = true;
        } else {
          // show a subtle success + allow optional "Why?"
          exp.textContent = "Correct!";
          exp.style.display = "block";
          exp.appendChild(whyBtn);
        }
      };
      optsWrap.appendChild(b);
    });

    exp.style.display = "none";

    const ctrls = el("div", { class:"rv-ctr" }, [
      el("button", { class:"rv-nav", text:"Back", id:"rv-back" }),
      el("button", { class:"rv-nav", text:"Next", id:"rv-next" })
    ]);

    ctrls.querySelector("#rv-back").onclick = () => onNav(idx-1);
    ctrls.querySelector("#rv-next").onclick = () => onNav(idx+1);

    box.appendChild(title);
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
    let i = 0;
    const nav = (next) => {
      if (next < 0) next = 0;
      if (next > items.length - 1) next = items.length - 1;
      i = next;
      renderOne(mount, items[i], i, items.length, nav);
      const sb = $("summaryBlock");
      if (sb) {
        const key = items.map(it => `${it.id || "Q"}: ${it.answer}`).join(", ");
        sb.innerHTML = `<span class="muted">Answer key hidden. Click any question to reveal feedback. (Key: ${key})</span>`;
      }
    };
    nav(0);
  };
})();
