/**
 * RoofVault /api/rvchat (stable REST build)
 * - Azure AI Search (REST)
 * - Azure OpenAI (REST)
 * - Safe, hard bias for:
 *     • "Membrane" + "2023"
 *     • "Steep-slope" + "2021"
 *     • "MOD-Details"
 *     • "SH-Details"
 */

const {
  AOAI_ENDPOINT, AOAI_KEY, AOAI_DEPLOYMENT,
  SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX
} = process.env;

function cors(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
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

function enrichQuery(q) {
  const base = (q || "").trim();
  // If the exact phrasing includes "existing", don't add extra terms
  if (/\bexisting\b/i.test(base)) return base;
  const boost = "(MOD K OR MOD L OR SH L OR SH M OR roof-to-roof transition OR slope change OR tie-in OR transition OR flashing OR modified bitumen OR asphalt shingle)";
  return base ? `${base} ${boost}` : boost;
}

function score(d) {
  let s = 0;
  const text = (d.content || "").toLowerCase();
  const name = (d.name || "").toLowerCase();
  const path = (d.path || "").toLowerCase();

  // Content keyword hits
  const RX = [
    /\bmod\s?[- ]?[a-z0-9]{1,3}\b/gi,
    /\bsh\s?[- ]?[a-z0-9]{1,3}\b/gi,
    /roof[-\s]?to[-\s]?roof/gi,
    /slope change/gi,
    /tie[-\s]?in/gi,
    /\btransition(s)?\b/gi,
    /\bflashing\b/gi,
    /modified bitumen/gi,
    /asphalt shingle/gi,
    /\bexisting\b/gi
  ];
  for (const rx of RX) { const m = text.match(rx); if (m) s += m.length * 2; }

  // Filename/path boosts
  if (name.includes("nrca")) s += 6;
  if (name.includes("manual")) s += 4;
  if (name.includes("detail") || name.includes("details")) s += 4;
  if (path.includes("roofdocs")) s += 2;

  // *** SAFE HARD BIAS so your new manuals always float to top ***
  if (name.includes("membrane") && name.includes("2023")) s += 100;
  if (name.includes("steep-slope") && name.includes("2021")) s += 100;
  if (name.includes("mod-details")) s += 100;
  if (name.includes("sh-") && name.includes("details")) s += 100;

  // Light penalty for very old editions so they don't outrank new ones
  if (name.includes("1989")) s -= 10;
  if (name.includes("1996")) s -= 8;
  if (name.includes("2012") || name.includes("2013")) s -= 6;

  return s;
}

async function searchDocs(query, topN = 10) {
  const enriched = enrichQuery(query);
  const base = SEARCH_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;

  const body = {
    search: enriched,
    top: 48,
    searchMode: "any",
    queryType: "simple",
    searchFields: "content",
    select: "content,metadata_storage_name,metadata_storage_path,id"
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "api-key": SEARCH_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const rawText = await r.text();
  let json = null; try { json = JSON.parse(rawText); } catch {}
  if (!r.ok) {
    throw new Error(`Search HTTP ${r.status}: ${json?.error?.message || json?.message || rawText || "unknown error"}`);
  }

  const arr = Array.isArray(json?.value) ? json.value : [];
  const raw = arr.map(v => ({
    content: (v?.content ?? "").toString(),
    name: v?.metadata_storage_name || "",
    path: v?.metadata_storage_path || ""
  })).filter(d => d.content && d.content.trim());

  const ranked = raw.map(d => ({ ...d, __score: score(d) }))
                    .sort((a, b) => b.__score - a.__score);

  return ranked.slice(0, topN).map((d, i) => ({
    id: i + 1,
    text: d.content.slice(0, 1600),
    source: d.name || d.path || "unknown"
  }));
}

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

  const rawText = await r.text();
  let json = null; try { json = JSON.parse(rawText); } catch {}
  if (!r.ok) {
    throw new Error(`AOAI HTTP ${r.status}: ${json?.error?.message || json?.message || rawText || "unknown error"}`);
  }
  return json?.choices?.[0]?.message?.content?.trim?.() || "No answer generated.";
}

module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") { context.res = cors({ ok:true }); return; }
    if (req.method === "GET") { context.res = cors({ ok:true, ping:"rvchat alive" }); return; }

    const { missing, seen } = validateEnv();
    if (missing.length) { context.res = cors({ ok:false, error:"Missing required environment variables.", missing, seen }, 500); return; }

    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const question = body.question || (messages.length ? (messages[messages.length - 1]?.content || "") : "");
    if (!question) { context.res = cors({ ok:false, error:"No question provided." }, 400); return; }

    const snippets = await searchDocs(question, 10);
    const sourcesBlock = snippets.map(s => `[[${s.id}]] ${s.source}\n${s.text}`).join("\n\n");

    const systemPrompt =
      "You are RoofVault AI, a roofing standards assistant. " +
      "Answer ONLY from the provided NRCA/IIBEC/ASTM sources. " +
      "Start with a clear yes/no on whether a standard NRCA detail exists for the described junction. " +
      "If none exists, say so, then outline the NRCA-aligned flashing/transition method. " +
      "When possible, name relevant NRCA Construction Detail families/IDs (e.g., MOD-K-2, SH-L-1). " +
      "Keep output neat (plain text, short bullets). " +
      "Cite sources inline using [#] matching the list below.";

    const userPrompt = `Question: ${question}

Sources:
${sourcesBlock || "(no sources found)"}`;

    let answer = await aoaiChat(systemPrompt, userPrompt);

    // Clean formatting a bit
    answer = answer
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/-\s+/g, "• ")
      .trim();

    context.res = cors({
      ok: true,
      question,
      answer,
      sources: snippets.map(s => ({ id: s.id, source: s.source }))
    });
  } catch (e) {
    context.log.error("[rvchat] Fatal:", e);
    context.res = cors({ ok:false, error:String(e?.message || e), stack:String(e?.stack || "") }, 500);
  }
};
