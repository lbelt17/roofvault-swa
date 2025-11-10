if (!global.fetch) {
  throw new Error("❌ global.fetch missing in Azure runtime");
}

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled rejection:", err?.message || err);
});

console.log("✅ group-questions handler loaded");
module.exports = async function (context, req) {
  // --- Guards for runtime ---
  if (!(global && global.fetch)) {
    context.res = { status: 500, body: { error: "global.fetch not available in Functions runtime" } };
    return;
  }
  const fetch = global.fetch;

  // --- ENV ---
  const rawSearchEndpoint = process.env.SEARCH_ENDPOINT || "";
  const SEARCH_ENDPOINT   = rawSearchEndpoint.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const SEARCH_API_KEY    = process.env.SEARCH_API_KEY || "";
  const SEARCH_INDEX      = process.env.SEARCH_INDEX || "azureblob-index";

  const OPENAI_ENDPOINT   = (process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_ENDPOINT || "").replace(/\/+$/,"");
  const OPENAI_API_KEY    = (process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "");
  const OPENAI_DEPLOYMENT = (process.env.AZURE_OPENAI_DEPLOYMENT || process.env.OPENAI_DEPLOYMENT || process.env.DEFAULT_MODEL || "roofvault-turbo");
  const OPENAI_API_VERSION= process.env.OPENAI_API_VERSION || "2024-06-01"; // chat/completions stable

  // --- Helpers ---
  function send(code, obj) {
    context.res = { status: code, headers: { "Content-Type":"application/json" }, body: obj };
  }

  // Parse body (handle both JSON and already-parsed)
  let body = {};
  try {
    body = (req.body && typeof req.body === "object") ? req.body : JSON.parse(req.rawBody || req.body || "{}");
  } catch { body = {}; }

  const { objectives, books, filterField = "metadata_storage_name", countPerBook = 2, topK = 5 } = body || {};

  if (!Array.isArray(objectives) || objectives.length === 0) return send(400, { error: "Missing 'objectives'[]" });
  if (!Array.isArray(books) || books.length === 0)        return send(400, { error: "Missing 'books'[]" });
  if (!SEARCH_ENDPOINT || !SEARCH_API_KEY || !SEARCH_INDEX) return send(500, { error: "Search env not configured" });
  if (!OPENAI_ENDPOINT || !OPENAI_API_KEY || !OPENAI_DEPLOYMENT) return send(500, { error: "OpenAI env not configured" });

  async function fetchSourceForBook(bookName) {
    const safe = String(bookName).replace(/'/g,"''");
    const url  = `https://${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-11-01`;
    const payload = {
      count: false,
      search: "*",
      filter: `${filterField} eq '${safe}'`,
      select: "id,metadata_storage_name,metadata_storage_path,content",
      top: topK,
      queryType: "simple"
    };
    const r = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type":"application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify(payload)
    });
    const t = await r.text();
    if (!r.ok) throw new Error(`SEARCH_HTTP_${r.status}: ${t.slice(0,1500)}`);
    let j = {};
    try { j = JSON.parse(t); } catch { throw new Error("Search non-JSON"); }
    const docs = Array.isArray(j.value) ? j.value : [];
    const combined = docs.map(d => String(d.content || "")).join("\n\n---\n\n").slice(0, 120000);
    return { docs, combined };
  }

  async function genAndGroup_old(bookName, combinedText) {
    const schema = {
      type: "object",
      properties: {
        groups: {
          type: "array",
          items: {
            type: "object",
            properties: {
              objectiveId:   { type:"string" },
              objectiveTitle:{ type:"string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id:        { type:"string" },
                    type:      { const:"mcq" },
                    question:  { type:"string" },
                    options: {
                      type:"array",
                      minItems:4, maxItems:4,
                      items: {
                        type:"object",
                        properties: { id:{type:"string"}, text:{type:"string"} },
                        required: ["id","text"],
                        additionalProperties:false
                      }
                    },
                    answer:    { type:"string" },
                    explanation:{ type:"string" },
                    cite:      { type:"string" }
                  },
                  required: ["id","type","question","options","answer","explanation","cite"],
                  additionalProperties:false
                }
              }
            },
            required: ["objectiveId","objectiveTitle","items"],
            additionalProperties:false
          }
        }
      },
      required: ["groups"],
      additionalProperties: false
    };

    const sys = [
      "You are a meticulous exam-item writer and classifier for roofing publications.",
      "Return STRICT JSON only that matches the provided schema.",
      "No prose or markdown — JSON only."
    ].join("\n");

    const objLines = (objectives || []).map(o => `- ${o.id}: ${o.title}`).join("\n");

    const user = [
      `SOURCE: ${bookName}`,
      "",
      `OBJECTIVES (choose exactly one objective per question):`,
      objLines,
      "",
      `TASK:`,
      `1) From the SOURCE EXCERPT below, create ${countPerBook} high-quality MCQs (A–D) with one correct answer.`,
      `2) For EACH MCQ, include a 1–2 sentence 'explanation' justifying the correct answer.`,
      `3) Immediately GROUP the new MCQs under the most relevant objective (by id and title).`,
      `4) Use "${bookName}" as the cite for each MCQ.`,
      "",
      `IMPORTANT:`,
      `- Only use information in the SOURCE EXCERPT (no outside knowledge).`,
      `- If the excerpt is noisy (OCR), do your best to craft accurate, directly supported items.`,
      "",
      `RETURN: a JSON object with a 'groups' array. Each element has { objectiveId, objectiveTitle, items:[...MCQs...] }.`,
      "",
      "SOURCE EXCERPT (verbatim, may include OCR noise):",
      String(combinedText || "").slice(0, 120000)
    ].join("\n");

    const url = `${OPENAI_ENDPOINT}/openai/deployments/${encodeURIComponent(OPENAI_DEPLOYMENT)}/chat/completions?api-version=${encodeURIComponent(OPENAI_API_VERSION)}`;
    const payload = {
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user",   content: user }
      ]
    };

    const headers = { "Content-Type":"application/json", "api-key": OPENAI_API_KEY };
    const r = await fetchFn(url, { method:"POST", headers, body: JSON.stringify(payload) });
    const t = await r.text();
    if (!r.ok) throw new Error(`OpenAI HTTP ${r.status}: ${t.slice(0,1500)}`);
    let j = {};
    try { j = JSON.parse(t); } catch { throw new Error("OpenAI non-JSON"); }

    const content = j?.choices?.[0]?.message?.content || "";
    if (!content) throw new Error("OpenAI: missing content");
    let parsed = {};
    try { parsed = JSON.parse(content); } catch { throw new Error("OpenAI content not JSON"); }
    const groups = Array.isArray(parsed.groups) ? parsed.groups : [];

