// gen-exam.js — resilient client for /api/exam
(function(){
  function $(id){ return document.getElementById(id); }
  const statusEl = $("status");
  const diagEl = $("diag");
  const qList = $("qList");
  const btn = $("btnGenExam50ByBook");

  function setStatus(t){ if(statusEl) statusEl.textContent = t || "Ready"; }
  function showDiag(o){
    if (!diagEl) return;
    try { diagEl.textContent = typeof o === "string" ? o : JSON.stringify(o,null,2); }
    catch { diagEl.textContent = String(o); }
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
        console.warn("safeFetch retrying after error:", e?.message || e);
        await new Promise(r=>setTimeout(r, 800)); // brief backoff
        return safeFetch(url, opts, timeoutMs, retries-1);
      }
      throw e;
    }
  }

  async function genExam(){
    if (!window.getSelectedBook){
      showDiag("Book selector not ready."); setStatus("Error"); return;
    }
    const pick = window.getSelectedBook();
    if (!pick){ showDiag("No book selected"); setStatus("Error"); return; }

    try{
      if (btn){ btn.disabled = true; btn.classList.add("busy"); }
      setStatus("Generating exam…");
      if (qList){ qList.classList.add("mono"); qList.textContent = "⏳ contacting /api/exam …"; }

      const res = await safeFetch("/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ book: pick.value, filterField: pick.field, count: 50 })
      }, 45000, 1);

      const txt = await res.text();
      let data; try { data = JSON.parse(txt); } catch { data = { error: txt }; }

      if (!res.ok){
        showDiag({ status: res.status, body: data });
        if (qList){ qList.textContent = data?.error || `HTTP ${res.status}`; }
        setStatus("Error");
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0){
        showDiag({ status: res.status, body: data, hint: "API responded but no items[] returned" });
        if (qList){ qList.textContent = "(No items returned)"; }
        setStatus("Error");
        return;
      }

      // Render interactively if available
      if (typeof window.renderQuiz === "function"){
        if (qList){ qList.classList.remove("mono"); qList.textContent = ""; }
        window.renderQuiz(items);
      } else {
        // fallback: show JSON
        if (qList){ qList.classList.add("mono"); qList.textContent = JSON.stringify(items, null, 2); }
      }
      setStatus(`HTTP ${res.status}`);
    }catch(e){
      console.error(e);
      const msg = (e && e.name === "AbortError") ? "timeout" : (e?.message || String(e));
      showDiag({ error: msg, hint: "Request aborted or network error" });
      if (qList){ qList.textContent = `{ "error": "${msg}" }`; }
      setStatus("Error");
    }finally{
      if (btn){ btn.disabled = false; btn.classList.remove("busy"); }
      setTimeout(()=>setStatus("Ready"), 900);
    }
  }

  function wire(){
    const b = $("btnGenExam50ByBook");
    if (!b) return;
    b.onclick = genExam;
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
