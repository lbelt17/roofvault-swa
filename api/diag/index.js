module.exports = async function (context, req) {
  const AOAI_ENDPOINT         = process.env.AOAI_ENDPOINT || "";
  const AOAI_DEPLOYMENT       = process.env.AOAI_DEPLOYMENT || "";
  const AOAI_DEPLOYMENT_TURBO = process.env.AOAI_DEPLOYMENT_TURBO || "";
  const SEARCH_ENDPOINT       = process.env.SEARCH_ENDPOINT || "";
  const SEARCH_INDEX          = process.env.SEARCH_INDEX || "";
  const hasAOAIKey            = !!process.env.AOAI_API_KEY;
  const hasSearchKey          = !!process.env.SEARCH_API_KEY;

  const heavyKeywords = ["summary","summarize","outline","100 questions","batch","group","divide","analyze"];
  const testPrompt = (req.query?.prompt || "Generate 100 questions and answers from the IIBEC Manual of Practice (3rd Edition).").toLowerCase();
  const turboWouldTrigger = AOAI_DEPLOYMENT_TURBO && heavyKeywords.some(k => testPrompt.includes(k));

  const aoaiHost   = AOAI_ENDPOINT.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const searchHost = SEARCH_ENDPOINT.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  const ok =
    AOAI_ENDPOINT && AOAI_DEPLOYMENT && AOAI_DEPLOYMENT_TURBO &&
    SEARCH_ENDPOINT && SEARCH_INDEX && hasAOAIKey && hasSearchKey;

  context.res = {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ok,
      openai: {
        endpointHost: aoaiHost,
        miniDeployment: AOAI_DEPLOYMENT,
        turboDeployment: AOAI_DEPLOYMENT_TURBO,
        apiKeyPresent: hasAOAIKey
      },
      search: {
        endpointHost: searchHost,
        indexName: SEARCH_INDEX,
        apiKeyPresent: hasSearchKey
      },
      turboSwitch: {
        testPrompt,
        wouldUseTurbo: !!turboWouldTrigger,
        chosenDeployment: turboWouldTrigger ? AOAI_DEPLOYMENT_TURBO : AOAI_DEPLOYMENT
      },
      tips: "If ok=false, verify SWA Environment Variables: AOAI_ENDPOINT, AOAI_API_KEY, AOAI_DEPLOYMENT, AOAI_DEPLOYMENT_TURBO, SEARCH_ENDPOINT, SEARCH_API_KEY, SEARCH_INDEX."
    }, null, 2)
  };
};
