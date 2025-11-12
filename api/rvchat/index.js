const { SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX, AOAI_ENDPOINT, AOAI_KEY, AOAI_DEPLOYMENT } = process.env;

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

// Tiny https POST (no external deps)
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
        res.on("data", (c) => text += c);
        res.on("end", () => resolve({ status: res.statusCode, ok: res.statusCode>=200&&res.statusCode<300, text }));
      });
      req.on("error", reject);
      req.write(data);
      req.end();
    } catch (e) { reject(e); }
  });
}

// Higher-quality search
async function searchSnippets(query, topN = 8) {
  const base = (SEARCH_ENDPOINT || "").replace(/\/+$/, "");
  const url = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;

  // --- helpers ---
  function norm(s){ return (s||"").toLowerCase(); }
  function tokens(s){
    return norm(s)
      .replace(/[^a-z0-9\-\._ ]+/g," ")
      .split(/\s+/)
      .filter(w => w && w.length>2 && !["the","and","for","with","from","manual","roof","roofs","systems","system","nrca","iibec","detail","details","part"].includes(w));
  }
  function familyKey(name){
    const n = norm(name||"");
    // collapse common patterns into a family signature
    // ex: "NRCA Roofing Manual Membrane Roof systems 2023 -MOD-Details_Part3.pdf"
    // ex: "IIBEC-405_RoofDecks-AtoZ_Hogan_FINAL_Digital_Part4.pdf"
    return n
      .replace(/_part\d+|[\s\-]part\d+|_final.*|\.pdf$|_ocr/g,"")
      .replace(/\s+/g," ")
      .slice(0,180); // compact
  }
  function scoreFamily(qToks, name){
    const nameToks = tokens(name);
    if (!nameToks.length) return 0;
    let hit = 0;
    for (const t of qToks){
      if (nameToks.includes(t)) hit += 1;
    }
    // small bonus for year/direct hints
    if (/\b2023\b/.test(name)) hit += 0.5;
    if (/\b2021\b/.test(name)) hit += 0.2;
    if (/membrane/.test(name)) hit += 0.5;
    if (/steep[-\s]?slope/.test(name)) hit += 0.5;
    if (/roof\s*decks/.test(name) || /atoz|a[\s-]*to[\s-]*z/.test(name)) hit += 0.8;
    return hit;
  }

  async function post(url, bodyObj){
    const resp = await postJson(url, { "api-key": SEARCH_KEY }, bodyObj);
    let parsed=null; try { parsed = JSON.parse(resp.text); } catch {}
    if (!resp.ok) throw new Error(`Search HTTP ${resp.status}: ${parsed?.error?.message || parsed?.message || resp.text || "unknown"}`);
    return parsed;
  }

  // --- PASS 1: broad probe over content+name+path ---
  const q1 = (query||"").trim();
  const qToks = tokens(q1);
  const pass1 = await post(url, {
    search: q1,
    top: 40,
    searchMode: "any",
    // IMPORTANT: include filename & path in both search and select
    queryType: "full",
    searchFields: "content,metadata_storage_name,metadata_storage_path",
    select: "content,metadata_storage_name,metadata_storage_path"
  });

  const vals = Array.isArray(pass1?.value) ? pass1.value : [];
  // group hits by "family"
  const groups = new Map();
  for (const v of vals) {
    const name = v?.metadata_storage_name || "";
    const key = familyKey(name);
    const s = scoreFamily(qToks, name + " " + (v?.metadata_storage_path||""));
    const g = groups.get(key) || { key, nameSample: name, total:0, items:[] };
    g.total += s;
    g.items.push(v);
    groups.set(key, g);
  }

  // choose best family if clearly dominant
  let best = null;
  for (const g of groups.values()){
    if (!best || g.total > best.total) best = g;
  }
  // compute second best to ensure margin
  let second = null;
  for (const g of groups.values()){
    if (g === best) continue;
    if (!second || g.total > second.total) second = g;
  }
  const margin = (best?.total || 0) - (second?.total || 0);

  const confident = (best && best.total >= 2 && margin >= 0.8);
  let finalList = vals;

  if (confident) {
    // --- PASS 2: target the chosen family (by name/path) ---
    // Build a name/path focus clause that still allows content relevance
    const familyName = (best.nameSample || "").replace(/"/g,'\\"');
    const focus = `("${familyName}" OR ${familyName.split(/\s+/).slice(0,3).join(" AND ")})`;
    const q2 = `${q1} AND (${focus})`;
    const pass2 = await post(url, {
      search: q2,
      top: 60,
      searchMode: "any",
      queryType: "full",
      searchFields: "content,metadata_storage_name,metadata_storage_path",
      select: "content,metadata_storage_name,metadata_storage_path"
    });
    finalList = Array.isArray(pass2?.value) ? pass2.value : vals;
  }

  // now rank by quick heuristic (favor newer/manual-ish names)
  function rankScore(v){
    const name = norm(v?.metadata_storage_name||"");
    const text = norm(v?.content||"");
    let s = 0;
    if (/2023/.test(name)) s += 2.0;
    if (/2021/.test(name)) s += 1.0;
    if (/membrane/.test(name)) s += 1.2;
    if (/steep[-\s]?slope/.test(name)) s += 1.0;
    if (/iibec|hogan/.test(name)) s += 1.2;
    if (/manual/.test(name)) s += 0.8;
    if (/detail|details/.test(name)) s += 0.4;
    // light content boost for exact query terms
    const ql = norm(q1);
    if (ql && text.includes(ql.split(/\s+/)[0]||"")) s += 0.2;
    return s;
  }

  finalList.sort((a,b)=> rankScore(b)-rankScore(a));
  const top = finalList.slice(0, Math.max(10, topN)); // keep a bit more, trim later

  // slice snippets and shape output
  const out = top.map((v,i) => {
    const content = (v?.content || "");
    const short = content.length > 600 ? content.slice(0,600) : content;
    return {
      id: i+1,
      source: v?.metadata_storage_name || "unknown",
      path: v?.metadata_storage_path || "",
      text: short
    };
  });

  return out.slice(0, topN);
}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;
  const resp = await postJson(url, { "api-key": SEARCH_KEY }, {
    search: (query || "").trim(),
    top: 60,
    searchMode: "any",
    queryType: "simple",
    select: "content,metadata_storage_name,metadata_storage_path"
  });
  let parsed = null; try { parsed = JSON.parse(resp.text); } catch {}
  if (!resp.ok) throw new Error(`Search HTTP ${resp.status}: ${parsed?.error?.message || parsed?.message || resp.text || "unknown"}`);
  let raw = Array.isArray(parsed?.value) ? parsed.value : [];

      // --- Org filter: if the question names IIBEC/NRCA/ASTM, keep only those hits (when present) ---
  try {
    const q = String(query || "").toLowerCase();
    let org = null;
    if (/\biibec\b/.test(q)) org = 'iibec';
    else if (/\bnrca\b/.test(q)) org = 'nrca';
    else if (/\bastm\b/.test(q)) org = 'astm';

    if (org) {
      const matches = raw.filter(v => {
        const name = ((v?.metadata_storage_name || '') + ' ' + (v?.metadata_storage_path || '')).toLowerCase();
        return name.includes(org);
      });
      if (matches.length >= 1) raw = matches; // only narrow if we found at least one
    }
  } catch (_) { /* never throw */ }// --- Safe narrowing on raw search hits (never throws) ---
  try {
    const q = String(query || "");
    const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);
    const wantYear = yearMatch ? yearMatch[1] : null;
    const mentionsMembrane = /\bmembrane\b/i.test(q);

    // Prefer explicit year if the question contains one
    if (wantYear) {
      const yr = raw.filter(v =>
        (v?.metadata_storage_name || "").includes(wantYear) ||
        (v?.metadata_storage_path || "").includes(wantYear)
      );
      if (yr.length >= 3) raw = yr;
    }

    // If question mentions "membrane" and membrane docs exist, drop steep-slope entirely
    if (mentionsMembrane) {
      const hasMem = raw.some(v =>
        /membrane/i.test((v?.metadata_storage_name || "") + (v?.metadata_storage_path || ""))
      );
      if (hasMem) {
        raw = raw.filter(v =>
          !/steep[-\s]?slope/i.test((v?.metadata_storage_name || "") + (v?.metadata_storage_path || ""))
        );
      }
    }
  } catch (_) { /* never throw */ }function yearFromName(name) {
    const m = (name || "").match(/\b(19\d{2}|20\d{2})\b/);
    return m ? parseInt(m[1], 10) : null;
  }
  const wantHistoric = /\b(19\d{2}|200[0-9])\b/i.test(query || "") || /\bhistory|historical|older|archive\b/i.test(query || "");

  const items = raw.map((v) => {
    const source = v?.metadata_storage_name || v?.metadata_storage_path || "unknown";
    const text = (v?.content || "").toString();
    const lower = source.toLowerCase();
    let score = 0;
    if (/\bmembrane\b|2023/.test(lower)) score += 12;
    if (/\bsteep[-\s]?slope\b|2021/.test(lower)) score += 10;
    if (/\bmod\b/.test(lower)) score += 6;
    if (/\bsh\b/.test(lower))  score += 6;
    const yr = yearFromName(source);
    if (yr) score += Math.min(yr - 2000, 30);
    if (!wantHistoric && yr && yr < 2010) score -= 25;
    if (/nrca|iibec|astm|manual|detail/.test(lower)) score += 4;
    return { source, text, year: yr, score };
  }).filter(x => x.text && x.text.trim());

  items.sort((a,b) => b.score - a.score);
  const seen = new Map();
  const picked = [];
  for (const it of items) {
    const c = seen.get(it.source) || 0;
    if (c >= 2) continue;
    seen.set(it.source, c + 1);
    picked.push(it);
    if (picked.length >= Math.max(6, Math.min(16, topN))) break;
  }

  return picked.map((x, i) => ({
    id: i + 1,
    source: x.source,
    text: x.text.slice(0, 1600)
  }));
}

