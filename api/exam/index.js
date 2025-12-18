const crypto = require("crypto");
const { TableClient } = require("@azure/data-tables");

const RWC_BANK = require("./rwc-question-bank-full").questions;

/**
 * /api/exam
 * POST { book: string, filterField: string, count?: number }
 * Returns: { items:[...], modelDeployment, _diag }
 *
 * NEW BEHAVIOR:
 * - Tracks seen question IDs in Azure Table Storage (per user + per book).
 * - On each Generate click, it tries to return NEW questions first.
 * - If not enough unseen exist, it will gracefully allow repeats to fill the request.
 */

// ======= CONFIG =======
const MAX_COUNT = 50;
const DEFAULT_COUNT = 25;
const GENERATE_MULTIPLIER = 2; // request extra so we can filter repeats
const MAX_GENERATION_ATTEMPTS = 2;

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
  // RowKey can contain lots of chars but keep it sane
  return String(s || "").slice(0, 512);
}

function safePartitionKey(s) {
  // PartitionKey best kept smaller; avoid crazy long keys
  return String(s || "").slice(0, 200);
}

function parseClientPrincipal(req) {
  // SWA auth user info
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

  // Prefer stable IDs when logged in:
  // cp.userId exists for AAD/AAD B2C, cp.userDetails often has email/UPN
  const userId =
    cp?.userId ||
    cp?.userDetails ||
    cp?.claims?.find?.((c) => c.typ === "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.val ||
    cp?.claims?.find?.((c) => c.typ === "emails")?.val;

  if (userId) return String(userId);

  // Anonymous fallback (won’t persist across devices, but prevents repeats within same browser sometimes)
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

// Helper to hard-fix Q103 + Q104 from the RWC guide
function patchRwcQuestion(q) {
  if (!q || typeof q !== "object") return q;

  if (q.number === 103) {
    const options = [
      { id: "A", text: "in a concrete construction joint with minimal movement, embedded in concrete on both sides as a waterstop" },
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
  // We store each seen question as an entity:
  // PartitionKey = pk (user|book), RowKey = questionId
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
    // If table is empty or perms are weird, don’t break exam gen
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

    const entity = {
      partitionKey: pk,
      rowKey,
      servedAt: now
    };

    try {
      // upsert = safe if user clicks twice quickly
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
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(t);
    return res;
  } finally {
    clearTimeout(t);
  }
}

// ======= MAIN FUNCTION =======
module.exports = async function (context, req) {
  const send = (status, obj) => {
    context.res = {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(obj ?? {})
    };
  };

  // DEBUG flag (shows real backend error when DEBUG_EXAM=1)
  const DEBUG = String(process.env.DEBUG_EXAM || "").toLowerCase() === "1";

  try {
    const body = (req && req.body) || {};
    const book = (body.book || "").trim();
    const filterField = (body.filterField || "metadata_storage_name").trim();
    const requestedCount = clampInt(body.count, 1, MAX_COUNT, DEFAULT_COUNT);

    // user + book “bucket”
    const userId = getUserId(req);
    const pk = safePartitionKey(`${userId}||${book || "(no-book)"}`);

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

      // Ensure stable IDs
      const normalized = bankMcqOnly.map((q) => {
        const id = q.id || stableIdFromText(q.question || q.prompt || q.text || `${q.number || ""}`);
        return { ...q, id };
      });

      // Prefer unseen first
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
      // If not enough unseen, allow repeats to fill
      for (const q of seenPool) {
        if (picked.length >= requestedCount) break;
        picked.push(q);
      }

      // Write only the ones we served (including repeats is fine; upsert makes it idempotent)
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
    // --- env
    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
    const SEARCH_INDEX = process.env.SEARCH_INDEX;

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
      searchIndex: SEARCH_INDEX,
      aoaiEndpointHost: (AOAI_ENDPOINT || "").replace(/https?:\/\//, "").split("/")[0],
      deployment: DEPLOYMENT || "(none)"
    };

    const SEARCH_INDEX_CONTENT = process.env.SEARCH_INDEX_CONTENT || "";

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

// Pull book content from CONTENT index (not meta)
const searchUrl = `${SEARCH_ENDPOINT.replace(/\/+$/, "")}/indexes/${encodeURIComponent(
  SEARCH_INDEX_CONTENT
)}/docs/search?api-version=2023-11-01`;

const filter = book ? `${filterField} eq '${book.replace(/'/g, "''")}'` : null;

const searchPayload = {
  search: "*",
  queryType: "simple",
  select: "bookGroupId,chunkId,metadata_storage_name,content",
  top: 5000,
  ...(filter ? { filter } : {})
};


    const sRes = await fetch(searchUrl, {
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
      return send(500, { error: "Search returned non-JSON", raw: sTxt.slice(0, 2000), _env: env2 });
    }

    const hits = Array.isArray(sJson.value) ? sJson.value : [];
    const texts = hits.map((h) => h.content || "").filter(Boolean);
    const citeName = book || hits[0]?.metadata_storage_name || "<mixed sources>";
    const combined = texts.join("\n\n").slice(0, 120000);

    if (combined.length < 1000) {
      return send(500, {
        error: "Not enough source text to generate questions.",
        _diag: { ...env2, searchHits: hits.length, combinedLen: combined.length }
      });
    }

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

    // We request extra so we can filter repeats.
    const want = Math.min(MAX_COUNT, Math.max(requestedCount, requestedCount * GENERATE_MULTIPLIER));

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
        combined
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

      const items = Array.isArray(parsed.items) ? parsed.items : [];
      return items;
    }

    // Try to build a "mostly unseen" set
    const picked = [];
    const pickedIds = new Set();

    let attempts = 0;
    while (picked.length < requestedCount && attempts < MAX_GENERATION_ATTEMPTS) {
      attempts++;

      const batchCount = Math.min(MAX_COUNT, want);
      const rawItems = await generateBatch(batchCount);

      // Normalize IDs (if model gives dupes/missing)
      for (const it of rawItems) {
        if (!it || typeof it !== "object") continue;

        const qText = it.question || it.prompt || it.text || "";
        const id = (it.id && String(it.id).trim()) || stableIdFromText(qText);

        const item = { ...it, id, type: "mcq" };

        // Skip if already picked in this response
        if (pickedIds.has(item.id)) continue;

        // Prefer unseen first
        if (!seen.has(item.id)) {
          picked.push(item);
          pickedIds.add(item.id);
          if (picked.length >= requestedCount) break;
        }
      }
    }

    // If still short, allow repeats to fill from last generated batch (or regenerate once more and allow repeats)
    if (picked.length < requestedCount) {
      const batch = await generateBatch(Math.min(MAX_COUNT, want));
      for (const it of batch) {
        if (picked.length >= requestedCount) break;
        if (!it || typeof it !== "object") continue;

        const qText = it.question || it.prompt || it.text || "";
        const id = (it.id && String(it.id).trim()) || stableIdFromText(qText);
        const item = { ...it, id, type: "mcq" };

        if (pickedIds.has(item.id)) continue;

        // allow repeats now
        picked.push(item);
        pickedIds.add(item.id);
      }
    }

    if (!picked.length) {
      return send(500, { error: "Model returned no usable items", _diag: { ...env2, ...envDiag } });
    }

    // Mark served questions as seen
    await markSeen(tableClient, pk, picked.map((q) => q.id));

    return send(200, {
      items: picked.slice(0, requestedCount),
      modelDeployment: DEPLOYMENT,
      _diag: {
        mode: "ai-seen-tracking",
        requested: requestedCount,
        returned: Math.min(picked.length, requestedCount),
        attempts,
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
    ...(String(process.env.DEBUG_EXAM || "").toLowerCase() === "1"
      ? { stack }
      : {})
  });
}
};
