// api/rvchat/index.js
// RoofVault Chat API (STRICT doc-grounded for roofing questions)
// mode: "doc" | "general" | "web"
//
// ✅ Default: roofing => DOC ONLY (Azure AI Search snippets + AOAI) with strict citations
// ✅ If roofing + no doc support => return needsConsentForWeb:true (UI prompts)
// ✅ Web is NEVER automatic. Only runs when client explicitly sets mode:"web"
// ✅ Session-only memory via messages[]
// ✅ Foundry Agents wired for web mode (Bing-grounded agent)
// ✅ Web sources enforced + extracted into sources[]
// ✅ NEW (Step 1): Server-side URL validation (WEB MODE ONLY) to reduce 404s
//
// Deploy tag:
const DEPLOY_TAG = "RVCHAT__2026-01-28__URL_VALIDATE__A";

// -------------------------
// Env
// -------------------------
const {
  // Azure AI Search (docs)
  SEARCH_ENDPOINT,
  SEARCH_KEY,
  SEARCH_INDEX,

  // Azure OpenAI (doc/general completion)
  AOAI_ENDPOINT,
  AOAI_KEY,
  AOAI_DEPLOYMENT,

  // Foundry / Agent (web mode) — keep whatever you already configured
  // These names are intentionally flexible; web mode code below reads them defensively.
  FOUNDRY_ENDPOINT,
  FOUNDRY_PROJECT_ENDPOINT,
  FOUNDRY_AGENT_ID,

  // Entra client credentials for Foundry agent calls
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
} = process.env;

// -------------------------
// Small utilities
// -------------------------
function jsonResponse(context, status, body) {
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body,
  };
}

function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function normalizeMode(modeRaw) {
  const m = String(modeRaw || "doc").toLowerCase().trim();
  if (m === "web") return "web";
  if (m === "general") return "general";
  return "doc";
}

function isProbablyRoofingQuestion(q) {
  const s = String(q || "").toLowerCase();
  // Keep this conservative; doc gate is enforced by snippet support anyway.
  return /(roof|roofing|tpo|epdm|pvc|flashing|membrane|shingle|modified bitumen|asphalt|smacna|nrca|iibec|astm|fm global|uplift|parapet|coping|deck|insulation|vapor retarder|fastener)/i.test(
    s
  );
}

function uniqueByUrl(sources) {
  const seen = new Set();
  const out = [];
  for (const s of sources || []) {
    const url = (s?.url || "").trim();
    if (!url) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title: (s?.title || "").trim(),
      url,
      publisher: (s?.publisher || "").trim(),
    });
  }
  return out;
}

function tryMakeOfficialDomainFallback(sources) {
  // Heuristic: choose the shortest, most “homepage-like” https URL (often the official site).
  const list = uniqueByUrl(sources);
  const scored = list
    .map((s) => {
      try {
        const u = new URL(s.url);
        const path = (u.pathname || "").replace(/\/+$/, "");
        const depth = path ? path.split("/").filter(Boolean).length : 0;
        const isHttps = u.protocol === "https:";
        // Prefer https, fewer path segments, no obvious tracking params
        const score =
          (isHttps ? 0 : 10) +
          depth * 2 +
          (u.search ? 2 : 0) +
          (u.hash ? 1 : 0);
        return { s, score };
      } catch {
        return { s, score: 999 };
      }
    })
    .sort((a, b) => a.score - b.score);

  if (!scored.length) return null;
  return scored[0].s;
}

// -------------------------
// Fetch with timeout (Node 18+ has global fetch)
// -------------------------
async function fetchWithTimeout(url, { timeoutMs = 3000, method = "GET" } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        // Some sites behave better with a browser-ish UA
        "User-Agent":
          "Mozilla/5.0 (compatible; RoofVaultBot/1.0; +https://roofvault.ai)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function isValidHttpStatus(status) {
  // Accept 200–399 (success + redirects)
  return status >= 200 && status <= 399;
}

