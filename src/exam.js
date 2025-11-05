(function(){
  function $(id){ return document.getElementById(id); }
  function setStatus(t){ const s=$("status"); if(s) s.textContent=t; }

  async function genExam(){
    try{
      setStatus("Generating exam…");
      const book = (window.getSelectedBook && window.getSelectedBook()) || "";
      const res = await fetch("/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ book })
      });
      const data = await res.json();

      // Show the exam text in the Questions panel as monospace text
      const qList = $("qList");
      if (qList){
        qList.textContent = (data && data.content) ? data.content : "(no content)";
        qList.classList.add("mono");
      }

      // Show which model answered, if returned
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
