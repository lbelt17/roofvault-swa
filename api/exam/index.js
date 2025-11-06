/**
 * /api/exam — resilient to non-filterable fields.
 * If filterField isn’t filterable, we fallback to a search query on searchable fields.
 */
const https = require("https");

function getJson(url, headers){
  return new Promise((resolve,reject)=>{
    const u = new URL(url);
    const req = https.request({ hostname:u.hostname, path:u.pathname+u.search, method:"GET", headers:{...headers} }, res=>{
      let buf=""; res.on("data",d=>buf+=d); res.on("end",()=>{ try{ resolve({status:res.statusCode, body:JSON.parse(buf||"{}")}); } catch{ resolve({status:res.statusCode, body:{raw:buf}}); } });
    });
    req.on("error",reject); req.end();
  });
}

function postJson(url, headers, body){
  return new Promise((resolve,reject)=>{
    const u = new URL(url);
    const req = https.request({ hostname:u.hostname, path:u.pathname+u.search, method:"POST", headers:{ "Content-Type":"application/json", ...headers } }, res=>{
      let buf=""; res.on("data",d=>buf+=d); res.on("end",()=>{ try{ resolve({status:res.statusCode, body:JSON.parse(buf||"{}")}); } catch{ resolve({status:res.statusCode, body:{raw:buf}}); } });
    });
    req.on("error",reject);
    req.write(JSON.stringify(body||{}));
    req.end();
  });
}

function escapeODataLiteral(s){ return String(s||"").replace(/'/g,"''"); }

async function fetchSchema(endpoint, key, index){
  const apiVersion="2023-11-01";
  const url=`${endpoint}/indexes/${encodeURIComponent(index)}?api-version=${apiVersion}`;
  const {status, body} = await getJson(url, { "api-key": key });
  if (status<200||status>=300) throw new Error(`Schema HTTP ${status}`);
  const fields = Array.isArray(body.fields)? body.fields : [];
  const filterable = new Set(fields.filter(f=>f.filterable).map(f=>f.name));
  const searchable = new Set(fields.filter(f=>f.searchable).map(f=>f.name));
  return { fields, filterable, searchable };
}

async function searchDocs({ endpoint, key, index, book, filterField, schema }){
  const apiVersion="2023-11-01";
  const url=`${endpoint}/indexes/${encodeURIComponent(index)}/docs/search?api-version=${apiVersion}`;

  // pick strategy
  let filter;
  let search="*";
  let searchFields;

  const candidatesNameLike = ["docName","documentName","fileName","metadata_storage_name","metadata_storage_path","title","name","path"];
  const searchableNameLike = candidatesNameLike.filter(f=>schema.searchable.has(f));

  if (book && filterField && schema.filterable.has(filterField)){
    // Best: exact filter
    filter = `${filterField} eq '${escapeODataLiteral(book)}'`;
  } else if (book && searchableNameLike.length){
    // Fallback: query by book string limited to name-like searchable fields
    // Quote book to bias towards exact filename
    search = `"${book}"`;
    searchFields = searchableNameLike.join(",");
  } else {
    // Worst-case: all docs
    search = "*";
  }

  const {status, body} = await postJson(url, { "api-key": key }, {
    search,
    searchMode: "any",
    ...(filter ? { filter } : {}),
    ...(searchFields ? { searchFields } : {}),
    top: 200
  });
  if (status<200||status>=300) throw new Error(`Search HTTP ${status}: ${JSON.stringify(body).slice(0,300)}`);

  // collect stringy content from whatever fields are present
  const docs = Array.isArray(body.value)? body.value : [];
  const texts = [];
  for (const d of docs){
    if (!d || typeof d!=="object") continue;
    for (const [k,v] of Object.entries(d)){
      // skip obvious metadata/noise
      if (/^(?:@search\.|metadata_|_ts$|id$|url$|path$|name$|contenttype$)/i.test(k)) continue;
      if (typeof v==="string" && v.trim().length>=80) texts.push(v.trim());
      else if (Array.isArray(v)){
        const j=v.filter(x=>typeof x==="string").join("\n");
        if (j.trim().length>=80) texts.push(j.trim());
      }
    }
  }
  // de-dup & cap ~50k chars
  const uniq = Array.from(new Set(texts)).slice(0, 200);
  let combined=""; for (const t of uniq){ if (combined.length>50000) break; combined += (combined? "\n\n---\n\n":"")+t; }
  return combined;
}

function stubItems(count, book){
  const items=[]; for(let i=1;i<=count;i++){ const stem=book?`(${book}) Practice Q${i}: Which option is most correct?`:`Practice Q${i}: Which option is most correct?`; const opts=["A","B","C","D"].map(id=>({id,text:`Option ${id} for Q${i}`})); const answer=["A","B","C","D"][i%4]; items.push({id:`q${i}`,type:"mcq",question:stem,options:opts,answer,cite:book||"General"});}
  return items;
}

function callAOAI({ endpoint, key, deployment, apiVersion, book, count, combinedText }){
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${apiVersion||"2024-02-15-preview"}`;
  const system = "You generate rigorous roofing exam questions from provided source excerpts. Return STRICT JSON {\"items\":[...]} with 4-option MCQs and an answer key.";
  const user = `${book?`Document: ${book}`:"All documents"}\n\nMake ${count} multiple-choice questions (A–D).\n\nSource excerpts below, separated by ---\n\n${combinedText||"(no text found)"}`;
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

    const aiEndpoint     = process.env.OPENAI_ENDPOINT;
    const aiKey          = process.env.OPENAI_API_KEY;
    const aiDeployment   = process.env.OPENAI_DEPLOYMENT;
    const aiVersion      = process.env.OPENAI_API_VERSION || "2024-02-15-preview";

    let combined = "";
    if (searchEndpoint && searchKey && searchIndex){
      const schema = await fetchSchema(searchEndpoint, searchKey, searchIndex);
      combined = await searchDocs({ endpoint:searchEndpoint, key:searchKey, index:searchIndex, book, filterField, schema });
    }

    if (aiEndpoint && aiKey && aiDeployment){
      const { status, body: aiBody } = await callAOAI({ endpoint:aiEndpoint, key:aiKey, deployment:aiDeployment, apiVersion:aiVersion, book, count, combinedText:combined });
      if (status<200||status>=300) throw new Error(`AOAI HTTP ${status}: ${JSON.stringify(aiBody).slice(0,300)}`);
      const content = aiBody?.choices?.[0]?.message?.content || "{}";
      let parsed; try{ parsed=JSON.parse(content);}catch{ parsed={items:[]}; }
      const items = Array.isArray(parsed.items)? parsed.items : [];
      context.res = { headers:{ "Content-Type":"application/json" }, body:{ items, modelDeployment: aiDeployment } };
    } else {
      context.res = { headers:{ "Content-Type":"application/json" }, body:{ items: stubItems(count, book), modelDeployment:"stub-fallback" } };
    }
  }catch(e){
    context.log.error("exam error", e);
    context.res = { status:500, headers:{ "Content-Type":"application/json" }, body:{ error:String(e && e.message || e) } };
  }
};
