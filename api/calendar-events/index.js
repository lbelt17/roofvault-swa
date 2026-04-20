// GET /api/calendar-events — returns approved calendar events only

const { getApprovedEvents } = require("../_helpers/calendar");

module.exports = async function (context, req) {
  try {
    const events = await getApprovedEvents();
    events.sort(function (a, b) {
      return String(a.date || "").localeCompare(String(b.date || ""));
    });
    context.res = {
      status: 200,
      headers: { "Cache-Control": "no-store" },
      body: events,
    };
  } catch (err) {
    try { context.log.error("calendar-events error:", err); } catch {}
    context.res = { status: 500, body: [] };
  }
};
