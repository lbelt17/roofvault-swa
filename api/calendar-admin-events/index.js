// GET /api/calendar-admin-events — owner-only list of calendar events
// Query: ?status=pending|approved|declined|all  (defaults to pending)

const { getAllEvents, getEventsByStatus, sortByDateAsc } = require("../_helpers/calendar");

var JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function parsePrincipal(req) {
  var header = req.headers && req.headers["x-ms-client-principal"];
  if (!header || typeof header !== "string" || !header.trim()) return null;
  try {
    var decoded = JSON.parse(Buffer.from(header, "base64").toString("utf8"));
    var userId = decoded && decoded.userId ? String(decoded.userId).trim() : null;
    var email = decoded && decoded.userDetails ? String(decoded.userDetails).trim().toLowerCase() : null;
    return userId ? { userId: userId, email: email } : null;
  } catch (e) {
    return null;
  }
}

module.exports = async function (context, req) {
  var principal = parsePrincipal(req);
  if (!principal || !principal.email) {
    context.res = { status: 401, headers: JSON_HEADERS, body: { ok: false, error: "Authentication required" } };
    return;
  }

  var OWNER_EMAILS;
  try {
    OWNER_EMAILS = require("../_helpers/owners").OWNER_EMAILS;
  } catch (err) {
    try { context.log.error("calendar-admin-events: owners helper failed", err); } catch (e) {}
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Internal configuration error" } };
    return;
  }

  if (!OWNER_EMAILS.includes(principal.email)) {
    context.res = { status: 403, headers: JSON_HEADERS, body: { ok: false, error: "Forbidden" } };
    return;
  }

  try {
    var status = (req.query && req.query.status ? String(req.query.status) : "pending").toLowerCase().trim();

    var events;
    if (status === "all") {
      events = await getAllEvents();
    } else {
      events = await getEventsByStatus(status);
    }

    var sorted = sortByDateAsc(events);
    context.res = {
      status: 200,
      headers: JSON_HEADERS,
      body: { ok: true, status: status, events: sorted },
    };
  } catch (err) {
    try { context.log.error("calendar-admin-events error:", err); } catch (e) {}
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Could not load events" } };
  }
};
