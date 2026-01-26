// api/rvchat/index.js
// RoofVault Chat API (doc-first, general fallback, session-only memory)
// Adds mode: "doc" | "general" in responses
// ✅ Adds relevance gate so irrelevant search hits don't force doc-mode

const {
  SEARCH_ENDPOINT,
  SEARCH_KEY,
  SEARCH_INDEX,
  AOAI_ENDPOINT,
  AOAI_KEY,
  AOAI_DEPLOYMENT
} = process.env;

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
          "roof",
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

/* 🔎 Azure Search snippet fetch – matches your schema: id + content */
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

/* Session-only memory prep (backend) */
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

/* ✅ Relevance gate: are snippets actually about the question? */
function snippetsLookRelevant(question, snippets) {
  const raw = String(question || "").trim();
  const expanded = aliasExpand(raw);
  const toks = _tokens(expanded);

  // If we can’t extract tokens, don’t block.
  if (!toks.length) return true;

  const hay = _norm(snippets.map((s) => s.text || "").join(" ").slice(0, 8000));

  // Count unique token hits
  const uniq = Array.from(new Set(toks));
  let hits = 0;
  for (const t of uniq) {
    if (hay.includes(t)) hits++;
  }

  // Require stronger match for short queries:
  // - 1–2 tokens: must hit ALL
  // - 3 tokens: need at least 2
  // - 4+ tokens: need at least 2
  let required = 2;
  if (uniq.length <= 2) required = uniq.length;
  else if (uniq.length === 3) required = 2;

  return hits >= required;
}

/* General knowledge fallback */
async function generalFallback(question, msgs) {
  const systemPrompt = [
    "You are RoofVault AI.",
    "No relevant RoofVault document snippets were found (or they were insufficient).",
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
  answer = String(answer).replace(/\[\[\s*#\s*\]\]/g, "").replace(/\[\[\s*\d+\s*\]\]/g, "");
  answer = answer.replace(/\n{3,}/g, "\n\n").trim();
  return answer;
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
      INDEX_NAME: SEARCH_INDEX || null
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
    /* Env Var Guard */
    const reqEnv = {
      SEARCH_ENDPOINT: !!SEARCH_ENDPOINT,
      SEARCH_KEY: !!SEARCH_KEY,
      SEARCH_INDEX: !!SEARCH_INDEX,
      AOAI_ENDPOINT: !!AOAI_ENDPOINT,
      AOAI_KEY: !!AOAI_KEY,
      AOAI_DEPLOYMENT: !!AOAI_DEPLOYMENT
    };
    if (!Object.values(reqEnv).every(Boolean)) {
      context.res = jsonRes({
        ok: false,
        layer: "env",
        error: "Missing environment variables",
        seen: reqEnv
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

    if (!question) {
      context.res = jsonRes({
        ok: false,
        layer: "input",
        error: "No question provided."
      });
      return;
    }

    /* 🔎 Perform Azure Search */
    let snippets = await searchSnippets(question, 8);

    // ✅ Relevance gate: if snippets don't match the question, treat as "no match"
    if (snippets.length && !snippetsLookRelevant(question, snippets)) {
      snippets = [];
    }

    /* If no relevant snippets → general fallback */
    if (!snippets.length) {
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

    /* Doc-mode prompt */
    const systemPrompt = [
      "You are RoofVault AI, a senior roofing consultant.",
      "Use ONLY the provided RoofVault document snippets as your factual basis.",
      "Do NOT use outside or general knowledge.",
      "Write a natural, ChatGPT-style answer (no forced sections).",
      "Keep it concise unless the user asks for depth.",
      "Every key claim must include inline citations like [[1]] that match the snippet numbers.",
      "If the answer cannot be supported by the snippets, say exactly: No support in the provided sources."
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

    // ✅ tighten citations
    const validIds = new Set(snippets.map((s) => String(s.id)));
    answer = tightenCitations(answer, validIds);

    // If doc-mode has zero valid citations, force the standard message
    if (answer !== "No support in the provided sources." && !hasAnyValidCitation(answer)) {
      answer = "No support in the provided sources.";
    }

    context.res = jsonRes({
      ok: true,
      mode: "doc",
      question,
      answer,
      sources: snippets.map((s) => ({ id: s.id, source: s.source }))
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
