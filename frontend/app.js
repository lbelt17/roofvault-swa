(function(){
  function $(id){ return document.getElementById(id); }
  const statusEl = $("status");
  const modelEl  = $("model");
  const qList    = $("qList");
  const diagEl   = $("diag");
  const summary  = $("summaryBlock");

  function setStatus(t){ if(statusEl) statusEl.textContent = t || "Ready"; }
  function showDiag(o){
    try { diagEl.textContent = typeof o === "string" ? o : JSON.stringify(o,null,2); }
    catch { diagEl.textContent = String(o); }
  }

  // Timeout-safe fetch (10s default)
  async function fetchWithTimeout(url, options={}, ms=10000){
    const ctrl = new AbortController();
    const id = setTimeout(()=>ctrl.abort(new Error("Request timeout")), ms);
    try{
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      return res;
    } finally { clearTimeout(id); }
  }

  // Fallback sample so UI always renders
  function renderFallback(bookLabel){
    const items = [
`1. MCQ: Sanity question for ${bookLabel||"Document"}. Choose B.
A. A
B. B
C. C
D. D
Answer: B
Why: Pipeline timeout fallback.
Cites: Preview`,
`2. T/F: This should be True.
Answer: True
Why: Pipeline timeout fallback.
Cites: Preview`,
`3. Short Answer: Type TEST.
Answer: TEST
Why: Pipeline timeout fallback.
Cites: Preview`
    ];
    if (summary) summary.innerHTML = '<span class="muted">Answer key hidden. Click "Show Answer Key".</span>';
    window.renderQuiz?.(items);
  }

  // Render function exposed by render-bridge.js
  const renderQuiz = window.renderQuiz || (items=>{
    if (qList){ qList.classList.add("mono"); qList.textContent = JSON.stringify(items,null,2); }
  });

  async function genExam(){
    const btn = $("btnGenExam50ByBook");
    try{
      if(!window.getSelectedBook){
        showDiag("Book selector not ready."); setStatus("Error"); return;
      }
      const pick = window.getSelectedBook();
      if (!pick) { showDiag("No book selected"); setStatus("Error"); return; }

      if (btn){ btn.disabled = true; btn.classList.add("busy"); }
      setStatus("Generating exam…");
      showDiag("Calling /api/exam …");

      // 10s timeout; DO NOT send filterField
      const res = await fetchWithTimeout("/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ book: pick.value })
      }, 10000);

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error:text }; }

      if(!res.ok){
        showDiag({status:res.status, body:data});
        renderFallback(pick.value);
        setStatus("Error");
        return;
      }

      const payload = (Array.isArray(data?.items) || Array.isArray(data?.docs)) ? data : (data?.body || data);
      if (Array.isArray(payload?.items) && payload.items.length){
        if (summary) summary.innerHTML = '<span class="muted">Answer key hidden. Click "Show Answer Key" in the Questions panel.</span>';
        window.renderQuiz?.(payload.items);
        if (modelEl && payload.modelDeployment) modelEl.textContent = payload.modelDeployment;
        setStatus(`HTTP ${res.status}`);
      } else if (Array.isArray(payload?.docs) && payload.docs.length){
        window.renderQuiz?.({ docs: payload.docs }); // bridge makes sample
        if (modelEl && payload.modelDeployment) modelEl.textContent = payload.modelDeployment;
        setStatus(`HTTP ${res.status}`);
      } else {
        renderFallback(pick.value);
        showDiag({status:res.status, body:payload});
        setStatus("Error");
      }
    }catch(e){
      console.error(e);
      showDiag(e?.message || String(e));
      const pick = window.getSelectedBook && window.getSelectedBook();
      renderFallback(pick && pick.value);
      setStatus("Error");
    }finally{
      if (btn){ btn.disabled = false; btn.classList.remove("busy"); }
      setTimeout(()=>setStatus("Ready"), 900);
    }
  }

  function wire(){
    const btn = $("btnGenExam50ByBook");
    if (!btn) return;
    btn.onclick = genExam;
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
