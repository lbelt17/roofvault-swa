/**
 * /api/exam — stronger retrieval + debug
 * - filter -> phrase search -> filename-term search fallback
 * - lower text-length threshold (80 -> 10 chars)
 * - debug returns: hit count, first doc keys, combined length + sample (when DEBUG_EXAM=1)
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
        endpoint, key, deployment: dep,
        apiVersion: process.env[v.ver] || process.env.OPENAI_API_VERSION || "2024-02-15-preview"
      };
    }
  }
  return null;
}

function normalizeAoaiBase(endpoint){
  let base = String(endpoint||"").trim();
  base = base.replace(/\/+$/,"").replace(/\/openai\/?$/i,"");
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

async function searchDocsWithFilenameTerms({ endpoint, key, index, book, top }){
  // Convert filename into separate tokens (strip extension; underscores/dashes -> spaces)
  const base = String(book||"").replace(/\.[^.]+$/,"").replace(/[_\-]+/g," ").trim();
  const query = base || "*";
  const apiVersion="2023-11-01";
  const url=`${endpoint}/indexes/${encodeURIComponent(index)}/docs/search?api-version=${apiVersion}`;
  return postJson(url, { "api-key": key }, { search: query, searchMode:"any", top });
}

function collectText(docs){
  const texts=[];
  for (const d of docs||[]){
    if (!d || typeof d!=="object") continue;
    for (const [k,v] of Object.entries(d)){
      // keep metadata names out; but allow any real content field
      if (/^(?:@search\.|_ts$|id$|url$|contenttype$|metadata_storage_name$|metadata_storage_path$)/i.test(k)) continue;
      if (typeof v==="string"){
        const s=v.trim(); if (s.length>=10) texts.push(s); // lowered threshold to 10 chars
      } else if (Array.isArray(v)){
        const s=v.filter(x=>typeof x==="string").join("\n").trim();
        if (s.length>=10) texts.push(s);
      }
    }
  }
  const uniq = Array.from(new Set(texts)).slice(0, 400); // allow more chunks
  let combined=""; for (const t of uniq){ if (combined.length>90000) break; combined += (combined? "\n\n---\n\n":"")+t; }
  return { combined, hitTexts: uniq };
}

function stubItems(count, book){
  const items=[]; for(let i=1;i<=count;i++){ const stem=book?`(${book}) Practice Q${i}: Which option is most correct?`:`Practice Q${i}: Which option is most correct?`; const opts=["A","B","C","D"].map(id=>({id,text:`Option ${id} for Q${i}`})); const answer=["A","B","C","D"][i%4]; items.push({id:`q${i}`,type:"mcq",question:stem,options:opts,answer,cite:book||"General"});} return items;
}

async function callAOAI_once({ endpoint, key, deployment, apiVersion, book, count, combinedText }){
  const base = normalizeAoaiBase(endpoint);
  const url = `${base}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${apiVersion}`;
  const system = [
    "You generate rigorous roofing exam questions strictly from provided excerpts.",
    "Return STRICT JSON: {\"items\":[...]}.",
    "Each item: {\"id\":\"q#\",\"type\":\"mcq\",\"question\":\"...\",\"options\":[{\"id\":\"A\",\"text\":\"...\"},{\"id\":\"B\",\"text\":\"...\"},{\"id\":\"C\",\"text\":\"...\"},{\"id\":\"D\",\"text\":\"...\"}],\"answer\":\"A\",\"cite\":\"<short source hint>\"}.",
    "Exactly 4 options A–D; concise stems; factual only; no preface."
  ].join(" ");
  const user = [
    book ? `Document: ${book}` : "All documents",
    `Make ${count} multiple-choice questions (A–D).`,
    "Source excerpts below, separated by ---",
    combinedText || "(no text found)"
  ].join("\n\n");
  const payload = { temperature:0.2, max_tokens:3500, response_format:{type:"json_object"}, messages:[{role:"system",content:system},{role:"user",content:user}] };
  const res = await postJson(url, { "api-key": key }, payload);

  let items=[];
  let content = res.body?.choices?.[0]?.message?.content;
  if (typeof content === "string"){
    try {
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.items)) items = parsed.items;
      else {
        const m = content.match(/\{\s*"items"\s*:\s*\[[\s\S]*?\]\s*\}/);
        if (m) {
          const parsed2 = JSON.parse(m[0]);
          if (parsed2 && Array.isArray(parsed2.items)) items = parsed2.items;
        }
      }
    } catch {}
  }
  return { status: res.status, items, contentPreview: (process.env.DEBUG_EXAM==="1" && typeof content==="string") ? content.slice(0,400) : undefined };
}

async function callAOAI_batched(env, book, count, combinedText){
  let first = await callAOAI_once({ ...env, book, count, combinedText });
  if (first.status>=200 && first.status<300 && Array.isArray(first.items) && first.items.length>0){
    return { items:first.items, diag:first.contentPreview };
  }
  const a = Math.ceil(count/2);
  const b = Math.floor(count/2);
  const p1 = await callAOAI_once({ ...env, book, count:a, combinedText });
  const p2 = await callAOAI_once({ ...env, book, count:b, combinedText });
  const merged = []
    .concat(Array.isArray(p1.items)?p1.items:[])
    .concat(Array.isArray(p2.items)?p2.items:[])
    .slice(0, count);
  return { items: merged, diag: p1.contentPreview || p2.contentPreview };
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

    // 1) RETRIEVAL: filter -> phrase -> filename-term fallback
    let combined="", hitCount=0, firstKeys=[];
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

      // If still no hits or no text, try filename-term search
      let docs = (res && Array.isArray(res.body?.value)) ? res.body.value : [];
      if ((!docs || docs.length===0) && book){
        const res2 = await searchDocsWithFilenameTerms({ endpoint:searchEndpoint, key:searchKey, index:searchIndex, book, top });
        if (res2.status>=200 && res2.status<300) {
          docs = Array.isArray(res2.body?.value) ? res2.body.value : [];
        }
      }

      hitCount = Array.isArray(docs) ? docs.length : 0;
      if (hitCount>0 && docs[0] && typeof docs[0]==="object") {
        firstKeys = Object.keys(docs[0]).slice(0,15);
      }

      const collected = collectText(docs);
      combined = collected.combined;
      // If the text is still empty, last ditch: allow even tiny strings (<= 10 already lowered)
      if (!combined && docs && docs.length){
        const tiny = [];
        for (const d of docs){
          for (const [k,v] of Object.entries(d)){
            if (typeof v==="string" && v.trim()) tiny.push(v.trim());
          }
        }
        combined = tiny.slice(0,50).join("\n\n---\n\n");
      }
    }

    // 2) AOAI
    const aoai = pickEnv();
    let items, diag;
    if (aoai){
      const out = await callAOAI_batched(aoai, book, count, combined);
      items = Array.isArray(out.items) ? out.items : [];
      diag = out.diag;
      if (items.length === 0) items = stubItems(count, book);
    } else {
      items = stubItems(count, book);
    }

    // 3) Response (+debug)
    const resp = { items, modelDeployment: (aoai ? aoai.deployment : "stub-fallback") };
    if (process.env.DEBUG_EXAM==="1") {
      resp._diag = {
        searchHits: hitCount,
        firstDocKeys: firstKeys,
        combinedLen: (combined||"").length,
        combinedSample: (combined||"").slice(0,600),
        modelPreview: diag
      };
    }
    context.res = { headers:{ "Content-Type":"application/json" }, body: resp };
  }catch(e){
    context.log.error("exam error", e);
    context.res = { status:500, headers:{ "Content-Type":"application/json" }, body:{ error:String(e && e.message || e) } };
  }
};
