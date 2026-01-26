// api/rvchat/index.js
// RoofVault Chat (Doc-first, general fallback, session-only memory prep)

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

    // Some Azure IDs are URL-safe base64; normalize then pad
    let b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (b64.length % 4)) % 4;
    if (padLen) b64 += "=".repeat(padLen);

    const url = Buffer.from(b64, "base64").toString("utf8");

    // If that didn't look like a URL, just return the original id
    if (!/^https?:\/\//i.test(url)) return id;

    // Take only the filename part
    const lastSegment = url.split("/").pop() || url;

    // Decode URL-encoded characters if present
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

  // If tokenization removes everything -> fallback to expanded text or "*"
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

/* AOAI wrapper (supports session-only history passed by frontend) */
async function aoaiAnswer(systemPrompt, userPrompt, historyMessages = []) {
  const base = (AOAI_ENDPOINT || "").replace(/\/+$/, "");
  const url = `${base}/openai/deployments/${encodeURIComponent(
    AOAI_DEPLOYMENT
  )}/chat/completions?api-version=2024-06-01`;

  // Session-only memory prep: include last N messages (user/assistant only)
  const safeHistory = Array.isArray(historyMessages)
    ? historyMessages
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim()
        )
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: String(m.content).slice(0, 2000)
        }))
    : [];

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

/* General fallback helper */
async function generalFallback(question, msgs) {
  const generalSystemPrompt = [
    "You are RoofVault AI.",
    "The RoofVault document search returned no relevant support for this question.",
    "Answer helpfully using general knowledge.",
    "Be honest about uncertainty.",
    "Do NOT include document-style citations like [[1]] or [1].",
    "End with exactly:",
    "Sources:",
    "General knowledge (no RoofVault document match)"
  ].join(" ");

  const generalUserPrompt = `Question: ${question}`;

  const ao = await aoaiAnswer(generalSystemPrompt, generalUserPrompt, msgs);
  const answer =
    (ao.ok ? ao.content : "") ||
    (ao.error ? `No answer due to model error: ${ao.error}` : "I couldn't generate an answer.");

  // Strip any accidental bracket citations
  return answer.replace(/\[\[\d+\]\]|\[\d+\]/g, "").replace(/\n{3,}/g, "\n\n").trim();
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
      SEARCH_INDEX_EXISTS: !!SEARCH_INDEX,
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
    const question = (
      body.question ||
      (msgs.length ? msgs[msgs.length - 1]?.content || "" : "") ||
      ""
    ).trim();

    if (!question) {
      context.res = jsonRes({
        ok: false,
        layer: "input",
        error: "No question provided."
      });
      return;
    }

    /* 🔎 Perform Azure Search */
    const snippets = await searchSnippets(question, 8);

    // If we have no snippets → general knowledge fallback
    if (!snippets.length) {
      const answer = await generalFallback(question, msgs);
      context.res = jsonRes({ ok: true, question, answer, sources: [] });
      return;
    }

    /* Document-mode prompt */
    const systemPrompt = [
      "You are RoofVault AI, a senior roofing consultant.",
      "Answer using ONLY the provided RoofVault document snippets as factual sources.",
      "Do NOT use outside or general knowledge.",
      "If the answer cannot be supported by the snippets, say exactly: 'No support in the provided sources.'",
      "Use inline citations like [[#]] that match the snippet numbers.",
      "",
      "Response structure:",
      "1) **Overview Section**",
      "2) **Technical Explanation Section**",
      "3) **Real-World Relevance Section**"
    ].join(" ");

    const userPrompt = `Question: ${question}

Sources:
${snippets
  .map((s) => "[[" + s.id + "]] " + s.source + "\n" + s.text)
  .join("\n\n")}`;

    /* Call AOAI (doc-first, with optional history) */
    const ao = await aoaiAnswer(systemPrompt, userPrompt, msgs);
    let answer = (ao.ok ? ao.content : "") || "";

    if (!answer) {
      answer = ao.error
        ? `No answer due to model error: ${ao.error}`
        : "No support in the provided sources.";
    }

    answer = answer.replace(/\n{3,}/g, "\n\n").trim();

    // If retrieval existed but model says unsupported → fallback to general knowledge
    if (/no support in the provided sources/i.test(answer)) {
      const fb = await generalFallback(question, msgs);
      context.res = jsonRes({ ok: true, question, answer: fb, sources: [] });
      return;
    }

    context.res = jsonRes({
      ok: true,
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
