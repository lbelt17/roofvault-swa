const { SearchClient } = require("@azure/search-documents");
const { AzureKeyCredential } = require("@azure/core-auth");

// ENV VARS
const {
  AOAI_ENDPOINT,       // e.g. https://theroofvaultopenai1.openai.azure.com/
  AOAI_KEY,
  AOAI_DEPLOYMENT,     // e.g. roofvault-turbo or gpt-4o-mini
  SEARCH_ENDPOINT,     // e.g. https://roofvaultsearch.search.windows.net
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

// Validate env (without leaking secrets)
function validateEnv(context) {
  const all = {
    AOAI_ENDPOINT, AOAI_KEY, AOAI_DEPLOYMENT,
    SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX
  };
  const missing = Object.entries(all)
    .filter(([_, v]) => !v || !String(v).trim())
    .map(([k]) => k);

  const seen = Object.fromEntries(
    Object.entries(all).map(([k, v]) => [k, !!(v && String(v).trim())])
  );
  context.log("[rvchat] env seen:", seen);
  return { missing, seen };
}

// Collect top N results from Azure AI Search, tolerant of SDK shapes
async function searchTopN(context, client, query, topN = 6) {
  const resp = client.search(query, {
    top: topN,
    includeTotalCount: false,
    queryType: "simple"
  });

  let hits = [];

  try {
    if (resp && typeof resp[Symbol.asyncIterator] === "function") {
      for await (const item of resp) {
        hits.push(item);
        if (hits.length >= topN) break;
      }
      return hits;
    }
  } catch (e) {
    context.log("[rvchat] iterator search failed, will try paging:", String(e));
  }

  try {
    if (resp && typeof resp.byPage === "function") {
      const pageIter = resp.byPage({ maxPageSize: topN });
      const first = await pageIter.next();
      const pageVal = first?.value;
      const results = (pageVal?.results || pageVal?.value || []);
      return Array.isArray(results) ? results.slice(0, topN) : [];
    }
  } catch (e) {
    context.log("[rvchat] paged search failed:", String(e));
  }

  return [];
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = cors({ ok: true });
    return;
  }

  const { missing, seen } = validateEnv(context);
  if (missing.length) {
    context.res = cors({ ok: false, error: "Missing required environment variables.", missing, seen }, 500);
    return;
  }

  try {
    // Parse input
    const body = (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const question = body.question || (messages.length ? (messages[messages.length - 1].content || "") : "");
    if (!question) {
      context.res = cors({ ok: false, error: "No question provided." }, 400);
      return;
    }

    // 1) Search
    const searchClient = new SearchClient(SEARCH_ENDPOINT, SEARCH_INDEX, new AzureKeyCredential(SEARCH_KEY));
    const rawHits = await searchTopN(context, searchClient, question, 6);

    // Normalize docs
    const snippets = [];
    for (const h of rawHits) {
      const doc = h?.document ?? h;
      const text = (doc?.content ?? "").toString().slice(0, 1200);
      const src = doc?.source || doc?.file || doc?.book || "unknown";
      const page = doc?.page ?? doc?.pageno ?? doc?.pageNumber ?? null;
      if (text && text.trim()) {
        snippets.push({ text, source: src, page });
      }
    }

    const sourcesBlock = snippets.map((s, i) =>
      `[[${i + 1}]] Source: ${s.source}${s.page ? ` (p.${s.page})` : ""}\n${s.text}`
    ).join("\n\n");

    const systemPrompt =
      "You are RoofVault AI, a roofing standards assistant. " +
      "Answer ONLY from the provided sources (NRCA, IIBEC, ASTM, etc.). " +
      "If the answer is not clearly supported, say you are unsure and suggest the most relevant source sections. " +
      "Cite sources inline using [#] matching the list below.";

    const userPrompt = `Question: ${question}

Sources:
${sourcesBlock || "(no sources found)"}`;

    // 2) AOAI via REST (built-in fetch, no SDK)
    const url = `${AOAI_ENDPOINT}openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=2024-06-01`;

    const payload = {
      temperature: 0.2,
      max_tokens: 900,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": AOAI_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      context.log.error("[rvchat] AOAI error:", resp.status, data);
      throw new Error(`AOAI HTTP ${resp.status}: ${data?.error?.message || data?.message || "unknown error"}`);
    }

    const answer = data?.choices?.[0]?.message?.content?.trim?.() || "No answer generated.";

    context.res = cors({
      ok: true,
      question,
      answer,
      sources: snippets.map((s, i) => ({ id: i + 1, source: s.source, page: s.page }))
    });
  } catch (e) {
    context.log.error("[rvchat] Error:", e);
    context.res = cors({ ok: false, error: String(e?.message || e) }, 500);
  }
};
