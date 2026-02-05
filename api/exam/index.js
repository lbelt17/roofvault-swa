// api/exam/index.js
// Step: Book-wide multi-part support (stability-first, NO sources returned)
// - Uses up to 8 parts max (1 top chunk per part) for speed + grounding.
// - Keeps single-part mode working.
// - Does NOT return sources[] or cite fields (cleaner + faster).
//
// ✅ Quality guardrails added (no "chapter/section/page" questions)
// ✅ Reject + regenerate safety net (won't return TOC/navigation questions)
//
// ✅ GET /api/exam?bank=rwc&count=25 returns RANDOM UNIQUE "PRO MODE" questions from RWC bank:
//    - Filters OUT optionless items (opt0)
//    - Filters OUT True/False (opt2) for pro impression (4-option MCQ only)
//    - Tries to include exhibit questions when available
//    (Does NOT affect POST behavior)

const DEPLOY_TAG =
  "DEPLOY_TAG__2026-02-02__MULTIPART_BOOKWIDE_NO_SOURCES__NO_TOC_QS_B__BANK_RWC_TEST_C";

process.on("unhandledRejection", (err) => console.error("[unhandledRejection]", err));
process.on("uncaughtException", (err) => console.error("[uncaughtException]", err));

function jsonRes(context, status, obj) {
  context.res = {
    status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

function getEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function safeJsonParse(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

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

function firstTextFromDoc(doc) {
  if (!doc) return "";
  const t =
    doc.content ||
    doc.text ||
    doc.chunk ||
    doc.pageContent ||
    doc.merged_content ||
    "";
  if (t && String(t).trim()) return String(t);
  try {
    return JSON.stringify(doc);
  } catch {
    return String(doc);
  }
}

// Extract a JSON object even if the model wraps it with extra text.
function extractFirstJsonObject(s) {
  const str = String(s || "");
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = str.slice(start, end + 1);
  return safeJsonParse(candidate);
}

// ---------- Quality guardrails (TOC/navigation ban) ----------

function normalizeText(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeTocOrNavigationQuestion(q) {
  const t = normalizeText(q).toLowerCase();

  const bannedPatterns = [
    /\bwhich\s+chapter\b/i,
    /\bwhat\s+chapter\b/i,
    /\bin\s+chapter\b/i,
    /\bchapter\s+\d+\b/i,
    /\bchapter\s+(one|two|three|four|five|six|seven|eight|nine|ten)\b/i,

    /\bwhich\s+section\b/i,
    /\bwhat\s+section\b/i,
    /\bin\s+section\b/i,
    /\bsection\s+\d+(\.\d+)*\b/i,

    /\bappendix\b/i,
    /\btable\s+of\s+contents\b/i,
    /\bcontents\s+page\b/i,
    /\bpage\s+\d+\b/i,
    /\bfigure\s+\d+\b/i,
    /\btable\s+\d+\b/i,
    /\bwhere\s+in\s+the\s+(manual|document|book)\b/i,
    /\bwhich\s+part\s+of\s+the\s+(manual|document|book)\b/i,
    /\bwhat\s+is\s+covered\s+in\b/i,
    /\bdiscuss(?:es|ed)\s+in\s+chapter\b/i,
  ];

  for (const re of bannedPatterns) {
    if (re.test(t)) return true;
  }
  return false;
}

function looksMalformedMcq(q) {
  if (!q || typeof q !== "object") return true;
  const question = normalizeText(q.question);
  const answer = normalizeText(q.answer);
  if (!question || !answer) return true;
  if (!Array.isArray(q.options) || q.options.length < 4) return true;

  const ids = q.options.map((o) => String(o?.id || "").toUpperCase());
  const hasA = ids.includes("A");
  const hasB = ids.includes("B");
  const hasC = ids.includes("C");
  const hasD = ids.includes("D");
  if (!(hasA && hasB && hasC && hasD)) return true;

  if (!["A", "B", "C", "D"].includes(answer.toUpperCase())) return true;

  for (const o of q.options) {
    if (!normalizeText(o?.text)) return true;
  }
  return false;
}

function normalizeMcq(it, nextId) {
  return {
    id: String(nextId),
    type: "mcq",
    question: normalizeText(it?.question),
    options: Array.isArray(it?.options)
      ? it.options.map((o) => ({
          id: String(o?.id || "").toUpperCase().trim(),
          text: normalizeText(o?.text),
        }))
      : [],
    answer: normalizeText(it?.answer).toUpperCase(),
  };
}

// ---------- Bank loader + sampling (RWC) ----------

function safeInt(n, fallback) {
  const x = parseInt(String(n ?? ""), 10);
  return Number.isFinite(x) ? x : fallback;
}

function loadRwcBank() {
  // eslint-disable-next-line global-require
  return require("./rwc-question-bank-full.js");
}

function optCount(q) {
  return Array.isArray(q?.options) ? q.options.length : 0;
}
function hasExhibit(q) {
  return !!(q?.exhibitImage || q?.imageRef);
}

// crypto-safe random int in [0, maxExclusive)
function randInt(maxExclusive) {
  if (maxExclusive <= 1) return 0;

  try {
    // eslint-disable-next-line no-undef
    const c = typeof crypto !== "undefined" ? crypto : null;
    if (c && typeof c.getRandomValues === "function") {
      const buf = new Uint32Array(1);
      const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
      let x;
      do {
        c.getRandomValues(buf);
        x = buf[0];
      } while (x >= limit);
      return x % maxExclusive;
    }
  } catch {
    // fall through
  }

  return Math.floor(Math.random() * maxExclusive);
}

// Sample N unique items without replacement (Fisher-Yates partial shuffle)
function sampleUnique(arr, n) {
  const a = Array.isArray(arr) ? arr.slice() : [];
  const take = Math.min(Math.max(n, 0), a.length);
  for (let i = 0; i < take; i += 1) {
    const j = i + randInt(a.length - i);
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a.slice(0, take);
}

// Pro-mode selection: prefer 4-option MCQ only, sprinkle exhibits if possible
function selectRwcPro(questions, count) {
  const exhibits = questions.filter((q) => hasExhibit(q) && optCount(q) >= 4);
  const mcq4 = questions.filter((q) => !hasExhibit(q) && optCount(q) >= 4);

  // include up to 2 exhibits if available (bank only has 4 total)
  const wantEx = Math.min(2, exhibits.length, count);
  const picked = [];

  picked.push(...sampleUnique(exhibits, wantEx));

  const remaining = count - picked.length;
  picked.push(...sampleUnique(mcq4, remaining));

  // If somehow still short (shouldn't happen with 39 4-option MCQs),
  // fill from any >=4 options remaining (including nonstandard)
  if (picked.length < count) {
    const pickedIds = new Set(picked.map((x) => x.id));
    const any4 = questions.filter((q) => optCount(q) >= 4 && !pickedIds.has(q.id));
    picked.push(...sampleUnique(any4, count - picked.length));
  }

  return picked.slice(0, count);
}

// ---------- Main ----------

module.exports = async function (context, req) {
  try {
    // ---------- GET ----------
    if (req.method === "GET") {
      const bank = String(req.query?.bank || "").toLowerCase();
      const count = Math.min(Math.max(safeInt(req.query?.count, 25), 1), 200);

      if (bank === "rwc") {
        try {
          const bankObj = loadRwcBank();
          const questionsAll = Array.isArray(bankObj?.questions) ? bankObj.questions : [];

          // ✅ PRO MODE: only 4-option+ questions, random each request
          const selected = selectRwcPro(questionsAll, count);

          const items = selected.map((q, idx) => ({
            id: String(q.id || idx + 1),
            type: q.type || "mcq",
            question: q.question || "",
            options: Array.isArray(q.options) ? q.options : [],
            answer: q.answer || "",
            multi: !!q.multi,
            correctIndexes: Array.isArray(q.correctIndexes) ? q.correctIndexes : [],
            expectedSelections: q.expectedSelections,
            cite: q.cite || bankObj?.book || "RWC Bank",
            explanation: q.explanation || "",
            exhibitImage: q.exhibitImage || "",
            imageRef: q.imageRef || q.exhibitImage || "",
          }));

          return jsonRes(context, 200, {
            ok: true,
            deployTag: DEPLOY_TAG,
            mode: "bank",
            bank: "rwc",
            book: bankObj?.book || "IIBEC - RWC Study Guide.docx",
            countRequested: count,
            returned: items.length,
            bankTotal: questionsAll.length,
            hasAnyExhibitImages: items.some((x) => !!x.exhibitImage || !!x.imageRef),
            qualityMode: "pro-mcq-only",
            items,
          });
        } catch (e) {
          return jsonRes(context, 500, {
            ok: false,
            deployTag: DEPLOY_TAG,
            mode: "bank",
            bank: "rwc",
            error: "Failed to load rwc-question-bank-full.js",
            detail: e?.message || String(e),
          });
        }
      }

      // Default GET (health)
      return jsonRes(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        method: "GET",
        hint: 'POST { "parts":["<part1>","<part2>"], "count":25 }',
        note:
          "Exam endpoint is multi-part grounded; sources are not returned. For RWC bank: GET /api/exam?bank=rwc&count=25",
      });
    }

    // ---------- POST (UNCHANGED BEHAVIOR) ----------
    if (req.method !== "POST") {
      return jsonRes(context, 405, {
        ok: false,
        deployTag: DEPLOY_TAG,
        error: "Method Not Allowed",
        allowed: ["GET", "POST"],
      });
    }

    const body = safeJsonParse(req.body);
    if (!body) {
      return jsonRes(context, 400, {
        ok: false,
        deployTag: DEPLOY_TAG,
        error: "Invalid JSON body (could not parse).",
      });
    }

    const partsRaw = Array.isArray(body.parts) ? body.parts : [];
    const partsAll = uniqStrings(partsRaw);

    const countRaw = Number.isFinite(body.count) ? body.count : parseInt(body.count, 10);
    const desiredCount =
      Number.isFinite(countRaw) && countRaw > 0 ? Math.min(countRaw, 50) : 25;

    if (!partsAll.length) {
      return jsonRes(context, 400, {
        ok: false,
        deployTag: DEPLOY_TAG,
        error: 'Body must include: parts: ["<part name>", ...]',
      });
    }

    const parts = partsAll.slice(0, 8);

    // --- 1) Search: 1 best chunk per part (top=1) ---
    const SEARCH_ENDPOINT = getEnv("SEARCH_ENDPOINT");
    const SEARCH_API_KEY = getEnv("SEARCH_API_KEY");
    const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "azureblob-index-content";

    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}/docs/search?api-version=2023-11-01`;

    const hitsByPart = [];
    for (const partName of parts) {
      const searchPayload = {
        search: partName,
        top: 1,
        queryType: "simple",
        select: "*",
      };

      const searchResp = await fetch(searchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
        body: JSON.stringify(searchPayload),
      });

      const searchText = await searchResp.text();
      if (!searchResp.ok) {
        return jsonRes(context, 500, {
          ok: false,
          deployTag: DEPLOY_TAG,
          stage: "search",
          partName,
          error: `Search failed: HTTP ${searchResp.status}`,
          raw: searchText.slice(0, 2000),
        });
      }

      const searchJson = safeJsonParse(searchText) || {};
      const docs = Array.isArray(searchJson.value) ? searchJson.value : [];
      hitsByPart.push({ partName, doc: docs[0] || null });
    }

    const contextPieces = [];
    for (const { partName, doc } of hitsByPart) {
      const text = doc ? firstTextFromDoc(doc) : "(No search hit returned for this part query.)";
      const chunk = String(text).slice(0, 2400);
      contextPieces.push(`PART: ${partName}\n${chunk}`);
    }

    let groundedContext = contextPieces.join("\n\n");
    if (groundedContext.length > 11000) groundedContext = groundedContext.slice(0, 11000);

    // --- 2) AOAI batching ---
    const AOAI_ENDPOINT = getEnv("AOAI_ENDPOINT");
    const AOAI_API_KEY = getEnv("AOAI_API_KEY");
    const AOAI_DEPLOYMENT = process.env.AOAI_DEPLOYMENT || "gpt-4o-mini";
    const AOAI_API_VERSION = process.env.AOAI_API_VERSION || "2024-02-15-preview";

    const aoaiUrl =
      `${AOAI_ENDPOINT.replace(/\/$/, "")}` +
      `/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=${encodeURIComponent(
        AOAI_API_VERSION
      )}`;

    const system = [
      "You generate multiple-choice exam questions.",
      "Output MUST be valid JSON only (no markdown, no extra text).",
      "Questions must be grounded ONLY in the provided CONTEXT.",
      "Do not invent facts not present in CONTEXT.",
      "",
      "QUALITY RULES (STRICT):",
      "- Do NOT write questions about chapter numbers, sections, appendices, page numbers, figure/table numbers, or where information appears in the document.",
      "- Do NOT ask 'which chapter/section' or 'what is covered in chapter X'.",
      "- Ask applied, real-world knowledge questions based on the content (definitions, requirements, procedures, calculations/loads if present, best practices, failure modes).",
      "- If the CONTEXT includes headings like 'Chapter 3' or a table of contents, ignore them and focus on the technical content.",
    ].join(" ");

    const BATCH_SIZE = 6;
    const MAX_TOTAL_CALLS = Math.max(6, Math.ceil(desiredCount / BATCH_SIZE) + 6);

    const items = [];
    let totalCalls = 0;

    while (items.length < desiredCount && totalCalls < MAX_TOTAL_CALLS) {
      const remaining = desiredCount - items.length;
      const want = Math.min(BATCH_SIZE, remaining);

      const avoid = items.slice(-20).map((q) => `- ${q.question}`).join("\n");

      const user = `
Create ${want} multiple-choice questions from the CONTEXT below.

Output ONLY JSON with this exact shape:
{ "items": [ { "id":"1", "type":"mcq", "question":"...", "options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}], "answer":"A" } ] }

STRICT RULES:
- Questions must be grounded in CONTEXT only.
- Do NOT invent facts not present in CONTEXT.
- Do NOT ask about: chapter numbers, sections, appendices, page numbers, figure/table numbers, or "where in the document" something is.
- Do NOT ask "Which chapter/section..." or "What is covered in chapter..."
- Prefer applied roofing questions.
- Do NOT repeat previous questions.

BOOK / PARTS:
${parts.join("\n")}

CONTEXT:
${groundedContext}

Already used questions (avoid repeating these exact questions):
${avoid}
`.trim();

      const aoaiPayload = {
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
        max_tokens: 1100,
      };

      totalCalls += 1;

      const aoaiResp = await fetch(aoaiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": AOAI_API_KEY },
        body: JSON.stringify(aoaiPayload),
      });

      const aoaiText = await aoaiResp.text();
      if (!aoaiResp.ok) {
        return jsonRes(context, 500, {
          ok: false,
          deployTag: DEPLOY_TAG,
          stage: "aoai",
          call: totalCalls,
          error: `AOAI failed: HTTP ${aoaiResp.status}`,
          raw: aoaiText.slice(0, 2000),
        });
      }

      const aoaiJson = safeJsonParse(aoaiText) || {};
      const content = aoaiJson?.choices?.[0]?.message?.content || "";
      const parsed = extractFirstJsonObject(content) || safeJsonParse(content);

      if (!parsed?.items || !Array.isArray(parsed.items)) {
        continue;
      }

      for (const it of parsed.items) {
        if (items.length >= desiredCount) break;

        const q = normalizeMcq(it, items.length + 1);
        if (looksMalformedMcq(q)) continue;
        if (looksLikeTocOrNavigationQuestion(q.question)) continue;

        const key = q.question.toLowerCase();
        const dup = items.some((x) => x.question.toLowerCase() === key);
        if (dup) continue;

        items.push(q);
      }
    }

    const partLabel =
      parts.length === 1 ? parts[0] : `${parts[0]} (+${parts.length - 1} more parts)`;

    return jsonRes(context, 200, {
      ok: true,
      deployTag: DEPLOY_TAG,
      model: AOAI_DEPLOYMENT,
      part: partLabel,
      debug: {
        hits: hitsByPart.filter((x) => !!x.doc).length,
        contextChars: groundedContext.length,
        desiredCount,
        batchSize: BATCH_SIZE,
        callsUsed: totalCalls,
        partsUsed: parts.length,
        partsTruncated: Math.max(0, partsAll.length - parts.length),
        filteredTocQPolicy: true,
        returnedCount: items.length,
      },
      items,
    });
  } catch (err) {
    return jsonRes(context, 500, {
      ok: false,
      deployTag: DEPLOY_TAG,
      stage: "catch",
      error: err?.message || String(err),
      stack: err?.stack ? String(err.stack).slice(0, 2000) : undefined,
    });
  }
};
