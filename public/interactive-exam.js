/* Minimal fallback exam renderer: renders items as plain text.
   Replace with your full interactive UI later. */
(function(){
  window.renderQuiz = function(items){
    var el = document.getElementById("qList");
    if (!el) return;
    el.classList.add("mono");
    el.textContent = JSON.stringify(items, null, 2);
  };
})();
