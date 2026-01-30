// api/exam/index.js
// Step: Book-wide multi-part support (stable citations: SOURCE 1..SOURCE 8)
// - Uses up to 8 parts max (1 top chunk per part) to preserve cite constraints.
// - Keeps single-part mode working.
// - Adds sources[] metadata for auditability.

const DEPLOY_TAG = "DEPLOY_TAG__2026-01-30__MULTIPART_BOOKWIDE_A";

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
  try { return JSON.parse(value); } catch { return null; }
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

module.exports = async function (context, req) {
  try {
    if (req.method === "GET") {
      return jsonRes(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        method: "GET",
        hint: 'POST { "parts":["<part1>","<part2>"], "count":25, "mode":"BOOK_ONLY" }',
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
    const desiredCount = Number.isFinite(countRaw) && countRaw > 0 ? Math.min(countRaw, 50) : 25;

    if (!partsAll.length) {
      return jsonRes(context, 400, {
        ok: false,
        deployTag: DEPLOY_TAG,
        error: 'Body must include: parts: ["<part name>", ...]',
      });
    }

    // IMPORTANT: keep cites limited to SOURCE 1..SOURCE 8.
    // So we sample up to 8 parts and take 1 best hit per part.
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

    // Build up to 8 SOURCES (one per part). Keep total under ~11k chars.
    const sourcesMeta = [];
    const sourcePieces = [];

    for (let i = 0; i < hitsByPart.length; i++) {
      const { partName, doc } = hitsByPart[i];
      const sourceId = `SOURCE ${i + 1}`;

      let text = "";
      if (doc) {
        text =
          doc.content ||
          doc.text ||
          doc.chunk ||
          doc.pageContent ||
          doc.merged_content ||
          "";
        if (!text) text = JSON.stringify(doc);
      } else {
        text = "(No search hit returned for this part query.)";
      }

      const piece = `${sourceId}\nPART: ${partName}\n${String(text)}`.slice(0, 2500);
      sourcePieces.push(piece);

      sourcesMeta.push({
        sourceId,
        part: partName,
        // These fields exist in many Azure Blob indexers; include if present.
        metadata_storage_name: doc?.metadata_storage_name,
        metadata_storage_path: doc?.metadata_storage_path,
        metadata_storage_url: doc?.metadata_storage_url,
        score: doc?.["@search.score"],
      });
    }

    let sources = sourcePieces.join("\n\n");
    if (sources.length > 11000) sources = sources.slice(0, 11000);

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

    const system = `You generate exam questions. Output MUST be valid JSON only. No markdown.`;

    const BATCH_SIZE = 6;
    const batches = Math.ceil(desiredCount / BATCH_SIZE);

    const items = [];
    for (let b = 0; b < batches; b++) {
      const remaining = desiredCount - items.length;
      if (remaining <= 0) break;

      const want = Math.min(BATCH_SIZE, remaining);

      const user = `
Create ${want} multiple-choice questions from the sources below.

Rules:
- Output ONLY JSON with this exact shape:
  { "items": [ { "id":"1", "type":"mcq", "question":"...", "options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}], "answer":"A", "cite":"SOURCE 1" } ] }
- Each cite MUST be one of: "SOURCE 1" .. "SOURCE ${Math.min(parts.length, 8)}"
- Keep questions specific and useful.
- Do NOT repeat previous questions.
- IMPORTANT: Questions must be grounded in the provided SOURCES only. If unsure, ask about what IS in the sources.

BOOK / PARTS:
${parts.join("\n")}

SOURCES:
${sources}

Already used questions (avoid repeating these exact questions):
${items.map((q) => `- ${q.question}`).join("\n")}
`.trim();

      const aoaiPayload = {
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
        max_tokens: 1200,
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
      const parsed = safeJsonParse(content);

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
        items.push({ ...it, id: String(items.length + 1) });
      }
    }

    // Respond with a “book-wide” label when multiple parts are used.
    const partLabel = parts.length === 1 ? parts[0] : `${parts[0]} (+${parts.length - 1} more parts)`;

    return jsonRes(context, 200, {
      ok: true,
      deployTag: DEPLOY_TAG,
      model: AOAI_DEPLOYMENT,
      part: partLabel,
      debug: {
        hits: hitsByPart.filter(x => !!x.doc).length,
        sourceChars: sources.length,
        desiredCount,
        batchSize: BATCH_SIZE,
        batchesPlanned: batches,
        batchesUsed: Math.ceil(items.length / BATCH_SIZE),
        partsUsed: parts.length,
        partsTruncated: partsAll.length - parts.length,
      },
      sources: sourcesMeta,
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
