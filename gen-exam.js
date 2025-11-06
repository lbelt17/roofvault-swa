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

  const renderQuiz = window.renderQuiz || (items=>{
    if (qList){ qList.classList.add("mono"); qList.textContent = JSON.stringify(items,null,2); }
  });

  async function safeFetch(url, opts, timeoutMs){
    const ctrl = new AbortController();
    const to = setTimeout(()=>ctrl.abort("timeout"), timeoutMs || 25000);
    try{
      const res = await fetch(url, {...opts, signal: ctrl.signal});
      clearTimeout(to);
      return res;
    }catch(e){
      clearTimeout(to);
      // Common opaque errors -> surface likely cause
      const msg = (e && e.name === "AbortError")
        ? "Request timed out. Likely the API is unreachable or long-running."
        : (String(e).includes("TypeError") ? "Network error (CORS, DNS, or mixed-content)."
        : (e && e.message) ? e.message : String(e));
      throw new Error(msg);
    }
  }

  async function preflight(){
    // Quick probe to tell if /api is even reachable
    try{
      const r = await safeFetch("/api/peek", { method:"POST", headers:{ "Content-Type":"application/json" }, body: "{}" }, 8000);
      const t = await r.text();
      let j; try{ j = JSON.parse(t); }catch{ j = { raw:t } }
      return { ok: r.ok, status: r.status, body: j };
    }catch(e){
      return { ok: false, status: 0, error: e.message || String(e) };
    }
  }

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
      showDiag({ step: "preflight", note: "Probing /api/peek to verify API reachability…" });

      const probe = await preflight();
      if (!probe.ok){
        showDiag({ probe, hint: "If status=0 with 'Network error', it is almost certainly CORS / wrong API base / SWA proxy misconfig." });
        setStatus("Error");
        return;
      }else{
        showDiag({ probe, next: "Calling /api/exam…" });
      }

      const payload = { book: pick.value, filterField: pick.field, count: 50 };
      const res = await safeFetch("/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      }, 30000);

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error:text }; }

      if(!res.ok){
        showDiag({ status: res.status, body: data, hint: "Non-200 from /api/exam" });
        if(qList){ qList.classList.add("mono"); qList.textContent = data?.error || ("HTTP " + res.status); }
        setStatus("Error");
        return;
      }

      if (Array.isArray(data.items) && data.items.length){
        if (summary) summary.innerHTML = '<span class="muted">Answer key hidden. Click "Show Answer Key" in the Questions panel.</span>';
        window.renderQuiz?.(data.items);
        if (modelEl && data.modelDeployment) modelEl.textContent = data.modelDeployment;
        setStatus("Done");
        showDiag({ ok:true, count: data.items.length, model: data.modelDeployment || "unknown" });
      } else {
        if(qList){ qList.classList.add("mono"); qList.textContent = data?.error || "(No items returned)"; }
        showDiag({ status: res.status, body: data, hint: "API responded but no items[] returned" });
        setStatus("Error");
      }
    }catch(e){
      console.error(e);
      showDiag({ error: e && e.message ? e.message : String(e), hint: "See hint text above for likely cause." });
      setStatus("Error");
    }finally{
      const btn = $("btnGenExam50ByBook");
      if (btn){ btn.disabled = false; btn.classList.remove("busy"); }
      setTimeout(()=>setStatus("Ready"), 1200);
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
