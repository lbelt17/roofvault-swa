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

  // Render function exposed by previous step
  const renderQuiz = window.renderQuiz || (items=>{
    // fallback: text mode
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

      const res = await fetch("https://roofvault-exam-durable2.azurewebsites.net/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ book: pick.value, filterField: pick.field })
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error:text }; }

      if(!res.ok){
        showDiag({status:res.status, body:data});
        if(qList){ qList.classList.add("mono"); qList.textContent = data?.error || `HTTP ${res.status}`; }
        setStatus("Error");
        return;
      }

      if (Array.isArray(data.items) && data.items.length){
        // Clear any old summary key
        if (summary) summary.innerHTML = '<span class="muted">Answer key hidden. Click "Show Answer Key" in the Questions panel.</span>';
        // Render
        window.renderQuiz?.(data.items);
        if (modelEl && data.modelDeployment) modelEl.textContent = data.modelDeployment;
        setStatus(`HTTP ${res.status}`);
      } else {
        if(qList){ qList.classList.add("mono"); qList.textContent = data?.error || "(No items returned)"; }
        showDiag({status:res.status, body:data});
        setStatus("Error");
      }
    }catch(e){
      console.error(e);
      showDiag(e?.message || e);
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
