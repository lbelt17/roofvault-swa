<<<<<<< HEAD
﻿/**
 * Groups items by Section/Objectives using a keyword taxonomy.
 * Tries multiple locations for data/objectives.json; if none found, uses an embedded fallback.
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
    else if (t.includes(kw)) score += 0.5;
  }
  return score;
}

// Embedded fallback taxonomy (same starter you added in data/objectives.json)
const FALLBACK_TAXONOMY = {
  "sections": [
    {
      "section": "Contract Administration",
      "objectives": [
        { "objective": "Forms & Logs", "keywords": ["submittal log","rfi","change order","field report","daily report","contract administration","cca","project record","procedural form"] },
        { "objective": "Delivery Methods", "keywords": ["design-build","design bid build","construction management","single prime","prime contracts","project delivery"] }
      ]
    },
    {
      "section": "Roofing Systems",
      "objectives": [
        { "objective": "Membranes & Insulation", "keywords": ["membrane","rigid board insulation","fasteners","surfacings","roof assembly","air barrier","vapor retarder"] },
        { "objective": "Steep-Slope", "keywords": ["asphalt shingle","tile","slate","metal shingle","steep-slope"] }
      ]
    },
    {
      "section": "Sheet Metal & Flashings",
      "objectives": [
        { "objective": "Edges & Terminations", "keywords": ["drip edge","edge metal","termination bar","counterflashing","reglet","coping"] },
        { "objective": "Penetrations & Details", "keywords": ["penetration","pipe boot","pitch pan","gooseneck","scupper","downspout","gutter"] }
      ]
    },
    {
      "section": "Waterproofing",
      "objectives": [
        { "objective": "Below-Grade & Plaza", "keywords": ["waterproof","protection course","planter","horizontal slab","expansion joint","sealant","tunnel","vault"] }
      ]
    },
    {
      "section": "Codes & Standards",
      "objectives": [
        { "objective": "Building Codes", "keywords": ["international building code","ibc","code enforcement","state building code","amendment"] },
        { "objective": "Wind & Loads", "keywords": ["asce","basic wind speed","special wind region","wind design"] }
      ]
    },
    {
      "section": "Safety",
      "objectives": [
        { "objective": "OSHA Construction", "keywords": ["cfr 29","personal protective","fire protection","materials handling","osha","life-saving equipment"] }
      ]
    }
  ]
};

async function loadTaxonomy(taxonomyUrl){
  // 1) Optional remote URL
  if (taxonomyUrl && /^https?:\/\//i.test(taxonomyUrl)) {
    const res = await fetch(taxonomyUrl);
    if (!res.ok) throw new Error(`Failed to load taxonomy URL: ${res.status}`);
    return await res.json();
  }

  // 2) Try common on-disk locations (SWA packs everything under /home/site/wwwroot)
  const candidates = [
    path.join(__dirname, "..", "..", "data", "objectives.json"),         // /api/group-questions/../../data
    path.join(__dirname, "..", "data", "objectives.json"),               // /api/group-questions/../data
    path.join(process.cwd(), "data", "objectives.json"),                 // cwd/data
    "/home/site/wwwroot/data/objectives.json",                            // absolute typical SWA path
    "/home/site/wwwroot/api/../data/objectives.json"                     // another absolute form
  ];

  for (const p of candidates){
    try {
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        return JSON.parse(buf.toString("utf8"));
      }
    } catch {}
  }

  // 3) Fallback to embedded taxonomy
  return FALLBACK_TAXONOMY;
}

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const taxonomyUrl = body.taxonomyUrl;

    if (items.length === 0){
      context.res = { status: 200, headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ groups: [], unassigned: [], note: "No items provided." }) };
      return;
    }

    const taxonomy = await loadTaxonomy(taxonomyUrl);

    const groupsIndex = [];
    for (const sec of taxonomy.sections || []){
      for (const obj of (sec.objectives || [])){
        groupsIndex.push({ section: sec.section, objective: obj.objective, keywords: obj.keywords || [], items: [] });
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

      let best = {score: 0, idx: -1};
      for (let i=0;i<groupsIndex.length;i++){
        const s = scoreText(blob, groupsIndex[i].keywords);
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
=======
﻿export default async function (context, req) {
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, endpoint: "group-questions" })
  };
}
>>>>>>> 53ab868 (SWA skeleton with three API endpoints)