// --- Normalize items so downstream is happy ---
(function normalizeAll() {
  let counter = 0;
  function newId() { counter += 1; return `q${counter}`; }

  function toOptionObjects(arr) {
    if (!Array.isArray(arr)) return [];
    if (arr.length && typeof arr[0] === "object") return arr;
    const labels = ["A","B","C","D","E","F","G"];
    return arr.map((txt, i) => ({ id: labels[i] || String(i+1), text: String(txt ?? "") }));
  }

  for (const g of groups) {
    if (!g || !Array.isArray(g.items)) continue;
    g.items = g.items.map((it) => {
      const question = it.question || it.stem || it.prompt || "";
      const optionsRaw = it.options || it.choices || [];
      const options = toOptionObjects(optionsRaw);

      let answer = it.answer_id || it.answer || it.correct || "";
      // If answer looks like a number (1-based), map index -> option id
      if (/^\d+$/.test(String(answer)) && options.length) {
        const idx = Math.max(0, Math.min(options.length - 1, Number(answer) - 1));
        answer = options[idx]?.id ?? answer;
      }
      // If answer is full text, map to matching option id
      if (answer && options.length && !options.some(o => o.id === answer)) {
        const hit = options.find(o => String(o.text).trim().toLowerCase() === String(answer).trim().toLowerCase());
        if (hit) answer = hit.id;
      }

      return {
        id: it.id || newId(),
        type: "mcq",
        question,
        options,
        answer,
        explanation: it.explanation || it.rationale || "",
        cite: it.cite || g.source || ""
      };
    });
  }
})();

