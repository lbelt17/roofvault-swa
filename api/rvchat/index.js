module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify({
      ok: true,
      probe: "minimal-handler-reset",
      method: req && req.method || null,
      node: process.version,
      time: new Date().toISOString()
    })
  };
};