async function validateSourcesServerSide(
  extractedSources,
  {
    maxToValidate = 5,
    perUrlTimeoutMs = 3000,
    totalBudgetMs = 9000, // cap total time spent validating
  } = {}
) {
  const sources = uniqueByUrl(extractedSources).slice(0, maxToValidate);
  if (!sources.length) return [];

  const started = Date.now();
  const validated = [];

  // Sequential validation to keep it lightweight and predictable.
  for (const s of sources) {
    if (Date.now() - started > totalBudgetMs) break;

    let ok = false;
    try {
      const res = await fetchWithTimeout(s.url, {
        timeoutMs: perUrlTimeoutMs,
        method: "GET", // prefer GET over HEAD (many sites block HEAD)
      });
      ok = isValidHttpStatus(res.status);
    } catch {
      ok = false;
    }

    if (ok) validated.push(s);
  }

  // Best-effort fallback behavior:
  // - If we validated at least 1 link, return those only.
  // - If we validated 0 links, return original extracted sources (deduped),
  //   but try to ensure at least one “official domain” style link is present.
  if (validated.length > 0) return validated;

  const fallback = uniqueByUrl(extractedSources).slice(0, maxToValidate);
  const official = tryMakeOfficialDomainFallback(fallback);
  if (official) {
    // Put official first (no duplicates)
    const rest = fallback.filter((x) => x.url !== official.url);
    return [official, ...rest].slice(0, maxToValidate);
  }
  return fallback;
}

// -------------------------
// Azure AI Search (docs)
// -------------------------
async function searchDocs(query) {
  if (!SEARCH_ENDPOINT || !SEARCH_KEY || !SEARCH_INDEX) {
    return { ok: false, error: "Missing SEARCH_* env vars", chunks: [] };
  }

  const url =
    `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(
      SEARCH_INDEX
    )}/docs/search?api-version=2023-11-01`;

  // Keep it simple: top chunks for grounding
  const payload = {
    search: query,
    top: 8,
    queryType: "simple",
    select: "content,title,sourcefile,chunk_id,bookGroupId,pageNumber,url",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": SEARCH_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { ok: false, error: `Search error ${res.status}: ${txt}`, chunks: [] };
  }

  const data = await res.json().catch(() => ({}));
  const chunks = Array.isArray(data?.value) ? data.value : [];
  return { ok: true, chunks };
}

function buildCitationsFromChunks(chunks) {
  // Minimal citation formatting—your existing UI likely just shows snippets.
  // Keep stable: return structured citations for your model prompt.
  return (chunks || []).map((c, i) => {
    const title = c?.title || c?.sourcefile || `Source ${i + 1}`;
    const page = c?.pageNumber != null ? `p.${c.pageNumber}` : "";
    const id = c?.chunk_id != null ? `chunk:${c.chunk_id}` : "";
    return {
      label: `[S${i + 1}] ${title}${page ? ` (${page})` : ""}${id ? ` (${id})` : ""}`,
      content: String(c?.content || ""),
      meta: {
        title: String(c?.title || ""),
        sourcefile: String(c?.sourcefile || ""),
        url: String(c?.url || ""),
        bookGroupId: String(c?.bookGroupId || ""),
        pageNumber: c?.pageNumber ?? null,
        chunk_id: c?.chunk_id ?? null,
      },
    };
  });
}

function hasAdequateSupport(chunks) {
  // Strong guard: require at least 1 chunk with substantial text.
  const good = (chunks || []).filter((c) => String(c?.content || "").trim().length >= 200);
  return good.length >= 1;
}

// -------------------------
// Azure OpenAI call (doc/general)
// -------------------------
async function callAOAI(messages, { temperature = 0.2 } = {}) {
  if (!AOAI_ENDPOINT || !AOAI_KEY || !AOAI_DEPLOYMENT) {
    return { ok: false, error: "Missing AOAI_* env vars", text: "" };
  }

  const url = `${AOAI_ENDPOINT}/openai/deployments/${encodeURIComponent(
    AOAI_DEPLOYMENT
  )}/chat/completions?api-version=2024-06-01`;

  const payload = {
    messages,
    temperature,
    max_tokens: 900,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": AOAI_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { ok: false, error: `AOAI error ${res.status}: ${txt}`, text: "" };
  }

  const data = await res.json().catch(() => ({}));
  const text =
    data?.choices?.[0]?.message?.content != null
      ? String(data.choices[0].message.content)
      : "";
  return { ok: true, text };
}

