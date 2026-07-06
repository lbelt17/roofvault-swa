// michael-exam.js — isolated RRC bank exam page (no book selector)
(function () {
  "use strict";

  const API_URL = "/api/exam?bank=rrc&count=25";
  const FETCH_TIMEOUT_MS = 120000;

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(message, visible) {
    const el = $("examStatus");
    if (!el) return;
    el.textContent = message || "";
    el.classList.toggle("visible", !!visible);
  }

  function setError(message) {
    const el = $("examError");
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.classList.add("visible");
    } else {
      el.textContent = "";
      el.classList.remove("visible");
    }
  }

  function clearQList() {
    const qList = $("qList");
    if (qList) qList.innerHTML = "";
  }

  async function safeFetch(url, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetch(url, { method: "GET", signal: ctrl.signal, cache: "no-store" });
    } catch (err) {
      if (err && err.name === "AbortError") {
        throw new Error("Request timed out while loading exam");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadRrcExam() {
    const btn = $("btnStartRrcExam");
    const qList = $("qList");

    if (!qList) return;

    setError("");
    setStatus("Loading exam…", true);

    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
    }

    try {
      clearQList();

      const res = await safeFetch(API_URL, FETCH_TIMEOUT_MS);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Exam API returned a non-JSON response.");
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      }

      const items = Array.isArray(data?.items) ? data.items : [];
      if (!items.length) {
        throw new Error("Exam API returned no questions.");
      }

      if (typeof window.renderQuiz !== "function") {
        throw new Error("Quiz renderer is not available.");
      }

      window.renderQuiz(items);
      setStatus(`Ready — ${items.length} questions loaded.`, true);
    } catch (err) {
      clearQList();
      qList.innerHTML =
        '<div class="q-empty">Could not load the exam. Please try again.</div>';
      setError(err?.message || "Failed to load exam.");
      setStatus("", false);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
      }
    }
  }

  function isNewExamButton(target) {
    const btn = target && target.closest ? target.closest("button") : null;
    if (!btn) return false;

    const text = (btn.textContent || "").trim().toLowerCase();
    return text === "new 25q practice exam" || text.includes("new 25q");
  }

  function wire() {
    const startBtn = $("btnStartRrcExam");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        loadRrcExam();
      });
    }

    document.addEventListener("click", (e) => {
      if (!isNewExamButton(e.target)) return;
      e.preventDefault();
      loadRrcExam();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
