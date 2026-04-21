// POST /api/calendar-admin-update — owner-only status update for a calendar event
// Body: { id: "<rowKey>", status: "approved" | "declined", partitionKey?: "<pk>" }

const { updateEventStatus, PARTITION_KEY } = require("../_helpers/calendar");

var JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };
var VALID_STATUSES = ["approved", "declined", "pending"];

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

function safeParseBody(req) {
  try {
    if (req.body === undefined || req.body === null) return null;
    if (typeof req.body === "object" && !Array.isArray(req.body)) return req.body;
    if (typeof req.body === "string") return JSON.parse(req.body);
    return null;
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
    try { context.log.error("calendar-admin-update: owners helper failed", err); } catch (e) {}
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Internal configuration error" } };
    return;
  }

  if (!OWNER_EMAILS.includes(principal.email)) {
    context.res = { status: 403, headers: JSON_HEADERS, body: { ok: false, error: "Forbidden" } };
    return;
  }

  var body = safeParseBody(req);
  if (!body) {
    context.res = { status: 400, headers: JSON_HEADERS, body: { ok: false, error: "Invalid or missing JSON body" } };
    return;
  }

  var id = body.id ? String(body.id).trim() : "";
  var status = body.status ? String(body.status).trim().toLowerCase() : "";
  var partitionKey = body.partitionKey ? String(body.partitionKey).trim() : PARTITION_KEY;

  if (!id) {
    context.res = { status: 400, headers: JSON_HEADERS, body: { ok: false, error: "Missing required field: id" } };
    return;
  }
  if (VALID_STATUSES.indexOf(status) === -1) {
    context.res = { status: 400, headers: JSON_HEADERS, body: { ok: false, error: "Invalid status. Must be: approved, declined, or pending" } };
    return;
  }

  try {
    await updateEventStatus(partitionKey, id, status);
    context.res = {
      status: 200,
      headers: JSON_HEADERS,
      body: { ok: true, id: id, status: status, updatedBy: principal.email, updatedAt: new Date().toISOString() },
    };
  } catch (err) {
    try { context.log.error("calendar-admin-update error:", err); } catch (e) {}
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Could not update event" } };
  }
};
