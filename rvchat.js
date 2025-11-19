// rvchat.js — Clean ChatGPT-style output formatting

document.addEventListener("DOMContentLoaded", () => {
  const askBtn = document.getElementById("ask");
  const q = document.getElementById("q");
  const out = document.getElementById("out");
  const answerBox = document.getElementById("answer");
  const srcBox = document.getElementById("sources");
  const status = document.getElementById("status");

  async function askQuestion() {
    const question = q.value.trim();
    if (!question) return;

    askBtn.disabled = true;
    status.textContent = "Thinking...";
    out.style.display = "none";

    const res = await fetch("/api/rvchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await res.json();

    // Format answer in a ChatGPT-style way
    let a = data.answer || "";
    a = a
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold formatting
      .replace(/\n\n/g, "<br><br>")                     // spacing
      .replace(/\n/g, "<br>");                          // single newlines

    answerBox.innerHTML = a;

    // Format sources
    if (data.sources && data.sources.length) {
      const lines = data.sources
        .map(s => `• <strong>[${s.id}]</strong> ${s.source}`)
        .join("<br>");
      srcBox.innerHTML = `<strong>Sources</strong><br>${lines}`;
    } else {
      srcBox.innerHTML = "<strong>Sources</strong><br>No sources returned.";
    }

    out.style.display = "block";
    status.textContent = "";
    askBtn.disabled = false;
  }

  askBtn.addEventListener("click", askQuestion);

  q.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      askQuestion();
    }
  });
});
