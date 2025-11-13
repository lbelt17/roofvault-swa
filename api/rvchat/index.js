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

/* Lightweight alias expansion */
function aliasExpand(q) {
  let s = String(q || "");
  s = s.replace(/\bmembrane (roof )?systems?\b/ig, "Membrane Roof Systems");
  s = s.replace(/\broof\s*decks\s*(a\s*to\s*z|atoz|a\-z)\b/ig, "Roof Decks: A to Z Hogan");
  s = s.replace(/\bsteep[-\s]?slope\b/ig, "Steep-slope Roof Systems");
  return s;
}

/* Helpers for family grouping/scoring */
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

/* Azure AI Search → return snippets */
async function searchSnippets(query, topN = 8) {
  const base = (SEARCH_ENDPOINT || "").replace(/\/+$/, "");
  const url  = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;

  const q1 = aliasExpand(String(query||"").trim());
  const qToks = _tokens(q1);

  let pass1;
  try {
    const r = await postJson(url, { "api-key": SEARCH_KEY }, {
      search: qToks.join(" "),
      top: 60,
      searchMode: "any",
      queryType: "full",
      searchFields: "content,metadata_storage_name,metadata_storage_path",
      select: "content,metadata_storage_name,metadata_storage_path"
    });
    pass1 = JSON.parse(r.text || "{}");
  } catch (e) {
    return [];
  }

  const vals = Array.isArray(pass1?.value) ? pass1.value : [];

  if (vals.length) {
    const top = vals.slice(0, Math.max(topN, 8));
    return top.map((v,i) => ({
      id: i + 1,
      source: (v?.metadata_storage_name || "unknown"),
      text: String(v?.content || "").slice(0, 1400)
    }));
  }

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

  let best = null;
  for (const g of groups.values()){ if (!best || g.total > best.total) best = g; }
  const chosen = (best && best.total >= 1) ? best.items : vals;

  return (chosen || []).slice(0, topN).map((v, i) => ({
    id: i+1,
    source: v?.metadata_storage_name || "unknown.pdf",
    text: String(v?.content || "").slice(0, 1200)
  })).filter(s => s.text && s.source);
}

/* AOAI chat completion wrapper */
async function aoaiAnswer(systemPrompt, userPrompt) {
  const base = (AOAI_ENDPOINT || "").replace(/\/+$/, "");
  const url  = `${base}/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=2024-06-01`;

  let resp;
  try {
    resp = await postJson(url, { "api-key": AOAI_KEY }, {
      temperature: 0.1,
      max_tokens: 900,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt }
      ]
    });
  } catch (e) {
    return { ok:false, error:String(e && e.message || e) };
  }

  let parsed = null;
  try { parsed = JSON.parse(resp.text || "{}"); } catch {}

  if (!resp.ok) {
    const err = parsed?.error?.message || parsed?.message || resp.text || "unknown";
    return { ok:false, error:`AOAI HTTP ${resp.status}: ${err}` };
  }

  const content = parsed?.choices?.[0]?.message?.content?.trim?.() || "";
  return { ok:true, content };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = jsonRes({ ok:true });
    return;
  }

  /* Hard diag */
  try {
    if (req.method === "GET" && String(req.query?.diag) === "1") {
      const seen = {
        SEARCH_ENDPOINT: !!SEARCH_ENDPOINT,
        SEARCH_KEY:      !!SEARCH_KEY,
        SEARCH_INDEX:    !!SEARCH_INDEX,
        AOAI_ENDPOINT:   !!AOAI_ENDPOINT,
        AOAI_KEY:        !!AOAI_KEY,
        AOAI_DEPLOYMENT: !!AOAI_DEPLOYMENT
      };
      context.res = jsonRes({ ok:true, layer:"diag", node:process.version, seen, t:new Date().toISOString() });
      return;
    }
  } catch(e) {
    context.res = jsonRes({ ok:false, layer:"diag", node:process.version, error:String(e) });
    return;
  }

  try {
    /* Env guard */
    const reqEnv = {
      SEARCH_ENDPOINT: !!SEARCH_ENDPOINT,
      SEARCH_KEY:      !!SEARCH_KEY,
      SEARCH_INDEX:    !!SEARCH_INDEX,
      AOAI_ENDPOINT:   !!AOAI_ENDPOINT,
      AOAI_KEY:        !!AOAI_KEY,
      AOAI_DEPLOYMENT: !!AOAI_DEPLOYMENT
    };
    if (!Object.values(reqEnv).every(Boolean)) {
      context.res = jsonRes({ ok:false, layer:"env", error:"Missing environment variables", seen:reqEnv });
      return;
    }

    /* Input parsing */
    const body = req.body || {};
    const msgs = Array.isArray(body.messages) ? body.messages : [];
    const question =
      (body.question ||
       (msgs.length ? (msgs[msgs.length-1]?.content || "") : "") ||
      "").trim();

    if (!question) {
      context.res = jsonRes({ ok:false, layer:"input", error:"No question provided." });
      return;
    }

    /* Search */
    const snippets = await searchSnippets(question, 8);

    /* NEW FORMATTED SYSTEM PROMPT */
    const systemPrompt = [
      "You are RoofVault AI, a senior roofing consultant and technical expert.",
      "Provide detailed, technical, consultant-level explanations using clean, professional formatting.",
      "Use ONLY the provided snippets as your factual base.",
      "Your response must always follow this structure:",
      "",
      "1) **Overview Section** — A short, plain-language summary (2–3 sentences).",
      "2) **Technical Explanation Section** — Well-organized paragraphs with bold section headers (e.g., **Definitions**, **Assembly Behavior**, **Failure Modes**, **Best Practices**).",
      "3) **Real-World Relevance Section** — Explain why the information matters for design, installation, inspections, and forensic analysis.",
      "",
      "Formatting rules:",
      "- Use bold headers, NOT Markdown headings (no ###).",
      "- Use paragraphs, not code blocks.",
      "- Do not bullet every line — mix bullets and paragraphs naturally.",
      "- Maintain clear spacing and clean layout.",
      "",
      "Content rules:",
      "- Prefer the most recent edition; if guidance conflicts, name the year.",
      "- Every factual point must include a [#] citation directly tied to a snippet.",
      "- If something is not supported by snippets, state: 'No support in the provided sources.'",
      "- Do not invent detail IDs, standard numbers, or language not in the snippets."
    ].join(" ");

    const userPrompt = `Question: ${question}

Sources:
${snippets.map(s => "[[" + s.id + "]] " + s.source + "\n" + s.text).join("\n\n") || "(no sources found)"}`;

    const ao = await aoaiAnswer(systemPrompt, userPrompt);
    let answer = (ao.ok ? ao.content : "") || "";

    if (!answer && !snippets.length) answer = "No support in the provided sources.";
    if (!answer && ao.error) answer = `No answer due to model error: ${ao.error}`;

    answer = answer.replace(/\n{3,}/g, "\n\n").trim();

    context.res = jsonRes({
      ok: true,
      question,
      answer,
      sources: snippets.map(s => ({ id: s.id, source: s.source }))
    });

  } catch (e) {
    context.res = jsonRes({
      ok:false,
      layer:"pipeline",
      error:String((e && e.message) || e),
      stack:String(e && e.stack || "")
    });
  }
};
