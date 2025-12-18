const crypto = require("crypto");
const { TableClient } = require("@azure/data-tables");

// RWC bank (optional)
let RWC_BANK = null;
try {
  RWC_BANK = require("./rwc-question-bank-full")?.questions || null;
} catch {
  RWC_BANK = null;
}

/**
 * /api/exam
 * POST:
 *   { parts: [fileName...], count?: 25 }
 *   OR { bookGroupId: "...", count?: 25 }
 *   OR { book: "...", filterField?: "metadata_storage_name", count?: 25 }
 *
 * Returns:
 *   { items:[...], modelDeployment, _diag }
 *
 * Notes:
 * - Uses SEARCH_INDEX_CONTENT only (your content index).
 * - Table Storage seen tracking per user+bucket.
 * - GET is a healthcheck (never runs AI).
 */

// ======= CONFIG =======
const MAX_COUNT = 50;
const DEFAULT_COUNT = 25;

// Keep each OpenAI call small to avoid timeouts + S0 rate limits
const BATCH_SIZE = 5;

// Caps the search text we send to OpenAI (critical for stability)
const MAX_SOURCE_CHARS = 18000;

// ======= HELPERS =======
function clampInt(n, min, max, fallback) {
  const v = parseInt(n, 10);
  if (Number.isFinite(v)) return Math.min(Math.max(v, min), max);
  return fallback;
}

function stableIdFromText(s) {
  const t = String(s || "").trim();
  if (!t) return "q_" + crypto.randomBytes(6).toString("hex");
  return "q_" + crypto.createHash("sha1").update(t).digest("hex").slice(0, 20);
}

function safeRowKey(s) {
  return String(s || "").slice(0, 512);
}

function safePartitionKey(s) {
  return String(s || "").slice(0, 200);
}

