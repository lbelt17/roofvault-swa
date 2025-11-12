const { SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX, AOAI_ENDPOINT, AOAI_KEY, AOAI_DEPLOYMENT } = process.env;

/* Always-JSON response helper (never throws, never 500s) */
function jsonRes(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

/* Tiny HTTP(S) JSON POST */
function postJson(url, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    try {
      const { URL } = require("node:url");
      const u = new URL(url);
      const isHttps = u.protocol === "https:";
      const mod = require(isHttps ? "node:https" : "node:http");
      const data = JSON.stringify(bodyObj || {});
      const req = mod.request({
        method: "POST",
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + (u.search || ""),
        headers: Object.assign({
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data)
        }, headers || {})
      }, (res) => {
        let text = "";
        res.on("data", c => text += c);
        res.on("end", () => resolve({ status: res.statusCode, ok: res.statusCode>=200&&res.statusCode<300, text }));
      });
      req.on("error", reject);
      req.write(data);
      req.end();
    } catch (e) { reject(e); }
  });
}

/* Lightweight alias expansion so queries can say "roof decks a-z", etc. */
function aliasExpand(q) {
  let s = String(q || "");
  s = s.replace(/\bmembrane (roof )?systems?\b/ig, "Membrane Roof Systems");
  s = s.replace(/\broof\s*decks\s*(a\s*to\s*z|atoz|a\-z)\b/ig, "Roof Decks: A to Z Hogan");
  s = s.replace(/\bsteep[-\s]?slope\b/ig, "Steep-slope Roof Systems");
  return s;
}

/* Normalize filename family and score by overlap with query tokens */
function _norm(s){ return (s||"").toLowerCase(); }
function _tokens(s){
  return _norm(s).replace(/[^a-z0-9\-\._ ]+/g," ")
    .split(/\s+/)
    .filter(w => w && w.length>2 && !["the","and","for","with","from","manual","roof","roofs","systems","system","nrca","iibec","detail","details","part","final","digital","pdf"].includes(w));
}
function _familyKey(name){
  const n = _norm(name||"");
  return n.replace(/_part\d+|[\s\-]part\d+|_ocr|_final.*|\.pdf$/g,"").replace(/\s+/g," ").slice(0,180);
}
function _scoreFamily(qToks, name, path){
  const nameToks = _tokens((name||"") + " " + (path||""));
  if (!nameToks.length) return 0;
  let hit = 0;
  for (const t of qToks){ if (nameToks.includes(t)) hit += 1; }
  if (/\b2023\b/.test(name)) hit += 0.4;
  if (/\b2021\b/.test(name)) hit += 0.2;
  if (/membrane/.test(name)) hit += 0.4;
  if (/steep[-\s]?slope/.test(name)) hit += 0.4;
  if (/roof\s*decks/.test(name) || /atoz|a[\s-]*to[\s-]*z/.test(name)) hit += 0.6;
  return hit;
}

