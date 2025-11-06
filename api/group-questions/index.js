function send(context, code, body) {
  context.res = {
    status: code,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body
  };
}

module.exports = async function (context, req) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
    return;
  }

  const body = (req.body && typeof req.body === "object") ? req.body : {};
  const objectives = Array.isArray(body.objectives) ? body.objectives : [];
  const books = Array.isArray(body.books) ? body.books : [];
  const countPerBook = Math.max(1, Math.min(50, Number(body.countPerBook || 10)));

  // Just echo a shape we’ll fill later
  return send(context, 200, {
    ok: true,
    received: { objectivesCount: objectives.length, books, countPerBook },
    groups: [],   // <- will be [{ objectiveId, objectiveTitle, items:[{book,id,question,answer,explanation,cite}], count }]
    _diag: { note: "scaffold only — no AI yet" }
  });
};
