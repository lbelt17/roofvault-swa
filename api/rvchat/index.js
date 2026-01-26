// api/rvchat/index.js
// RoofVault Chat API (STRICT doc-grounded for roofing questions)
// mode: "doc" | "general" | "web"
// ✅ Default: roofing => DOC ONLY (Azure AI Search snippets + AOAI) with strict citations
// ✅ If roofing + no doc support => return a "needsConsentForWeb" flag (UI should prompt user)
// ✅ Web is NEVER automatic. Only runs when client explicitly sets mode:"web" (or allowWeb:true)
// ✅ Session-only memory via messages[]
// ✅ Citation tightening + enforcement
// ✅ Stronger support check (prevents "sounds right" doc answers)
// ✅ List-item citation enforcement (each bullet/step must cite a snippet)
// ✅ Domain-anchor gate prevents Mars-type false doc matches

const {
  SEARCH_ENDPOINT,
  SEARCH_KEY,
  SEARCH_INDEX,
  AOAI_ENDPOINT,
  AOAI_KEY,
  AOAI_DEPLOYMENT,

  // Optional (not required for doc-mode):
  // If you later implement true Bing-grounded web mode via Foundry Agents,
  // you can wire these and replace webFallback() below.
  // FOUNDRY_API_KEY,
  // FOUNDRY_PROJECT_ENDPOINT,
  // FOUNDRY_AGENT_ID,

  WEB_QUESTION_CREDITS // optional: e.g. "5"
} = process.env;

/* ===== Config (STRICT by default) ===== */
const STRICT_DOC_GROUNDING =
  (process.env.STRICT_DOC_GROUNDING ?? "true").toLowerCase() === "true";

const DEFAULT_WEB_CREDITS = Number.isFinite(Number(WEB_QUESTION_CREDITS))
  ? Number(WEB_QUESTION_CREDITS)
  : 5;

/* Always-JSON response helper */
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

/* Minimal HTTP(S) POST for JSON */
function postJson(url, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    try {
      const { URL } = require("node:url");
      const u = new URL(url);
      const isHttps = u.protocol === "https:";
      const mod = require(isHttps ? "node:https" : "node:http");
      const data = JSON.stringify(bodyObj || {});
      const req = mod.request(
        {
          method: "POST",
          hostname: u.hostname,
          port: u.port || (isHttps ? 443 : 80),
          path: u.pathname + (u.search || ""),
          headers: Object.assign(
            {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(data)
            },
            headers || {}
          )
        },
        (res) => {
          let text = "";
          res.on("data", (c) => (text += c));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              ok: res.statusCode >= 200 && res.statusCode < 300,
              text
            })
          );
        }
      );
      req.on("error", reject);
      req.write(data);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

/* Query normalization helpers */
function aliasExpand(q) {
  let s = String(q || "");
  s = s.replace(/\bmembrane (roof )?systems?\b/gi, "Membrane Roof Systems");
  s = s.replace(
    /\broof\s*decks\s*(a\s*to\s*z|atoz|a\-z)\b/gi,
    "Roof Decks: A to Z Hogan"
  );
  s = s.replace(/\bsteep[-\s]?slope\b/gi, "Steep-slope Roof Systems");
  return s;
}

function _norm(s) {
  return (s || "").toLowerCase();
}
function _tokens(s) {
  return _norm(s)
    .replace(/[^a-z0-9\-\._ ]+/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w &&
        w.length > 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "from",
          "manual",
          "roofs",
          "systems",
          "system",
          "nrca",
          "iibec",
          "detail",
          "details",
          "part",
          "final",
          "digital",
          "pdf"
        ].includes(w)
    );
}

/* ✅ Domain anchor gate: if user question isn't about roofing/building envelope, go GENERAL */
const ROOF_ANCHORS = new Set([
  "roof","roofing","reroof","re-roof","slope","steep","lowslope","low-slope","pitch",
  "deck","decks","sheathing","substrate","parapet","coping","curb","curbs",
  "flashing","counterflashing","baseflashing","termination","reglet",
  "drain","drains","scupper","gutter","downspout","leader",
  "insulation","polyiso","eps","xps","mineral","coverboard","gypsum",
  "vapor","retarder","air","barrier","condensation","dewpoint","moisture",
  "fastener","fasteners","plates","adhesive","bonding","weld","welded","seam","seams",
  "membrane","tpo","epdm","pvc","modbit","modified","bitumen","bur","asphalt",
  "shingle","shingles","tile","slate","metal","standing","seam",
  "underlayment","ice","water","shield",
  "uplift","wind","pressure","fm","factory","mutual",
  "penetration","penetrations","pipe","vent","skylight","equipment",
  "sealant","primer","mastic","tape",
  "rvalue","r-value","thermal","heat","humidity","ventilation","attic","soffit","ridge"
]);