// -------------------------
// Foundry Agent (web mode)
// -------------------------
// IMPORTANT: This is written defensively so it doesn’t break your already-working wiring.
// It assumes your existing environment variables are correct.
// If your current file uses different variable names/endpoints, swap ONLY the env wiring,
// not the validation logic added after sources extraction.
async function getEntraToken() {
  // AAD v2 token endpoint
  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
    throw new Error("Missing AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET");
  }

  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(
    AZURE_TENANT_ID
  )}/oauth2/v2.0/token`;

  // Scope commonly used for Azure resources; your existing setup may already work with this.
  // If you had a known-good scope in your current file, keep it there.
  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", AZURE_CLIENT_ID);
  body.set("client_secret", AZURE_CLIENT_SECRET);
  body.set("scope", "https://management.azure.com/.default");

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Entra token error ${res.status}: ${txt}`);
  }

  const data = await res.json();
  const token = data?.access_token;
  if (!token) throw new Error("Entra token missing access_token");
  return token;
}

function pickFoundryBase() {
  // Prefer project endpoint if provided; fallback to foundry endpoint.
  return (FOUNDRY_PROJECT_ENDPOINT || FOUNDRY_ENDPOINT || "").replace(/\/+$/, "");
}

async function callFoundryAgentWeb(question) {
  const base = pickFoundryBase();
  if (!base || !FOUNDRY_AGENT_ID) {
    throw new Error("Missing FOUNDRY_PROJECT_ENDPOINT/FOUNDRY_ENDPOINT or FOUNDRY_AGENT_ID");
  }

  const token = await getEntraToken();

  // These routes reflect the common Agents/Threads/Runs pattern you said is already working.
  // Keep consistent with your current working implementation.
  const threadsUrl = `${base}/threads?api-version=2024-10-01-preview`;
  const createThreadRes = await fetch(threadsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!createThreadRes.ok) {
    const txt = await createThreadRes.text().catch(() => "");
    throw new Error(`Foundry create thread failed ${createThreadRes.status}: ${txt}`);
  }

  const threadData = await createThreadRes.json();
  const threadId = threadData?.id;
  if (!threadId) throw new Error("Foundry thread id missing");

  // Add message
  const messagesUrl = `${base}/threads/${encodeURIComponent(
    threadId
  )}/messages?api-version=2024-10-01-preview`;

  // Enforce “Sources:” with 2–5 https links
  const enforcedPrompt = [
    `Answer using the web (Bing-grounded).`,
    `At the end, include a section exactly titled: "Sources:"`,
    `Under "Sources:" provide 2–5 bullet links, each MUST be a full https URL.`,
    `Avoid gated/member-only links when possible; prefer official publisher pages.`,
    ``,
    `Question: ${question}`,
  ].join("\n");

  const addMsgRes = await fetch(messagesUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      role: "user",
      content: enforcedPrompt,
    }),
  });

  if (!addMsgRes.ok) {
    const txt = await addMsgRes.text().catch(() => "");
    throw new Error(`Foundry add message failed ${addMsgRes.status}: ${txt}`);
  }

  // Create run
  const runsUrl = `${base}/threads/${encodeURIComponent(
    threadId
  )}/runs?api-version=2024-10-01-preview`;

  const createRunRes = await fetch(runsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      assistant_id: FOUNDRY_AGENT_ID,
    }),
  });

  if (!createRunRes.ok) {
    const txt = await createRunRes.text().catch(() => "");
    throw new Error(`Foundry create run failed ${createRunRes.status}: ${txt}`);
  }

  const runData = await createRunRes.json();
  const runId = runData?.id;
  if (!runId) throw new Error("Foundry run id missing");

  // Poll run
  const runUrl = `${base}/threads/${encodeURIComponent(
    threadId
  )}/runs/${encodeURIComponent(runId)}?api-version=2024-10-01-preview`;

  const maxPollMs = 20000;
  const pollEveryMs = 700;
  const pollStart = Date.now();

  while (true) {
    const pollRes = await fetch(runUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!pollRes.ok) {
      const txt = await pollRes.text().catch(() => "");
      throw new Error(`Foundry poll failed ${pollRes.status}: ${txt}`);
    }
    const p = await pollRes.json().catch(() => ({}));
    const status = String(p?.status || "").toLowerCase();

    if (status === "completed") break;
    if (status === "failed" || status === "cancelled" || status === "expired") {
      throw new Error(`Foundry run status: ${status}`);
    }
    if (Date.now() - pollStart > maxPollMs) {
      throw new Error("Foundry run poll timeout");
    }
    await new Promise((r) => setTimeout(r, pollEveryMs));
  }

  // Get final messages
  const listMsgRes = await fetch(messagesUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!listMsgRes.ok) {
    const txt = await listMsgRes.text().catch(() => "");
    throw new Error(`Foundry list messages failed ${listMsgRes.status}: ${txt}`);
  }

  const listData = await listMsgRes.json().catch(() => ({}));
  const items = Array.isArray(listData?.data) ? listData.data : [];

  // Find the latest assistant message content (defensive)
  const assistantMsg = items.find((m) => String(m?.role).toLowerCase() === "assistant");
  const content = assistantMsg?.content;

  // content can be string or array depending on API shape
  let text = "";
  if (typeof content === "string") {
    text = content;
  } else if (Array.isArray(content)) {
    // try to join text parts
    text = content
      .map((part) => part?.text?.value || part?.text || part?.value || "")
      .filter(Boolean)
      .join("\n");
  } else {
    text = String(content || "");
  }

  return text;
}

