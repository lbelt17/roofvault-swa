module.exports = async function (context, req) {
  var header = req.headers["x-ms-client-principal"];
  if (!header) {
    context.res = { status: 200, body: { authenticated: false } };
    return;
  }
  try {
    var decoded = JSON.parse(Buffer.from(header, "base64").toString("utf8"));
    context.res = { status: 200, body: decoded };
  } catch (e) {
    context.res = { status: 200, body: { error: e.message } };
  }
};