function questionLooksRoofingRelated(question) {
  const raw = String(question || "").trim();
  if (!raw) return false;

  const expanded = aliasExpand(raw);
  const toks = _tokens(expanded);
  const n = _norm(expanded);

  for (const t of toks) {
    if (ROOF_ANCHORS.has(t)) return true;
  }
  for (const a of ROOF_ANCHORS) {
    if (a.length >= 4 && n.includes(a)) return true;
  }
  return false;
}

/* 🔓 Decode index id (base64-encoded URL) into a nice filename */
function decodeIdToName(id) {
  try {
    const raw = String(id || "").trim();
    if (!raw) return id || "unknown";

    let b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (b64.length % 4)) % 4;
    if (padLen) b64 += "=".repeat(padLen);

    const url = Buffer.from(b64, "base64").toString("utf8");
    if (!/^https?:\/\//i.test(url)) return id;

    const lastSegment = url.split("/").pop() || url;
    try {
      return decodeURIComponent(lastSegment);
    } catch {
      return lastSegment;
    }
  } catch {
    return id || "unknown";
  }
}

/* 🔎 Azure Search snippet fetch – schema: id + content */
async function searchSnippets(query, topN = 8) {
  const base = (SEARCH_ENDPOINT || "").replace(/\/+$/, "");
  const url = `${base}/indexes('${encodeURIComponent(
    SEARCH_INDEX
  )}')/docs/search?api-version=2023-11-01`;

  const raw = String(query || "").trim();
  const expanded = aliasExpand(raw);
  const qToks = _tokens(expanded);

  const searchText = qToks.length ? qToks.join(" ") : expanded || "*";

  let pass1;
  try {
    const r = await postJson(
      url,
      { "api-key": SEARCH_KEY },
      {
        search: searchText,
        top: 60,
        searchMode: "any",
        queryType: "full",
        searchFields: "content",
        select: "id,content"
      }
    );
    pass1 = JSON.parse(r.text || "{}");
  } catch {
    return [];
  }

  const vals = Array.isArray(pass1?.value) ? pass1.value : [];
  if (!vals.length) return [];

  return vals.slice(0, Math.max(topN, 8)).map((v, i) => {
    const rawId = v?.id || `doc-${i + 1}`;
    const niceName = decodeIdToName(rawId);
    return {
      id: i + 1,
      source: niceName,
      text: String(v?.content || "").slice(0, 1400)
    };
  });
}

/* Session-only memory prep */
function buildSafeHistory(historyMessages, max = 10) {
  return Array.isArray(historyMessages)
    ? historyMessages
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim()
        )
        .slice(-max)
        .map((m) => ({
          role: m.role,
          content: String(m.content).slice(0, 2000)
        }))
    : [];
}

/* AOAI wrapper */
async function aoaiAnswer(systemPrompt, userPrompt, historyMessages = []) {
  const base = (AOAI_ENDPOINT || "").replace(/\/+$/, "");
  const url = `${base}/openai/deployments/${encodeURIComponent(
    AOAI_DEPLOYMENT
  )}/chat/completions?api-version=2024-06-01`;

  const safeHistory = buildSafeHistory(historyMessages, 10);

  let resp;
  try {
    resp = await postJson(
      url,
      { "api-key": AOAI_KEY },
      {
        temperature: 0.1,
        max_tokens: 900,
        messages: [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: userPrompt }
        ]
      }
    );
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(resp.text || "{}");
  } catch {}

  if (!resp.ok) {
    const err =
      parsed?.error?.message || parsed?.message || resp.text || "unknown";
    return { ok: false, error: `AOAI HTTP ${resp.status}: ${err}` };
  }

  const content = parsed?.choices?.[0]?.message?.content?.trim?.() || "";
  return { ok: true, content };
}

