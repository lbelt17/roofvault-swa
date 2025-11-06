// gen-exam.js — safe wiring, auto-create UI, global trigger (__genExam)
(function(){
  function $(id){ return document.getElementById(id); }
  const statusEl = $("status");
  const diagEl = $("diag");

  function setStatus(t){ if(statusEl) statusEl.textContent = t || "Ready"; }
  function showDiag(o){
    if (!diagEl) return;
    try { diagEl.textContent = typeof o === "string" ? o : JSON.stringify(o,null,2); }
    catch { diagEl.textContent = String(o); }
  }

  // ensure required UI exists (never returns nulls)
  function ensureUI(){
    let qList = $("qList");
    if (!qList){
      qList = document.createElement("div");
      qList.id = "qList";
      qList.style.minHeight = "240px";
      qList.style.border = "1px solid #2a2f3a";
      qList.style.borderRadius = "12px";
      qList.style.padding = "14px";
      qList.style.background = "#0c0f14";
      const bm = $("bookMount");
      if (bm && bm.parentNode) bm.parentNode.appendChild(qList);
      else document.body.appendChild(qList);
    }
    let btn = $("btnGenExam50ByBook");
    if (!btn){
      const holder = document.createElement("div");
      holder.style.margin = "10px 0";
      btn = document.createElement("button");
      btn.id = "btnGenExam50ByBook";
      btn.textContent = "Generate 50";
      btn.style.padding = "10px 14px";
      btn.style.borderRadius = "8px";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.background = "linear-gradient(180deg,#2aa9ff,#0ec0ff)";
      btn.style.color = "#071018";
      btn.style.fontWeight = "700";
      holder.appendChild(btn);
      const bm = $("bookMount");
      if (bm && bm.parentNode) bm.parentNode.insertBefore(holder, qList.nextSibling);
      else document.body.insertBefore(holder, document.body.firstChild);
    }
    return { qList, btn };
  }

  async function safeFetch(url, opts={}, timeoutMs=45000, retries=1){
    const ctrl = new AbortController();
    const t = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(t);
      return res;
    }catch(e){
      clearTimeout(t);
      if (retries > 0){
        await new Promise(r=>setTimeout(r, 800));
        return safeFetch(url, opts, timeoutMs, retries-1);
      }
      throw e;
    }
  }

  async function genExam(){
    const { qList } = ensureUI();
    if (!window.getSelectedBook){
      showDiag("Book selector not ready."); setStatus("Error"); return;
    }
    const pick = window.getSelectedBook();
    if (!pick){ showDiag("No book selected"); setStatus("Error"); return; }

    try{
      const btn = $("btnGenExam50ByBook");
      if (btn){ btn.disabled = true; btn.classList.add("busy"); }
      setStatus("Generating exam…");
      qList.classList.add("mono");
      qList.textContent = "⏳ contacting /api/exam …";

      const res = await safeFetch("/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ book: pick.value, filterField: pick.field, count: 50 })
      }, 45000, 1);

      const txt = await res.text();
      let data; try { data = JSON.parse(txt); } catch { data = { error: txt }; }

      if (!res.ok){
        showDiag({ status: res.status, body: data });
        qList.textContent = data?.error || `HTTP ${res.status}`;
        setStatus("Error");
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0){
        showDiag({ status: res.status, body: data, hint: "API responded but no items[] returned" });
        qList.textContent = "(No items returned)";
        setStatus("Error");
        return;
      }

      if (typeof window.renderQuiz === "function"){
        qList.classList.remove("mono"); qList.textContent = "";
        window.renderQuiz(items);
      } else {
        qList.classList.add("mono");
        qList.textContent = JSON.stringify(items, null, 2);
      }
      setStatus(`HTTP ${res.status}`);
    }catch(e){
      const msg = (e && e.name === "AbortError") ? "timeout" : (e?.message || String(e));
      showDiag({ error: msg, hint: "Request aborted or network error" });
      const { qList } = ensureUI();
      qList.textContent = `{ "error": "${msg}" }`;
      setStatus("Error");
    }finally{
      const btn = $("btnGenExam50ByBook");
      if (btn){ btn.disabled = false; btn.classList.remove("busy"); }
      setTimeout(()=>setStatus("Ready"), 900);
    }
  }

  // expose a manual trigger so Console can call it if wiring is delayed
  window.__genExam = genExam;

  // safe wiring: wait until DOM + ensureUI yields a button, else retry
  function wire(attempt=0){
    const maxAttempts = 25; // ~5s with 200ms backoff
    const { btn } = ensureUI();
    if (btn){
      try{
        btn.onclick = genExam;
      }catch{}
      return;
    }
    if (attempt < maxAttempts){
      setTimeout(()=>wire(attempt+1), 200);
    }
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ()=>wire());
  } else {
    wire();
  }
})();
