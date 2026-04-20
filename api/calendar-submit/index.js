// POST /api/calendar-submit — stores a new calendar event with status "pending"

const { createEvent } = require("../_helpers/calendar");

function safeParseBody(req) {
  try {
    if (req.body === undefined || req.body === null) return null;
    if (typeof req.body === "object" && !Array.isArray(req.body)) return req.body;
    if (typeof req.body === "string") return JSON.parse(req.body);
    return null;
  } catch {
    return null;
  }
}

module.exports = async function (context, req) {
  try {
    const body = safeParseBody(req);
    const name = body && body.name ? String(body.name).trim() : "";
    const date = body && body.date ? String(body.date).trim() : "";
    const time = body && body.time ? String(body.time).trim() : "";
    const organization = body && body.organization ? String(body.organization).trim() : "";
    const description = body && body.description ? String(body.description).trim() : "";

    if (!name || !date) {
      context.res = {
        status: 400,
        body: { success: false, error: "name and date are required" },
      };
      return;
    }

    await createEvent({
      name,
      date,
      time,
      organization,
      description,
      status: "pending",
    });

    context.res = { status: 200, body: { success: true } };
  } catch (err) {
    try { context.log.error("calendar-submit error:", err); } catch {}
    context.res = {
      status: 500,
      body: { success: false, error: "Could not submit event" },
    };
  }
};
