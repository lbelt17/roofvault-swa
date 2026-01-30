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

  const renderQuiz = window.renderQuiz || (items => {
    if (qList) { qList.classList.add("mono"); qList.textContent = JSON.stringify(items, null, 2); }
  });

  // Picks ONE best part string. Backend appears to require a single part.
  function pickSinglePart(pick) {
    // Prefer explicit single selection fields if they exist
    const candidates = [
      pick?.part,
      pick?.partName,
      pick?.selectedPart
    ].filter(v => typeof v === "string" && v.trim());

    if (candidates.length) return candidates[0].trim();

    // Otherwise, if we have an array, take the first part deterministically
    if (Array.isArray(pick?.parts) && pick.parts.length) {
      const first = pick.parts.find(Boolean);
      if (typeof first === "string" && first.trim()) return first.trim();
    }

    // Last fallback: use display title as a "part-ish" string (matches your earlier working curl)
    const displayTitle =
      pick?.displayTitle ||
      pick?.title ||
      pick?.label ||
      pick?.name ||
      "";

    if (typeof displayTitle === "string" && displayTitle.trim()) return displayTitle.trim();

    return "";
  }

  function buildExamPayloadFromPick(pick) {
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

    const singlePart = pickSinglePart(pick);

    return {
      bookGroupId,
      displayTitle,
      // IMPORTANT: backend appears to require ONE selected part
      parts: singlePart ? [singlePart] : [],
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

      if (!payload.bookGroupId) {
        showDiag({ error: "Missing bookGroupId from picker selection.", pick });
        if (qList) { qList.classList.add("mono"); qList.textContent = "Error: Missing bookGroupId."; }
        setStatus("Error");
        return;
      }

      if (!Array.isArray(payload.parts) || payload.parts.length !== 1) {
        showDiag({ error: "Missing single selected part (backend requires one part).", payload, pick });
        if (qList) {
          qList.classList.add("mono");
          qList.textContent = "Error: No single part selected (picker mismatch).";
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

      if (Array.isArray(data.items) && data.items.length) {
        if (summary) {
          summary.innerHTML = '<span class="muted">Answer key hidden. Click "Show Answer Key" in the Questions panel.</span>';
        }
        window.renderQuiz?.(data.items);

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
