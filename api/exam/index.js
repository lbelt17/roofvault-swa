// api/exam/index.js
// Step: Book-wide multi-part support (stability-first, NO sources returned)
// - Uses up to 8 parts max (1 top chunk per part) for speed + grounding.
// - Keeps single-part mode working.
// - Does NOT return sources[] or cite fields (cleaner + faster).

const DEPLOY_TAG = "DEPLOY_TAG__2026-02-02__MULTIPART_BOOKWIDE_NO_SOURCES_A";

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
  // last resort: safe-ish stringify
  try {
    return JSON.stringify(doc);
  } catch {
    return String(doc);
  }
}

// Extract a JSON object even if the model wraps it with extra text.
// We keep this conservative to avoid weird parse failures.
function extractFirstJsonObject(s) {
  const str = String(s || "");
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = str.slice(start, end + 1);
  return safeJsonParse(candidate);
}

module.exports = async function (context, req) {
  try {
    if (req.method === "GET") {
      return jsonRes(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        method: "GET",
        hint: 'POST { "parts":["<part1>","<part2>"], "count":25 }',
        note: "Exam endpoint is multi-part grounded; sources are not returned.",
      });
    }

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

    // Stability/perf: up to 8 parts
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
        // Keep it simple and stable; this matches your existing approach.
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

    // Build a compact grounded context (no SOURCE labels).
    // Keep under ~11k chars to avoid huge prompts.
    const contextPieces = [];
    for (const { partName, doc } of hitsByPart) {
      const text = doc ? firstTextFromDoc(doc) : "(No search hit returned for this part query.)";
      // cap each part chunk
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
    ].join(" ");

    const BATCH_SIZE = 6;
    const batchesPlanned = Math.ceil(desiredCount / BATCH_SIZE);

    const items = [];
    for (let b = 0; b < batchesPlanned; b++) {
      const remaining = desiredCount - items.length;
      if (remaining <= 0) break;

      const want = Math.min(BATCH_SIZE, remaining);

      // Keep "already used" small to reduce token bloat; last ~20 is enough to avoid repeats.
      const avoid = items.slice(-20).map((q) => `- ${q.question}`).join("\n");

      const user = `
Create ${want} multiple-choice questions from the CONTEXT below.

Output ONLY JSON with this exact shape:
{ "items": [ { "id":"1", "type":"mcq", "question":"...", "options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}], "answer":"A" } ] }

Rules:
- Questions must be grounded in CONTEXT only.
- Keep questions specific and useful.
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
        temperature: 0.4,
        max_tokens: 1100,
      };

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
          batch: b + 1,
          error: `AOAI failed: HTTP ${aoaiResp.status}`,
          raw: aoaiText.slice(0, 2000),
        });
      }

      const aoaiJson = safeJsonParse(aoaiText) || {};
      const content = aoaiJson?.choices?.[0]?.message?.content || "";
      const parsed = extractFirstJsonObject(content) || safeJsonParse(content);

      if (!parsed?.items || !Array.isArray(parsed.items)) {
        return jsonRes(context, 500, {
          ok: false,
          deployTag: DEPLOY_TAG,
          stage: "parse",
          batch: b + 1,
          error: "Model returned invalid JSON.",
          raw: String(content).slice(0, 2000),
        });
      }

      for (const it of parsed.items) {
        if (items.length >= desiredCount) break;

        // Enforce expected shape lightly (stability)
        const q = {
          id: String(items.length + 1),
          type: "mcq",
          question: String(it?.question || "").trim(),
          options: Array.isArray(it?.options) ? it.options : [],
          answer: String(it?.answer || "").trim(),
        };

        // Skip malformed entries rather than failing the whole request.
        if (!q.question || !q.options?.length || !q.answer) continue;

        items.push(q);
      }
    }

    const partLabel = parts.length === 1 ? parts[0] : `${parts[0]} (+${parts.length - 1} more parts)`;

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
        batchesPlanned,
        batchesUsed: Math.ceil(items.length / BATCH_SIZE),
        partsUsed: parts.length,
        partsTruncated: Math.max(0, partsAll.length - parts.length),
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
