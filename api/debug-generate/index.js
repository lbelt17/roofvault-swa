const fetch = global.fetch || require("node-fetch");

module.exports = async function (context, req) {
  const out = { ok: true, checks: [] };
  function add(name, ok, detail){ out.checks.push({ name, ok, detail }); if (!ok) out.ok=false; }

  try {
    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_INDEX    = process.env.SEARCH_INDEX;
    const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;

    const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT;
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    const DEFAULT_MODEL   = process.env.DEFAULT_MODEL;
    const DEPLOY_41       = process.env.OPENAI_GPT41;
    const DEPLOY_4O_MINI  = process.env.OPENAI_GPT4O_MINI;

    // 1) Env presence
    add("env.SEARCH_ENDPOINT", !!SEARCH_ENDPOINT, SEARCH_ENDPOINT || "MISSING");
    add("env.SEARCH_INDEX", !!SEARCH_INDEX, SEARCH_INDEX || "MISSING");
    add("env.SEARCH_API_KEY", !!SEARCH_API_KEY, SEARCH_API_KEY ? "(present)" : "MISSING");
    add("env.OPENAI_ENDPOINT", !!OPENAI_ENDPOINT, OPENAI_ENDPOINT || "MISSING");
    add("env.OPENAI_API_KEY", !!OPENAI_API_KEY, OPENAI_API_KEY ? "(present)" : "MISSING");
    add("env.DEFAULT_MODEL", !!DEFAULT_MODEL, DEFAULT_MODEL || "MISSING");
    add("env.OPENAI_GPT41", !!DEPLOY_41, DEPLOY_41 || "MISSING");
    add("env.OPENAI_GPT4O_MINI", !!DEPLOY_4O_MINI, DEPLOY_4O_MINI || "MISSING");

    // 2) Decide deployment name the same way generate-questions does
    const deploymentName = (DEFAULT_MODEL === "gpt-4.1") ? (DEPLOY_41 || DEPLOY_4O_MINI) : (DEPLOY_4O_MINI || DEPLOY_41);
    add("resolved.deploymentName", !!deploymentName, deploymentName || "NO DEPLOYMENT NAME");

    // 3) Tiny Search probe (top=1, minimal)
    if (SEARCH_ENDPOINT && SEARCH_INDEX && SEARCH_API_KEY) {
      try {
        const sUrl = `${SEARCH_ENDPOINT}/indexes/${SEARCH_INDEX}/docs/search?api-version=2024-07-01`;
        const sRes = await fetch(sUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
          body: JSON.stringify({ search: "roof", top: 1 })
        });
        const ok = sRes.ok;
        const txt = await sRes.text();
        add("probe.search", ok, ok ? "OK (top=1 returned)" : `HTTP ${sRes.status}: ${txt}`);
      } catch (e) {
        add("probe.search", false, String(e && e.message || e));
      }
    }

    // 4) Tiny AOAI probe (no big tokens; just a hello JSON)
    if (OPENAI_ENDPOINT && OPENAI_API_KEY && deploymentName) {
      try {
        const oUrl = `${OPENAI_ENDPOINT}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-10-01-preview`;
        const body = {
          messages: [
            { role: "system", content: "Return ONLY this JSON: {\"ok\":true}" },
            { role: "user", content: "Say nothing else." }
          ],
          temperature: 0,
          max_tokens: 20,
          response_format: { type: "json_object" }
        };
        const oRes = await fetch(oUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": OPENAI_API_KEY },
          body: JSON.stringify(body)
        });
        const txt = await oRes.text();
        let detail = `HTTP ${oRes.status}`;
        try { const j = JSON.parse(txt); detail += `; parsed: ${JSON.stringify(j)}`; } catch { detail += `; body: ${txt}`; }
        add("probe.aoai", oRes.ok, detail);
      } catch (e) {
        add("probe.aoai", false, String(e && e.message || e));
      }
    }

    context.res = { status: 200, headers: {"Content-Type":"application/json"}, body: JSON.stringify(out, null, 2) };
  } catch (err) {
    context.res = { status: 500, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ ok:false, error: err.message }) };
  }
};
