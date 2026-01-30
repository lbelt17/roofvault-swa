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
// ✅ Server-side URL validation (WEB MODE ONLY) to reduce 404s
// ✅ Demo-stable web fallback when validation returns too few links (validated-first, then safe fallback)
// ✅ Anti-429 stability fixes (prompt cap + max_tokens + throttle fuse)

const DEPLOY_TAG = "RVCHAT__2026-01-29__WEB_VALIDATION_FALLBACK__A";

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

  // Foundry / Agent (web mode)
  FOUNDRY_ENDPOINT,
  FOUNDRY_PROJECT_ENDPOINT,
  FOUNDRY_AGENT_ID,

  // Entra client credentials for Foundry agent calls
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
} = process.env;

// -------------------------
// Instance-level throttle fuse
// -------------------------
let AOAI_THROTTLED_UNTIL_MS = 0;

// -------------------------
// Web sources policy
// -------------------------
const WEB_SOURCES_MIN = 2; // if validated < 2, fallback to reach at least 2
const WEB_SOURCES_MAX = 5; // never return more than 5
const WEB_FALLBACK_ALLOWLIST = [
  "nrca.net",
  "wbdg.org",
  "ibec.org",
  "iibec.org",
  "iccsafe.org",
  "gaf.com",
  "certainteed.com",
  "johnsmanville.com",
  "owenscorning.com",
  "soprema.us",
  "holcim.com",
  "astm.org",
  "smacna.org",
  "osha.gov",
  "cdc.gov",
  "nih.gov",
  "noaa.gov",
  "energy.gov",
];

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
  return context.res;
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
  return /(roof|roofing|tpo|epdm|pvc|flashing|membrane|shingle|modified bitumen|asphalt|smacna|nrca|iibec|astm|fm global|uplift|parapet|coping|deck|insulation|vapor retarder|fastener)/i.test(
    s
  );
}

function clampText(s, maxChars) {
  const t = String(s || "");
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars) + "…";
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

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isAllowlisted(url) {
  const h = hostOf(url);
  if (!h) return false;
  if (h.endsWith(".gov") || h.endsWith(".edu")) return true;
  return WEB_FALLBACK_ALLOWLIST.some((d) => h === d || h.endsWith(`.${d}`));
}

function isHomepageLike(url) {
  try {
    const u = new URL(url);
    const path = (u.pathname || "/").trim();
    return path === "/" || path === "" || path.toLowerCase() === "/index.html";
  } catch {
    return false;
  }
}

function uniqByUrl(list) {
  const seen = new Set();
  const out = [];
  for (const s of list || []) {
    const url = (s?.url || "").trim();
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(s);
  }
  return out;
}

