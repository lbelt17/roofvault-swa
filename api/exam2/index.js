const fetch = globalThis.fetch;

const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
const SEARCH_INDEX    = process.env.SEARCH_INDEX;
const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

const AOAI_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT;
const AOAI_KEY        = process.env.AZURE_OPENAI_API_KEY;
const AOAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

function sampleExam(book, tag){
  const items = [
`1. MCQ: Sample for ${book} ${tag||""}. Choose B.
A. A
B. B
C. C
D. D
Answer: B
Why: Sample.
Cites: Preview`,
`2. T/F: This is True.
Answer: True
Why: Sample.
Cites: Preview`,
`3. Short Answer: Type TEST.
Answer: TEST
Why: Sample.
Cites: Preview`
  ];
  return { ok: true, items, modelDeployment: "(sample)", sourceFiles: [book] };
}

function toChunks(text, max=3500){
  const out=[]; let buf="";
  for (const para of (text||"").split(/\n{2,}/)) {
    if ((buf+"\n\n"+para).length > max) { if (buf) out.push(buf); buf = para; }
    else { buf = buf ? (buf+"\n\n"+para) : para; }
  }
  if (buf) out.push(buf);
  return out.slice(0, 8);
}
function timeout(ms){ return new Promise((_,rej)=>setTimeout(()=>rej(new Error("Timeout")), ms)); }
async function withTimeout(p, ms){ return Promise.race([p, timeout(ms)]); }

// Grab long string-ish fields from a search doc
function extractTextFromDoc(doc){
  if (!doc || typeof doc !== "object") return "";
  const candidates = [];

  // common field names first (strong bias)
  const preferred = [
    "content","pages_content","merged_content","merged_text","text","pageText","chunk","chunks","body","body_text","rawText"
  ];
  for (const k of preferred){
    if (typeof doc[k] === "string" && doc[k].trim().length > 200) candidates.push(doc[k]);
    if (Array.isArray(doc[k])) {
      const joined = doc[k].filter(v=>typeof v==="string").join("\n");
      if (joined.trim().length > 200) candidates.push(joined);
    }
  }

  // fallback: any long string fields
  for (const [k,v] of Object.entries(doc)){
    if (typeof v === "string" && v.trim().length > 300 && !preferred.includes(k)) candidates.push(v);
    if (Array.isArray(v)) {
      const joined = v.filter(x=>typeof x==="string").join("\n");
      if (joined.trim().length > 300 && !preferred.includes(k)) candidates.push(joined);
    }
  }

  // de-dupe and join
  const uniq = Array.from(new Set(candidates.map(s=>s.trim()))).filter(Boolean);
  return uniq.join("\n\n");
}

module.exports = async function (context, req) {
  try {
    const method = (req.method || "GET").toUpperCase();
    const book =
      (method === "POST"
        ? (req.body && (req.body.book || req.body.fileName))
        : (req.query && (req.query.book || req.query.fileName))) || "Unknown.pdf";

    if (!SEARCH_ENDPOINT || !SEARCH_INDEX || !SEARCH_API_KEY) {
      context.res = { status: 200, body: sampleExam(book, "(no-search-config)") }; return;
    }

    // 1) Search by filename (quoted); select '*' so we can inspect available fields
    const q = `"${book.replace(/"/g,'\\"')}"`;
    const url = `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2024-07-01`;
    const body = {
      search: q,
      searchMode: "all",
      queryType: "simple",
      top: 50,             // pull a decent set
      select: "*"          // we want to see all retrievable fields
    };

    const sres = await withTimeout(fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
      body: JSON.stringify(body)
    }), 8000).catch(()=>null);

    if (!sres || !sres.ok) {
      context.res = { status: 200, body: sampleExam(book, "(search-failed)") }; return;
    }

    const sjson = await sres.json().catch(()=>({}));
    const candidates = Array.isArray(sjson.value) ? sjson.value : [];

    // Prefer exact filename match if present (case-insensitive)
    const exact = candidates.filter(d =>
      (d.metadata_storage_name||"").toLowerCase() === (book||"").toLowerCase()
    );
    const used = exact.length ? exact : candidates;

    // Extract text from docs (auto-detect fields)
    const docsText = used.map(extractTextFromDoc).filter(Boolean).join("\n\n");

    if (!docsText) {
      context.res = { status: 200, body: sampleExam(book, "(no-docs/unknown-fields)") }; return;
    }

    // 2) Call AOAI if configured; else return sample
    if (!AOAI_ENDPOINT || !AOAI_KEY || !AOAI_DEPLOYMENT) {
      context.res = { status: 200, body: sampleExam(book, "(no-aoai-config)") }; return;
    }

    const chunks = toChunks(docsText, 3500);
    const system = `You are a strict roofing exam generator. Produce 50 questions from the provided content:
- Mix: MCQ, T/F, Short Answer
- EXACT format:
"1. MCQ: <stem>
A. ...
B. ...
C. ...
D. ...
Answer: <A/B/C/D>
Why: <1–2 lines>
Cites: <short refs>"

"2. T/F: <statement>
Answer: True|False
Why: ...
Cites: ..."

"3. Short Answer: <prompt>
Answer: <short phrase>
Why: ...
Cites: ..."
- Use only facts from the text. Keep citations short (section labels, code refs).`;

    const items = [];
    for (let i=0; i<Math.min(3, chunks.length); i++){
      const user = `CONTENT CHUNK ${i+1} of ${chunks.length} for book "${book}":\n\n${chunks[i]}\n\nGenerate ~${i===0?20:15} questions in the exact format above.`;
      const r = await withTimeout(fetch(`${AOAI_ENDPOINT}/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=2024-08-01-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": AOAI_KEY },
        body: JSON.stringify({
          messages: [ { role: "system", content: system }, { role: "user", content: user } ],
          temperature: 0.2,
          max_tokens: 2000
        })
      }), 12000).catch(()=>null);

      if (!r || !r.ok) continue;
      const jr = await r.json().catch(()=>null);
      const text = jr?.choices?.[0]?.message?.content || "";
      const qs = text.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
      items.push(...qs);
      if (items.length >= 50) break;
    }

    const trimmed = items.slice(0, 50);
    if (!trimmed.length) {
      context.res = { status: 200, body: sampleExam(book, "(aoai-empty)") }; return;
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { ok: true, items: trimmed, modelDeployment: AOAI_DEPLOYMENT, sourceFiles: [book] }
    };
  } catch (e) {
    context.res = { status: 200, body: sampleExam("Unknown.pdf", "(exception: "+String(e&&e.message||e)+")") };
  }
};
