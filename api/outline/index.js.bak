const fetch = global.fetch || require("node-fetch");

// send helper for Azure Functions
function send(context, code, body){
  context.res = {
    status: code,
    headers: { "Content-Type": "application/json" },
    body
  };
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

  const env = process.env;
  const SEARCH_ENDPOINT = (env.SEARCH_ENDPOINT || "").replace(/^https?:\/\//,'');
  const SEARCH_INDEX    = env.SEARCH_INDEX;
  const SEARCH_API_KEY  = env.SEARCH_API_KEY;

  const OPENAI_ENDPOINT    = (env.OPENAI_ENDPOINT || env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/,'');
  const OPENAI_API_KEY     = env.OPENAI_API_KEY  || env.AZURE_OPENAI_API_KEY;
  const OPENAI_DEPLOYMENT  = env.OPENAI_DEPLOYMENT || env.AOAI_DEPLOYMENT_TURBO || env.AZURE_OPENAI_DEPLOYMENT;
  const OPENAI_API_VERSION = env.OPENAI_API_VERSION || "2024-08-01-preview";

  const body = (req.body && typeof req.body === "object") ? req.body : {};
  const book = (body.book || "").trim();
  const filterField = (body.filterField || "metadata_storage_name").trim();
  const topK = Math.max(3, Math.min(10, Number(body.topK || 5)));

  if (!book) return send(context, 400, { error: "Missing 'book'." });
  if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) return send(context, 500, { error:"Search env missing." });
  if (!OPENAI_ENDPOINT || !OPENAI_API_KEY || !OPENAI_DEPLOYMENT) return send(context, 500, { error:"OpenAI env missing." });

  try{
    // 1) Pull content from Azure AI Search
    const filter = `${filterField} eq '${book.replace(/'/g, "''")}'`;
    const searchUrl = `https://${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-11-01`;
    const sPayload = {
      search: "*",
      filter,
      select: "id,metadata_storage_name,metadata_storage_path,content",
      queryType: "simple",
      top: topK
    };

    const sRes = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type":"application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify(sPayload)
    });
    const sTxt = await sRes.text();
    if (!sRes.ok) return send(context, 500, { error:`Search HTTP ${sRes.status}`, raw: sTxt });

    const sJson = JSON.parse(sTxt);
    const hits = Array.isArray(sJson.value) ? sJson.value : [];
    const combined = hits.map(h => (h.content || "")).join("\n\n---\n\n").slice(0, 350000);

    if (!combined || combined.trim().length < 100) {
      return send(context, 200, {
        outline: [],
        summary: "",
        sources: hits.map(h => ({ file: h.metadata_storage_name, where: "not enough text" })),
        _diag: { hits: hits.length, sampleLen: (combined||"").length }
      });
    }

    // 2) Ask model for outline + summary + "where to find answers"
    const system = [
      "You produce structured study aids for roofing publications.",
      "Return STRICT JSON only."
    ].join("\n");

    const schema = {
      type: "object",
      properties: {
        outline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type:"string" },
              bullets: { type:"array", items:{ type:"string" } }
            },
            required:["title","bullets"], additionalProperties:false
          }
        },
        summary: { type:"string" },
        sources: {
          type:"array",
          items: {
            type:"object",
            properties:{
              file:{ type:"string" },
              where:{ type:"string" }
            },
            required:["file","where"], additionalProperties:false
          }
        }
      },
      required:["outline","summary","sources"],
      additionalProperties:false
    };

    const user = [
      `BOOK: ${book}`,
      "",
      "From the SOURCE TEXT below:",
      "1) Create a hierarchical OUTLINE (5–12 sections) with concise titles, each with 3–8 bullets.",
      "2) Write a 1–2 paragraph SUMMARY of the whole publication.",
      "3) Build a SOURCES array listing where learners can find answers for exam questions (use short pointers like headings, figure/table names, chapter labels, or visible page markers).",
      "",
      "SOURCE TEXT (verbatim; may include OCR noise):",
      combined
    ].join("\n");

    const chatUrl = `${OPENAI_ENDPOINT}/openai/deployments/${encodeURIComponent(OPENAI_DEPLOYMENT)}/chat/completions?api-version=${encodeURIComponent(OPENAI_API_VERSION)}`;
    const payload = {
      temperature: 0.2,
      messages: [
        { role:"system", content: system },
        { role:"user", content: user }
      ],
      response_format: { type:"json_schema", json_schema:{ name:"outline_pack", schema } }
    };

    const mRes = await fetch(chatUrl, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "api-key": OPENAI_API_KEY },
      body: JSON.stringify(payload)
    });
    const mTxt = await mRes.text();
    if (!mRes.ok) return send(context, 500, { error:`OpenAI HTTP ${mRes.status}`, raw: mTxt });

    let mJson; try { mJson = JSON.parse(mTxt); } catch { return send(context, 500, { error:"Model non-JSON", raw:mTxt }); }
    const content = mJson?.choices?.[0]?.message?.content;
    if (!content) return send(context, 500, { error:"No content from model", raw:mJson });

    let parsed; try { parsed = JSON.parse(content); } catch { return send(context, 500, { error:"Content not valid JSON", raw: content }); }

    // Ensure file names exist
    const defaultFile = hits[0]?.metadata_storage_name || book;
    (parsed.sources || []).forEach(s => { if (!s.file) s.file = defaultFile; });

    return send(context, 200, {
      outline: parsed.outline || [],
      summary: parsed.summary || "",
      sources: parsed.sources || [],
      _diag: { hits: hits.length, sampleLen: combined.length }
    });
  } catch (e) {
    return send(context, 500, { error: String(e?.message||e), stack: String(e?.stack||"") });
  }
};

