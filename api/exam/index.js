/**
 * /api/exam — Generate exam from Azure Search passages.
 * - Optional body: { book: "file.pdf", filterField: "metadata_storage_name" }
 * - Returns { items: [...], modelDeployment, tookMs, hits, filtered, sourceFiles }
 * Uses global fetch (Node 18+).
 */
module.exports = async function (context, req) {
  const t0 = Date.now();
  const {
    AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT,
    AZURE_OPENAI_API_KEY,
    SEARCH_ENDPOINT,
    SEARCH_INDEX,
    SEARCH_API_KEY
  } = process.env;

  const body = (req && req.body) || {};
  const book = (body.book || "").toString().trim();
  const filterField = (body.filterField || "").toString().trim() || null;

  const searchUrl = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;
  const select = "content,metadata_storage_name";

  const doSearch = async (useFilter) => {
    let filter = undefined;
    if (useFilter && book && filterField) {
      // Escape single quotes per OData
      const val = book.replace(/'/g, "''");
      filter = `${filterField} eq '${val}'`;
    }
    const payload = { search: "*", queryType: "simple", top: 50, select, ...(filter ? { filter } : {}) };
    const r = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify(payload)
    });
    const txt = await r.text();
    let json = null; try { json = JSON.parse(txt); } catch {}
    if (!r.ok) {
      return { ok:false, status:r.status, error: json || txt };
    }
    const docs = (json && json.value) || [];
    return { ok:true, status:r.status, docs };
  };

  // 1) Try with filter if provided
  let filtered = !!(book && filterField);
  let res = await doSearch(filtered);
  if (!res.ok) {
    context.res = { status: 500, headers:{ "Content-Type":"application/json" }, body: { error: "Search error", details: res } };
    return;
  }
  // 2) Fallback to all-books if zero
  if (res.docs.length === 0 && filtered) {
    filtered = false;
    res = await doSearch(false);
    if (!res.ok) {
      context.res = { status: 500, headers:{ "Content-Type":"application/json" }, body: { error: "Search error", details: res } };
      return;
    }
  }

  const hits = res.docs.length;
  if (hits === 0) {
    context.res = {
      status: 200,
      headers:{ "Content-Type":"application/json" },
      body: { items: [], modelDeployment: AZURE_OPENAI_DEPLOYMENT || null, error: "No passages found from Search.", hits, filtered }
    };
    return;
  }

  // Concatenate a reasonable chunk of content to prompt the model
  const sourceFiles = [...new Set(res.docs.map(d => d.metadata_storage_name).filter(Boolean))].slice(0, 20);
  const contextText = res.docs.map(d => d.content || "").filter(Boolean).join("\n\n").slice(0, 18000);

  // 3) Ask AOAI to create a clean MCQ/TF/Short exam with explanations + citations
  const prompt = `
You are an exam generator for roofing/waterproofing study. Using the CONTEXT below, generate 20 mixed questions (MCQ, T/F, and short answer).
Rules:
- For MCQ, provide exactly 4 options (A–D) and mark the correct one.
- After each question, include:
  - "Answer: <letter or short>"
  - "Why: <1-2 sentence explanation>"
  - "Cites: <brief pointers to the relevant source lines/topics>" (do not invent URLs; just short labels)
- Keep language simple and unambiguous.
- Do NOT include content outside the given context.

CONTEXT:
${contextText}
`.trim();

  const aoaiUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`;
  const payload = {
    messages: [
      { role: "system", content: "You create concise, accurate exams with clear feedback and brief citations." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1800
  };

  const aRes = await fetch(aoaiUrl, {
    method: "POST",
    headers: { "Content-Type":"application/json", "api-key": AZURE_OPENAI_API_KEY },
    body: JSON.stringify(payload)
  });
  const aTxt = await aRes.text();
  let aJson = null; try { aJson = JSON.parse(aTxt); } catch {}

  if (!aRes.ok) {
    context.res = { status: 500, headers:{ "Content-Type":"application/json" }, body: { error: "AOAI error", details: aJson || aTxt } };
    return;
  }

  const content = aJson.choices?.[0]?.message?.content || "";
  const items = content ? [content] : [];

  context.res = {
    status: 200,
    headers:{ "Content-Type":"application/json" },
    body: {
      items,
      modelDeployment: AZURE_OPENAI_DEPLOYMENT || null,
      tookMs: Date.now() - t0,
      hits,
      filtered,
      sourceFiles
    }
  };
};
