// --- ENV ---
const SEARCH_ENDPOINT   = process.env.SEARCH_ENDPOINT;   // e.g., https://roofvaultsearch.search.windows.net
const SEARCH_API_KEY    = process.env.SEARCH_API_KEY;
const SEARCH_INDEX      = process.env.SEARCH_INDEX || "azureblob-index";

const OPENAI_ENDPOINT   = (process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_ENDPOINT || "").replace(/\/+$/,"");
const OPENAI_API_KEY    = (process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "");
const OPENAI_DEPLOYMENT = (process.env.AZURE_OPENAI_DEPLOYMENT || process.env.OPENAI_DEPLOYMENT || process.env.DEFAULT_MODEL || "roofvault-turbo");
const OPENAI_API_VERSION= process.env.OPENAI_API_VERSION || "2024-08-01-preview"; // required for json_schema

function send(res, code, obj) {
  res.status(code).setHeader("Content-Type","application/json");
  res.end(JSON.stringify(obj));
}

export default async function (req, res) {
  if (req.method !== "POST") return send(res, 405, { error:"POST only" });

  let body = {};
  try { body = JSON.parse(req.body || "{}"); } catch {}
  const { objectives, books, filterField = "metadata_storage_name", countPerBook = 2, topK = 5 } = body;

  if (!Array.isArray(objectives) || objectives.length === 0) {
    return send(res, 400, { error: "Missing 'objectives'[]" });
  }
  if (!Array.isArray(books) || books.length === 0) {
    return send(res, 400, { error: "Missing 'books'[]" });
  }
  if (!SEARCH_ENDPOINT || !SEARCH_API_KEY || !SEARCH_INDEX) {
    return send(res, 500, { error: "Search env not configured" });
  }
  if (!OPENAI_ENDPOINT || !OPENAI_API_KEY || !OPENAI_DEPLOYMENT) {
    return send(res, 500, { error: "OpenAI env not configured" });
  }

  // helper: search source by exact book name
  async function fetchSourceForBook(bookName) {
    const filter = `${filterField} eq '${String(bookName).replace(/'/g,"''")}'`;
    const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2024-07-01`;
    const payload = {
      count: false,
      search: "*",
      filter,
      select: "id,metadata_storage_name,metadata_storage_path,content",
      top: topK
    };
    const r = await fetch(url, {
      method:"POST",
      headers: {
        "Content-Type":"application/json",
        "api-key": SEARCH_API_KEY
      },
      body: JSON.stringify(payload)
    });
    const t = await r.text();
    if (!r.ok) throw new Error(`SEARCH_HTTP_${r.status}: ${t.slice(0,4000)}`);
    let j = {};
    try { j = JSON.parse(t); } catch { throw new Error("Search non-JSON"); }
    const docs = Array.isArray(j.value) ? j.value : [];
    const combined = docs.map(d => String(d.content || "")).join("\n\n---\n\n");
    return { docs, combined };
  }

  // helper: one-shot generate MCQs AND group to objectives
  async function genAndGroup(bookName, combinedText) {
    // model schema for strict JSON
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
      "You must return STRICT JSON that matches the provided json_schema.",
      "No prose, no markdown — JSON only."
    ].join("\n");

    const objLines = objectives.map(o => `- ${o.id}: ${o.title}`).join("\n");

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
      combinedText.slice(0, 120000) // cap to keep request manageable
    ].join("\n");

    const url = `${OPENAI_ENDPOINT}/openai/deployments/${encodeURIComponent(OPENAI_DEPLOYMENT)}/responses?api-version=${encodeURIComponent(OPENAI_API_VERSION)}`;
    const payload = {
      model: OPENAI_DEPLOYMENT,
      input: [
        { role: "system", content: sys },
        { role: "user",   content: user }
      ],
      response_format: { type: "json_schema", json_schema: { name:"groups_payload", schema } },
      temperature: 0.2
    };

    const headers = { "Content-Type":"application/json" };
    if (/azure/i.test(OPENAI_ENDPOINT)) headers["api-key"] = OPENAI_API_KEY; else headers["Authorization"] = `Bearer ${OPENAI_API_KEY}`;

    const r = await fetch(url, { method:"POST", headers, body: JSON.stringify(payload) });
    const t = await r.text();
    if (!r.ok) throw new Error(`OpenAI HTTP ${r.status}: ${t.slice(0,4000)}`);
    let j = {};
    try { j = JSON.parse(t); } catch { throw new Error("OpenAI non-JSON"); }
    const content = j?.output?.[0]?.content?.[0]?.text || j?.choices?.[0]?.message?.content || "";
    if (!content) throw new Error("OpenAI: missing content");
    let parsed = {};
    try { parsed = JSON.parse(content); } catch { throw new Error("OpenAI content not JSON"); }
    const groups = Array.isArray(parsed.groups) ? parsed.groups : [];
    // attach book cite if missing (should be present already)
    for (const g of groups) {
      for (const it of (g.items||[])) if (!it.cite) it.cite = bookName;
    }
    return groups;
  }

  try {
    const agg = new Map(); // objectiveId -> {objectiveId, objectiveTitle, items:[]}
    for (const book of books) {
      const { combined } = await fetchSourceForBook(book);
      if (!combined || combined.trim().length === 0) continue;
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
    return send(res, 200, {
      ok: true,
      groups: out,
      _diag: { booksCount: books.length, objectivesCount: objectives.length }
    });
  } catch (e) {
    return send(res, 500, { error: String(e?.message||e) });
  }
}

