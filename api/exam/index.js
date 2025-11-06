/**
 * /api/exam
 * POST { book: string, filterField: string, count?: number }
 * Returns: { items:[...], modelDeployment, _diag }
 */
module.exports = async function (context, req) {
  const send = (status, obj) => {
    context.res = {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(obj ?? {})
    };
  };

  try {
    const body = (req && req.body) || {};
    const book = (body.book || "").trim();
    const filterField = (body.filterField || "metadata_storage_name").trim();
    const count = Math.min(Math.max(parseInt(body.count || 50, 10) || 50, 1), 50);

    // --- env
    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;
    const SEARCH_INDEX    = process.env.SEARCH_INDEX;

    const AOAI_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_ENDPOINT || process.env.AOAI_ENDPOINT;
    const AOAI_KEY        = process.env.AZURE_OPENAI_API_KEY   || process.env.OPENAI_API_KEY   || process.env.AOAI_API_KEY;
    const DEPLOYMENT      = process.env.AZURE_OPENAI_DEPLOYMENT
                         || process.env.OPENAI_DEPLOYMENT
                         || process.env.AOAI_DEPLOYMENT_TURBO
                         || process.env.DEFAULT_MODEL
                         || process.env.OPENAI_GPT4O_MINI;

    const envDiag = {
      searchEndpoint: (SEARCH_ENDPOINT||"").replace(/https?:\/\//,"").split("/")[0],
      searchIndex: SEARCH_INDEX,
      aoaiEndpointHost: (AOAI_ENDPOINT||"").replace(/https?:\/\//,"").split("/")[0],
      deployment: DEPLOYMENT || "(none)"
    };

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY || !SEARCH_INDEX) {
      return send(500, { error: "Missing SEARCH_* env vars", _env: envDiag });
    }
    if (!AOAI_ENDPOINT || !AOAI_KEY || !DEPLOYMENT) {
      return send(500, { error: "Missing OpenAI/Azure OpenAI env (endpoint/key/deployment)", _env: envDiag });
    }

    // --- search
    const searchUrl = `${SEARCH_ENDPOINT.replace(/\/+$/,"")}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-11-01`;
    const filter = book ? `${filterField} eq '${book.replace(/'/g, "''")}'` : null;

    const searchPayload = {
      search: "*",
      queryType: "simple",
      select: "id,metadata_storage_name,metadata_storage_path,content",
      top: 5,
      ...(filter ? { filter } : {})
    };

    let sTxt = "";
    const sRes = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type":"application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify(searchPayload)
    }).catch(e => { throw new Error("FETCH_SEARCH_FAILED: "+(e?.message||e)); });

    sTxt = await sRes.text().catch(()=> "");
    if (!sRes.ok) return send(500, { error: `Search HTTP ${sRes.status}`, raw: sTxt, _env: envDiag });

    let sJson; try { sJson = JSON.parse(sTxt); } catch { return send(500, { error: "Search returned non-JSON", raw: sTxt.slice(0,2000), _env: envDiag }); }
    const hits = Array.isArray(sJson.value) ? sJson.value : [];
    const texts = hits.map(h => (h.content || "")).filter(Boolean);
    const citeName = book || (hits[0]?.metadata_storage_name) || "<mixed sources>";
    const combined = texts.join("\n\n").slice(0, 120000);
    const combinedLen = combined.length;

    const _diag = { _env: envDiag, searchHits: hits.length, firstDocKeys: hits[0] ? Object.keys(hits[0]).slice(0,5) : [], combinedLen, combinedSample: combined.slice(0,800) };

    if (combinedLen < 1000) return send(500, { error: "Not enough source text to generate questions.", _diag });

    // --- OpenAI (Azure vs non-Azure)
    const isAzure = /azure\.com/i.test(AOAI_ENDPOINT);
    let chatUrl;
    if (isAzure) {
      const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
      chatUrl = `${AOAI_ENDPOINT.replace(/\/+$/,"")}/openai/deployments/${encodeURIComponent(DEPLOYMENT)}/chat/completions?api-version=${apiVersion}`;
    } else {
      chatUrl = `${AOAI_ENDPOINT.replace(/\/+$/,"")}/v1/chat/completions`;
    }

    const sys =
      "You are an expert item-writer for roofing/structures exams. " +
      "Write strictly factual, unambiguous multiple-choice questions from the provided source text. " +
      "Each question must be answerable from the source; do not invent facts. " +
      "Return exactly the requested count of questions. " +
      "Output ONLY valid JSON matching the schema provided.";

    // include 'explanation' field in schema
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
                items: { type:"object", properties:{ id:{type:"string"}, text:{type:"string"} }, required:["id","text"], additionalProperties:false },
                minItems: 4, maxItems: 4
              },
              answer: { type:"string" },
              cite: { type:"string" },
              explanation: { type:"string" }
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
      `- The correct answer must be derivable from the source.`,
      `- Cite: use "${citeName}" for each item.`,
      `- For EACH question, also include a concise 'explanation' (1–2 sentences) that justifies WHY the correct option is correct based on the source.`,
      `- Explanations must refer only to facts available in the source (no outside knowledge).`,
      ``,
      `SOURCE (verbatim, may include OCR noise):`,
      combined
    ].join("\n");

    const payload = {
      messages: [{ role:"system", content: sys }, { role:"user", content: user }],
      temperature: 0.3,
      response_format: { type: "json_schema", json_schema: { name: "mcq_list", schema } }
    };

    const headers = { "Content-Type": "application/json" };
    if (isAzure) headers["api-key"] = AOAI_KEY; else headers["Authorization"] = `Bearer ${AOAI_KEY}`;

    let mTxt = "";
    const mRes = await fetch(chatUrl, { method:"POST", headers, body: JSON.stringify(payload) }).catch(e => { throw new Error("FETCH_OPENAI_FAILED: "+(e?.message||e)); });
    mTxt = await mRes.text().catch(()=> "");
    if (!mRes.ok) return send(500, { error: `OpenAI HTTP ${mRes.status}`, raw: mTxt.slice(0,4000), _diag });

    let mJson; try { mJson = JSON.parse(mTxt); } catch { return send(500, { error:"Model returned non-JSON", raw: mTxt.slice(0,4000), _diag }); }
    const content = mJson?.choices?.[0]?.message?.content;
    if (!content) return send(500, { error:"No content from model", raw: mJson, _diag });

    let parsed; try { parsed = JSON.parse(content); } catch { return send(500, { error:"Content not valid JSON", content: content.slice(0,4000), _diag }); }
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    if (items.length !== count) return send(500, { error:`Model returned ${items.length} items; expected ${count}`, _diag });

    return send(200, { items, modelDeployment: DEPLOYMENT, _diag });
  } catch (e) {
    return send(500, { error: String(e?.message||e), stack: String(e?.stack||"") });
  }
};
