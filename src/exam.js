(function () {
  function $(id) { return document.getElementById(id); }

  const statusEl = $("status");
  const modelEl = $("model");
  const qList = $("qList");
  const diagEl = $("diag");
  const summary = $("summaryBlock");

  function setStatus(t) { if (statusEl) statusEl.textContent = t || "Ready"; }
  function showDiag(o) {
    try { diagEl.textContent = typeof o === "string" ? o : JSON.stringify(o, null, 2); }
    catch { diagEl.textContent = String(o); }
  }

  // Render function exposed by previous step
  const renderQuiz = window.renderQuiz || (items => {
    if (qList) { qList.classList.add("mono"); qList.textContent = JSON.stringify(items, null, 2); }
  });

  // Normalize the selected book object into the strict backend contract
  function buildExamPayloadFromPick(pick) {
    // We support a few possible shapes because the book picker has evolved over time.
    // Expected best-case:
    //   pick = { bookGroupId, displayTitle, parts:[], ... }
    //
    // Legacy shapes we might see:
    //   pick.value = groupId
    //   pick.title / pick.label = display title
    //   pick.parts or pick.part or pick.value (single string)
    //
    // Our rules:
    // - bookGroupId MUST be present
    // - parts MUST be a non-empty array of strings
    // - displayTitle is optional but preferred

    const bookGroupId =
      pick?.bookGroupId ||
      pick?.groupId ||
      pick?.value ||
      pick?.id ||
      "";

    const displayTitle =
      pick?.displayTitle ||
      pick?.title ||
      pick?.label ||
      pick?.name ||
      "";

    // Prefer explicit parts array; otherwise accept a single part string if present.
    let parts = [];
    if (Array.isArray(pick?.parts)) parts = pick.parts.filter(Boolean);
    else if (typeof pick?.part === "string" && pick.part.trim()) parts = [pick.part.trim()];
    else if (typeof pick?.partName === "string" && pick.partName.trim()) parts = [pick.partName.trim()];
    else if (typeof pick?.selectedPart === "string" && pick.selectedPart.trim()) parts = [pick.selectedPart.trim()];

    // If the picker only returns a "book" and not parts, we still need to send *something*.
    // Your backend currently supports book-only mode; to keep it strict, we set parts to
    // a single "book title" fallback ONLY if we have nothing else.
    if (!parts.length) {
      const fallback = displayTitle || (typeof pick?.text === "string" ? pick.text : "");
      if (fallback && fallback.trim()) parts = [fallback.trim()];
    }

    return {
      bookGroupId,
      displayTitle,
      parts,
      excludeQuestions: [],
      count: 25,
      mode: "BOOK_ONLY",
      attemptNonce: `${Date.now()}-${Math.random().toString(16).slice(2)}`
    };
  }

  async function genExam() {
    const btn = $("btnGenExam50ByBook");

    try {
      if (!window.getSelectedBook) {
        showDiag("Book selector not ready.");
        setStatus("Error");
        return;
      }

      const pick = window.getSelectedBook();
      if (!pick) {
        showDiag("No book selected");
        setStatus("Error");
        return;
      }

      const payload = buildExamPayloadFromPick(pick);

      // Hard stop if required fields are missing (prevents silent broad retrieval)
      if (!payload.bookGroupId) {
        showDiag({
          error: "Missing bookGroupId from picker selection.",
          pick
        });
        if (qList) {
          qList.classList.add("mono");
          qList.textContent = "Error: Missing bookGroupId (book selector mismatch).";
        }
        setStatus("Error");
        return;
      }

      if (!Array.isArray(payload.parts) || payload.parts.length === 0) {
        showDiag({
          error: "Missing parts[] from picker selection.",
          pick
        });
        if (qList) {
          qList.classList.add("mono");
          qList.textContent = "Error: Missing parts[] (book selector mismatch).";
        }
        setStatus("Error");
        return;
      }

      if (btn) { btn.disabled = true; btn.classList.add("busy"); }
      setStatus("Generating exam…");
      showDiag({ message: "Calling /api/exam …", payload });

      const res = await fetch("https://roofvault-exam-durable2.azurewebsites.net/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error: text }; }

      if (!res.ok) {
        showDiag({ status: res.status, body: data });
        if (qList) {
          qList.classList.add("mono");
          qList.textContent = data?.error || `HTTP ${res.status}`;
        }
        setStatus("Error");
        return;
      }

      // Render path
      if (Array.isArray(data.items) && data.items.length) {
        if (summary) {
          summary.innerHTML = '<span class="muted">Answer key hidden. Click "Show Answer Key" in the Questions panel.</span>';
        }

        window.renderQuiz?.(data.items);

        // Support either model or modelDeployment field names
        const modelName = data.modelDeployment || data.model;
        if (modelEl && modelName) modelEl.textContent = modelName;

        setStatus(`HTTP ${res.status}`);
        showDiag({
          status: res.status,
          ok: data.ok,
          deployTag: data.deployTag,
          part: data.part,
          items: data.items.length,
          debug: data.debug
        });
      } else {
        if (qList) {
          qList.classList.add("mono");
          qList.textContent = data?.error || "(No items returned)";
        }
        showDiag({ status: res.status, body: data });
        setStatus("Error");
      }
    } catch (e) {
      console.error(e);
      showDiag(e?.message || e);
      setStatus("Error");
    } finally {
      if (btn) { btn.disabled = false; btn.classList.remove("busy"); }
      setTimeout(() => setStatus("Ready"), 900);
    }
  }

  function wire() {
    const btn = $("btnGenExam50ByBook");
    if (!btn) return;
    btn.onclick = genExam;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
