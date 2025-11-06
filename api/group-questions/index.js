const fetch = global.fetch;

// --- helpers ---
function send(context, code, body) {
  context.res = {
    status: code,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body
  };
}
function bad(context, msg, extra={}) { return send(context, 400, { ok:false, error: msg, ...extra }); }

// --- env (same shape you already use elsewhere) ---
const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT?.replace(/\/+$/,'') || "";
const SEARCH_INDEX    = process.env.SEARCH_INDEX || "";
const SEARCH_API_KEY  = process.env.SEARCH_API_KEY || "";

const AOAI_ENDPOINT   = (process.env.OPENAI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/,'');
const AOAI_KEY        = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY || process.env.AOAI_API_KEY || "";
const DEPLOYMENT      = process.env.OPENAI_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AOAI_DEPLOYMENT || process.env.AOAI_DEPLOYMENT_TURBO || "roofvault-turbo";
const API_VER         = process.env.OPENAI_API_VERSION || "2024-08-01-preview";

// --- constants ---
const MAX_COMBINED = 120_000;   // cap source text to keep prompts snappy
const SELECT = "id,metadata_storage_name,metadata_storage_path,content";

async function searchBook({ book, filterField = "metadata_storage_name", top = 8 }) {
  if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
    throw new Error("SEARCH_ENV_MISSING");
  }
  const filter = book ? `${filterField} eq '${book.replace(/'/g, "''")}'` : null;
  const body = {
    search: "*",
    select: SELECT,
    queryType: "simple",
    top,
    ...(filter ? { filter } : {})
  };
  const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2024-07-01`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "api-key": SEARCH_API_KEY
    },
    body: JSON.stringify(body)
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`SEARCH_HTTP_${r.status}: ${t}`);
  let j; try{ j = JSON.parse(t) } catch { throw new Error("SEARCH_BAD_JSON"); }
  const hits = Array.isArray(j.value) ? j.value : [];
  const combined = hits.map(h => String(h.content || "")).join("\n\n---\n\n");
  return {
    hits: hits.length,
    firstKeys: hits[0] ? Object.keys(hits[0]) : [],
    combined: combined.slice(0, MAX_COMBINED)
  };
}

function buildModelUrl(){
  if (!AOAI_ENDPOINT || !DEPLOYMENT || !AOAI_KEY) throw new Error("OPENAI_ENV_MISSING");
  return `${AOAI_ENDPOINT}/openai/deployments/${encodeURIComponent(DEPLOYMENT)}/chat/completions?api-version=${encodeURIComponent(API_VER)}`;
}

async function genMcqs({ combined, citeName, count }) {
  const chatUrl = buildModelUrl();

  const sys = [
    "You generate exam-quality multiple-choice questions (MCQs) strictly from the provided SOURCE passages.",
    "Return ONLY JSON that matches the given JSON schema."
  ].join(" ");

  const schema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id:        { type:"string" },
            type:      { const:"mcq" },
            question:  { type:"string" },
            options:   { type:"array", items:{ type:"object", properties:{ id:{type:"string"}, text:{type:"string"} }, required:["id","text"], additionalProperties:false }, minItems:4, maxItems:4 },
            answer:    { type:"string" },
            cite:      { type:"string" },
            explanation:{ type:"string" }
          },
          required: ["id","type","question","options","answer","cite","explanation"],
          additionalProperties: false
        },
        minItems: count, maxItems: count
      }
    },
    required: ["items"],
    additionalProperties: false
  };

  const user = [
    `Create ${count} exam-quality MCQs strictly from the SOURCE below.`,
    `- Use clear, specific stems; do NOT use “Which option is most correct.”`,
    `- Provide exactly 4 options labeled A–D.`,
    `- The correct answer must be explicitly derivable from the source.`,
    `- Cite: use "${citeName}" for each item.`,
    `- For EACH question, include a concise "explanation" (1–2 sentences) justifying WHY the correct option is correct based only on the source.`,
    "",
    "SOURCE (verbatim, may include OCR noise):",
    combined
  ].join("\n");

  const payload = {
    messages: [{ role:"system", content: sys }, { role:"user", content: user }],
    temperature: 0.2,
    response_format: { type: "json_schema", json_schema: { name:"mcq_list", schema } }
  };

  const headers = { "Content-Type":"application/json", "api-key": AOAI_KEY };
  const res = await fetch(chatUrl, { method:"POST", headers, body: JSON.stringify(payload) });
  const txt = await res.text();
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${txt}`);
  let j; try { j = JSON.parse(txt) } catch { throw new Error("MODEL_BAD_JSON"); }
  const content = j?.choices?.[0]?.message?.content;
  if (!content) throw new Error("MODEL_NO_CONTENT");
  let parsed; try { parsed = JSON.parse(content) } catch { throw new Error("MODEL_CONTENT_NOT_JSON"); }
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  if (items.length !== count) throw new Error(`MODEL_COUNT_MISMATCH: got ${items.length}, want ${count}`);
  return items;
}

