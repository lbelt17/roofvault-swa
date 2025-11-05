(function(){
  function $(id){ return document.getElementById(id); }
  function setStatus(t){ const s=$("status"); if(s) s.textContent=t; }

  async function genExam(){
    try{
      setStatus("Generating exam…");
      const pick = (window.getSelectedBook && window.getSelectedBook()) || { value:"", field:null };
      const res = await fetch("/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ book: pick.value, filterField: pick.field })
      });
      const data = await res.json();

      const qList = $("qList");
      if (qList){
        qList.textContent = (data && data.content) ? data.content : "(no content)";
        qList.classList.add("mono");
      }

      const model = $("model");
      if (model && data && data.modelDeployment) model.textContent = data.modelDeployment;

      setStatus(`HTTP ${res.status}`);
    }catch(e){
      setStatus("Error");
      console.error(e);
    }finally{
      setTimeout(()=>setStatus("Ready"), 800);
    }
  }

  function addButton(){
    const bar = document.querySelector(".toolbar .btnbar");
    if(!bar) return;
    const btn = document.createElement("button");
    btn.id = "btnGenExam50ByBook";
    btn.textContent = "Generate Exam (50 by Book)";
    btn.addEventListener("click", genExam);
    bar.appendChild(btn);
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", addButton);
  } else {
    addButton();
  }
})();
