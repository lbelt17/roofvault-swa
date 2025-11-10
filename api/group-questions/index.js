/**
 * Stable, diagnostic group-questions function
 * - POST only
 * - ?mode=search-only returns combined text so we can debug Search separately
 * - Uses Azure Search 2023-11-01
 * - Uses Azure OpenAI chat/completions 2024-06-01 with response_format=json_object
 * - Returns explicit error JSON so you never get a blank 500 again
 */

module.exports = async function (context, req) {
  // Helpers
  function j(status, body) {
    context.res = { status, headers: { "Content-Type": "application/json" }, body };
  }
  function bad(status, msg, extra) {
    j(status, Object.assign({ ok:false, error: msg }, extra||{}));
  }

  try {
    if ((req.method || "").toUpperCase() !== "POST") {
      return bad(405, "POST only");
    }

    // --- Env ---
    const SEARCH_ENDPOINT  = process.env.SEARCH_ENDPOINT || "";
    const SEARCH_API_KEY   = process.env.SEARCH_API_KEY  || "";
    const SEARCH_INDEX     = process.env.SEARCH_INDEX    || "azureblob-index";

    const AOAI_ENDPOINT    = (process.env.AZURE_OPENAI_ENDPOINT || process.env.AOAI_ENDPOINT || "").replace(/\/+$/,"");
    const AOAI_API_KEY     = (process.env.AZURE_OPENAI_API_KEY  || process.env.AOAI_API_KEY  || "");
    const AOAI_DEPLOYMENT  = (process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AOAI_DEPLOYMENT_TURBO || process.env.AOAI_DEPLOYMENT || "roofvault-turbo");
    const AOAI_API_VERSION = "2024-06-01";

    const hasFetch = (global && typeof global.fetch === "function");
    if (!hasFetch) return bad(500, "global.fetch not available in Functions runtime");

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY || !SEARCH_INDEX) {
      return bad(500, "Search env not configured", { need: ["SEARCH_ENDPOINT","SEARCH_API_KEY","SEARCH_INDEX"] });
    }
    if (!AOAI_ENDPOINT || !AOAI_API_KEY || !AOAI_DEPLOYMENT) {
      return bad(500, "OpenAI env not configured", { need: ["AZURE_OPENAI_ENDPOINT/AOAI_ENDPOINT","AZURE_OPENAI_API_KEY/AOAI_API_KEY","AZURE_OPENAI_DEPLOYMENT/AOAI_DEPLOYMENT(_TURBO)"] });
    }

    // --- Body ---
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const objectives = Array.isArray(body.objectives) ? body.objectives : [];
    const books      = Array.isArray(body.books) ? body.books : [];
    const countPerBook = Number(body.countPerBook || 2);
    const topK         = Number(body.topK || 5);

    if (!objectives.length) return bad(400, "Missing 'objectives'[]");
    if (!books.length)      return bad(400, "Missing 'books'[]");

    // --- Search helper (stable) ---
    async function fetchSourceForBook(bookName) {
      const endpointHost = (SEARCH_ENDPOINT || "").replace(/^https?:\/\//, "").replace(/\/+$/,"");
      if (!endpointHost) throw new Error("SEARCH_ENDPOINT missing host");

      const filter = `metadata_storage_name eq '${String(bookName).replace(/'/g,"''")}'`;
      const url = `https://${endpointHost}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=2023-11-01`;

      const payload = {
        count: false,
        search: "*",
        queryType: "simple",
        searchMode: "any",
        filter,
        select: "id,metadata_storage_name,metadata_storage_path,content",
        top: topK
      };

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type":"application/json", "api-key": SEARCH_API_KEY },
        body: JSON.stringify(payload)
      });

      const t = await r.text();
      if (!r.ok) throw new Error(`SEARCH_HTTP_${r.status}: ${t.slice(0,1000)}`);

      let j;
      try { j = JSON.parse(t) } catch { throw new Error("Search non-JSON"); }
      const docs = Array.isArray(j.value) ? j.value : [];
      const combined = docs.map(d => String(d.content || "")).join("\n\n---\n\n").slice(0, 120000);
      return { docs, combined };
    }

    // --- Quick diagnostic path ---
    if ((req.query && req.query.mode) === "search-only") {
      const testBook = String((Array.isArray(books) && books[0]) || "");
      if (!testBook) return bad(400, "search-only requires books:[<one book>]");
      try {
        const found = await fetchSourceForBook(testBook);
        return j(200, { ok:true, mode:"search-only", book:testBook, bytes: (found.combined||"").length, docs: (found.docs||[]).length });
      } catch (e) {
        return bad(500, "search-only failed", { book:testBook, details: String(e && e.message || e) });
      }
    }

    // --- Normalize + prompt ---
    const objLines = objectives.map(o => `- ${o.id}: ${o.title}`).join("\n");
    async function genForBook(bookName, combinedText) {
      const sys = [
        "You are a meticulous exam-item writer and classifier for roofing publications.",
        "Return JSON only (no prose)."
      ].join("\n");

      const user = [
        `SOURCE: ${bookName}`,
        "",
        "OBJECTIVES (choose exactly one objective per question):",
        objLines,
        "",
        "TASK:",
        `1) From the SOURCE EXCERPT below, create ${countPerBook} MCQs (A–D) with one correct answer.`,
        "2) For EACH MCQ, include a 1–2 sentence 'explanation'.",
        "3) Immediately GROUP the new MCQs under the most relevant objective (by id and title).",
        `4) Use '${bookName}' as the cite for each MCQ.`,
        "",
        "RETURN a JSON object with shape: { groups:[ { objectiveId, objectiveTitle, items:[ { id,type:'mcq',question,options:[{id,text}*4],answer,explanation,cite } ] } ] }",
        "",
        "SOURCE EXCERPT:",
        combinedText.slice(0, 80000)
      ].join("\n");

      const url = `${AOAI_ENDPOINT}/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=${AOAI_API_VERSION}`;
      const payload = {
        messages: [
          { role:"system", content: sys },
          { role:"user",   content: user }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      };

      const headers = { "Content-Type":"application/json", "api-key": AOAI_API_KEY };
      const r = await fetch(url, { method:"POST", headers, body: JSON.stringify(payload) });
      const t = await r.text();
      if (!r.ok) throw new Error(`OpenAI HTTP ${r.status}: ${t.slice(0,1000)}`);

      let j;
      try { j = JSON.parse(t) } catch { throw new Error("OpenAI non-JSON"); }
      const content = j?.choices?.[0]?.message?.content || "";
      if (!content) throw new Error("OpenAI: missing content");

      let parsed;
      try { parsed = JSON.parse(content) } catch { throw new Error("OpenAI content not JSON"); }
      const groups = Array.isArray(parsed.groups) ? parsed.groups : [];

      // normalize items
      let counter = 0; const nextId = () => `q${++counter}`;
      function toOptObjects(arr) {
        if (!Array.isArray(arr)) return [];
        if (arr.length && typeof arr[0] === "object") return arr;
        const labels = ["A","B","C","D","E","F"];
        return arr.map((txt,i)=>({ id: labels[i]||String(i+1), text: String(txt??"") }));
      }

      for (const g of groups) {
        if (!Array.isArray(g.items)) { g.items = []; continue; }
        g.items = g.items.map(it => {
          const question = it.question || it.stem || "";
          const options = toOptObjects(it.options || it.choices || []);
          let answer = it.answer_id || it.answer || "";
          // map numeric or text to option id
          if (/^\d+$/.test(String(answer)) && options.length) {
            const idx = Math.max(0, Math.min(options.length-1, Number(answer)-1));
            answer = options[idx]?.id ?? answer;
          }
          if (answer && options.length && !options.some(o=>o.id===answer)) {
            const hit = options.find(o => String(o.text).trim().toLowerCase() === String(answer).trim().toLowerCase());
            if (hit) answer = hit.id;
          }
          return {
            id: it.id || nextId(),
            type: "mcq",
            question,
            options,
            answer,
            explanation: it.explanation || it.rationale || "",
            cite: it.cite || bookName
          };
        });
      }
      return groups;
    }

    // --- Process first book only (keep it simple & reliable; you can batch offline) ---
    const book = String(books[0] || "");
    const { combined } = await fetchSourceForBook(book);
    if (!combined || !combined.trim()) return bad(404, "No content returned from Search", { book });

    const groups = await genForBook(book, combined);
    return j(200, { ok:true, groups, _diag:{ book, bytes: combined.length, objectives: objectives.length } });

  } catch (e) {
    return bad(500, "Unhandled", { details: String(e && e.message || e) });
  }
};
