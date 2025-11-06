/**
 * /api/exam — uses Azure Search + Azure OpenAI (with robust env autodetect)
 * - Accepts OPENAI_*, AZURE_OPENAI_*, or AOAI_* env prefixes
 * - Normalizes endpoint (avoids /openai/openai)
 * - Falls back to phrase search if field not filterable
 * - Falls back to stub only if NO AOAI creds detected
 */
const https = require("https");

function pickEnv(){
  const variants = [
    { ep: "OPENAI_ENDPOINT", key: "OPENAI_API_KEY", dep: "OPENAI_DEPLOYMENT", ver: "OPENAI_API_VERSION" },
    { ep: "AZURE_OPENAI_ENDPOINT", key: "AZURE_OPENAI_API_KEY", dep: "AZURE_OPENAI_DEPLOYMENT", ver: "AZURE_OPENAI_API_VERSION" },
    { ep: "AOAI_ENDPOINT", key: "AOAI_API_KEY", dep: "AOAI_DEPLOYMENT", ver: "AOAI_API_VERSION" },
  ];
  for (const v of variants){
    const endpoint = process.env[v.ep];
    const key = process.env[v.key];
    const dep = process.env[v.dep];
    if (endpoint && key && dep) {
      return {
        endpoint,
        key,
        deployment: dep,
        apiVersion: process.env[v.ver] || process.env.OPENAI_API_VERSION || "2024-02-15-preview",
        source: v
      };
    }
  }
  return null;
}

function normalizeAoaiBase(endpoint){
  // strip trailing slash and any trailing /openai
  let base = String(endpoint || "").trim();
  base = base.replace(/\/+$/,"");
  base = base.replace(/\/openai\/?$/i, "");
  return base;
}

function postJson(url, headers, body){
  return new Promise((resolve,reject)=>{
    const u = new URL(url);
    const req = https.request(
      { hostname:u.hostname, path:u.pathname+u.search, protocol:u.protocol, method:"POST", headers:{ "Content-Type":"application/json", ...headers } },
      res => { let buf=""; res.on("data",d=>buf+=d); res.on("end",()=>{ try{ resolve({status:res.statusCode, body:JSON.parse(buf||"{}")}); }catch{ resolve({status:res.statusCode, body:{raw:buf}}); } }); }
    );
    req.on("error",reject);
    req.write(JSON.stringify(body||{}));
    req.end();
  });
}