// --- Normalize items so downstream is happy ---
(function normalizeAll() {
  let counter = 0;
  function newId() { counter += 1; return `q${counter}`; }

  function toOptionObjects(arr) {
    if (!Array.isArray(arr)) return [];
    if (arr.length && typeof arr[0] === "object") return arr;
    const labels = ["A","B","C","D","E","F","G"];
    return arr.map((txt, i) => ({ id: labels[i] || String(i+1), text: String(txt ?? "") }));
  }

  for (const g of groups) {
    if (!g || !Array.isArray(g.items)) continue;
    g.items = g.items.map((it) => {
      const question = it.question || it.stem || it.prompt || "";
      const optionsRaw = it.options || it.choices || [];
      const options = toOptionObjects(optionsRaw);
      let answer = it.answer_id || it.answer || it.correct || "";
      // If answer looks like a number and options have ids A/B/C..., map index->id
      if (/^\d+$/.test(String(answer)) && options.length) {
        const idx = Math.max(0, Math.min(options.length-1, Number(answer) - 1));
        answer = options[idx]?.id ?? answer;
      }
      // If answer looks like the full text, map to matching option id
      if (answer && options.length && !options.some(o => o.id === answer)) {
        const hit = options.find(o => String(o.text).trim().toLowerCase() === String(answer).trim().toLowerCase());
        if (hit) answer = hit.id;
      }
      return {
        id: it.id || newId(),
        type: "mcq",
        question,
        options,
        answer,
        explanation: it.explanation || it.rationale || "",
        cite: it.cite || g.source || ""
      };
    });
  }
})();

    // ensure cite
    for (const g of groups) for (const it of (g.items||[])) if (!it.cite) it.cite = bookName;
    return groups;
  }

  try {
    const agg = new Map(); // objectiveId -> {objectiveId, objectiveTitle, items:[]}
    for (const book of books) {
      const { combined } = await fetchSourceForBook(book);
if ((req.query && req.query.mode === 'search-only') || (body && body.mode === 'search-only')) {
  return send(res, 200, { ok: true, stage: 'after-search', book, bytes: (combined || '').length });
}if (!combined || combined.trim().length === 0) continue;
      const groups = await genAndGroup(book, combined);
      for (const g of groups) {
        const key = g.objectiveId || g.objectiveTitle || "UNMAPPED";
        if (!agg.has(key)) agg.set(key, { objectiveId: g.objectiveId || key, objectiveTitle: g.objectiveTitle || key, items: [] });
        agg.get(key).items.push(...(g.items||[]));
      }
    }
    const out = Array.from(agg.values()).map(g => ({
      objectiveId: g.objectiveId,
      objectiveTitle: g.objectiveTitle,
      items: g.items
    }));
    return send(200, { ok: true, groups: out, _diag: { booksCount: books.length, objectivesCount: objectives.length } });
  } catch (e) {
    return send(500, { error: String(e && e.message || e) });
  }
};




const fetchFn = (global && global.fetch) ? global.fetch : null;
param($m)
$m.Value + @"
  if (!fetchFn) {
    throw new Error("global.fetch not available in Functions runtime");
  }
