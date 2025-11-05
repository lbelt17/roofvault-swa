module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { ok: true, when: new Date().toISOString(), method: req.method, url: req.originalUrl || req.url }
  };
};
