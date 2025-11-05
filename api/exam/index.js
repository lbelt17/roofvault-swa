/**
 * /api/exam — generate 50 Qs from a selected "book".
 * Robust book scoping: try $filter first; if 0 hits, fallback to a text search on the same field,
 * then (last resort) a general search. Uses global fetch (Node 18+).
 */
module.exports = async function (context, req) {
  const AZURE_OPENAI_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_ENDPOINT || process.env.AOAI_ENDPOINT;
  const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || process.env.OPENAI_GPT4O_MINI || process.env.AOAI_DEPLOYMENT || process.env.OPENAI_GPT41;
  const AZURE_OPENAI_API_KEY    = process.env.AZURE_OPENAI_API_KEY || process.env.AOAI_API_KEY || process.env.OPENAI_API_KEY;

  const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
  const SEARCH_INDEX    = process.env.SEARCH_INDEX;
  const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

  const body = req.body || {};
  const book = (body.book || "").trim();
  const filterField = (body.filterField || "").trim() || "metadata_storage_name";

  if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
    context.res = { status: 500, jsonBody: { error: "Search not configured." } };
    return;
  }
  if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_DEPLOYMENT || !AZURE_OPENAI_API_KEY) {
    context.res = { status: 500, jsonBody: { error: "AOAI not configured." } };
    return;
  }

  const searchUrl = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;

  const doSearch = async (payload) => {
    const r = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type":"application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify(payload)
    });
    const t = await r.text();
    let j = null; try { j = JSON.parse(t); } catch { /* keep raw */ }
    return { ok: r.ok, status: r.status, json: j || t };
  };

  // sanitize for OData literal
  const odataLit = (s) => "'" + String(s).replace(/'/g, "''") + "'";

  // 1) Try strict filter on the chosen field (requires field to be filterable in the index)
  let hits = [];
  if (book) {
    const filterPayload = {
      search: "*",
      queryType: "simple",
      top: 60,
      select: "content,metadata_storage_name,metadata_storage_path,chunk,id,sourcepage,pageno,book,section",
      filter: `${filterField} eq ${odataLit(book)}`
    };
    const res1 = await doSearch(filterPayload);
    if (res1.ok && res1.json && Array.isArray(res1.json.value)) {
      hits = res1.json.value;
    }
  }

  // 2) If no hits, try a text search on that field name (works if the field is searchable)
  if (hits.length === 0 && book) {
    const res2 = await doSearch({
      search: `"${book}"`,
      queryType: "simple",
      searchMode: "all",
      top: 60,
      select: "content,metadata_storage_name,metadata_storage_path,chunk,id,sourcepage,pageno,book,section",
      searchFields: filterField // harmless if field isn’t searchable; service ignores it
    });
    if (res2.ok && res2.json && Array.isArray(res2.json.value)) {
      hits = res2.json.value;
    }
  }

  // 3) Last resort: pull any top docs so the user at least gets questions
  if (hits.length === 0) {
    const res3 = await doSearch({
      search: "*",
      queryType: "simple",
      top: 60,
      select: "content,metadata_storage_name,metadata_storage_path,chunk,id,sourcepage,pageno,book,section"
    });
    if (res3.ok && res3.json && Array.isArray(res3.json.value)) {
      hits = res3.json.value;
    }
  }

  if (!hits || hits.length === 0) {
    context.res = {
      status: 200,
      jsonBody: {
        items: [],
        modelDeployment: AZURE_OPENAI_DEPLOYMENT,
        error: "No passages found. Make sure the file name matches exactly, or re-index with the field set as filterable/searchable."
      }
    };
    return;
  }

  // Build a compact context for the model (trim long chunks)
  const take = Math.min(hits.length, 50);
  const ctx = hits.slice(0, take).map(h => {
    const name = h.metadata_storage_name || h.book || h.id || "";
    const page = h.sourcepage || h.pageno || "";
    let txt = (h.content || h.chunk || "").toString();
    if (txt.length > 1200) txt = txt.slice(0, 1200) + " …";
    return `【${name}${page ? ` p.${page}` : ""}】 ${txt}`;
  }).join("\n\n");

  const prompt = [
    {
      role: "system",
      content:
        "You are a certification exam writer for roofing/waterproofing. Write 50 study questions (mix MCQ, T/F, Short). " +
        "Each question must include: (1) the question, (2) the correct answer, (3) a one-sentence explanation, (4) a source tag like 【filename p.X】 " +
        "Only cite from the provided context. Keep language concise and unambiguous."
    },
    {
      role: "user",
      content:
        `Target file: ${book || "(not specified)"}\n\nContext passages:\n${ctx}\n\nReturn JSON: {"items":[{"q":"...","a":"...","why":"...","cite":"..."}]}\nEnsure exactly 50 items if enough context exists.`
    }
  ];

  // AOAI call
  const aoaiUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`;
  let items = [];
  try {
    const r = await fetch(aoaiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: prompt,
        temperature: 0.2,
        max_tokens: 3500,
        response_format: { type: "json_object" }
      })
    });
    const t = await r.text();
    let j = null; try { j = JSON.parse(t); } catch {}
    const text = j?.choices?.[0]?.message?.content || t;
    let parsed = null; try { parsed = JSON.parse(text); } catch {}
    items = parsed?.items || [];
    if (!Array.isArray(items)) items = [];
  } catch (e) {
    context.log("AOAI error", e?.message);
    return (context.res = { status: 500, jsonBody: { error: `AOAI error: ${e?.message || e}` } });
  }

  context.res = { status: 200, jsonBody: { items, modelDeployment: AZURE_OPENAI_DEPLOYMENT } };
};