"@

  // --- Config knobs ---
  const CHUNK_SIZE = 35000;         // ~35k chars per chunk
  const MAX_CHUNKS = 3;             // try up to 3 chunks per book
  const ITEMS_PER_CHUNK = 1;        // 1 MCQ per chunk
  const PRIMARY_DEPLOYMENT = OPENAI_DEPLOYMENT;             // e.g., roofvault-turbo
  const FALLBACK_DEPLOYMENT = process.env.AOAI_DEPLOYMENT || "gpt-4o-mini";

  const src = String(combinedText || "").trim();
  if (!src) return [];

  // Build chunks
  const chunks = [];
  for (let i = 0; i < Math.min(src.length, CHUNK_SIZE * MAX_CHUNKS); i += CHUNK_SIZE) {
    chunks.push(src.slice(i, i + CHUNK_SIZE));
  }

  // Common prompt
  const sys = [
    "You are a meticulous exam-item writer and classifier for roofing publications.",
    "Return ONLY JSON (no markdown).",
    "Output must be a JSON object with: { groups: [ { objectiveId, objectiveTitle, items: [ ... ] } ] }."
  ].join("\n");

  const objLines = objectives.map(o => `- ${o.id}: ${o.title}`).join("\n");

  async function callModel(deployment, chunkText) {
    const url = `${OPENAI_ENDPOINT}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(OPENAI_API_VERSION)}`;
    const messages = [
      { role: "system", content: sys },
      {
        role: "user",
        content: [
          `SOURCE: ${bookName}`,
          "",
          `OBJECTIVES (choose exactly one objective per question):`,
          objLines,
          "",
          `TASK:`,
          `1) From the SOURCE EXCERPT below, create ${ITEMS_PER_CHUNK} high-quality MCQ(s) (A–D) with one correct answer.`,
          `2) For EACH MCQ, include a 1–2 sentence 'explanation' justifying the correct answer.`,
          `3) Immediately GROUP the new MCQs under the most relevant objective (by id and title).`,
          `4) Use "${bookName}" as the cite for each MCQ.`,
          "",
          `IMPORTANT: Only use information in the SOURCE EXCERPT (no outside knowledge).`,
          "",
          `RETURN: a JSON object with a 'groups' array. Each element has { objectiveId, objectiveTitle, items:[{ id, type:"mcq", question, options:[{id,text} x4], answer, explanation, cite }] }.`,
          "",
          "SOURCE EXCERPT (verbatim, may include OCR noise):",
          chunkText
        ].join("\n")
      }
    ];

    const headers = { "Content-Type": "application/json" };
    if (/azure/i.test(OPENAI_ENDPOINT)) headers["api-key"] = OPENAI_API_KEY; else headers["Authorization"] = `Bearer ${OPENAI_API_KEY}`;

    const payload = {
      model: deployment,
      messages,
      temperature: 0.3,
      response_format: { type: "json_object" }
    };

    const r = await fetchFn(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const t = await r.text();
    if (!r.ok) throw new Error(`OpenAI HTTP ${r.status}: ${t.slice(0, 1200)}`);
    let j = {};
    try { j = JSON.parse(t) } catch { throw new Error("OpenAI non-JSON"); }
    const content = j?.choices?.[0]?.message?.content || "";
    return content;
  }

  function normalizeGroups(parsed) {
    const groups = Array.isArray(parsed.groups) ? parsed.groups : [];
    let counter = 0; const newId = () => `q${++counter}`;
    const toOptionObjects = (arr) => {
      if (!Array.isArray(arr)) return [];
      if (arr.length && typeof arr[0] === "object") return arr;
      const labels = ["A","B","C","D","E","F","G"];
      return arr.map((txt, i) => ({ id: labels[i] || String(i+1), text: String(txt ?? "") }));
    };
    for (const g of groups) {
      if (!g || !Array.isArray(g.items)) continue;
      g.items = g.items.map((it) => {
        const question = it.question || it.stem || it.prompt || "";
        const options = toOptionObjects(it.options || it.choices || []);
        let answer = it.answer_id || it.answer || it.correct || "";

        if (/^\d+$/.test(String(answer)) && options.length) {
          const idx = Math.max(0, Math.min(options.length - 1, Number(answer) - 1));
          answer = options[idx]?.id ?? answer;
        }
        if (answer && options.length && !options.some(o => o.id === answer)) {
          const hit = options.find(o => String(o.text).trim().toLowerCase() === String(answer).trim().toLowerCase());
          if (hit) answer = hit.id;
        }

        return {
          id: it.id || newId(),
          type: "mcq",
          question,
          options,
          answer,
          explanation: it.explanation || it.rationale || "",
          cite: it.cite || bookName
        };
      });
    }
    return groups;
  }

  const allGroups = [];
  async function tryPass(modelName) {
    for (const chunk of chunks) {
      try {
        const content = await callModel(modelName, chunk);
        let parsed = {};
        try { parsed = JSON.parse(content) } catch { continue; }
        const groups = normalizeGroups(parsed);
        for (const g of groups) {
          if (Array.isArray(g.items) && g.items.length > 0) allGroups.push(g);
        }
        await new Promise(r => setTimeout(r, 400));
      } catch {
        // ignore per-chunk failure
      }
    }
  }

  await tryPass(PRIMARY_DEPLOYMENT);
  if (allGroups.length === 0 && FALLBACK_DEPLOYMENT) {
    await tryPass(FALLBACK_DEPLOYMENT);
  }

  return allGroups;
}




