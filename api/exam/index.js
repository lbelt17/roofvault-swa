// api/exam/index.js
// Minimal known-good baseline: Search -> AOAI -> JSON -> return
// No batching, no filtering, no top-up, no loops (beyond simple joins)

const DEPLOY_TAG = "DEPLOY_TAG__2026-01-22__BASELINE_A";

// If Azure swallows errors, these can still help in platform logs
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

module.exports = async function (context, req) {
  // Always return *some* JSON unless Azure crashes before our code runs
  try {
    // Quick health check + deploy proof
    if (req.method === "GET") {
      return jsonRes(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        method: "GET",
        hint: "POST a JSON body like { parts: [\"NRCA - Steep-slope Roof Systems 2017 - Part 01\"], count: 3 }",
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

    // Parse body safely
    const body = safeJsonParse(req.body);
    if (!body) {
      return jsonRes(context, 400, {
        ok: false,
        deployTag: DEPLOY_TAG,
        error: "Invalid JSON body (could not parse).",
      });
    }

    const parts = Array.isArray(body.parts) ? body.parts : [];
    const count = Number.isFinite(body.count) ? body.count : parseInt(body.count, 10);
    const desiredCount = Number.isFinite(count) && count > 0 ? Math.min(count, 10) : 3;

    if (!parts.length || typeof parts[0] !== "string" || !parts[0].trim()) {
      return jsonRes(context, 400, {
        ok: false,
        deployTag: DEPLOY_TAG,
        error: 'Body must include: parts: ["<part name>"]',
      });
    }

    const partName = parts[0].trim();

    // --- 1) Azure AI Search (minimal) ---
    const SEARCH_ENDPOINT = getEnv("SEARCH_ENDPOINT");
    const SEARCH_API_KEY = getEnv("SEARCH_API_KEY");
    const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "azureblob-index-content";

    // We intentionally keep the query simple for baseline stability:
    // search = partName, top = 5
    const searchUrl =
      `${SEARCH_ENDPOINT.replace(/\/$/, "")}` +
      `/indexes/${encodeURIComponent(SEARCH_INDEX_CONTENT)}/docs/search?api-version=2023-11-01`;

    const searchPayload = {
      search: partName,
      top: 5,
      queryType: "simple",
      select: "*",
    };

    const searchResp = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": SEARCH_API_KEY,
      },
      body: JSON.stringify(searchPayload),
    });

    const searchText = await searchResp.text();
    if (!searchResp.ok) {
      return jsonRes(context, 500, {
        ok: false,
        deployTag: DEPLOY_TAG,
        stage: "search",
        error: `Search failed: HTTP ${searchResp.status}`,
        raw: searchText.slice(0, 2000),
      });
    }

    const searchJson = safeJsonParse(searchText) || {};
    const hits = Array.isArray(searchJson.value) ? searchJson.value : [];

    // Build a compact source block (baseline: just smash text together)
    // Try common fields; fall back to stringifying the doc.
    const sourcePieces = hits.map((doc, i) => {
      const text =
        doc.content ||
        doc.text ||
        doc.chunk ||
        doc.pageContent ||
        doc.merged_content ||
        JSON.stringify(doc);
      return `SOURCE ${i + 1}\n${String(text)}`.slice(0, 2500);
    });

    // Hard cap total chars to avoid token explosions
    let sources = sourcePieces.join("\n\n");
    if (sources.length > 8000) sources = sources.slice(0, 8000);

    // --- 2) Azure OpenAI (single call, JSON-only output) ---
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
    const user = `
Create ${desiredCount} multiple-choice questions from the sources below.

Rules:
- Output ONLY JSON with this exact shape:
  { "items": [ { "id":"1", "type":"mcq", "question":"...", "options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}], "answer":"A", "cite":"SOURCE 1" } ] }
- Each cite MUST be one of: "SOURCE 1" .. "SOURCE 5"
- Keep questions specific and useful.

PART NAME: ${partName}

SOURCES:
${sources}
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
      headers: {
        "Content-Type": "application/json",
        "api-key": AOAI_API_KEY,
      },
      body: JSON.stringify(aoaiPayload),
    });

    const aoaiText = await aoaiResp.text();
    if (!aoaiResp.ok) {
      return jsonRes(context, 500, {
        ok: false,
        deployTag: DEPLOY_TAG,
        stage: "aoai",
        error: `AOAI failed: HTTP ${aoaiResp.status}`,
        raw: aoaiText.slice(0, 2000),
      });
    }

    const aoaiJson = safeJsonParse(aoaiText) || {};
    const content =
      aoaiJson?.choices?.[0]?.message?.content ||
      aoaiJson?.choices?.[0]?.text ||
      "";

    const parsed = safeJsonParse(content);

    // Final response (baseline truth)
    return jsonRes(context, 200, {
      ok: true,
      deployTag: DEPLOY_TAG,
      model: AOAI_DEPLOYMENT,
      part: partName,
      debug: {
        hits: hits.length,
        sourceChars: sources.length,
      },
      items: parsed?.items || [],
      raw: parsed ? undefined : String(content).slice(0, 2000),
    });
  } catch (err) {
    // If we reach here, we *should* still return JSON
    return jsonRes(context, 500, {
      ok: false,
      deployTag: DEPLOY_TAG,
      stage: "catch",
      error: err?.message || String(err),
      stack: err?.stack ? String(err.stack).slice(0, 2000) : undefined,
    });
  }
};
