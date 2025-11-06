/**
 * /api/exam
 * POST { book: string, filterField: string, count?: number }
 * Returns: { items:[...], modelDeployment, _diag }
 */
module.exports = async function (context, req) {
  try {
    const body = (req && req.body) || {};
    const book = (body.book || "").trim();
    const filterField = (body.filterField || "metadata_storage_name").trim();
    const count = Math.min(Math.max(parseInt(body.count || 50, 10) || 50, 1), 50);

    // --- env
    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;
    const SEARCH_INDEX    = process.env.SEARCH_INDEX;

    // Prefer Azure OpenAI, fallback to OpenAI
    const AOAI_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_ENDPOINT || process.env.AOAI_ENDPOINT;
    const AOAI_KEY        = process.env.AZURE_OPENAI_API_KEY   || process.env.OPENAI_API_KEY   || process.env.AOAI_API_KEY;
    const DEPLOYMENT      = process.env.AZURE_OPENAI_DEPLOYMENT
                         || process.env.OPENAI_DEPLOYMENT
                         || process.env.AOAI_DEPLOYMENT_TURBO
                         || process.env.DEFAULT_MODEL
                         || process.env.OPENAI_GPT4O_MINI;

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY || !SEARCH_INDEX) {
      return context.res = { status: 500, jsonBody: { error: "Missing SEARCH_* env vars" } };
    }
    if (!AOAI_ENDPOINT || !AOAI_KEY || !DEPLOYMENT) {
      return context.res = { status: 500, jsonBody: { error: "Missing OpenAI/Azure OpenAI env (endpoint/key/deployment)" } };
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

    const sRes = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": SEARCH_API_KEY
      },
      body: JSON.stringify(searchPayload)
    });

    if (!sRes.ok) {
      const raw = await sRes.text().catch(()=> "");
      return context.res = { status: 500, jsonBody: { error: `Search HTTP ${sRes.status}`, raw } };
    }

    const sJson = await sRes.json();
    const hits = Array.isArray(sJson.value) ? sJson.value : [];
    const texts = hits.map(h => (h.content || "")).filter(Boolean);
    const citeName = book || (hits[0]?.metadata_storage_name) || "<mixed sources>";

    const combined = texts.join("\n\n").slice(0, 120000); // keep payload sane
    const combinedLen = combined.length;

    const _diag = {
      searchHits: hits.length,
      firstDocKeys: hits[0] ? Object.keys(hits[0]).slice(0, 5) : [],
      combinedLen,
      combinedSample: combined.slice(0, 800)
    };

    if (combinedLen < 1000) {
      // not enough source → hard fail (no stubs)
      return context.res = {
        status: 500,
        jsonBody: { error: "Not enough source text to generate questions.", _diag }
      };
    }

    // --- OpenAI Chat (Azure or OpenAI)
    // Try Azure-style first; if endpoint contains '/openai/' we assume Azure route.
    const isAzure = /azure|openai\/deployments/i.test(AOAI_ENDPOINT);
    let chatUrl;
    if (isAzure) {
      const base = AOAI_ENDPOINT.replace(/\/+$/,"");
      chatUrl = `${base}/openai/deployments/${encodeURIComponent(DEPLOYMENT)}/chat/completions?api-version=2024-02-15-preview`;
    } else {
      // raw OpenAI style (Organizations/Projects not handled here)
      chatUrl = `${AOAI_ENDPOINT.replace(/\/+$/,"")}/v1/chat/completions`;
    }

    const sys = [
      "You are an expert item-writer for roofing/structures exams.",
      "Write strictly factual, unambiguous multiple-choice questions from the provided source text.",
      "Each question must be answerable from the source alone; do not invent facts.",
      "Return exactly the requested count of questions.",
      "Output ONLY valid JSON matching the schema provided."
    ].join(" ");

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
                  properties: { id: { type:"string" }, text: { type:"string" } },
                  required: ["id","text"],
                  additionalProperties: false
                },
                minItems: 4, maxItems: 4
              },
              answer: { type:"string" },
              cite: { type:"string" }
            },
            required: ["id","type","question","options","answer","cite"],
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
      `- Use clear, specific stems; avoid “Which option is most correct.”`,
      `- Provide exactly 4 options labeled A–D.`,
      `- The correct answer must be derivable from the source.`,
      `- Cite: use "${citeName}" for each item.`,
      ``,
      `SOURCE (verbatim, noisy OCR may exist):`,
      combined
    ].join("\n");

    const payload = {
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ],
      temperature: 0.3,
      response_format: { type: "json_schema", json_schema: { name: "mcq_list", schema } }
    };

    const oaiHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${AOAI_KEY}`
    };
    // Azure sometimes needs api-key header instead of Bearer; include both
    if (/azure/i.test(AOAI_ENDPOINT)) oaiHeaders["api-key"] = AOAI_KEY;

    const mRes = await fetch(chatUrl, {
      method: "POST",
      headers: oaiHeaders,
      body: JSON.stringify(payload)
    });

    const mTxt = await mRes.text();
    if (!mRes.ok) {
      return context.res = {
        status: 500,
        jsonBody: { error: `OpenAI HTTP ${mRes.status}`, raw: mTxt, _diag }
      };
    }

    let mJson;
    try { mJson = JSON.parse(mTxt); } catch {
      return context.res = {
        status: 500,
        jsonBody: { error: "Model returned non-JSON", raw: mTxt.slice(0, 4000), _diag }
      };
    }

    const content = mJson?.choices?.[0]?.message?.content;
    if (!content) {
      return context.res = {
        status: 500,
        jsonBody: { error: "No content from model", raw: mJson, _diag }
      };
    }

    let parsed;
    try { parsed = JSON.parse(content); } catch {
      return context.res = {
        status: 500,
        jsonBody: { error: "Content not valid JSON", content: content.slice(0, 4000), _diag }
      };
    }

    // Validate shape quickly
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    if (items.length !== count) {
      return context.res = {
        status: 500,
        jsonBody: { error: `Model returned ${items.length} items; expected ${count}`, _diag }
      };
    }

    // Success
    return context.res = {
      status: 200,
      jsonBody: { items, modelDeployment: DEPLOYMENT, _diag }
    };
  } catch (e) {
    return context.res = { status: 500, jsonBody: { error: String(e && e.message || e) } };
  }
};
