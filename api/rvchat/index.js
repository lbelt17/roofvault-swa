const { SearchClient } = require("@azure/search-documents");
const { AzureKeyCredential } = require("@azure/core-auth");

// ENV
const {
  AOAI_ENDPOINT,
  AOAI_KEY,
  AOAI_DEPLOYMENT,
  SEARCH_ENDPOINT,
  SEARCH_KEY,
  SEARCH_INDEX
} = process.env;

// CORS helper
function cors(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

function validateEnv() {
  const all = { AOAI_ENDPOINT, AOAI_KEY, AOAI_DEPLOYMENT, SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX };
  const missing = Object.entries(all).filter(([_, v]) => !v || !String(v).trim()).map(([k]) => k);
  const seen = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, !!(v && String(v).trim())]));
  return { missing, seen };
}

async function searchTopN(context, client, query, topN = 8) {
  const options = {
    top: topN,
    includeTotalCount: false,
    queryType: "simple",
    select: ["content","metadata_storage_name","metadata_storage_path","id","@search.score"]
  };

  let hits = [];

  try {
    const resp = client.search(query, options);
    if (resp && typeof resp[Symbol.asyncIterator] === "function") {
      for await (const item of resp) {
        hits.push(item?.document ?? item);
        if (hits.length >= topN) break;
      }
      return hits;
    }
  } catch (e) {
    context.log("[rvchat] iterator search failed:", String(e));
  }

  try {
    const resp = client.search(query, options);
    if (resp && typeof resp.byPage === "function") {
      const iter = resp.byPage({ maxPageSize: topN });
      const first = await iter.next();
      const pv = first?.value;
      const arr = (pv?.results || pv?.value || []);
      for (const v of arr) hits.push(v?.document ?? v);
      return hits.slice(0, topN);
    }
  } catch (e) {
    context.log("[rvchat] paged search failed:", String(e));
  }

  return [];
}

async function aoaiChat(systemPrompt, userPrompt) {
  const url = `${AOAI_ENDPOINT.replace(/\/+$/, "")}/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=2024-06-01`;
  const payload = {
    temperature: 0.2,
    max_tokens: 900,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "api-key": AOAI_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(`AOAI HTTP ${r.status}: ${json?.error?.message || json?.message || "unknown error"}`);
  }
  return json?.choices?.[0]?.message?.content?.trim?.() || "No answer generated.";
}

module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") {
      context.res = cors({ ok: true });
      return;
    }

    const { missing, seen } = validateEnv();
    if (missing.length) {
      context.res = cors({ ok: false, error: "Missing required environment variables.", missing, seen }, 500);
      return;
    }

    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const question = body.question || (messages.length ? (messages[messages.length - 1]?.content || "") : "");
    if (!question) {
      context.res = cors({ ok: false, error: "No question provided." }, 400);
      return;
    }

    // 1) Search your index
    const sc = new SearchClient(SEARCH_ENDPOINT, SEARCH_INDEX, new AzureKeyCredential(SEARCH_KEY));
    const docs = await searchTopN(context, sc, question, 8);

    const snippets = [];
    for (const d of docs) {
      const text = (d?.content ?? "").toString().slice(0, 1200);
      const src = d?.metadata_storage_name || d?.metadata_storage_path || "unknown";
      if (text.trim()) snippets.push({ text, source: src });
    }

    const sourcesBlock = snippets.map((s, i) => `[[${i + 1}]] ${s.source}\n${s.text}`).join("\n\n");

    const systemPrompt =
      "You are RoofVault AI, a roofing standards assistant. " +
      "Answer ONLY from the provided sources (NRCA, IIBEC, ASTM, etc.). " +
      "If the answer is not clearly supported, say you are unsure and suggest the most relevant source sections. " +
      "Cite sources inline using [#] that match the list below.";

    const userPrompt = `Question: ${question}

Sources:
${sourcesBlock || "(no sources found)"}`;

    // 2) Azure OpenAI chat
    const answer = await aoaiChat(systemPrompt, userPrompt);

    context.res = cors({
      ok: true,
      question,
      answer,
      sources: snippets.map((s, i) => ({ id: i + 1, source: s.source }))
    });
  } catch (e) {
    context.log.error("[rvchat] Fatal error:", e);
    try {
      context.res = cors({ ok: false, error: String(e?.message || e) }, 500);
    } catch {
      // If even setting res fails, let the platform return 500
      throw e;
    }
  }
};