/* ✅ Citation tightening: keep ONLY [[n]] where n is a valid snippet id */
function tightenCitations(answer, validIdSet) {
  let s = String(answer || "");

  // Convert [n] -> [[n]] (avoid converting existing [[n]])
  s = s.replace(/(?<!\[)\[(\d{1,3})\](?!\])/g, (m, n) => `[[${n}]]`);

  // Remove any [[...]] that isn't a valid numeric id in this response
  s = s.replace(/\[\[([^\]]+)\]\]/g, (m, inner) => {
    const n = String(inner || "").trim();
    if (!/^\d{1,3}$/.test(n)) return "";
    if (!validIdSet.has(n)) return "";
    return `[[${n}]]`;
  });

  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

function hasAnyValidCitation(answer) {
  return /\[\[\d{1,3}\]\]/.test(String(answer || ""));
}

/* Detect list/steps/factors style questions (we enforce stronger grounding here) */
function isListStyleQuestion(question) {
  const q = _norm(String(question || ""));
  return (
    /\bwhat (are|is) (the )?(key )?(factors|considerations|steps|requirements|components)\b/.test(q) ||
    /\b(list|enumerate)\b/.test(q) ||
    /\bhow do i\b/.test(q) ||
    /\bwhat should\b/.test(q) ||
    /\bwhat must\b/.test(q)
  );
}

/* Stronger support check:
   Require higher token overlap between question and snippets for list-style questions */
function snippetsLookRelevantStrict(question, snippets) {
  const expanded = aliasExpand(String(question || "").trim());
  const toks = _tokens(expanded);
  if (!toks.length) return true;

  const hay = _norm(snippets.map((s) => s.text || "").join(" ").slice(0, 12000));
  const uniq = Array.from(new Set(toks));

  let hits = 0;
  for (const t of uniq) {
    if (hay.includes(t)) hits++;
  }

  // Strict threshold: at least 40% of tokens, minimum 3 hits (unless very short question)
  const minHits = uniq.length <= 3 ? uniq.length : Math.max(3, Math.ceil(uniq.length * 0.4));

  return hits >= minHits;
}

/* Enforce: each list item/bullet line must contain a valid [[n]] citation */
function listItemsAllHaveCitations(answer) {
  const lines = String(answer || "").split(/\r?\n/);
  const itemLine = (ln) =>
    /^\s*(\d+[\.\)]\s+|[-*]\s+|[A-Z][\.\)]\s+)/.test(ln);

  let sawItem = false;
  for (const ln of lines) {
    if (!itemLine(ln)) continue;
    sawItem = true;
    if (!/\[\[\d{1,3}\]\]/.test(ln)) return false;
  }
  return true; // if no list items, don't fail
}

/* Standard doc refusal payload (+ web prompt flags) */
function docRefusal(question, sources = [], note = "", web = {}) {
  return {
    ok: true,
    mode: "doc",
    question,
    answer: "No support in the provided sources.",
    sources,
    ...(note ? { note } : {}),
    // UI can use these to show a modal/button
    needsConsentForWeb: true,
    web: {
      eligible: true,
      reason: "No direct RoofVault library support found for this roofing question.",
      creditsMax: DEFAULT_WEB_CREDITS,
      creditsRemaining:
        Number.isFinite(Number(web.creditsRemaining)) ? Number(web.creditsRemaining) : undefined,
      ...web
    }
  };
}