// Existing "official-ish" fallback scorer (kept)
function tryMakeOfficialDomainFallback(sources) {
  const list = uniqueByUrl(sources);
  const scored = list
    .map((s) => {
      try {
        const u = new URL(s.url);
        const path = (u.pathname || "").replace(/\/+$/, "");
        const depth = path ? path.split("/").filter(Boolean).length : 0;
        const isHttps = u.protocol === "https:";
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
// Fetch with timeout
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
        "User-Agent":
          "Mozilla/5.0 (compatible; RoofVaultBot/1.0; +https://roofvault.ai)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function isValidHttpStatus(status) {
  return status >= 200 && status <= 399;
}

/**
 * WEB MODE ONLY validation:
 * - Validate up to N extracted sources (GET with short timeouts + total budget)
 * - Returns ONLY validated sources (can be 0..N)
 * NOTE: Demo-stable fallback to reach minimum happens AFTER this function.
 */
async function validateSourcesServerSide(
  extractedSources,
  { maxToValidate = 5, perUrlTimeoutMs = 3000, totalBudgetMs = 9000 } = {}
) {
  const sources = uniqueByUrl(extractedSources).slice(0, maxToValidate);
  if (!sources.length) return [];

  const started = Date.now();
  const validated = [];

  for (const s of sources) {
    if (Date.now() - started > totalBudgetMs) break;

    let ok = false;
    try {
      const res = await fetchWithTimeout(s.url, {
        timeoutMs: perUrlTimeoutMs,
        method: "GET",
      });
      ok = isValidHttpStatus(res.status);
    } catch {
      ok = false;
    }

    if (ok) validated.push(s);
  }

  return validated;
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

  const payload = {
    search: query,
    top: 6, // keep smaller to reduce prompt size
    queryType: "simple",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": SEARCH_KEY },
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

function hasAdequateSupport(chunks) {
  // strong guard: require at least 1 chunk with substantial text
  const good = (chunks || []).filter(
    (c) => String(c?.content || "").trim().length >= 180
  );
  return good.length >= 1;
}

function buildCitationsFromChunks(chunks) {
  return (chunks || []).map((c, i) => {
    const title =
      c?.metadata_storage_name ||
      c?.title ||
      c?.sourcefile ||
      c?.sourceFile ||
      `Source ${i + 1}`;

    const id =
      c?.chunkId != null
        ? `chunk:${c.chunkId}`
        : c?.chunk_id != null
        ? `chunk:${c.chunk_id}`
        : "";

    return {
      id: `S${i + 1}`,
      label: `[S${i + 1}] ${title}${id ? ` (${id})` : ""}`,
      content: String(c?.content || ""),
      meta: {
        metadata_storage_name: String(c?.metadata_storage_name || ""),
        metadata_storage_path: String(c?.metadata_storage_path || ""),
        bookGroupId: String(c?.bookGroupId || ""),
        chunkId: String(c?.chunkId || ""),
      },
    };
  });
}

// Build a SMALL sources block for AOAI (prevents huge token usage)
function buildSourcesBlockForAOAI(citations) {
  const MAX_SOURCES = 4;
  const MAX_CHARS_PER_SOURCE = 900;
  const MAX_TOTAL_CHARS = 3200;

  const picked = (citations || []).slice(0, MAX_SOURCES);

  let out = "";
  for (const c of picked) {
    const piece = `${c.label}\n${clampText(
      c.content,
      MAX_CHARS_PER_SOURCE
    )}\n\n---\n\n`;
    if (out.length + piece.length > MAX_TOTAL_CHARS) break;
    out += piece;
  }
  return out.trim();
}

// -------------------------
// Azure OpenAI call (doc/general)
// -------------------------
async function callAOAI(messages, { temperature = 0.2, maxTokens = 320 } = {}) {
  if (!AOAI_ENDPOINT || !AOAI_KEY || !AOAI_DEPLOYMENT) {
    return { ok: false, status: 0, error: "Missing AOAI_* env vars", text: "" };
  }

  // Throttle fuse: if we're in cooldown, do NOT call AOAI again
  if (Date.now() < AOAI_THROTTLED_UNTIL_MS) {
    return {
      ok: false,
      status: 429,
      error: "RateLimitReached (fuse)",
      text: "",
    };
  }

  const url = `${AOAI_ENDPOINT}/openai/deployments/${encodeURIComponent(
    AOAI_DEPLOYMENT
  )}/chat/completions?api-version=2024-06-01`;

  const payload = {
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": AOAI_KEY },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 429) {
      AOAI_THROTTLED_UNTIL_MS = Date.now() + 65000;
    }
    return {
      ok: false,
      status: res.status,
      error: `AOAI error ${res.status}: ${txt}`,
      text: "",
    };
  }

  const data = await res.json().catch(() => ({}));
  const text =
    data?.choices?.[0]?.message?.content != null
      ? String(data.choices[0].message.content)
      : "";
  return { ok: true, status: 200, text };
}

// -------------------------
// Foundry Agent (web mode)
// -------------------------
async function getEntraToken() {
  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
    throw new Error(
      "Missing AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET"
    );
  }

  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(
    AZURE_TENANT_ID
  )}/oauth2/v2.0/token`;

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", AZURE_CLIENT_ID);
  body.set("client_secret", AZURE_CLIENT_SECRET);
  body.set("scope", "https://ai.azure.com/.default");

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
  return (FOUNDRY_PROJECT_ENDPOINT || FOUNDRY_ENDPOINT || "").replace(/\/+$/, "");
}

async function callFoundryAgentWeb(question) {
  const base = pickFoundryBase();
  if (!base || !FOUNDRY_AGENT_ID) {
    throw new Error(
      "Missing FOUNDRY_PROJECT_ENDPOINT/FOUNDRY_ENDPOINT or FOUNDRY_AGENT_ID"
    );
  }

  const token = await getEntraToken();

  const threadsUrl = `${base}/threads?api-version=v1`;
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
    throw new Error(
      `Foundry create thread failed ${createThreadRes.status}: ${txt}`
    );
  }
  const threadData = await createThreadRes.json();
  const threadId = threadData?.id;
  if (!threadId) throw new Error("Foundry thread id missing");

  const messagesUrl = `${base}/threads/${encodeURIComponent(
    threadId
  )}/messages?api-version=v1`;

  const enforcedPrompt = [
    `Answer using the web (Bing-grounded).`,
    `At the end, include a section exactly titled: "Sources:"`,
    `Under "Sources:" provide exactly 5 bullet links, each MUST be a full https URL.`,
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
    body: JSON.stringify({ role: "user", content: enforcedPrompt }),
  });
  if (!addMsgRes.ok) {
    const txt = await addMsgRes.text().catch(() => "");
    throw new Error(`Foundry add message failed ${addMsgRes.status}: ${txt}`);
  }

  const runsUrl = `${base}/threads/${encodeURIComponent(
    threadId
  )}/runs?api-version=v1`;
  const createRunRes = await fetch(runsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ assistant_id: FOUNDRY_AGENT_ID }),
  });
  if (!createRunRes.ok) {
    const txt = await createRunRes.text().catch(() => "");
    throw new Error(
      `Foundry create run failed ${createRunRes.status}: ${txt}`
    );
  }
  const runData = await createRunRes.json();
  const runId = runData?.id;
  if (!runId) throw new Error("Foundry run id missing");

  const runUrl = `${base}/threads/${encodeURIComponent(
    threadId
  )}/runs/${encodeURIComponent(runId)}?api-version=v1`;

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

  const listMsgRes = await fetch(messagesUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!listMsgRes.ok) {
    const txt = await listMsgRes.text().catch(() => "");
    throw new Error(
      `Foundry list messages failed ${listMsgRes.status}: ${txt}`
    );
  }

  const listData = await listMsgRes.json().catch(() => ({}));
  const items = Array.isArray(listData?.data) ? listData.data : [];
  const assistantMsg = items.find(
    (m) => String(m?.role).toLowerCase() === "assistant"
  );

  const content = assistantMsg?.content;
  let text = "";
  if (typeof content === "string") text = content;
  else if (Array.isArray(content)) {
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
// Sources extraction (web)
// -------------------------
function extractHttpsUrls(text) {
  const s = String(text || "");
  const re = /\bhttps:\/\/[^\s)<>\]}",']+/gi;
  const matches = s.match(re) || [];
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

/**
 * Build demo-stable sources:
 * - If validated >= WEB_SOURCES_MIN: return validated only
 * - Else: return validated + safe fallback from extracted (allowlist/homepage-like preferred)
 * - Caps at WEB_SOURCES_MAX.
 */
function buildFinalWebSources(extractedSources, validatedSources) {
  const extractedUnique = uniqByUrl(uniqueByUrl(extractedSources));
  const validatedUnique = uniqByUrl(uniqueByUrl(validatedSources));

  let finalSources = [...validatedUnique];
  let validatedPartial = false;

  if (finalSources.length < WEB_SOURCES_MIN) {
    validatedPartial = true;

    const validatedUrlSet = new Set(finalSources.map((s) => s.url));
    const notValidated = extractedUnique.filter(
      (s) => !validatedUrlSet.has(s.url)
    );

    const preferred = [];
    const secondary = [];

    for (const s of notValidated) {
      const url = (s?.url || "").trim();
      if (!url.startsWith("https://")) continue;

      if (isAllowlisted(url) || isHomepageLike(url)) preferred.push(s);
      else secondary.push(s);
    }

    const need = Math.max(0, WEB_SOURCES_MIN - finalSources.length);

    const fill = [];
    for (const s of preferred) {
      if (fill.length >= need) break;
      fill.push(s);
    }
    for (const s of secondary) {
      if (fill.length >= need) break;
      fill.push(s);
    }

    let combined = uniqByUrl([...finalSources, ...fill]);
    if (combined.length < WEB_SOURCES_MIN) {
      const official = tryMakeOfficialDomainFallback(extractedUnique);
      if (official && !combined.find((x) => x.url === official.url)) {
        combined = uniqByUrl([official, ...combined]);
      }
    }

    finalSources = combined.slice(0, WEB_SOURCES_MAX);
  }

  finalSources = uniqByUrl(finalSources).slice(0, WEB_SOURCES_MAX);

  return {
    finalSources,
    validatedPartial,
    returnedCountValidated: validatedUnique.length,
    returnedCountTotal: finalSources.length,
  };
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

    const debugFlag =
      String((req.query && (req.query.debug || req.query.diag)) || "") === "1";

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
      const extractedSources = sourcesFromUrls(urls).slice(0, 12);

      const validatedSources = await validateSourcesServerSide(extractedSources, {
        maxToValidate: 8,
        perUrlTimeoutMs: 2500,
        totalBudgetMs: 9000,
      });

      const built = buildFinalWebSources(extractedSources, validatedSources);

      return jsonResponse(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        mode,
        answer: stripSourcesSection(webText),
        sources: built.finalSources,
        web: {
          eligible: true,
          creditsMax: 5,
          validated: true,
          validatedPartial: built.validatedPartial,
          extractedCount: extractedSources.length,
          returnedCountValidated: built.returnedCountValidated,
          returnedCountTotal: built.returnedCountTotal,
          returnedCount: built.returnedCountTotal,
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

      // MUST be let: we may apply intent filters.
      let chunks = search.chunks || [];

      // ✅ Doc-mode intent filter: if user explicitly asks for IIBEC, keep IIBEC sources only.
      // (Stability-first: only activates when keyword is explicit.)
      const qUpper = String(question || "").toUpperCase();
      const wantsIIBEC = qUpper.includes("IIBEC");
      if (wantsIIBEC && Array.isArray(chunks) && chunks.length) {
        const filtered = chunks.filter((ch) =>
          String(ch.metadata_storage_name || "").toUpperCase().includes("IIBEC")
        );
        if (filtered.length) chunks = filtered;
      }

      const supported = hasAdequateSupport(chunks);

      if (!supported) {
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
        `Keep answers concise.`,
        `Cite sources inline like [S1], [S2].`,
        `Do not use outside knowledge.`,
      ].join("\n");

      const sourcesBlock = buildSourcesBlockForAOAI(citations);

      const user = [`Question: ${question}`, ``, `Sources:`, sourcesBlock].join(
        "\n"
      );

      const aoai = await callAOAI(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        {
          temperature: 0.1,
          maxTokens: 320,
        }
      );

      if (!aoai.ok) {
        const errText = String(aoai.error || "");
        const is429 =
          aoai.status === 429 ||
          errText.includes("AOAI error 429") ||
          errText.includes("RateLimitReached") ||
          errText.includes("fuse");

        if (is429) {
          return jsonResponse(context, 429, {
            ok: false,
            deployTag: DEPLOY_TAG,
            mode: "doc",
            error: "Rate limited by Azure OpenAI. Please retry in ~60 seconds.",
            retryAfterSeconds: 60,
            throttled: true,
          });
        }

        return jsonResponse(context, 502, {
          ok: false,
          deployTag: DEPLOY_TAG,
          mode: "doc",
          error: aoai.error || "AOAI failed",
        });
      }

      const answer = String(aoai.text || "").trim();

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

      const _diag = debugFlag
        ? {
            chunksCount: Array.isArray(chunks) ? chunks.length : 0,
            chunk0Keys: chunks && chunks[0] ? Object.keys(chunks[0]) : [],
          }
        : undefined;

      return jsonResponse(context, 200, {
        ok: true,
        deployTag: DEPLOY_TAG,
        mode: "doc",
        question,
        answer,
        ...(debugFlag ? { _diag } : {}),
        sources: citations.map((c, i) => {
          const ch = (chunks && chunks[i]) || {};

          const title = String(
            ch.metadata_storage_name ||
              ch.title ||
              ch.sourcefile ||
              ch.sourceFile ||
              ch.filename ||
              ch.fileName ||
              ""
          ).trim();

          const rawPath = String(
            ch.metadata_storage_path || ch.url || ch.sourceUrl || ""
          ).trim();

          const url =
            rawPath.startsWith("http://") || rawPath.startsWith("https://")
              ? rawPath
              : "";

          const chunk_id = ch.chunkId || ch.chunk_id || ch.id || null;

          return {
            id: c.id,
            title,
            url,
            publisher: "",
            pageNumber: null,
            chunk_id,
          };
        }),
      });
    }

    // -------------------------
    // GENERAL MODE (non-roofing only)
    // -------------------------
    if (mode === "general") {
      const system = `You are RoofVault Chat. Answer normally and helpfully. Keep it concise.`;
      const aoai = await callAOAI(
        [
          { role: "system", content: system },
          { role: "user", content: question },
        ],
        { temperature: 0.4, maxTokens: 320 }
      );

      if (!aoai.ok) {
        const is429 =
          aoai.status === 429 ||
          String(aoai.error || "").includes("RateLimitReached");
        if (is429) {
          return jsonResponse(context, 429, {
            ok: false,
            deployTag: DEPLOY_TAG,
            mode,
            error: "Rate limited by Azure OpenAI. Please retry in ~60 seconds.",
            retryAfterSeconds: 60,
            throttled: true,
          });
        }

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
