/**
 * Groups items (Q&A) by Section/Objectives using a simple keyword taxonomy.
 * Request body:
 *   { "items": [ {question, choices, rationale, citations[]} ], "taxonomyUrl": "<optional http(s)>" }
 * If taxonomyUrl is omitted, loads ./../../data/objectives.json from the app package (local file).
 */
const fs = require("fs");
const path = require("path");
const fetch = global.fetch || require("node-fetch");

function normalize(s){ return (s||"").toString().toLowerCase(); }

function scoreText(text, keywords){
  const t = normalize(text);
  let score = 0;
  for (const k of keywords){
    const kw = normalize(k).trim();
    if (!kw) continue;
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")}\\b`,"g");
    const matches = t.match(re);
    if (matches) score += matches.length;
    else if (t.includes(kw)) score += 0.5; // partial
  }
  return score;
}

async function loadTaxonomy(taxonomyUrl){
  if (taxonomyUrl && /^https?:\/\//i.test(taxonomyUrl)) {
    const res = await fetch(taxonomyUrl);
    if (!res.ok) throw new Error(`Failed to load taxonomy URL: ${res.status}`);
    return await res.json();
  }
  // Read from local file packaged with the app
  const localPath = path.join(__dirname, "..", "..", "data", "objectives.json");
  const buf = fs.readFileSync(localPath);
  return JSON.parse(buf.toString("utf8"));
}

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const taxonomyUrl = body.taxonomyUrl; // optional

    if (items.length === 0){
      context.res = { status: 200, headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ groups: [], unassigned: [], note: "No items provided." }) };
      return;
    }

    const taxonomy = await loadTaxonomy(taxonomyUrl);

    const groupsIndex = []; // {section, objective, keywords, items:[]}
    for (const sec of taxonomy.sections || []){
      for (const obj of (sec.objectives || [])){
        groupsIndex.push({
          section: sec.section,
          objective: obj.objective,
          keywords: obj.keywords || [],
          items: []
        });
      }
    }

    const unassigned = [];

    for (const it of items){
      const blob = [
        it.question,
        ...(it.choices ? Object.values(it.choices) : []),
        it.rationale,
        ...(Array.isArray(it.citations) ? it.citations.map(c=>c.title||"") : [])
      ].filter(Boolean).join(" \n ");

      // score each objective and pick best
      let best = {score: 0, idx: -1};
      for (let i=0;i<groupsIndex.length;i++){
        const g = groupsIndex[i];
        const s = scoreText(blob, g.keywords);
        if (s > best.score) best = {score: s, idx: i};
      }

      if (best.idx >= 0 && best.score > 0){
        groupsIndex[best.idx].items.push(it);
      } else {
        unassigned.push(it);
      }
    }

    const groups = groupsIndex
      .filter(g => g.items.length > 0)
      .map(g => ({ section: g.section, objective: g.objective, count: g.items.length, items: g.items }));

    context.res = { status: 200, headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ groups, unassigned }) };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