async function classifyToObjectives({ items, objectives }) {
  const chatUrl = buildModelUrl();

  const sys = "You assign each MCQ to exactly one objective from the provided objective catalog. Return ONLY JSON per schema.";
  const schema = {
    type: "object",
    properties: {
      assignments: {
        type: "array",
        items: {
          type:"object",
          properties: {
            id: { type:"string" },          // MCQ id
            objectiveId: { type:"string" }, // one of objectives[].id
            objectiveTitle: { type:"string" }
          },
          required:["id","objectiveId","objectiveTitle"],
          additionalProperties:false
        }
      }
    },
    required:["assignments"],
    additionalProperties:false
  };

  const user = [
    "OBJECTIVES (id :: title):",
    ...objectives.map(o => `- ${o.id} :: ${o.title}`),
    "",
    "QUESTIONS (id :: question):",
    ...items.map(it => `- ${it.id} :: ${it.question}`),
    "",
    "Return JSON with { assignments:[{id, objectiveId, objectiveTitle}] } where objectiveId is one of the provided ids."
  ].join("\n");

  const payload = {
    messages:[{ role:"system", content: sys }, { role:"user", content: user }],
    temperature: 0,
    response_format: { type:"json_schema", json_schema:{ name:"assignments", schema } }
  };

  const headers = { "Content-Type":"application/json", "api-key": AOAI_KEY };
  const res = await fetch(chatUrl, { method:"POST", headers, body: JSON.stringify(payload) });
  const txt = await res.text();
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${txt}`);
  let j; try { j = JSON.parse(txt) } catch { throw new Error("MODEL_BAD_JSON_2"); }
  const content = j?.choices?.[0]?.message?.content;
  if (!content) throw new Error("MODEL_NO_CONTENT_2");
  let parsed; try { parsed = JSON.parse(content) } catch { throw new Error("MODEL_CONTENT_NOT_JSON_2"); }
  const assignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
  return assignments;
}

module.exports = async function (context, req) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
    return;
  }

  try{
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const objectives = Array.isArray(body.objectives) ? body.objectives : [];
    const books = Array.isArray(body.books) ? body.books.filter(Boolean) : [];
    const countPerBook = Math.max(1, Math.min(50, Number(body.countPerBook || 5)));
    const filterField = body.filterField || "metadata_storage_name";

    if (!books.length) return bad(context, "Missing 'books' (array of filenames).");
    if (!objectives.length) return bad(context, "Missing 'objectives' (array of {id,title}).");

    const allItems = [];
    const diag = { books:[], note:"group-questions v1" };

    // For each book: search -> generate MCQs
    for (const book of books) {
      const s = await searchBook({ book, filterField, top: 8 });
      diag.books.push({ book, searchHits: s.hits, firstDocKeys: s.firstKeys, combinedLen: s.combined.length });

      if (s.hits === 0 || !s.combined) continue;
      const mcqs = await genMcqs({ combined: s.combined, citeName: book, count: countPerBook });
      // augment with book name
      mcqs.forEach(m => { m.book = book; });
      allItems.push(...mcqs);
    }

    if (!allItems.length) return send(context, 200, { ok:true, groups:[], _diag: diag });

    // Classify each question to an objective
    const assignments = await classifyToObjectives({ items: allItems, objectives });

    // group the questions by objectiveId
    const map = new Map();
    for (const a of assignments) {
      map.set(a.id, a);
    }
    const byObjective = new Map();
    for (const it of allItems) {
      const a = map.get(it.id);
      const key = a?.objectiveId || "UNASSIGNED";
      const title = a?.objectiveTitle || "Unassigned";
      if (!byObjective.has(key)) byObjective.set(key, { objectiveId:key, objectiveTitle:title, items:[] });
      byObjective.get(key).items.push(it);
    }
    const groups = [...byObjective.values()].map(g => ({ ...g, count: g.items.length }));

    return send(context, 200, { ok:true, groups, _diag: diag });
  } catch(e){
    return send(context, 500, { ok:false, error: String(e?.message||e), stack: String(e?.stack||"") });
  }
};
