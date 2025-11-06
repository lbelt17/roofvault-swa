module.exports = async function (context, req) {
  try {
    context.log("peek hit");
    const body = {
      ok: true,
      mode: "health",
      time: new Date().toISOString()
    };
    context.res = { headers: { "Content-Type": "application/json" }, body };
  } catch (e) {
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { ok:false, error: String(e && e.message || e) } };
  }
};
