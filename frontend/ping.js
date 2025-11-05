(function(){
  function $(id){ return document.getElementById(id); }
  const diagEl = $("diag");
  const btn    = $("btnPing");

  function show(o){
    try { diagEl.textContent = typeof o === "string" ? o : JSON.stringify(o,null,2); }
    catch { diagEl.textContent = String(o); }
  }

  async function ping(){
    try{
      show("Calling /api/ping …");
      const res  = await fetch("/api/ping", { method:"GET" });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = { raw:text }; }
      show({ status: res.status, headers: Object.fromEntries(res.headers.entries()), body: data });
    }catch(e){
      show({ error: String(e && e.message || e) });
    }
  }

  if (btn) btn.onclick = ping;
})();