async function aoaiAnswer(systemPrompt, userPrompt) {
  const base = (AOAI_ENDPOINT || "").replace(/\/+$/, "");
  const url = `${base}/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=2024-06-01`;
  const resp = await postJson(url, { "api-key": AOAI_KEY }, {
    temperature: 0.1,
    max_tokens: 700,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });
  let parsed = null; try { parsed = JSON.parse(resp.text); } catch {}
  if (!resp.ok) throw new Error(`AOAI HTTP ${resp.status}: ${parsed?.error?.message || parsed?.message || resp.text || "unknown"}`);
  return parsed?.choices?.[0]?.message?.content?.trim?.() || "No answer generated.";
}

module.exports = async function (context, req) {
  // --- TEMP SHORT-CIRCUIT (debug) ---
  if (req && String(req.query?.diag) === "1") {
    context.res = {
      status: 200,
      headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" },
      body: JSON.stringify({ ok:true, route:"rvchat", note:"short-circuit", node: process.version, t: new Date().toISOString() })
    };
    return;
  }
  // --- END TEMP SHORT-CIRCUIT ---
  // --- HARD DIAG GUARD (cannot throw) ---
  try {
    if (req?.method === "GET" && String(req?.query?.diag) === "1") {
      const seen = {
        SEARCH_ENDPOINT: !!(process.env.SEARCH_ENDPOINT||"").trim(),
        SEARCH_KEY: !!(process.env.SEARCH_KEY||"").trim(),
        SEARCH_INDEX: !!(process.env.SEARCH_INDEX||"").trim(),
        AOAI_ENDPOINT: !!(process.env.AOAI_ENDPOINT||"").trim(),
        AOAI_KEY: !!(process.env.AOAI_KEY||"").trim(),
        AOAI_DEPLOYMENT: !!(process.env.AOAI_DEPLOYMENT||"").trim()
      };
      context.res = jsonRes({ ok:true, layer:"diag", node:process.version, seen, t:new Date().toISOString() }, 200);
      return;
    }
  } catch(_e) {
    context.res = jsonRes({ ok:false, layer:"diag", node:process.version, error:String(_e && _e.message || _e) }, 200);
    return;
  }
  // --- END HARD DIAG GUARD ---
  try {
    if (req.method === "OPTIONS") { context.res = jsonRes({ ok:true }); return; }

    // --- DIAG PATH: /api/rvchat?diag=1 ---
    if ((req.query && (req.query.diag == "1")) || (req.body && req.body.diag == 1)) {
      const seen = {
        SEARCH_ENDPOINT: !!(SEARCH_ENDPOINT && SEARCH_ENDPOINT.trim()),
        SEARCH_KEY: !!(SEARCH_KEY && SEARCH_KEY.trim()),
        SEARCH_INDEX: !!(SEARCH_INDEX && SEARCH_INDEX.trim()),
        AOAI_ENDPOINT: !!(AOAI_ENDPOINT && AOAI_ENDPOINT.trim()),
        AOAI_KEY: !!(AOAI_KEY && AOAI_KEY.trim()),
        AOAI_DEPLOYMENT: !!(AOAI_DEPLOYMENT && AOAI_DEPLOYMENT.trim())
      };
      let names = [], status = null, rawError = null;
      if (seen.SEARCH_ENDPOINT && seen.SEARCH_KEY && seen.SEARCH_INDEX) {
        const base = SEARCH_ENDPOINT.replace(/\/+$/, "");
        const url = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;
        try {
          const r = await postJson(url, { "api-key": SEARCH_KEY }, { search: "membrane", top: 5, select: "metadata_storage_name" });
          status = r.status;
          const j = JSON.parse(r.text);
          names = Array.isArray(j?.value) ? j.value.map(v => v?.metadata_storage_name || "unknown") : [];
          if (!r.ok) rawError = j?.error?.message || j?.message || r.text || null;
        } catch (e) { rawError = String(e && e.message || e); }
      }
      context.res = jsonRes({ ok:true, layer:"diag", node: process.version, seen, searchStatus: status, hitNames: names, rawError });
      return;
    }
    // --- END DIAG ---

    // Env presence check
    const seen = {
      SEARCH_ENDPOINT: !!(SEARCH_ENDPOINT && SEARCH_ENDPOINT.trim()),
      SEARCH_KEY: !!(SEARCH_KEY && SEARCH_KEY.trim()),
      SEARCH_INDEX: !!(SEARCH_INDEX && SEARCH_INDEX.trim()),
      AOAI_ENDPOINT: !!(AOAI_ENDPOINT && AOAI_ENDPOINT.trim()),
      AOAI_KEY: !!(AOAI_KEY && AOAI_KEY.trim()),
      AOAI_DEPLOYMENT: !!(AOAI_DEPLOYMENT && AOAI_DEPLOYMENT.trim())
    };
    if (!Object.values(seen).every(Boolean)) {
      context.res = jsonRes({ ok:false, error:"Missing environment variables", seen, layer:"env" }, 200);
      return;
    }

    const body = req.body || {};
    const msgs = Array.isArray(body.messages) ? body.messages : [];
    const question = (body.question || (msgs.length ? (msgs[msgs.length-1]?.content || "") : "") || "").trim();
    if (!question) { context.res = jsonRes({ ok:false, error:"No question provided.", layer:"input" }, 200); return; }

    // 1) Search
    const snippets = await searchSnippets(aliasExpand(question), 8);

    // 2) Prompt
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

    // 3) AOAI
    let answer = await aoaiAnswer(systemPrompt, userPrompt);
    answer = answer.replace(/\n{3,}/g, "\n\n").trim();

    context.res = jsonRes({
      ok: true,
      question,
      answer,
      sources: snippets.map(s => ({ id: s.id, source: s.source }))
    });
  } catch (e) {
    // Always 200 so we can see the actual error
    context.res = jsonRes({ ok:false, error:String(e && (e.message || e)), stack:String(e && e.stack || ""), layer:"pipeline" }, 200);
  }
};












