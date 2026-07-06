#!/usr/bin/env node
/**
 * Local preview: static site + /api/exam bank mode + minimal /api/books.
 * Usage: node scripts/local-preview-server.js
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 8765);

const BANK_MODULES = {
  jm_app_roofing_systems: "../api/exam/jm-app-roofing-systems-question-bank-2026.js",
  polyglass_technical_guide: "../api/exam/polyglass-technical-guide-question-bank-2026.js",
  elevate_ultraply_tpo: "../api/exam/elevate-ultraply-tpo-question-bank-2026.js",
  duro_last_maintenance: "../api/exam/duro-last-maintenance-question-bank-2026.js",
  pfas: "../api/exam/pfas-question-bank-2026.js",
  rrc: "../api/exam/rrc-question-bank-2026.js",
};

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function loadBankItems(bankKey, count) {
  const rel = BANK_MODULES[bankKey];
  if (!rel) return null;
  const bankObj = require(path.join(__dirname, rel));
  const questionsAll = Array.isArray(bankObj?.questions)
    ? bankObj.questions
    : (Array.isArray(bankObj?.items) ? bankObj.items : []);
  const take = Math.min(Math.max(count, 1), questionsAll.length);
  const shuffled = questionsAll.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selected = shuffled.slice(0, take);
  return selected.map((q, idx) => {
    const answerLetter = String(q.answer || "").toUpperCase().trim();
    const ci = answerLetter.charCodeAt(0) - 65;
    const correctIndexes =
      Number.isFinite(ci) && ci >= 0 && ci < (Array.isArray(q.options) ? q.options.length : 0)
        ? [ci]
        : [];
    return {
      id: String(q.id || idx + 1),
      type: q.type || "mcq",
      question: q.question || "",
      options: Array.isArray(q.options) ? q.options : [],
      answer: answerLetter,
      multi: !!q.multi,
      correctIndexes,
      expectedSelections: q.expectedSelections || 1,
      cite: q.cite || bankObj?.book || bankKey,
      explanation: q.explanation || "",
      exhibitImage: q.exhibitImage || "",
      imageRef: q.imageRef || q.exhibitImage || "",
    };
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
  };
  return map[ext] || "application/octet-stream";
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === "/api/exam" && req.method === "GET") {
    const bank = String(parsed.query.bank || "").toLowerCase();
    const count = Math.min(Math.max(parseInt(parsed.query.count, 10) || 25, 1), 200);
    const items = loadBankItems(bank, count);
    if (!items) {
      return sendJson(res, 404, { ok: false, error: "Unknown bank", bank });
    }
    return sendJson(res, 200, { ok: true, bank, count: items.length, items });
  }

  if (parsed.pathname === "/api/books" && req.method === "GET") {
    return sendJson(res, 200, { books: [], values: [] });
  }

  let filePath = path.join(ROOT, parsed.pathname === "/" ? "index.html" : parsed.pathname);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end("Not found");
  }
  res.writeHead(200, { "Content-Type": contentType(filePath), "Cache-Control": "no-store" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Local preview: http://127.0.0.1:${PORT}/exams.html`);
});
