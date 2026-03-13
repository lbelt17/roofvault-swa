// POST /api/terms-accept — records terms acceptance for current user
// Uses x-ms-client-principal, Table Storage TermsAcceptance, userId as identity key

const { TableClient } = require("@azure/data-tables");

const CURRENT_TERMS_VERSION = "2026-03-13-v1";
const TABLE_NAME = "TermsAcceptance";
const ROW_KEY = "terms";

function parsePrincipal(req) {
  const header = req.headers && req.headers["x-ms-client-principal"];
  if (!header || typeof header !== "string" || !header.trim()) {
    return null;
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(header, "base64").toString("utf8")
    );
    const userId = (decoded && decoded.userId && String(decoded.userId).trim()) || null;
    const userDetails = (decoded && decoded.userDetails && String(decoded.userDetails).trim()) || null;
    return userId ? { userId, userDetails: userDetails || null } : null;
  } catch {
    return null;
  }
}

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
  const unauthRes = { status: 401, body: { ok: false, error: "Authentication required" } };
  const validationRes = { status: 400, body: { ok: false, error: "Invalid or outdated terms version" } };
  const serverErrRes = { status: 500, body: { ok: false, error: "Could not record terms acceptance" } };

  try {
    const principal = parsePrincipal(req);
    if (!principal) {
      context.res = unauthRes;
      return;
    }

    const body = safeParseBody(req);
    const termsVersion = body && body.termsVersion != null ? String(body.termsVersion).trim() : "";
    if (termsVersion !== CURRENT_TERMS_VERSION) {
      context.res = validationRes;
      return;
    }

    const conn = process.env.TABLES_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn || !String(conn).trim()) {
      context.log.error("terms-accept: TABLES_CONNECTION_STRING / AZURE_STORAGE_CONNECTION_STRING missing");
      context.res = serverErrRes;
      return;
    }

    const acceptedAt = new Date().toISOString();
    const entity = {
      partitionKey: principal.userId,
      rowKey: ROW_KEY,
      termsVersion: CURRENT_TERMS_VERSION,
      acceptedAt,
    };
    if (principal.userDetails) {
      entity.userEmail = principal.userDetails;
    }

    try {
      const client = TableClient.fromConnectionString(conn, TABLE_NAME);
      await client.upsertEntity(entity, "Merge");
    } catch (err) {
      context.log.error("terms-accept: storage error", err);
      context.res = serverErrRes;
      return;
    }

    context.res = {
      status: 200,
      body: {
        ok: true,
        termsVersion: CURRENT_TERMS_VERSION,
        acceptedAt,
      },
    };
  } catch (err) {
    context.log.error("terms-accept error:", err);
    context.res = serverErrRes;
  }
};
