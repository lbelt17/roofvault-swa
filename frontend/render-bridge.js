/* render-bridge.js
   Normalizes API responses into the "## Exam Output ..." text
   and feeds the interactive widget (window.renderInteractiveExam).
*/
(function(){
  // Helper: turn items (array of strings) into one big exam text
  function itemsToExamText(items){
    // If items already look like "1. MCQ: ..." etc., just join them.
    const body = items.join("\n\n");
    return "## Exam Output\n" + body.trim();
  }

  // Helper: turn docs (from /api/exam search) into a placeholder exam
  function docsToExamText(docs){
    // Minimal safe fallback: 3 questions so UI renders even before LLM step.
    const name = (docs[0] && docs[0].metadata_storage_name) || "Document";
    return `## Exam Output
1. MCQ: This is a sample question for ${name}. Choose B to test.
A. Option A
B. Option B
C. Option C
D. Option D
Answer: B
Why: Sanity check that the UI is working.
Cites: Preview

2. T/F: This true/false sample should be True.
Answer: True
Why: Sanity check.
Cites: Preview

3. Short Answer: Type "TEST".
Answer: TEST
Why: Sanity check.
Cites: Preview`;
  }

  // Expose a single bridge the page can call:
  window.renderQuiz = function(payload){
    try{
      // Case A: payload is already an array of question strings
      if (Array.isArray(payload) && payload.length && typeof payload[0] === "string") {
        window.ExamText = itemsToExamText(payload);
        if (window.renderInteractiveExam) window.renderInteractiveExam();
        return;
      }

      // Case B: payload has { items: [...] }
      if (payload && Array.isArray(payload.items) && payload.items.length) {
        window.ExamText = itemsToExamText(payload.items);
        if (window.renderInteractiveExam) window.renderInteractiveExam();
        return;
      }

      // Case C: payload has { docs: [...] } from /api/exam
      if (payload && Array.isArray(payload.docs) && payload.docs.length) {
        window.ExamText = docsToExamText(payload.docs);
        if (window.renderInteractiveExam) window.renderInteractiveExam();
        return;
      }

      // Fallback: show something minimal so the UI isn't blank
      window.ExamText = docsToExamText([{ metadata_storage_name: "Unknown.pdf" }]);
      if (window.renderInteractiveExam) window.renderInteractiveExam();
    } catch (e){
      console.error("renderQuiz bridge error:", e);
    }
  };
})();
