function cors(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") { context.res = cors({ ok:true }); return; }
  context.res = cors({
    ok: true,
    ts: new Date().toISOString(),
    node: process.version,
    envSeen: {
      AOAI_ENDPOINT: !!process.env.AOAI_ENDPOINT,
      AOAI_KEY: !!process.env.AOAI_KEY,
      AOAI_DEPLOYMENT: !!process.env.AOAI_DEPLOYMENT,
      SEARCH_ENDPOINT: !!process.env.SEARCH_ENDPOINT,
      SEARCH_KEY: !!process.env.SEARCH_KEY,
      SEARCH_INDEX: !!process.env.SEARCH_INDEX
    }
  });
};
