/**
 * /api/exam — generate N practice items for a selected document.
 *
 * Env required:
 *   SEARCH_ENDPOINT=https://roofvaultsearch.search.windows.net
 *   SEARCH_API_KEY=xxxxxxxxxxxxxxxxxxxx
 *   SEARCH_INDEX=azureblob-index
 *
 *   OPENAI_ENDPOINT=https://TheRoofVaultOPENAI1.openai.azure.com         (your Azure OpenAI endpoint)
 *   OPENAI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx                              (your AOAI key)
 *   OPENAI_DEPLOYMENT=roofvault-turbo                                    (your deployed model name)
 *   OPENAI_API_VERSION=2024-02-15-preview                                 (defaults to this if unset)
 *
 * Request body: { book: string, filterField: string, count?: number }
 * Response: { items: [...], modelDeployment: string }
 */

const https = require("https");

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        protocol: u.protocol,
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers }
      },
      (res) => {
        let buf = "";
        res.on("data", (d) => (buf += d));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(buf || "{}") }); }
          catch (e) { resolve({ status: res.statusCode, body: { raw: buf } }); }
        });
      }
    );
    req.on("error", reject);
    req.write(JSON.stringify(body || {}));
    req.end();
  });
}

function escapeODataLiteral(s){
  // OData string literals escape single quotes by doubling them
  return String(s || "").replace(/'/g, "''");
}

async function fetchPassages({ endpoint, key, index, filterField, book }) {
  const apiVersion = "2023-11-01";
  const url = `${endpoint}/indexes/${encodeURIComponent(index)}/docs/search?api-version=${apiVersion}`;

  const filter =
    (book && filterField)
      ? `${filterField} eq '${escapeODataLiteral(book)}'`
      : null;

  // Pull a healthy chunk of text; adjust the select list to match your index
  // Common fields: content, text, chunk, pageContent, metadata_storage_path/name
  const selectCandidates = ["content", "text", "chunk", "pageContent"];
  const selects = selectCandidates.join(",");

  const { status, body } = await postJson(
    url,
    { "api-key": key },
    {
      search: "*",
      searchMode: "any",
      filter: filter || undefined,
      select: selects,
      top: 200
    }
  );

  if (status < 200 || status >= 300) {
    throw new Error(`Search HTTP ${status}: ${JSON.stringify(body).slice(0,300)}`);
  }

  const docs = Array.isArray(body.value) ? body.value : [];
  const texts = [];
  for (const d of docs) {
    for (const f of selectCandidates) {
      if (d[f] && typeof d[f] === "string") {
        texts.push(d[f]);
        break;
      }
    }
  }

  // De-dup & trim; cap total prompt size
  const uniq = Array.from(new Set(texts.map(t => t.trim()).filter(Boolean)));
  // Keep first ~50k chars to avoid token blowups
  let combined = "";
  for (const t of uniq) {
    if (combined.length > 50000) break;
    combined += (combined ? "\n\n---\n\n" : "") + t;
  }
  return combined;
}

async function callAOAI({ endpoint, key, deployment, apiVersion, book, count, combinedText }) {
  const url =
    `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${apiVersion || "2024-02-15-preview"}`;

  const system = [
    "You generate rigorous roofing exam questions from provided source excerpts.",
    "Return STRICT JSON: {\"items\":[...]}.",
    "Each item must be an object: {\"id\":\"q#\",\"type\":\"mcq\",\"question\":\"...\",\"options\":[{\"id\":\"A\",\"text\":\"...\"},...],\"answer\":\"A\",\"cite\":\"<short source hint>\"}.",
    "Exactly 4 options (A–D). Use factual content only; do not invent standards.",
    "Avoid identical wording; keep stems concise. Cite the doc name or section if discernible."
  ].join(" ");

  const user = [
    book ? `Document: ${book}` : "All documents",
    `Make ${count} multiple-choice questions (A–D).`,
    "Source excerpts below, separated by ---",
    combinedText || "(no text found)"
  ].join("\n\n");

  const payload = {
    temperature: 0.2,
    max_tokens: 3000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  };

  const { status, body } = await postJson(
    url,
    { "api-key": key },
    payload
  );

  if (status < 200 || status >= 300) {
    throw new Error(`AOAI HTTP ${status}: ${JSON.stringify(body).slice(0,300)}`);
  }

  const content = body?.choices?.[0]?.message?.content || "{}";
  let json;
  try { json = JSON.parse(content); }
  catch { json = { items: [] }; }
  return json;
}

function stubItems(count, book){
  const items = [];
  for (let i = 1; i <= count; i++) {
    const stem = book ? `(${book}) Practice Q${i}: Which option is most correct?`
                      : `Practice Q${i}: Which option is most correct?`;
    const options = ["A","B","C","D"].map((id)=>({id, text:`Option ${id} for Q${i}`}));
    const answer = ["A","B","C","D"][i % 4];
    items.push({ id:`q${i}`, type:"mcq", question: stem, options, answer, cite: book || "General" });
  }
  return items;
}

module.exports = async function (context, req) {
  try {
    const body = req?.body || {};
    const book = (body.book || "").trim();
    const filterField = (body.filterField || "").trim();
    const count = Math.max(1, Math.min(100, Number(body.count) || 50));

    const searchEndpoint = process.env.SEARCH_ENDPOINT;
    const searchKey      = process.env.SEARCH_API_KEY;
    const searchIndex    = process.env.SEARCH_INDEX || "azureblob-index";

    const aiEndpoint     = process.env.OPENAI_ENDPOINT;
    const aiKey          = process.env.OPENAI_API_KEY;
    const aiDeployment   = process.env.OPENAI_DEPLOYMENT;
    const aiVersion      = process.env.OPENAI_API_VERSION || "2024-02-15-preview";

    let combined = "";
    if (searchEndpoint && searchKey && searchIndex) {
      combined = await fetchPassages({
        endpoint: searchEndpoint,
        key: searchKey,
        index: searchIndex,
        filterField: filterField,
        book: book
      });
    }

    // If AOAI creds exist, call AOAI; else fallback to stub
    if (aiEndpoint && aiKey && aiDeployment) {
      const result = await callAOAI({
        endpoint: aiEndpoint,
        key: aiKey,
        deployment: aiDeployment,
        apiVersion: aiVersion,
        book,
        count,
        combinedText: combined
      });

      const items = Array.isArray(result.items) ? result.items : [];
      context.res = {
        headers: { "Content-Type": "application/json" },
        body: { items, modelDeployment: aiDeployment }
      };
    } else {
      // graceful fallback so the UI never hangs
      context.res = {
        headers: { "Content-Type": "application/json" },
        body: { items: stubItems(count, book), modelDeployment: "stub-fallback" }
      };
    }
  } catch (e) {
    context.log.error("exam error", e);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: String(e && e.message || e) }
    };
  }
};
