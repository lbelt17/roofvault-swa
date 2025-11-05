const log = document.getElementById("log");
const f = document.getElementById("f");
const q = document.getElementById("q");
const typing = document.getElementById("typing");

function add(role, text) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="${role === "user" ? "you" : "bot"}">${role === "user" ? "You" : "RoofVault"}:</span> ${text}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

f.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = q.value.trim();
  if (!prompt) return;
  add("user", prompt);
  q.value = "";
  typing.style.display = "block"; // show typing indicator

  try {
    const res = await fetch("https://roofvaultchatapic77eb745.azurewebsites.net/api/chat?code=YOUR_FUNCTION_CODE==", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json().catch(() => ({}));
    add("assistant", data.answer || "(no answer)");

    if (Array.isArray(data.citations) && data.citations.length) {
      const c = document.createElement("div");
      c.className = "src";
      c.textContent = "Sources: " + data.citations.map(s => s.title || s.id || s.source || "doc").join("; ");
      log.appendChild(c);
    }
  } finally {
    typing.style.display = "none"; // hide typing indicator
  }
});

