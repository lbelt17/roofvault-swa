module.exports = async function (context, req) {
  try {
    const { SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX, AOAI_ENDPOINT, AOAI_KEY, AOAI_DEPLOYMENT } = process.env;
    const seen = {
      SEARCH_ENDPOINT: !!(SEARCH_ENDPOINT||"").trim(),
      SEARCH_KEY: !!(SEARCH_KEY||"").trim(),
      SEARCH_INDEX: !!(SEARCH_INDEX||"").trim(),
      AOAI_ENDPOINT: !!(AOAI_ENDPOINT||"").trim(),
      AOAI_KEY: !!(AOAI_KEY||"").trim(),
      AOAI_DEPLOYMENT: !!(AOAI_DEPLOYMENT||"").trim(),
    };
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ ok:true, route:"rvdiag", node: process.version, seen, t: new Date().toISOString() })
    };
  } catch (e) {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok:false, route:"rvdiag", error: String(e && (e.message||e)) })
    };
  }
};
