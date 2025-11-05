(function(){
  // 10s timeout wrapper
  async function fetchWithTimeout(url, options={}, ms=10000){
    const ctrl = new AbortController();
    const id = setTimeout(()=>ctrl.abort(new Error("Request timeout")), ms);
    try { return await fetch(url, { ...options, signal: ctrl.signal }); }
    finally { clearTimeout(id); }
  }

  // Convert items[] -> "## Exam Output ..." string
  function itemsToExamText(items){
    return "## Exam Output\n" + (items||[]).join("\n\n");
  }

  // Guaranteed fallback
  function fallbackExam(book){
    return `## Exam Output
1. MCQ: Sanity question for ${book||"Document"}. Choose B.
A. A
B. B
C. C
D. D
Answer: B
Why: Fallback.
Cites: Preview

2. T/F: This should be True.
Answer: True
Why: Fallback.
Cites: Preview

3. Short Answer: Type TEST.
Answer: TEST
Why: Fallback.
Cites: Preview`;
  }

  async function genExam(){
    // Get selected book name from your dropdown helper; if missing, fallback
    const pick = (window.getSelectedBook && window.getSelectedBook()) || { value: "Unknown.pdf" };

    try{
      // call /api/exam with 10s timeout
      const res = await fetchWithTimeout("/api/exam", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ book: pick.value })
      }, 10000);

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = { error:text }; }

      // happy path: items[] present
      const payload = (Array.isArray(data?.items) || Array.isArray(data?.docs)) ? data : (data?.body || data);
      if (Array.isArray(payload?.items) && payload.items.length){
        window.ExamText = itemsToExamText(payload.items);
        if (window.renderInteractiveExam) window.renderInteractiveExam();
        return;
      }

      // doc-only response → still show a sample
      if (Array.isArray(payload?.docs) && payload.docs.length){
        window.ExamText = fallbackExam(pick.value);
        if (window.renderInteractiveExam) window.renderInteractiveExam();
        return;
      }

      // unexpected payload → fallback
      window.ExamText = fallbackExam(pick.value);
      if (window.renderInteractiveExam) window.renderInteractiveExam();
    }catch(e){
      // timeout/network → fallback
      window.ExamText = fallbackExam(pick.value);
      if (window.renderInteractiveExam) window.renderInteractiveExam();
    }
  }

  // wire button
  function wire(){
    const btn = document.getElementById("btnGenExam50ByBook");
    if (btn) btn.onclick = genExam;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
