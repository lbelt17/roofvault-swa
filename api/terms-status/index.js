// GET /api/terms-status — returns terms acceptance status for current user
// Uses x-ms-client-principal, Table Storage TermsAcceptance, userId as identity key

const { TableClient } = require("@azure/data-tables");

const CURRENT_TERMS_VERSION = "2026-03-23-v2";
const TABLE_NAME = "TermsAcceptance";
const ROW_KEY = "terms";

const BASE_BODY = {
  accepted: false,
  acceptedAt: null,
  termsVersion: null,
  currentTermsVersion: CURRENT_TERMS_VERSION,
};

const UNAUTHENTICATED_BODY = {
  ...BASE_BODY,
  isAuthenticated: false,
};

const ERROR_BODY = {
  ...BASE_BODY,
  error: "Could not read terms status",
};

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
    return userId || null;
  } catch {
    return null;
  }
}

module.exports = async function (context, req) {
  try {
    const userId = parsePrincipal(req);
    if (!userId) {
      context.res = { status: 200, body: UNAUTHENTICATED_BODY };
      return;
    }

    const conn = process.env.TABLES_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn || !String(conn).trim()) {
      context.log.error("terms-status: TABLES_CONNECTION_STRING / AZURE_STORAGE_CONNECTION_STRING missing");
      context.res = { status: 500, body: ERROR_BODY };
      return;
    }

    let entity;
    try {
      const client = TableClient.fromConnectionString(conn, TABLE_NAME);
      entity = await client.getEntity(userId, ROW_KEY);
    } catch (err) {
      if (err.code === "ResourceNotFound" || err.statusCode === 404) {
        context.res = {
          status: 200,
          body: {
            ...BASE_BODY,
            accepted: false,
            acceptedAt: null,
            termsVersion: null,
            currentTermsVersion: CURRENT_TERMS_VERSION,
          },
        };
        return;
      }
      context.log.error("terms-status: storage error", err);
      context.res = { status: 500, body: ERROR_BODY };
      return;
    }

    const storedVersion = entity && (entity.termsVersion || entity.TermsVersion);
    const version = storedVersion ? String(storedVersion).trim() : null;
    const acceptedAtVal = entity && (entity.acceptedAt || entity.AcceptedAt);
    const acceptedAt = acceptedAtVal ? String(acceptedAtVal) : null;

    const accepted = version === CURRENT_TERMS_VERSION;

    context.res = {
      status: 200,
      body: {
        accepted,
        acceptedAt,
        termsVersion: version,
        currentTermsVersion: CURRENT_TERMS_VERSION,
      },
    };
  } catch (err) {
    context.log.error("terms-status error:", err);
    context.res = { status: 500, body: ERROR_BODY };
  }
};
