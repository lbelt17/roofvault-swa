/**
 * /api/debug — sanity checks env, Azure Search, and Azure OpenAI.
 * Returns JSON with masked keys and the exact error bodies/status codes.
 * Uses global fetch (Node 18+).
 */
module.exports = async function (context, req) {
  const resp = {
    env: {
      AZURE_OPENAI_ENDPOINT: !!process.env.AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT || null,
      AZURE_OPENAI_API_KEY_present: !!process.env.AZURE_OPENAI_API_KEY,
      AOAI_API_KEY_present: !!process.env.AOAI_API_KEY,
      OPENAI_API_KEY_present: !!process.env.OPENAI_API_KEY,
      SEARCH_ENDPOINT: process.env.SEARCH_ENDPOINT || null,
      SEARCH_INDEX: process.env.SEARCH_INDEX || null,
      SEARCH_API_KEY_present: !!process.env.SEARCH_API_KEY
    },
    search: null,
    aoai: null
  };

  // --- Azure Search test ---
  try {
    const sUrl = `${process.env.SEARCH_ENDPOINT}/indexes/${encodeURIComponent(process.env.SEARCH_INDEX)}/docs/search?api-version=2023-07-01-Preview`;
    const sBody = { queryType: "simple", search: "*", top: 1 };
    const sRes = await fetch(sUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": process.env.SEARCH_API_KEY },
      body: JSON.stringify(sBody)
    });
    const sTxt = await sRes.text();
    let sJson = null; try { sJson = JSON.parse(sTxt); } catch {}
    resp.search = { ok: sRes.ok, status: sRes.status, body: sJson || sTxt.slice(0, 4000) };
  } catch (e) {
    resp.search = { ok: false, error: e.message };
  }

  // --- Azure OpenAI test ---
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_ENDPOINT || process.env.AOAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || process.env.OPENAI_GPT4O_MINI || process.env.AOAI_DEPLOYMENT || process.env.OPENAI_GPT41;
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;
    const payload = {
      messages: [{ role:"system", content:"reply with JSON: {\"ok\":true}" }],
      temperature: 0,
      max_tokens: 16
    };
    const aRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type":"application/json", "api-key": process.env.AZURE_OPENAI_API_KEY || process.env.AOAI_API_KEY || process.env.OPENAI_API_KEY },
      body: JSON.stringify(payload)
    });
    const aTxt = await aRes.text();
    let aJson = null; try { aJson = JSON.parse(aTxt); } catch {}
    resp.aoai = { ok: aRes.ok, status: aRes.status, body: aJson || aTxt.slice(0, 4000) };
  } catch (e) {
    resp.aoai = { ok: false, error: e.message };
  }

  context.res = { status: 200, headers:{ "Content-Type":"application/json" }, body: resp };
};