/* Azure AI Search -> return snippets [{id, source, text}] without throwing */
async function searchSnippets(query, topN = 8) {
  const base = (SEARCH_ENDPOINT || "").replace(/\/+$/, "");
  const url  = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;

  const q1 = aliasExpand(String(query||"").trim());
  const qToks = _tokens(q1);

  let pass1;
  try {
    const r = await postJson(url, { "api-key": SEARCH_KEY }, {
      search: q1,
      top: 60,
      searchMode: "any",
      queryType: "full",
      searchFields: "content,metadata_storage_name,metadata_storage_path",
      select: "content,metadata_storage_name,metadata_storage_path"
    });
    pass1 = JSON.parse(r.text || "{}");
  } catch (e) {
    return []; // fail closed → no snippets, caller will show "No support…"
  }

  const vals = Array.isArray(pass1?.value) ? pass1.value : [];
  // --- fallback selection: if family dominance is unclear, just use top-ranked pass1 hits ---
  // Rank by filename/path relevance (scoreFamily) and pick a generous slice; downstream will trim to topN.
  let chosen = (vals || []);
  try {
    // group by family (if you already do below, this is harmless)
    const groups = new Map();
    for (const v of vals) {
      const name = v?.metadata_storage_name || "";
      const key = (name || "").toLowerCase().replace(/_part\d+|[\s\-]part\d+|_final.*|\.pdf$|_ocr/g,"").replace(/\s+/g," ").slice(0,180);
      const s = (function scoreFamilyLocal(qToks, nm, pth){
        const toks = (nm + " " + (pth||"")).toLowerCase().replace(/[^a-z0-9\-\._ ]+/g," ").split(/\s+/);
        let hit = 0;
        for (const t of (qToks||[])) if (t && toks.includes(t)) hit += 1;
        if (/\b2023\b/.test(nm)) hit += 0.5;
        if (/\b2021\b/.test(nm)) hit += 0.2;
        if (/membrane/.test(nm)) hit += 0.5;
        if (/steep[-\s]?slope/.test(nm)) hit += 0.5;
        if (/roof\s*decks/.test(nm) || /atoz|a[\s-]*to[\s-]*z/.test(nm)) hit += 0.8;
        return hit;
      })( (function makeToks(s){ return (s||"").toLowerCase().replace(/[^a-z0-9\-\._ ]+/g," ").split(/\s+/).filter(w=>w&&w.length>2); })(q1), name, v?.metadata_storage_path );

      const g = groups.get(key) || { key, total:0, items:[] };
      g.total += s;
      g.items.push(v);
      groups.set(key, g);
    }

    // find best family
    let best = null;
    for (const g of groups.values()) if (!best || g.total > best.total) best = g;

    // If a family clearly wins, use it; else use a ranked list of all pass1 hits
    if (best && best.total >= 1.0) {
      chosen = best.items;
    } else {
      chosen = vals
        .map(v => {
          const nm = v?.metadata_storage_name || "";
          const pth = v?.metadata_storage_path || "";
          // reuse same scoring
          let hit = 0;
          const toks = (nm + " " + pth).toLowerCase().replace(/[^a-z0-9\-\._ ]+/g," ").split(/\s+/);
          for (const t of (function makeToks(s){ return (s||"").toLowerCase().replace(/[^a-z0-9\-\._ ]+/g," ").split(/\s+/).filter(w=>w&&w.length>2); })(q1)) {
            if (t && toks.includes(t)) hit += 1;
          }
          if (/\b2023\b/.test(nm)) hit += 0.5;
          if (/\b2021\b/.test(nm)) hit += 0.2;
          if (/membrane/.test(nm)) hit += 0.5;
          if (/steep[-\s]?slope/.test(nm)) hit += 0.5;
          if (/roof\s*decks/.test(nm) || /atoz|a[\s-]*to[\s-]*z/.test(nm)) hit += 0.8;
          return { v, hit };
        })
        .sort((a,b) => b.hit - a.hit)
        .map(x => x.v);
    }
  } catch(_e) {
    // in case any of the above fails, just fall back to pass1 vals
    chosen = vals;
  }

  // Downstream code should build snippets from chosen (not raw pass1 vals):
  const raw = chosen.slice(0, Math.max(topN*2, 20)); // generous slice; later we trim to topN
const groups = new Map();
  for (const v of vals) {
    const name = v?.metadata_storage_name || "";
    const path = v?.metadata_storage_path || "";
    const key  = _familyKey(name);
    const s    = _scoreFamily(qToks, name, path);
    const g    = groups.get(key) || { key, nameSample: name, total:0, items:[] };
    g.total += s;
    g.items.push(v);
    groups.set(key, g);
  }

  // pick dominant family (if one clearly stands out)
  let best = null;
  for (const g of groups.values()) { if (!best || g.total > best.total) best = g; }
  const chosen = (best && best.total >= 1) ? best.items : vals; // fallback to all when weak

  // shape to snippets
  const out = (chosen || []).slice(0, 50).map((v, i) => ({
    id: i+1,
    source: v?.metadata_storage_name || "unknown.pdf",
    text: (v?.content || "").toString().slice(0, 1200)
  })).filter(s => s.text && s.source);

  // prefer topN
  return out.slice(0, topN);
}

/* AOAI chat completion (defensive) */
async function aoaiAnswer(systemPrompt, userPrompt) {
  const base = (AOAI_ENDPOINT || "").replace(/\/+$/, "");
  const url  = `${base}/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=2024-06-01`;
  let resp;
  try {
    resp = await postJson(url, { "api-key": AOAI_KEY }, {
      temperature: 0.1,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt }
      ]
    });
  } catch (e) {
    return { ok:false, error:String(e && e.message || e) };
  }
  let parsed=null; try { parsed = JSON.parse(resp.text || "{}"); } catch {}
  if (!resp.ok) {
    const err = parsed?.error?.message || parsed?.message || resp.text || "unknown";
    return { ok:false, error:`AOAI HTTP ${resp.status}: ${err}` };
  }
  const content = parsed?.choices?.[0]?.message?.content?.trim?.() || "";
  return { ok:true, content };
}

