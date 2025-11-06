/**
 * Generator with keyword-aware search and optional IIBEC bias.
 * - honors body.keywords (string)
 * - honors body.onlyIIBEC (boolean)
 * - keeps: stage tests, batching, and dry-run
 */
const fetch = globalThis.fetch;

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function fetchWithRetry(url, options, delays=[1500,3000,5000,8000]) {
  for (let i=0;i<=delays.length;i++){
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    if (i===delays.length) return res;
    await sleep(delays[i]);
  }
}

function buildSearchText({ keywords, onlyIIBEC }) {
  const seed = 'roofing sheet metal flashing waterproofing building enclosure contract administration code wind NRCA IIBEC ASTM';
  const base = (keywords && String(keywords).trim()) ? String(keywords).trim() : seed;
  const iibecBias = onlyIIBEC
    ? ' (IIBEC OR "Institute of Building Enclosure Consultants" OR "Sheet Metal Manual" OR "Manual of Practice")'
    : '';
  return `${base}${iibecBias}`.trim();
}

module.exports = async function (context, req) {
  try {
    // --- DRY RUN ---
    if (req.body && req.body.debug === true) {
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              question: "What is the primary purpose of a drip edge?",
              choices: { A: "Direct water off edges", B: "Provide structure", C: "Aesthetic trim", D: "Sealant backup" },
              answer: "A",
              rationale: "Edge metal directs water away from the fascia and underlying components.",
              citations: [{ title: "IIBEC Sheet Metal Manual" }]
            },
            {
              question: "Which delivery method consolidates design and construction under one contract?",
              choices: { A: "Design-bid-build", B: "Design-build", C: "CM as Agent", D: "Multiple prime" },
              answer: "B",
              rationale: "Design-build reduces owner risk by unifying responsibility.",
              citations: [{ title: "IIBEC Manual of Practice" }]
            }
          ],
          note: "dry-run OK"
        })
      };
      return;
    }

    const count      = Math.min(Math.max(parseInt(req.body?.count ?? 50,10), 1), 100);
    const onlyIIBEC  = !!req.body?.onlyIIBEC;
    const keywords   = (req.body?.keywords ?? '').toString();
    const batchSize  = 5;
    const delayMs    = 2500;

    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_INDEX    = process.env.SEARCH_INDEX;
    const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

    const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT;
    const DEFAULT_MODEL   = process.env.DEFAULT_MODEL; // "gpt-4.1" or "gpt-4o-mini"
    const DEPLOY_41       = process.env.OPENAI_GPT41;      // e.g., "roofvault-turbo"
    const DEPLOY_4O_MINI  = process.env.OPENAI_GPT4O_MINI; // e.g., "gpt-4o-mini"
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;

    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY || !OPENAI_ENDPOINT || !OPENAI_API_KEY) {
      return context.res = { status: 500, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ error: "Missing required app settings (Search or OpenAI)." }) };
    }

    const deploymentName = (DEFAULT_MODEL === "gpt-4.1") ? (DEPLOY_41 || DEPLOY_4O_MINI) : (DEPLOY_4O_MINI || DEPLOY_41);
    if (!deploymentName) {
      return context.res = { status: 500, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ error: "No AOAI deployment name found (OPENAI_GPT41 / OPENAI_GPT4O_MINI)." }) };
    }

    // ---------- Stage: SEARCH only (for diagnostics) ----------
    if (req.body?.stage === "search") {
      const searchText = buildSearchText({ keywords, onlyIIBEC });
      const url = `${SEARCH_ENDPOINT}/indexes/${SEARCH_INDEX}/docs/search?api-version=2024-07-01`;
      const res = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
        body: JSON.stringify({ search: searchText, queryType: "simple", searchMode: "any", top: 6 })
      });
      const text = await res.text();
      context.res = { status: 200, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ ok: res.ok, status: res.status, searchText, bodyLen: text.length, bodyPreview: text.slice(0, 500) }) };
      return;
    }

    // ---------- Stage: AOAI only (for diagnostics) ----------
    if (req.body?.stage === "aoai") {
      const aoaiUrl = `${OPENAI_ENDPOINT}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-10-01-preview`;
      const body = {
        messages: [
          { role: "system", content: "Return STRICT JSON: {\"items\":[{\"question\":\"...\",\"choices\":{\"A\":\"...\",\"B\":\"...\",\"C\":\"...\",\"D\":\"...\"},\"answer\":\"A\",\"rationale\":\"...\",\"citations\":[{\"title\":\"...\"}]}]}" },
          { role: "user", content: "Create 1 roofing MCQ with A–D options, short rationale, and a plausible citation title." }
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" }
      };
      const r = await fetchWithRetry(aoaiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": OPENAI_API_KEY },
        body: JSON.stringify(body)
      });
      const txt = await r.text();
      context.res = { status: 200, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ ok: r.ok, status: r.status, raw: txt.slice(0, 800) }) };
      return;
    }

    // ---------- Full path (keyword-aware search + batched AOAI) ----------
    const searchText = buildSearchText({ keywords, onlyIIBEC });
    const searchUrl  = `${SEARCH_ENDPOINT}/indexes/${SEARCH_INDEX}/docs/search?api-version=2024-07-01`;
    const sRes = await fetchWithRetry(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify({ search: searchText, queryType: "simple", searchMode: "any", top: 6 })
    });
    if (!sRes || !sRes.ok) {
      const txt = sRes ? await sRes.text() : "(no response)";
      return context.res = { status: 500, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ error: `Search error ${sRes?.status||'??'}: ${txt}` }) };
    }
    const sJson = await sRes.json();

    const pickContentField = (d) => {
      if (typeof d.content === "string" && d.content.trim()) return d.content;
      if (typeof d.merged_content === "string" && d.merged_content.trim()) return d.merged_content;
      const pieces = Object.entries(d).filter(([k,v]) => typeof v === "string" && v.length > 0).map(([k,v]) => `${k}: ${v}`);
      return pieces.join("\n");
    };
    const docs = Array.isArray(sJson.value) ? sJson.value : [];
    const contextChunks = docs
      .map(d => (pickContentField(d) || "").slice(0, 1200))
      .filter(x => x && x.trim())
      .slice(0, 3);
    const contextBlob = contextChunks.join("\n\n---\n\n");
    if (!contextBlob) {
      return context.res = { status: 200, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ items: [], total: 0, note: "No text content found in the index.", searchText }) };
    }

    const aoaiUrl = `${OPENAI_ENDPOINT}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-10-01-preview`;
    const systemPrompt = `
You are an IIBEC/NRCA exam item writer. Produce multiple-choice questions (A–D), exactly one correct answer, a brief rationale, and at least one citation title.
STRICT JSON ONLY: {"items":[{"question":"...","choices":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A|B|C|D","rationale":"...","citations":[{"title":"..."}]}]}
- Use only the provided excerpts.
- Vary difficulty and topic.
- No duplicates across batches.
- No markdown, no extra keys.
`.trim();

    const all = [];
    const batches = Math.ceil(count / batchSize);
    for (let i = 0; i < batches; i++) {
      const n = Math.min(batchSize, count - i*batchSize);
      const userPrompt = `From the following excerpts, write ${n} distinct items.\n\nExcerpts:\n${contextBlob}`;
      const body = {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      };

      const r = await fetchWithRetry(aoaiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": OPENAI_API_KEY },
        body: JSON.stringify(body)
      });

      if (!r) {
        return context.res = { status: 500, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: "AOAI: no HTTP response object" }) };
      }
      if (!r.ok) {
        const txt = await r.text();
        return context.res = { status: 500, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: `OpenAI error ${r.status}: ${txt}` }) };
      }

      const j = await r.json();
      const content = j?.choices?.[0]?.message?.content || "{}";
      let parsed;
      try { parsed = JSON.parse(content); } catch { parsed = { items: [] }; }
      const items = Array.isArray(parsed.items) ? parsed.items : (Array.isArray(parsed) ? parsed : []);
      all.push(...items);

      if (i < batches - 1) await sleep(delayMs);
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: all, total: all.length, batches, modelDeployment: deploymentName, searchText })
    };
  } catch (err) {
    context.res = { status: 500, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