function parseClientPrincipal(req) {
  const hdr =
    req?.headers?.["x-ms-client-principal"] ||
    req?.headers?.["X-MS-CLIENT-PRINCIPAL"];
  if (!hdr) return null;
  try {
    const decoded = Buffer.from(hdr, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getUserId(req) {
  const cp = parseClientPrincipal(req);

  const userId =
    cp?.userId ||
    cp?.userDetails ||
    cp?.claims?.find?.(
      (c) =>
        c.typ ===
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    )?.val ||
    cp?.claims?.find?.((c) => c.typ === "emails")?.val;

  if (userId) return String(userId);

  const anon =
    req?.headers?.["x-forwarded-for"] ||
    req?.headers?.["X-Forwarded-For"] ||
    "anon";
  return `anon:${String(anon).split(",")[0].trim()}`;
}

function isRwcStudyGuide(book) {
  const lower = String(book || "").toLowerCase();
  return lower.includes("rwc") && lower.includes("study") && lower.includes("guide");
}

// Hard patch for RWC Q103/Q104
function patchRwcQuestion(q) {
  if (!q || typeof q !== "object") return q;

  if (q.number === 103) {
    const options = [
      {
        id: "A",
        text:
          "in a concrete construction joint with minimal movement, embedded in concrete on both sides as a waterstop"
      },
      { id: "B", text: "at control joints in gypsum board partitions" },
      { id: "C", text: "at expansion joints in metal roof panels" },
      { id: "D", text: "as an exterior surface seal on masonry veneer" }
    ];
    return {
      ...q,
      type: "mcq",
      options,
      answer: "A",
      multi: false,
      correctIndexes: [0],
      expectedSelections: 1,
      explanation:
        q.explanation ||
        "A PVC dumbbell waterstop is intended for use in concrete construction joints with minimal movement, embedded in concrete on both sides to act as a waterstop."
    };
  }

  if (q.number === 104) {
    const options = [
      { id: "A", text: "Integral crystalline admixture" },
      { id: "B", text: "Air entrainment" },
      { id: "C", text: "Ordinary reinforcing steel" },
      { id: "D", text: "Exterior paint only" }
    ];
    return {
      ...q,
      type: "mcq",
      options,
      answer: "A,B",
      multi: true,
      correctIndexes: [0, 1],
      expectedSelections: 2,
      explanation:
        q.explanation ||
        "Integral crystalline admixtures and (in this study guide context) air entrainment are treated as waterproofing approaches for concrete; the other options are not primary waterproofing methods."
    };
  }

  return q;
}

function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getTableClient() {
  const conn = process.env.TABLES_CONNECTION_STRING;
  const tableName = process.env.EXAM_SEEN_TABLE || "TRVExamSeen";
  if (!conn) return null;
  return TableClient.fromConnectionString(conn, tableName);
}

async function loadSeenIds(tableClient, pk) {
  const seen = new Set();
  if (!tableClient) return seen;

  try {
    const entities = tableClient.listEntities({
      queryOptions: { filter: `PartitionKey eq '${pk.replace(/'/g, "''")}'` }
    });

    for await (const e of entities) {
      if (e?.rowKey) seen.add(String(e.rowKey));
    }
  } catch (e) {
    console.warn("loadSeenIds failed:", e?.message || e);
  }

  return seen;
}

async function markSeen(tableClient, pk, questionIds) {
  if (!tableClient) return { wrote: 0 };
  const now = new Date().toISOString();
  let wrote = 0;

  for (const qid of questionIds) {
    const rowKey = safeRowKey(qid);
    if (!rowKey) continue;

    const entity = { partitionKey: pk, rowKey, servedAt: now };

    try {
      await tableClient.upsertEntity(entity, "Merge");
      wrote++;
    } catch (e) {
      console.warn("markSeen upsert failed:", e?.message || e);
    }
  }
  return { wrote };
}

async function safeFetch(url, opts = {}, timeoutMs = 45000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ======= MAIN FUNCTION =======
module.exports = async function (context, req) {
  const send = (status, obj) => {
    context.res = {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      },
      body: JSON.stringify(obj ?? {})
    };
  };

  // CORS preflight
  if ((req?.method || "").toUpperCase() === "OPTIONS") {
    context.res = {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept"
      }
    };
    return;
  }

  // Healthcheck (never runs search/model)
  if ((req?.method || "").toUpperCase() === "GET") {
    return send(200, {
      ok: true,
      route: "exam",
      usage:
        "POST JSON: {parts:[...],count:25} OR {bookGroupId:'...',count:25} OR {book:'...',filterField:'metadata_storage_name',count:25}"
    });
  }

  // Debug flag (exposes stack)
  const DEBUG = String(process.env.DEBUG_EXAM || "").toLowerCase() === "1";

  try {
    const body = (req && req.body) || {};

    const book = String(body.book || "").trim();
    const bookGroupId = String(body.bookGroupId || "").trim();
    const filterField = String(body.filterField || "metadata_storage_name").trim();

    const parts = Array.isArray(body.parts)
      ? body.parts.map((s) => String(s || "").trim()).filter(Boolean)
      : [];

    const requestedCount = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    // Require a selection (prevents accidental “search everything”)
    if (!parts.length && !bookGroupId && !book) {
      return send(400, {
        error: "Missing selection. Provide parts[] or bookGroupId or book."
      });
    }

    // user + bucket
    const userId = getUserId(req);
    const bucketLabel = bookGroupId || book || (parts.length ? "parts" : "(no-book)");
    const pk = safePartitionKey(`${userId}||${bucketLabel}`);

    const tableClient = await getTableClient();
    const seen = await loadSeenIds(tableClient, pk);

    const envDiag = {
      userBucket: pk,
      seenCount: seen.size,
      tableEnabled: !!tableClient
    };

    // ======= RWC STATIC PATH =======
    if (isRwcStudyGuide(book) && Array.isArray(RWC_BANK) && RWC_BANK.length) {
      const patchedAll = RWC_BANK.map(patchRwcQuestion);
      const bankMcqOnly = patchedAll.filter((q) => {
        if (!q) return false;
        if (!Array.isArray(q.options) || q.options.length < 2) return false;
        if (typeof q.answer !== "string" || !q.answer.trim()) return false;
        return true;
      });

      const normalized = bankMcqOnly.map((q) => {
        const id =
          q.id || stableIdFromText(q.question || q.prompt || q.text || `${q.number || ""}`);
        return { ...q, id };
      });

      const shuffled = fisherYatesShuffle(normalized);
      const unseenFirst = [];
      const seenPool = [];

      for (const q of shuffled) {
        if (seen.has(q.id)) seenPool.push(q);
        else unseenFirst.push(q);
      }

      const picked = [];
      for (const q of unseenFirst) {
        if (picked.length >= requestedCount) break;
        picked.push(q);
      }
      for (const q of seenPool) {
        if (picked.length >= requestedCount) break;
        picked.push(q);
      }

      await markSeen(tableClient, pk, picked.map((q) => q.id));

      return send(200, {
        items: picked,
        modelDeployment: "RWC-STATIC-BANK",
        _diag: {
          mode: "rwc-bank-js-seen",
          totalAvailable: normalized.length,
          requested: requestedCount,
          returned: picked.length,
          unseenAvailable: unseenFirst.length,
          ...envDiag
        }
      });
    }

    // ======= AI PATH =======
    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY = process.env.SEARCH_API_KEY;

    // IMPORTANT: use CONTENT index only
    const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT;

    const AOAI_ENDPOINT =
      process.env.AZURE_OPENAI_ENDPOINT ||
      process.env.OPENAI_ENDPOINT ||
      process.env.AOAI_ENDPOINT;

    const AOAI_KEY =
      process.env.AZURE_OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.AOAI_KEY;

    const DEPLOYMENT =
      process.env.EXAM_OPENAI_DEPLOYMENT ||
      process.env.AZURE_OPENAI_DEPLOYMENT ||
      process.env.OPENAI_DEPLOYMENT ||
      process.env.AOAI_DEPLOYMENT_TURBO ||
      process.env.DEFAULT_MODEL ||
      process.env.OPENAI_GPT4O_MINI;

    const env2 = {
      searchEndpoint: (SEARCH_ENDPOINT || "").replace(/https?:\/\//, "").split("/")[0],
      searchIndexContent: SEARCH_INDEX_CONTENT || "(none)",
      aoaiEndpointHost: (AOAI_ENDPOINT || "").replace(/https?:\/\//, "").split("/")[0],
      deployment: DEPLOYMENT || "(none)"
    };

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY || !SEARCH_INDEX_CONTENT) {
      return send(500, {
        error: "Missing SEARCH_* env vars (content index required)",
        _env: env2
      });
    }

    if (!AOAI_ENDPOINT || !AOAI_KEY || !DEPLOYMENT) {
      return send(500, {
        error: "Missing OpenAI/Azure OpenAI env (endpoint/key/deployment)",
        _env: env2
      });
    }

    // Pull content from CONTENT index
    const searchUrl = `${SEARCH_ENDPOINT.replace(/\/+$/, "")}/indexes/${encodeURIComponent(
      SEARCH_INDEX_CONTENT
    )}/docs/search?api-version=2023-11-01`;

    let filter = null;

    if (parts.length) {
      const ors = parts.map((p) => `${filterField} eq '${p.replace(/'/g, "''")}'`);
      filter = `(${ors.join(" or ")})`;
    } else if (bookGroupId) {
      filter = `bookGroupId eq '${bookGroupId.replace(/'/g, "''")}'`;
    } else if (book) {
      filter = `${filterField} eq '${book.replace(/'/g, "''")}'`;
    }

    const searchPayload = {
      search: "*",
      queryType: "simple",
      select: "bookGroupId,chunkId,metadata_storage_name,content",
      top: 5000,
      ...(filter ? { filter } : {})
    };

    const sRes = await safeFetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify(searchPayload)
    }).catch((e) => {
      throw new Error("FETCH_SEARCH_FAILED: " + (e?.message || e));
    });

    const sTxt = await sRes.text().catch(() => "");
    if (!sRes.ok) {
      return send(500, { error: `Search HTTP ${sRes.status}`, raw: sTxt, _env: env2 });
    }

    let sJson;
    try {
      sJson = JSON.parse(sTxt);
    } catch {
      return send(500, {
        error: "Search returned non-JSON",
        raw: sTxt.slice(0, 2000),
        _env: env2
      });
    }

    const hits = Array.isArray(sJson.value) ? sJson.value : [];
    const texts = hits.map((h) => h?.content || "").filter(Boolean);

    const citeName =
      (parts.length === 1 ? parts[0] : null) ||
      book ||
      hits[0]?.metadata_storage_name ||
      "<mixed sources>";

    const combined = texts.join("\n\n").slice(0, 120000);

    if (combined.length < 1000) {
      return send(500, {
        error: "Not enough source text to generate questions.",
        _diag: { ...env2, ...envDiag, searchHits: hits.length, combinedLen: combined.length }
      });
    }

    const combinedCapped =
      typeof combined === "string" && combined.length > MAX_SOURCE_CHARS
        ? combined.slice(0, MAX_SOURCE_CHARS)
        : combined;

    // OpenAI request setup
    const isAzure = /azure\.com/i.test(AOAI_ENDPOINT);
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";

    const chatUrl = isAzure
      ? `${AOAI_ENDPOINT.replace(/\/+$/, "")}/openai/deployments/${encodeURIComponent(
          DEPLOYMENT
        )}/chat/completions?api-version=${apiVersion}`
      : `${AOAI_ENDPOINT.replace(/\/+$/, "")}/v1/chat/completions`;

    const headers = { "Content-Type": "application/json" };
    if (isAzure) headers["api-key"] = AOAI_KEY;
    else headers["Authorization"] = `Bearer ${AOAI_KEY}`;

    const sys =
      "You are an expert item-writer for roofing/structures exams. " +
      "Write strictly factual, unambiguous multiple-choice questions from the provided source text. " +
      "Each question must be answerable from the source; do not invent facts. " +
      "Output ONLY valid JSON matching the schema provided.";

    const schema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { const: "mcq" },
              question: { type: "string" },
              options: {
                type: "array",
                items: {
                  type: "object",
                  properties: { id: { type: "string" }, text: { type: "string" } },
                  required: ["id", "text"],
                  additionalProperties: false
                },
                minItems: 4,
                maxItems: 4
              },
              answer: { type: "string" },
              cite: { type: "string" },
              explanation: { type: "string" }
            },
            required: ["id", "type", "question", "options", "answer", "cite", "explanation"],
            additionalProperties: false
          },
          minItems: 1
        }
      },
      required: ["items"],
      additionalProperties: false
    };

    async function generateBatch(batchCount) {
      const user = [
        `Create ${batchCount} exam-quality MCQs strictly from the SOURCE below.`,
        `- Use clear, specific stems.`,
        `- Provide exactly 4 options labeled A–D.`,
        `- The correct answer must be derivable from the source.`,
        `- Cite: use "${citeName}" for each item.`,
        `- Include a concise explanation (1–2 sentences) based ONLY on the source.`,
        "",
        "SOURCE (verbatim, may include OCR noise):",
        combinedCapped
      ].join("\n");

      const payload = {
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user }
        ],
        temperature: 0.3,
        response_format: {
          type: "json_schema",
          json_schema: { name: "mcq_list", schema }
        }
      };

      const mRes = await safeFetch(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const mTxt = await mRes.text().catch(() => "");
      if (!mRes.ok) {
        throw new Error(`OPENAI_HTTP_${mRes.status}: ${mTxt.slice(0, 2000)}`);
      }

      let mJson;
      try {
        mJson = JSON.parse(mTxt);
      } catch {
        throw new Error("MODEL_RETURNED_NON_JSON");
      }

      const content = mJson?.choices?.[0]?.message?.content;
      if (!content) throw new Error("NO_MODEL_CONTENT");

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("CONTENT_NOT_VALID_JSON");
      }

      return Array.isArray(parsed.items) ? parsed.items : [];
    }

    async function generateBatchWithRetry(n) {
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          return await generateBatch(n);
        } catch (e) {
          const msg = String(e?.message || e);

          if (msg.includes("OPENAI_HTTP_429") || msg.includes("RateLimitReached")) {
            const m = msg.match(/retry after\s+(\d+)\s+seconds/i);
            const waitSec = m ? parseInt(m[1], 10) : 10;
            await sleep((waitSec + 1) * 1000);
            continue;
          }

          throw e;
        }
      }
      throw new Error("Exceeded retry attempts due to OpenAI rate limiting");
    }

    // Build mostly-unseen set
    const picked = [];
    const pickedIds = new Set();
    const repeatPool = [];

    // Keep generating until we have enough (or we hit a safe cap)