function escapeODataLiteral(s){ return String(s||"").replace(/'/g,"''"); }

async function searchDocsWithFilter({ endpoint, key, index, filterField, book, top }){
  const apiVersion="2023-11-01";
  const url=`${endpoint}/indexes/${encodeURIComponent(index)}/docs/search?api-version=${apiVersion}`;
  const filter = `${filterField} eq '${escapeODataLiteral(book)}'`;
  return postJson(url, { "api-key": key }, { search:"*", searchMode:"any", filter, top });
}

async function searchDocsWithPhrase({ endpoint, key, index, book, top }){
  const apiVersion="2023-11-01";
  const url=`${endpoint}/indexes/${encodeURIComponent(index)}/docs/search?api-version=${apiVersion}`;
  return postJson(url, { "api-key": key }, { search: book ? `"${book}"` : "*", searchMode:"any", top });
}

function collectText(docs){
  const texts=[];
  for (const d of docs||[]){
    if (!d || typeof d!=="object") continue;
    for (const [k,v] of Object.entries(d)){
      if (/^(?:@search\.|_ts$|id$|url$|contenttype$)/i.test(k)) continue;
      if (typeof v==="string"){ const s=v.trim(); if (s.length>=80) texts.push(s); }
      else if (Array.isArray(v)){ const s=v.filter(x=>typeof x==="string").join("\n").trim(); if (s.length>=80) texts.push(s); }
    }
  }
  const uniq = Array.from(new Set(texts)).slice(0, 250);
  let combined=""; for (const t of uniq){ if (combined.length>50000) break; combined += (combined? "\n\n---\n\n":"")+t; }
  return combined;
}

function stubItems(count, book){
  const items=[]; for(let i=1;i<=count;i++){ const stem=book?`(${book}) Practice Q${i}: Which option is most correct?`:`Practice Q${i}: Which option is most correct?`; const opts=["A","B","C","D"].map(id=>({id,text:`Option ${id} for Q${i}`})); const answer=["A","B","C","D"][i%4]; items.push({id:`q${i}`,type:"mcq",question:stem,options:opts,answer,cite:book||"General"});} return items;
}

function callAOAI({ endpoint, key, deployment, apiVersion, book, count, combinedText }){
  const base = normalizeAoaiBase(endpoint);
  const url = `${base}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${apiVersion}`;
  const system = [
    "You generate rigorous roofing exam questions strictly from provided excerpts.",
    "Return STRICT JSON: {\"items\":[...]}.",
    "Each item: {\"id\":\"q#\",\"type\":\"mcq\",\"question\":\"...\",\"options\":[{\"id\":\"A\",\"text\":\"...\"},...],\"answer\":\"A\",\"cite\":\"<short source hint>\"}.",
    "Exactly 4 options A–D; concise stems; factual only."
  ].join(" ");
  const user = [
    book ? `Document: ${book}` : "All documents",
    `Make ${count} multiple-choice questions (A–D).`,
    "Source excerpts below, separated by ---",
    combinedText || "(no text found)"
  ].join("\n\n");
  const payload = { temperature:0.2, max_tokens:3000, response_format:{type:"json_object"}, messages:[{role:"system",content:system},{role:"user",content:user}] };
  return postJson(url, { "api-key": key }, payload);
}

module.exports = async function (context, req){
  try{
    const body = req?.body || {};
    const book = (body.book||"").trim();
    const filterField = (body.filterField||"").trim();
    const count = Math.max(1, Math.min(100, Number(body.count)||50));

    const searchEndpoint = process.env.SEARCH_ENDPOINT;
    const searchKey      = process.env.SEARCH_API_KEY;
    const searchIndex    = process.env.SEARCH_INDEX || "azureblob-index";

    // Gather passages from Search (filter → phrase fallback)
    let combined="";
    if (searchEndpoint && searchKey && searchIndex){
      const top = 200;
      let res = null, usedFallback=false;
      if (book && filterField){
        res = await searchDocsWithFilter({ endpoint:searchEndpoint, key:searchKey, index:searchIndex, filterField, book, top });
        if (res.status===400 && /not a filterable field/i.test(JSON.stringify(res.body||{}))){
          usedFallback = true;
          res = await searchDocsWithPhrase({ endpoint:searchEndpoint, key:searchKey, index:searchIndex, book, top });
        }
      } else {
        usedFallback = true;
        res = await searchDocsWithPhrase({ endpoint:searchEndpoint, key:searchKey, index:searchIndex, book:book||"*", top });
      }
      if (res.status<200 || res.status>=300) throw new Error(`Search HTTP ${res.status}: ${JSON.stringify(res.body).slice(0,300)}`);
      combined = collectText(res.body?.value);
      if (!combined && !usedFallback && book){
        const r2 = await searchDocsWithPhrase({ endpoint:searchEndpoint, key:searchKey, index:searchIndex, book, top });
        if (r2.status>=200 && r2.status<300) combined = collectText(r2.body?.value);
      }
    }

    // Detect AOAI creds under any prefix
    const aoai = pickEnv();

    if (aoai){
      const ai = await callAOAI({ endpoint:aoai.endpoint, key:aoai.key, deployment:aoai.deployment, apiVersion:aoai.apiVersion, book, count, combinedText:combined });
      if (ai.status<200 || ai.status>=300) throw new Error(`AOAI HTTP ${ai.status}: ${JSON.stringify(ai.body).slice(0,300)}`);
      const content = ai.body?.choices?.[0]?.message?.content || "{}";
      let parsed; try{ parsed=JSON.parse(content); }catch{ parsed={items:[]} }
      const items = Array.isArray(parsed.items)? parsed.items : [];
      context.res = { headers:{ "Content-Type":"application/json" }, body:{ items, modelDeployment: aoai.deployment } };
    } else {
      context.res = { headers:{ "Content-Type":"application/json" }, body:{ items: stubItems(count, book), modelDeployment:"stub-fallback (no AOAI env detected)" } };
    }
  }catch(e){
    context.log.error("exam error", e);
    context.res = { status:500, headers:{ "Content-Type":"application/json" }, body:{ error:String(e && e.message || e) } };
  }
};
