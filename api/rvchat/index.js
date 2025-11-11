/**
 * REST-only rvchat: no SDK imports. Works on Node 18+ (global fetch).
 * Uses Azure AI Search REST + Azure OpenAI REST.
 */

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

// --- Azure Search (REST) ---
async function searchDocs(query, topN = 8) {
  // Expand query with NRCA terms
  const enriched = `${query} (MOD K OR MOD L OR SH L OR SH M OR roof-to-roof transition OR slope change OR tie-in OR transition OR flashing OR modified bitumen OR asphalt shingle)`;

  const base = SEARCH_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;

  // Pull a wider net first
  const body = {
    search: enriched || "*",
    top: 24,
    searchFields: "content",
    queryType: "simple",
    select: "content,metadata_storage_name,metadata_storage_path,id"
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "api-key": SEARCH_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(`Search HTTP ${r.status}: ${json?.error?.message || json?.message || "unknown error"}`);
  }

  const arr = Array.isArray(json.value) ? json.value : [];
  const raw = arr.map(v => ({
    content: (v.content ?? "").toString(),
    source: v.metadata_storage_name || v.metadata_storage_path || "unknown",
    path: v.metadata_storage_path || ""
  })).filter(d => d.content && d.content.trim());

  // Re-rank by MOD/SH and transition semantics
  const RX = [
    /\bMOD\s?[A-Z0-9-]{1,4}\b/gi,     // e.g., MOD K-1
    /\bSH\s?[A-Z0-9-]{1,4}\b/gi,      // e.g., SH L-2
    /roof[-\s]?to[-\s]?roof/gi,
    /slope change/gi,
    /tie[-\s]?in/gi,
    /\btransition(s)?\b/gi,
    /\bflashing\b/gi,
    /modified bitumen/gi,
    /asphalt shingle/gi
  ];

  function scoreDoc(d) {
    let s = 0;
    for (const rx of RX) {
      const matches = d.content.match(rx);
      if (matches) s += matches.length * 2;
    }
    // Prefer NRCA manuals by filename
    const name = (d.source || "").toLowerCase();
    if (name.includes("nrca")) s += 6;
    if (name.includes("manual")) s += 4;
    if (name.includes("construction") || name.includes("detail")) s += 3;
    // Slight bonus if path points to your roofdocs container
    if ((d.path || "").toLowerCase().includes("roofdocs")) s += 2;
    return s;
  }

  const ranked = raw
    .map(d => ({ ...d, __score: scoreDoc(d) }))
    .sort((a, b) => b.__score - a.__score);

  const best = ranked.some(d => d.__score > 0) ? ranked : raw; // fallback if all zeros

  // Return topN with trimmed content
  return best.slice(0, topN).map((d, i) => ({
    content: d.content.slice(0, 1600),
    source: d.source
  }));
}
  const arr = Array.isArray(json.value) ? json.value : [];
  // Normalize
  return arr.map(v => ({
    content: (v.content ?? "").toString(),
    source: v.metadata_storage_name || v.metadata_storage_path || "unknown"
  })).filter(d => d.content && d.content.trim());
}

// --- Azure OpenAI (REST) ---
async function aoaiChat(systemPrompt, userPrompt) {
  const base = AOAI_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=2024-06-01`;

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
    if (req.method === "OPTIONS") { context.res = cors({ ok: true }); return; }

    const { missing, seen } = validateEnv();
    if (missing.length) { context.res = cors({ ok:false, error:"Missing required environment variables.", missing, seen }, 500); return; }

    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const question = body.question || (messages.length ? (messages[messages.length - 1]?.content || "") : "");
    if (!question) { context.res = cors({ ok:false, error:"No question provided." }, 400); return; }

    // 1) Search your index
    const docs = await searchDocs(question, 8);

    const snippets = docs.slice(0, 8).map((d, i) => ({
      id: i + 1,
      text: d.content.slice(0, 1200),
      source: d.source
    }));

    const sourcesBlock = snippets.map(s => `[[${s.id}]] ${s.source}\n${s.text}`).join("\n\n");

    const systemPrompt =
      "You are RoofVault AI, a roofing standards assistant. " +
      "Answer ONLY from the provided sources (NRCA, IIBEC, ASTM, etc.). " +
      "If the answer is not clearly supported, say you are unsure and suggest the most relevant source sections. " +
      "Cite sources inline using [#] that match the list below.";

    const userPrompt = `Question: ${question}

Sources:
${sourcesBlock || "(no sources found)"}`;

    // 2) Get answer
    const answer = await aoaiChat(systemPrompt, userPrompt);

    context.res = cors({
      ok: true,
      question,
      answer,
      sources: snippets.map(s => ({ id: s.id, source: s.source }))
    });
  } catch (e) {
    context.log.error("[rvchat] Fatal:", e);
    context.res = cors({ ok:false, error:String(e?.message || e) }, 500);
  }
};