const MAX_BATCH_RUNS = 12; // safety cap to avoid infinite loops
let runs = 0;

while (picked.length < requestedCount && runs < MAX_BATCH_RUNS) {
  runs++;

  const need = requestedCount - picked.length;
  const n = Math.min(BATCH_SIZE, need);
  if (n <= 0) break;

  const rawItems = await generateBatchWithRetry(n);

  // If the model returned nothing, don't spin forever
  if (!Array.isArray(rawItems) || rawItems.length === 0) break;

  for (const it of rawItems) {
    if (!it || typeof it !== "object") continue;

    const qText = it.question || it.prompt || it.text || "";
    if (!qText) continue;

    const id = (it.id && String(it.id).trim()) || stableIdFromText(qText);
    if (pickedIds.has(id)) continue;

    const item = { ...it, id, type: "mcq" };

    if (!seen.has(id) && picked.length < requestedCount) {
      picked.push(item);
      pickedIds.add(id);
    } else {
      repeatPool.push(item);
    }

    if (picked.length >= requestedCount) break;
  }
}

    // Fill with repeats if needed
    for (const it of repeatPool) {
      if (picked.length >= requestedCount) break;
      if (!pickedIds.has(it.id)) {
        picked.push(it);
        pickedIds.add(it.id);
      }
    }

    if (!picked.length) {
      return send(500, { error: "Model returned no usable items", _diag: { ...env2, ...envDiag } });
    }

    await markSeen(tableClient, pk, picked.map((q) => q.id));

    return send(200, {
      items: picked.slice(0, requestedCount),
      modelDeployment: DEPLOYMENT,
      _diag: {
        mode: "ai-seen-tracking",
        requested: requestedCount,
        returned: Math.min(picked.length, requestedCount),
        runs,
        ...env2,
        ...envDiag
      }
    });
  } catch (err) {
    const msg = err?.message || String(err);
    const stack = err?.stack || null;

    return send(500, {
      error: "Backend call failure",
      message: msg,
      ...(DEBUG ? { stack } : {})
    });
  }
};
