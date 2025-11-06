/**
 * /api/exam — schema-agnostic: pull passages from any string fields in the docs.
 * Works with azureblob-index even if field names vary.
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

function escapeODataLiteral(s){ return String(s || "").replace(/'/g, "''"); }

async function fetchPassages({ endpoint, key, index, filterField, book }) {
  const apiVersion = "2023-11-01";
  const url = `${endpoint}/indexes/${encodeURIComponent(index)}/docs/search?api-version=${apiVersion}`;

  const filter = (book && filterField) ? `${filterField} eq '${escapeODataLiteral(book)}'` : undefined;

  // No $select — return all retrievable fields; we’ll pick strings.
  const { status, body } = await postJson(
    url,
    { "api-key": key },
    {
      search: "*",
      searchMode: "any",
      filter,
      top: 200
    }
  );

  if (status < 200 || status >= 300) {
    throw new Error(`Search HTTP ${status}: ${JSON.stringify(body).slice(0,300)}`);
  }

  const docs = Array.isArray(body.value) ? body.value : [];
  const texts = [];

  for (const d of docs) {
    if (!d || typeof d !== "object") continue;
    for (const [k, v] of Object.entries(d)) {
      // Skip obvious non-content / metadata-ish fields
      if (/^(?:@search\.|metadata_|id$|url$|path$|name$|contenttype$|_ts$)/i.test(k)) continue;

      if (typeof v === "string") {
        // prefer meaningful chunks
        if (v.trim().length >= 80) texts.push(v.trim());
      } else if (Array.isArray(v)) {
        // sometimes content is an array of strings
        const joined = v.filter(x => typeof x === "string").join("\n");
        if (joined.trim().length >= 80) texts.push(joined.trim());
      }
    }
  }

  // de-dup & size cap ~50k chars
  const uniq = Array.from(new Set(texts)).slice(0, 200);
  let combined = "";
  for (const t of uniq) {
    if (combined.length > 50000) break;
    combined += (combined ? "\n\n---\n\n" : "") + t;
  }
  return combined;
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

function callAOAI({ endpoint, key, deployment, apiVersion, book, count, combinedText }) {
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${apiVersion || "2024-02-15-preview"}`;
  const system = [
    "You generate rigorous roofing exam questions from provided source excerpts.",
    "Return STRICT JSON: {\"items\":[...]}.",
    "Each item: {\"id\":\"q#\",\"type\":\"mcq\",\"question\":\"...\",\"options\":[{\"id\":\"A\",\"text\":\"...\"},...],\"answer\":\"A\",\"cite\":\"<short hint>\"}.",
    "4 options A–D. Use only facts from the excerpts."
  ].join(" ");
  const user = [
    book ? `Document: ${book}` : "All documents",
    "Make 50 multiple-choice questions (A–D).",
    "Source excerpts below, separated by ---",
    combinedText || "(no text found)"
  ].join("\n\n");

  const payload = {
    temperature: 0.2,
    max_tokens: 3000,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: system }, { role: "user", content: user }]
  };

  return postJson(url, { "api-key": key }, payload);
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

    // Gather passages (robust to unknown field names)
    let combined = "";
    if (searchEndpoint && searchKey && searchIndex) {
      combined = await fetchPassages({ endpoint: searchEndpoint, key: searchKey, index: searchIndex, filterField, book });
    }

    // If AOAI creds exist, call AOAI; else use stub
    if (aiEndpoint && aiKey && aiDeployment) {
      const { status, body: aiBody } = await callAOAI({
        endpoint: aiEndpoint, key: aiKey, deployment: aiDeployment, apiVersion: aiVersion,
        book, count, combinedText: combined
      });

      if (status < 200 || status >= 300) {
        throw new Error(`AOAI HTTP ${status}: ${JSON.stringify(aiBody).slice(0,300)}`);
      }

      const content = aiBody?.choices?.[0]?.message?.content || "{}";
      let parsed; try { parsed = JSON.parse(content) } catch { parsed = { items: [] } }
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      context.res = { headers: { "Content-Type": "application/json" }, body: { items, modelDeployment: aiDeployment } };
    } else {
      context.res = { headers: { "Content-Type": "application/json" }, body: { items: stubItems(count, book), modelDeployment: "stub-fallback" } };
    }
  } catch (e) {
    context.log.error("exam error", e);
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { error: String(e && e.message || e) } };
  }
};