module.exports = async function (context, req) {
  // Hard guard: never throw on OPTIONS
  if (req.method === "OPTIONS") { context.res = jsonRes({ ok:true }); return; }

  // Hard diag (must never 500)
  try {
    if (req?.method === "GET" && String(req?.query?.diag) === "1") {
      const seen = {
        SEARCH_ENDPOINT: !!(SEARCH_ENDPOINT||"").trim(),
        SEARCH_KEY:      !!(SEARCH_KEY||"").trim(),
        SEARCH_INDEX:    !!(SEARCH_INDEX||"").trim(),
        AOAI_ENDPOINT:   !!(AOAI_ENDPOINT||"").trim(),
        AOAI_KEY:        !!(AOAI_KEY||"").trim(),
        AOAI_DEPLOYMENT: !!(AOAI_DEPLOYMENT||"").trim()
      };
      context.res = jsonRes({ ok:true, layer:"diag", node:process.version, seen, t:new Date().toISOString() }, 200);
      return;
    }
  } catch(e) {
    context.res = jsonRes({ ok:false, layer:"diag", node:process.version, error:String(e && e.message || e) }, 200);
    return;
  }

  try {
    // Env presence (report, don't 500)
    const seen = {
      SEARCH_ENDPOINT: !!(SEARCH_ENDPOINT||"").trim(),
      SEARCH_KEY:      !!(SEARCH_KEY||"").trim(),
      SEARCH_INDEX:    !!(SEARCH_INDEX||"").trim(),
      AOAI_ENDPOINT:   !!(AOAI_ENDPOINT||"").trim(),
      AOAI_KEY:        !!(AOAI_KEY||"").trim(),
      AOAI_DEPLOYMENT: !!(AOAI_DEPLOYMENT||"").trim()
    };
    if (!Object.values(seen).every(Boolean)) {
      context.res = jsonRes({ ok:false, layer:"env", error:"Missing environment variables", seen }, 200);
      return;
    }

    // Parse input
    const body = req.body || {};
    const msgs = Array.isArray(body.messages) ? body.messages : [];
    const question = (body.question || (msgs.length ? (msgs[msgs.length-1]?.content || "") : "") || "").trim();
    if (!question) { context.res = jsonRes({ ok:false, layer:"input", error:"No question provided." }, 200); return; }

    // 1) Search (defensive: empty → "No support")
    const snippets = await searchSnippets(question, 8);

    // 2) Prompts (strict)
    const systemPrompt = [
      "You are RoofVault AI.",
      "Use ONLY the provided snippets (NRCA, IIBEC, ASTM, manufacturers, or any uploaded docs).",
      "If a claim is not supported by the snippets, say: 'No support in the provided sources.'",
      "Prefer the most recent editions; if guidance conflicts, name the edition/year.",
      "Do NOT invent standard numbers, detail IDs, or language not present in the snippets.",
      "Answers must be concise, in short bullets, and each bullet must include at least one [#] citation.",
      "Citations [#] map exactly to the numbered snippets list provided."
    ].join(" ");

    const userPrompt = `Question: ${question}

Sources:
${snippets.map(s => "[[" + s.id + "]] " + s.source + "\n" + s.text).join("\n\n") || "(no sources found)"}`;

    // 3) AOAI (defensive)
    const ao = await aoaiAnswer(systemPrompt, userPrompt);
    let answer = (ao.ok ? ao.content : "") || "";
    if (!answer && (!snippets || !snippets.length)) {
      answer = "No support in the provided sources.";
    } else if (!answer && ao.error) {
      answer = `No answer due to model error: ${ao.error}`;
    }
    answer = answer.replace(/\n{3,}/g, "\n\n").trim();

    context.res = jsonRes({
      ok: true,
      question,
      answer,
      sources: (snippets||[]).map(s => ({ id: s.id, source: s.source }))
    }, 200);
  } catch (e) {
    // Final catch: still 200, never 500
    context.res = jsonRes({ ok:false, layer:"pipeline", error:String(e && (e.message||e)), stack:String(e && e.stack || "") }, 200);
  }
};

