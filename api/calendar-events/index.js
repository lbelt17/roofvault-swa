// GET /api/calendar-events — returns approved calendar events only, sorted ascending by date

const { getApprovedEvents, sortByDateAsc } = require("../_helpers/calendar");

module.exports = async function (context, req) {
  try {
    const events = await getApprovedEvents();
    const sorted = sortByDateAsc(events);
    context.res = {
      status: 200,
      headers: { "Cache-Control": "no-store" },
      body: sorted,
    };
  } catch (err) {
    try { context.log.error("calendar-events error:", err); } catch {}
    context.res = { status: 500, body: [] };
  }
};
