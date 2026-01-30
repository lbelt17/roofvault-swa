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

  function uniqStrings(arr) {
    const out = [];
    const seen = new Set();
    for (const v of arr || []) {
      const s = typeof v === "string" ? v.trim() : "";
      if (!s) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
    return out;
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

    // IMPORTANT: now that SWA /api/exam supports multi-part, we send ALL parts.
    let parts = [];
    if (Array.isArray(pick?.parts)) parts = uniqStrings(pick.parts);
    else if (typeof pick?.part === "string" && pick.part.trim()) parts = [pick.part.trim()];
    else if (typeof pick?.partName === "string" && pick.partName.trim()) parts = [pick.partName.trim()];
    else if (typeof pick?.selectedPart === "string" && pick.selectedPart.trim()) parts = [pick.selectedPart.trim()];

    if (!parts.length) {
      // last resort: use the display title so the backend has something searchable
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

      if (!payload.bookGroupId) {
        showDiag({ error: "Missing bookGroupId from picker selection.", pick });
        if (qList) { qList.classList.add("mono"); qList.textContent = "Error: Missing bookGroupId."; }
        setStatus("Error");
        return;
      }

      if (!Array.isArray(payload.parts) || payload.parts.length === 0) {
        showDiag({ error: "Missing parts[] from picker selection.", payload, pick });
        if (qList) { qList.classList.add("mono"); qList.textContent = "Error: Missing parts[] (book selector mismatch)."; }
        setStatus("Error");
        return;
      }

      if (btn) { btn.disabled = true; btn.classList.add("busy"); }
      setStatus("Generating exam…");
      showDiag({ message: "Calling /api/exam …", payload });

      // ✅ CRITICAL: same-origin SWA API (uses the code we just fixed)
      const res = await fetch("/api/exam", {
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
          debug: data.debug,
          sourcesCount: Array.isArray(data.sources) ? data.sources.length : 0
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