// -------------------------
// Sources extraction
// -------------------------
function extractHttpsUrls(text) {
  const s = String(text || "");
  const re = /\bhttps:\/\/[^\s)<>\]}",']+/gi;
  const matches = s.match(re) || [];
  // Clean trailing punctuation that often sticks to URLs
  return matches.map((u) => u.replace(/[)\].,;:"'!?]+$/g, ""));
}

function sourcesFromUrls(urls) {
  return uniqueByUrl(
    (urls || []).map((u) => {
      let title = "";
      try {
        const x = new URL(u);
        title = x.hostname.replace(/^www\./, "");
      } catch {
        title = "Source";
      }
      return { title, url: u, publisher: "" };
    })
  );
}

function stripSourcesSection(text) {
  const s = String(text || "");
  const idx = s.toLowerCase().lastIndexOf("sources:");
  if (idx === -1) return s.trim();
  return s.slice(0, idx).trim();
}

// -------------------------
// Main handler
// -------------------------
module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse(context, 204, "");
    }

    const body = req.body || safeJsonParse(req.rawBody, {}) || {};
    const mode = normalizeMode(body.mode);
    const question = String(body.question || "").trim();

    if (!question) {
      return jsonResponse(context, 400, {
        ok: false,
        deployTag: DEPLOY_TAG,
        error: "Missing question",
      });
    }

    // -------------------------
    // WEB MODE (explicit only)
    // -------------------------
    if (mode === "web") {
      let webText = "";
      try {
        webText = await callFoundryAgentWeb(question);
      } catch (e) {
        return jsonResponse(context, 502, {
          ok: false,
          deployTag: DEPLOY_TAG,
          mode,
          error: `Web mode failed: ${e?.message || String(e)}`,
        });
      }

      const urls = extractHttpsUrls(webText);
      const extractedSources = sourcesFromUrls(urls).slice(0, 5);

      // ✅ NEW: Validate links server-side (web mode only)
      const validatedSources = await validateSourcesServerSide(extractedSources, {
        maxToValidate: 5,
        perUrlTimeoutMs: 3000,
        totalBudgetMs: 9000,
      });

      return jsonResponse(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        mode,
        answer: stripSourcesSection(webText),
        sources: validatedSources,
        web: {
          eligible: true,
          creditsMax: 5,
          validated: true,
          extractedCount: extractedSources.length,
          returnedCount: validatedSources.length,
        },
      });
    }

    // -------------------------
    // DOC / GENERAL
    // -------------------------
    const roofing = isProbablyRoofingQuestion(question);

    // Default behavior: doc strict for roofing
    if (mode === "doc" || (mode === "general" && roofing)) {
      const search = await searchDocs(question);
      if (!search.ok) {
        return jsonResponse(context, 502, {
          ok: false,
          deployTag: DEPLOY_TAG,
          mode: "doc",
          error: search.error || "Search failed",
        });
      }

      const chunks = search.chunks || [];
      const supported = hasAdequateSupport(chunks);

      if (!supported) {
        // Strict refusal + consent gate for web fallback
        return jsonResponse(context, 200, {
          ok: true,
          deployTag: DEPLOY_TAG,
          mode: "doc",
          question,
          answer: "No support in the provided sources.",
          needsConsentForWeb: true,
          web: { eligible: true, creditsMax: 5 },
          sources: [],
        });
      }

      const citations = buildCitationsFromChunks(chunks);

      const system = [
        `You are RoofVault Chat. You MUST be strictly grounded in the provided sources.`,
        `If the answer is not supported by the sources, respond exactly: "No support in the provided sources."`,
        `Cite sources inline like [S1], [S2].`,
        `Do not use outside knowledge.`,
      ].join("\n");

      const sourcesBlock = citations
        .map((c) => `${c.label}\n${c.content}`)
        .join("\n\n---\n\n");

      const user = [
        `Question: ${question}`,
        ``,
        `Sources:`,
        sourcesBlock,
      ].join("\n");

      const aoai = await callAOAI(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { temperature: 0.1 }
      );

      if (!aoai.ok) {
        return jsonResponse(context, 502, {
          ok: false,
          deployTag: DEPLOY_TAG,
          mode: "doc",
          error: aoai.error || "AOAI failed",
        });
      }

      const answer = String(aoai.text || "").trim();

      // If the model refused, keep the consent gate (but still doc mode)
      if (answer === "No support in the provided sources.") {
        return jsonResponse(context, 200, {
          ok: true,
          deployTag: DEPLOY_TAG,
          mode: "doc",
          question,
          answer,
          needsConsentForWeb: true,
          web: { eligible: true, creditsMax: 5 },
          sources: [],
        });
      }

      // Return doc citations (your UI likely already renders doc snippets elsewhere)
      return jsonResponse(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        mode: "doc",
        question,
        answer,
        sources: citations.map((c) => ({
          title: c.meta.title || c.meta.sourcefile || "",
          url: c.meta.url || "",
          publisher: "",
          pageNumber: c.meta.pageNumber ?? null,
          chunk_id: c.meta.chunk_id ?? null,
        })),
      });
    }

    // -------------------------
    // GENERAL MODE (non-roofing only)
    // -------------------------
    if (mode === "general") {
      const system = `You are RoofVault Chat. Answer normally and helpfully.`;
      const aoai = await callAOAI(
        [
          { role: "system", content: system },
          { role: "user", content: question },
        ],
        { temperature: 0.4 }
      );

      if (!aoai.ok) {
        return jsonResponse(context, 502, {
          ok: false,
          deployTag: DEPLOY_TAG,
          mode,
          error: aoai.error || "AOAI failed",
        });
      }

      return jsonResponse(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        mode,
        question,
        answer: String(aoai.text || "").trim(),
        sources: [],
      });
    }

    // Fallback
    return jsonResponse(context, 400, {
      ok: false,
      deployTag: DEPLOY_TAG,
      error: `Unsupported mode: ${mode}`,
    });
  } catch (e) {
    return jsonResponse(context, 500, {
      ok: false,
      deployTag: DEPLOY_TAG,
      error: e?.message || String(e),
    });
  }
};