/* General knowledge fallback (ONLY for clearly non-roofing questions) */
async function generalFallback(question, msgs) {
  const systemPrompt = [
    "You are RoofVault AI.",
    "Answer helpfully using general knowledge. Keep it concise and clear.",
    "If you are unsure, say so briefly.",
    "",
    "At the end, include exactly one line:",
    "Sources: General knowledge (no RoofVault document match)",
    "",
    "Do NOT use [[#]] style citations because no RoofVault snippets are available."
  ].join(" ");

  const userPrompt = `Question: ${question}`;
  const ao = await aoaiAnswer(systemPrompt, userPrompt, msgs);

  let answer =
    (ao.ok ? ao.content : "") ||
    (ao.error ? `No answer due to model error: ${ao.error}` : "I couldn't generate an answer.");

  // Strip accidental snippet-style citations
  answer = String(answer)
    .replace(/\[\[\s*#\s*\]\]/g, "")
    .replace(/\[\[\s*\d+\s*\]\]/g, "");

  return answer.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * WEB MODE (opt-in only)
 * IMPORTANT: This is a SAFE placeholder.
 * It does NOT pretend to have real web citations.
 *
 * To make this truly Bing-grounded later:
 * - Call your Foundry Agent (with Bing knowledge) here
 * - Return answer + links/sources from that agent run
 */
async function webFallback(question, msgs) {
  const systemPrompt = [
    "You are RoofVault AI.",
    "The user explicitly requested WEB mode (not RoofVault documents).",
    "Answer using general knowledge, but DO NOT fabricate links or citations.",
    "If you cannot provide verified links, say so.",
    "",
    "End with exactly one line:",
    "Sources: Web mode requested (web grounding not yet implemented on server)"
  ].join(" ");

  const userPrompt = `Question: ${question}`;
  const ao = await aoaiAnswer(systemPrompt, userPrompt, msgs);

  let answer =
    (ao.ok ? ao.content : "") ||
    (ao.error ? `No answer due to model error: ${ao.error}` : "I couldn't generate an answer.");

  // Strip any snippet-style citations
  answer = String(answer)
    .replace(/\[\[\s*#\s*\]\]/g, "")
    .replace(/\[\[\s*\d+\s*\]\]/g, "");

  return answer.replace(/\n{3,}/g, "\n\n").trim();
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = jsonRes({ ok: true });
    return;
  }

  /* 🔍 Diag: show env wiring & index name */
  if (req.method === "GET" && String(req.query?.diag) === "1") {
    const seen = {
      SEARCH_ENDPOINT: !!SEARCH_ENDPOINT,
      SEARCH_KEY: !!SEARCH_KEY,
      SEARCH_INDEX: !!SEARCH_INDEX,
      AOAI_ENDPOINT: !!AOAI_ENDPOINT,
      AOAI_KEY: !!AOAI_KEY,
      AOAI_DEPLOYMENT: !!AOAI_DEPLOYMENT,
      INDEX_NAME: SEARCH_INDEX || null,
      STRICT_DOC_GROUNDING,
      DEFAULT_WEB_CREDITS
    };

    context.res = jsonRes({
      ok: true,
      layer: "diag",
      node: process.version,
      seen,
      t: new Date().toISOString()
    });
    return;
  }

  try {
    /* Env Var Guard (doc + general/web both need AOAI; doc also needs search) */
    const baseEnv = {
      AOAI_ENDPOINT: !!AOAI_ENDPOINT,
      AOAI_KEY: !!AOAI_KEY,
      AOAI_DEPLOYMENT: !!AOAI_DEPLOYMENT
    };
    if (!Object.values(baseEnv).every(Boolean)) {
      context.res = jsonRes({
        ok: false,
        layer: "env",
        error: "Missing AOAI environment variables",
        seen: baseEnv
      });
      return;
    }

    /* Parse Input */
    const body = req.body || {};
    const msgs = Array.isArray(body.messages) ? body.messages : [];
    const question =
      (body.question ||
        (msgs.length ? msgs[msgs.length - 1]?.content || "" : "") ||
        "").trim();

    // Client can request explicit mode
    // - mode:"web" => NEVER use docs, go webFallback()
    // - mode:"doc" => doc mode only
    // - mode:"general" => general mode only
    // - allowWeb:true => treated same as mode:"web" (explicit user consent)
    const clientMode = String(body.mode || "").toLowerCase().trim();
    const allowWeb = Boolean(body.allowWeb);
    const webCreditsRemaining = body.webCreditsRemaining;

    if (!question) {
      context.res = jsonRes({
        ok: false,
        layer: "input",
        error: "No question provided."
      });
      return;
    }

    /* ✅ DOMAIN ANCHOR GATE */
    const isRoofing = questionLooksRoofingRelated(question);

    // If user explicitly wants web/general, respect it regardless of roofing-ness.
    if (clientMode === "general") {
      const answer = await generalFallback(question, msgs);
      context.res = jsonRes({
        ok: true,
        mode: "general",
        question,
        answer,
        sources: []
      });
      return;
    }

    if (clientMode === "web" || allowWeb) {
      const answer = await webFallback(question, msgs);
      context.res = jsonRes({
        ok: true,
        mode: "web",
        question,
        answer,
        sources: [],
        web: {
          creditsMax: DEFAULT_WEB_CREDITS,
          creditsRemaining:
            Number.isFinite(Number(webCreditsRemaining)) ? Number(webCreditsRemaining) : undefined
        }
      });
      return;
    }

    // Default behavior if not roofing: general knowledge is allowed
    if (!isRoofing) {
      const answer = await generalFallback(question, msgs);
      context.res = jsonRes({
        ok: true,
        mode: "general",
        question,
        answer,
        sources: []
      });
      return;
    }

    // From here down: ROOFING => DOC MODE ONLY (unless user explicitly asked web)
    const docEnv = {
      SEARCH_ENDPOINT: !!SEARCH_ENDPOINT,
      SEARCH_KEY: !!SEARCH_KEY,
      SEARCH_INDEX: !!SEARCH_INDEX
    };
    if (!Object.values(docEnv).every(Boolean)) {
      context.res = jsonRes({
        ok: false,
        layer: "env",
        error: "Missing SEARCH environment variables for doc mode",
        seen: { ...baseEnv, ...docEnv }
      });
      return;
    }

    /* 🔎 Perform Azure Search */
    let snippets = await searchSnippets(question, 8);

    /* ✅ STRICT behavior for roofing questions:
       If no relevant snippets, DO NOT fall back to general knowledge.
       Return a refusal + UI prompt flags (so user can opt-in to web). */
    if (!snippets.length) {
      context.res = jsonRes(
        docRefusal(
          question,
          [],
          STRICT_DOC_GROUNDING
            ? "Roofing-related question, but no directly supporting RoofVault snippets were found."
            : "No relevant RoofVault snippets were found.",
          { creditsRemaining: webCreditsRemaining }
        )
      );
      return;
    }

    /* ✅ Stronger support check for list-style questions */
    if (STRICT_DOC_GROUNDING && isListStyleQuestion(question)) {
      if (!snippetsLookRelevantStrict(question, snippets)) {
        context.res = jsonRes(
          docRefusal(
            question,
            snippets.map((s) => ({ id: s.id, source: s.source })),
            "Retrieved documents, but the excerpts did not contain strong direct support for a list-style answer.",
            { creditsRemaining: webCreditsRemaining }
          )
        );
        return;
      }
    }

    /* Doc-mode prompt */
    const systemPrompt = [
      "You are RoofVault AI, a senior roofing consultant.",
      "Use ONLY the provided RoofVault document snippets as your factual basis.",
      "Do NOT use outside or general knowledge.",
      "Write a natural, ChatGPT-style answer (no forced sections).",
      "Keep it concise unless the user asks for depth.",
      "Every key claim must include inline citations like [[1]] that match the snippet numbers.",
      "If the answer cannot be supported by the snippets, say exactly: No support in the provided sources.",
      "",
      "If you present a list (bullets/numbered items), each item must include a citation on the same line."
    ].join(" ");

    const userPrompt = `Question: ${question}

Snippets:
${snippets.map((s) => `[[${s.id}]] ${s.source}\n${s.text}`).join("\n\n")}`;

    const ao = await aoaiAnswer(systemPrompt, userPrompt, msgs);
    let answer = (ao.ok ? ao.content : "") || "";

    if (!answer) {
      answer = ao.error
        ? `No answer due to model error: ${ao.error}`
        : "No support in the provided sources.";
    }

    // ✅ tighten citations (only allow citations that exist in this response)
    const validIds = new Set(snippets.map((s) => String(s.id)));
    answer = tightenCitations(answer, validIds);

    // ✅ STRICT: if doc-mode has zero valid citations, refuse
    if (answer !== "No support in the provided sources." && !hasAnyValidCitation(answer)) {
      context.res = jsonRes(
        docRefusal(
          question,
          snippets.map((s) => ({ id: s.id, source: s.source })),
          "Model response did not include valid snippet citations.",
          { creditsRemaining: webCreditsRemaining }
        )
      );
      return;
    }

    // ✅ STRICT: if list items exist, every item must have a citation
    if (STRICT_DOC_GROUNDING && isListStyleQuestion(question)) {
      if (!listItemsAllHaveCitations(answer)) {
        context.res = jsonRes(
          docRefusal(
            question,
            snippets.map((s) => ({ id: s.id, source: s.source })),
            "List-style answer did not provide per-item citations; refusing to avoid ungrounded synthesis.",
            { creditsRemaining: webCreditsRemaining }
          )
        );
        return;
      }
    }

    /* ✅ Return doc answer */
    context.res = jsonRes({
      ok: true,
      mode: "doc",
      question,
      answer,
      sources: snippets.map((s) => ({ id: s.id, source: s.source })),
      needsConsentForWeb: false
    });
  } catch (e) {
    context.res = jsonRes({
      ok: false,
      layer: "pipeline",
      error: String(e && e.message),
      stack: String(e && e.stack)
    });
  }
};
