var JSON_HEADERS = { "Content-Type": "application/json" };

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
    context.log.error("useraccess: failed to load owners helper", err);
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Internal configuration error" } };
    return;
  }

  if (!OWNER_EMAILS.includes(principal.email)) {
    context.res = { status: 403, headers: JSON_HEADERS, body: { ok: false, error: "Forbidden" } };
    return;
  }

  var access;
  try {
    access = require("../_helpers/access");
  } catch (err) {
    context.log.error("useraccess: failed to load access helper", err);
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Internal configuration error" } };
    return;
  }

  var method = (req.method || "GET").toUpperCase();

  if (method === "GET") {
    var targetUserId = (req.query && req.query.userId) ? String(req.query.userId).trim() : null;
    if (!targetUserId) {
      context.res = { status: 400, headers: JSON_HEADERS, body: { ok: false, error: "Missing required query param: userId" } };
      return;
    }

    try {
      var record = await access.getUserAccess(targetUserId);
      if (!record) {
        context.res = {
          status: 200,
          headers: JSON_HEADERS,
          body: {
            ok: true,
            userId: targetUserId,
            userEmail: null,
            accessState: "allowed",
            updatedAt: null,
            updatedBy: null,
            notes: null,
            isDefault: true,
          },
        };
        return;
      }
      context.res = {
        status: 200,
        headers: JSON_HEADERS,
        body: { ok: true, isDefault: false, userId: record.userId, userEmail: record.userEmail, accessState: record.accessState, updatedAt: record.updatedAt, updatedBy: record.updatedBy, notes: record.notes },
      };
    } catch (err) {
      context.log.error("useraccess: GET failed", err);
      context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Could not read access record" } };
    }
    return;
  }

  if (method === "POST") {
    var body = safeParseBody(req);
    if (!body) {
      context.res = { status: 400, headers: JSON_HEADERS, body: { ok: false, error: "Invalid or missing JSON body" } };
      return;
    }

    var userId = body.userId ? String(body.userId).trim() : null;
    if (!userId) {
      context.res = { status: 400, headers: JSON_HEADERS, body: { ok: false, error: "Missing required field: userId" } };
      return;
    }

    var accessState = body.accessState ? String(body.accessState).trim().toLowerCase() : null;
    if (!accessState || access.VALID_STATES.indexOf(accessState) === -1) {
      context.res = { status: 400, headers: JSON_HEADERS, body: { ok: false, error: "Invalid accessState. Must be: allowed, suspended, or blocked" } };
      return;
    }

    var userEmail = body.userEmail ? String(body.userEmail).trim() : null;
    var notes = body.notes != null ? String(body.notes).trim() : null;
    var updatedAt = new Date().toISOString();

    try {
      await access.upsertUserAccess({
        userId: userId,
        userEmail: userEmail,
        accessState: accessState,
        updatedAt: updatedAt,
        updatedBy: principal.email,
        notes: notes,
      });

      context.res = {
        status: 200,
        headers: JSON_HEADERS,
        body: { ok: true, userId: userId, accessState: accessState, updatedAt: updatedAt, updatedBy: principal.email },
      };
    } catch (err) {
      context.log.error("useraccess: POST failed", err);
      context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Could not update access record" } };
    }
    return;
  }

  context.res = { status: 405, headers: JSON_HEADERS, body: { ok: false, error: "Method not allowed" } };
};
