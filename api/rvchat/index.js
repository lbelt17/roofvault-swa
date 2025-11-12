/**
 * RoofVault /api/rvchat — REST-only
 * - Azure AI Search (REST)
 * - Azure OpenAI (REST)
 * - Exact phrasing if "existing" is present
 * - Strong ranking for MOD/SH + 2023/2021 manuals, and hard-prefer those when present
 */


const _fetch = (typeof fetch !== 'undefined')
  ? fetch
  : ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));
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

function enrichQuery(q) {
  const base = (q || "").trim();
  // Avoid over-biasing broad asks; no enrichment for very short queries
  if (!base || base.split(/\s+/).length <= 3) return base;
  // Keep as-is for now (no corpus-specific boosts)
  return base;
} ${boost}` : boost;
}

function score(d) {
  let s = 0;
  const text = (d.content || "").toLowerCase();
  const name = (d.name || "").toLowerCase();
  const path = (d.path || "").toLowerCase();

  // Keyword hits
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

  // Filename/path boosts (prefer your new manuals)
  if (name.includes("mod") || name.includes("-mod-")) s += 12;
  if (name.includes("sh")  || name.includes("-sh-"))  s += 12;
  if (name.includes("membrane") || name.includes("2023")) s += 12;
  if (name.includes("steep-slope") || name.includes("2021")) s += 12;

  // Generic boosts
  if (name.includes("nrca")) s += 6;
  if (name.includes("manual")) s += 4;
  if (name.includes("detail") || name.includes("details")) s += 4;
  if (path.includes("roofdocs")) s += 2;

  // Penalize older editions so they don't outrank new ones
  if (name.includes("1989")) s -= 10;
  if (name.includes("1996")) s -= 9;
  if (name.includes("2012")) s -= 6;
  if (name.includes("2013")) s -= 6;
  if (name.includes("2017")) s -= 3;

  // Small bonus for any 2020+ year mentions
  if (/(202[0-9])/.test(name)) s += 2;

  return s;
}
async function searchDocs(query, topN = 10) {
  const enriched = enrichQuery(query);
  const base = SEARCH_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;

  const body = {
    search: enriched,
    top: 60, // wider catch
    searchMode: "any",
    queryType: "simple",
    searchFields: "content",
    select: "content,metadata_storage_name,metadata_storage_path,id"
  };

  const r = await _fetch(url, {
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

  // Rank everything
  const ranked = raw.map(d => ({ ...d, __score: score(d) }))
                    .sort((a, b) => b.__score - a.__score);

  // Priority selectors
  const isMem2023 = (n) => /membrane/i.test(n) && /2023/.test(n);
  const isSteep2021 = (n) => /steep[-\s]?slope/i.test(n) && /2021/.test(n);
  const hasMOD = (n) => /\bmod\b|\-mod\-|mod\-details/i.test(n);
  const hasSH  = (n) => /\bsh\b|\-sh\-|sh\-details/i.test(n);

  const pri = [];
  for (const d of ranked) {
    const n = (d.name || "").toLowerCase();
    if (isMem2023(n) && !pri.some(x => isMem2023((x.name||"").toLowerCase()))) pri.push(d);
    if (isSteep2021(n) && !pri.some(x => isSteep2021((x.name||"").toLowerCase()))) pri.push(d);
  }
  // If still missing either family, grab first file that looks like MOD or SH
  if (!pri.some(d => hasMOD((d.name||"").toLowerCase()))) {
    const m = ranked.find(d => hasMOD((d.name||"").toLowerCase()));
    if (m) pri.push(m);
  }
  if (!pri.some(d => hasSH((d.name||"").toLowerCase()))) {
    const s = ranked.find(d => hasSH((d.name||"").toLowerCase()));
    if (s) pri.push(s);
  }

  // Merge: priority first, then the rest (de-dup)
  const seen = new Set(pri.map(d => d.path || d.name));
  const tail = ranked.filter(d => !seen.has(d.path || d.name));
  const merged = pri.concat(tail);

  return merged.slice(0, topN).map((d, i) => ({
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

  const r = await _fetch(url, {
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

    const { missing, seen } = validateEnv();
    if (missing.length) { context.res = cors({ ok:false, error:"Missing required environment variables.", missing, seen }, 500); return; }

    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const question = body.question || (messages.length ? (messages[messages.length - 1]?.content || "") : "");
    if (!question) { context.res = cors({ ok:false, error:"No question provided." }, 400); return; }

    // Search documents
    const snippets = await searchDocs(question, 8);
    const sourcesBlock = snippets.map(s => `[[${s.id}]] ${s.source}\n${s.text}`).join("\n\n");

    const systemPrompt = `
You are RoofVault AI, a building-envelope/roofing standards assistant.
Use ONLY the provided source snippets (NRCA, IIBEC, ASTM, manufacturers, or any uploaded docs).
If the sources do not support a claim, say you do not have support.
Prefer the most recent guidance when multiple editions conflict; call out edition/year if relevant.
Do not invent standard numbers or detail IDs—mention them only if the exact text appears in the snippets.
Keep responses concise with plain text and short bullets.
Cite sources inline as [#] where # maps to the list below.
`;

    const priorityNames = (snippets || [])
  .map(s => s.source || "")
  .filter(Boolean)
  .slice(0, 4);

const userPrompt = `Question: ${question}

Priority sources (by filename):
${(priorityNames.length ? priorityNames.map(n => "- " + n).join("\n") : "(none)")}

Sources:
${snippets.map(s => "[[" + s.id + "]] " + s.source + "\n" + s.text).join("\n\n") || "(no sources found)"}`;

    // Generate answer
    let answer = await aoaiChat(systemPrompt, userPrompt);

    // Cleanup
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
    context.res = cors({ ok:false, error:String(e?.message || e), stack: String(e?.stack || "") }, 500);
  }
};





