// api/_helpers/usage.js — fire-and-forget per-user usage counter
// Table: Usage | PK: userId | RK: YYYYMM

const { TableClient } = require("@azure/data-tables");

const TABLE_NAME = "Usage";

function parsePrincipal(req) {
  const header = req.headers && req.headers["x-ms-client-principal"];
  if (!header || typeof header !== "string" || !header.trim()) return null;
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

function currentYYYYMM() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

async function logUsage(context, req, fieldName) {
  try {
    const principal = parsePrincipal(req);
    if (!principal) return;

    const conn = process.env.TABLES_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn || !String(conn).trim()) return;

    const entity = {
      partitionKey: principal.userId,
      rowKey: currentYYYYMM(),
      [fieldName]: 1,
      lastActive: new Date().toISOString(),
    };

    if (principal.userDetails) {
      entity.userEmail = principal.userDetails;
    }

    const client = TableClient.fromConnectionString(conn, TABLE_NAME);
    await client.createTable().catch(function () {});

    let existing;
    try {
      existing = await client.getEntity(principal.userId, entity.rowKey);
    } catch {
      existing = null;
    }

    if (existing && typeof existing[fieldName] === "number") {
      entity[fieldName] = existing[fieldName] + 1;
    }

    await client.upsertEntity(entity, "Merge");
  } catch (err) {
    try { context.log.error("usage: log failed", err); } catch {}
  }
}

module.exports = { logUsage };
