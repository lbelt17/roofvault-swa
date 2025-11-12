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
  const resp = await postJson(url, { "api-key": SEARCH_KEY }, {
    search: (query || "").trim(),
    top: 60,
    searchMode: "any",
    queryType: "simple",
    select: "content,metadata_storage_name,metadata_storage_path"
  });
  let parsed = null; try { parsed = JSON.parse(resp.text); } catch {}
  if (!resp.ok) throw new Error(`Search HTTP ${resp.status}: ${parsed?.error?.message || parsed?.message || resp.text || "unknown"}`);
  const raw = Array.isArray(parsed?.value) ? parsed.value : [];

  function yearFromName(name) {
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
    temperature: 0.2,
    max_tokens: 900,
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
    const snippets = await searchSnippets(question, 8);

    // 2) Prompt
    const systemPrompt = "You are RoofVault AI. Answer using ONLY the provided snippets (NRCA, IIBEC, ASTM, manufacturers, or any uploaded docs). Prefer the most recent editions. If support is missing, say so. Keep it concise with short bullets. Cite as [#] matching the snippets list.";
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
