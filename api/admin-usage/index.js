module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { ok: true, test: "admin-usage route is alive" },
  };
};
