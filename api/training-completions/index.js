// /api/training-completions — save and list PPE training completion records

const {
  COURSE_NAME,
  COURSE_VERSION,
  buildTrainingRecord,
  saveTrainingRecord,
  listTrainingRecords,
} = require("../_helpers/training-records");

var JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

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

function requestMeta(req) {
  var forwarded = req.headers && req.headers["x-forwarded-for"];
  var ip = forwarded ? String(forwarded).split(",")[0].trim() : null;
  if (!ip && req.headers && req.headers["x-client-ip"]) {
    ip = String(req.headers["x-client-ip"]).trim();
  }
  return {
    userAgent: req.headers && req.headers["user-agent"] ? String(req.headers["user-agent"]) : null,
    requesterIp: ip,
  };
}

function validatePayload(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  var employeeFullName = body.employeeFullName ? String(body.employeeFullName).trim() : "";
  var company = body.company ? String(body.company).trim() : "";
  var typedSignature = body.typedSignature ? String(body.typedSignature).trim() : "";
  var acknowledgedVideoAndLessons = body.acknowledgedVideoAndLessons === true;
  var acknowledgedTrainingTopics = body.acknowledgedTrainingTopics === true;

  if (!employeeFullName) {
    return { ok: false, error: "Employee full name is required." };
  }
  if (!company) {
    return { ok: false, error: "Company / employer is required." };
  }
  if (!typedSignature) {
    return { ok: false, error: "Typed signature is required." };
  }
  if (employeeFullName.toLowerCase() !== typedSignature.toLowerCase()) {
    return { ok: false, error: "Typed signature must match the employee full name." };
  }
  if (!acknowledgedVideoAndLessons) {
    return { ok: false, error: "Please confirm the PPE training video and lesson summaries were reviewed." };
  }
  if (!acknowledgedTrainingTopics) {
    return { ok: false, error: "Please acknowledge the PPE training topics." };
  }

  return {
    ok: true,
    payload: {
      employeeFullName: employeeFullName,
      company: company,
      role: body.role ? String(body.role).trim() : "",
      employeeEmail: body.employeeEmail ? String(body.employeeEmail).trim() : "",
      completionDateClient: body.completionDateClient ? String(body.completionDateClient).trim() : "",
      typedSignature: typedSignature,
    },
  };
}

async function handlePost(context, req) {
  var validation = validatePayload(safeParseBody(req));
  if (!validation.ok) {
    context.res = {
      status: 400,
      headers: JSON_HEADERS,
      body: { ok: false, error: validation.error },
    };
    return;
  }

  var record = buildTrainingRecord(validation.payload, requestMeta(req));
  var saved = await saveTrainingRecord(record);

  context.res = {
    status: 200,
    headers: JSON_HEADERS,
    body: { ok: true, record: saved.record },
  };
}

async function handleGet(context, req) {
  var principal = parsePrincipal(req);
  if (!principal || !principal.email) {
    context.res = {
      status: 401,
      headers: JSON_HEADERS,
      body: { ok: false, error: "Authentication required" },
    };
    return;
  }

  var OWNER_EMAILS;
  try {
    OWNER_EMAILS = require("../_helpers/owners").OWNER_EMAILS;
  } catch (err) {
    try { context.log.error("training-completions: owners helper failed", err); } catch (e) {}
    context.res = {
      status: 500,
      headers: JSON_HEADERS,
      body: { ok: false, error: "Internal configuration error" },
    };
    return;
  }

  if (!OWNER_EMAILS.includes(principal.email)) {
    context.res = {
      status: 403,
      headers: JSON_HEADERS,
      body: { ok: false, error: "Forbidden" },
    };
    return;
  }

  var records = await listTrainingRecords(100);
  context.res = {
    status: 200,
    headers: JSON_HEADERS,
    body: { ok: true, records: records },
  };
}

module.exports = async function (context, req) {
  try {
    var method = (req.method || "GET").toUpperCase();
    if (method === "POST") {
      await handlePost(context, req);
      return;
    }
    if (method === "GET") {
      await handleGet(context, req);
      return;
    }
    context.res = {
      status: 405,
      headers: JSON_HEADERS,
      body: { ok: false, error: "Method not allowed" },
    };
  } catch (err) {
    try { context.log.error("training-completions error:", err); } catch (e) {}
    context.res = {
      status: 500,
      headers: JSON_HEADERS,
      body: { ok: false, error: "Could not process training completion request" },
    };
  }
};
