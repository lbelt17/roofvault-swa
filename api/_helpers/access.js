var TableClient = require("@azure/data-tables").TableClient;

var TABLE_NAME = "UserAccess";
var ROW_KEY = "access";

function getConnection() {
  var conn = process.env.TABLES_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;
  return conn && String(conn).trim() ? conn : null;
}

function parsePrincipal(req) {
  var header = req.headers && req.headers["x-ms-client-principal"];
  if (!header || typeof header !== "string" || !header.trim()) return null;
  try {
    var decoded = JSON.parse(Buffer.from(header, "base64").toString("utf8"));
    var userId = decoded && decoded.userId ? String(decoded.userId).trim() : null;
    var userDetails = decoded && decoded.userDetails ? String(decoded.userDetails).trim() : null;
    return userId ? { userId: userId, userDetails: userDetails || null } : null;
  } catch (e) {
    return null;
  }
}

/**
 * Read user access record from UserAccess table.
 *
 * Returns { accessState, updatedAt, updatedBy, notes } if row exists.
 * Returns null if no record found (caller should treat as "allowed").
 * Throws on storage errors (caller decides how to handle).
 *
 * accessState values: "allowed" | "suspended" | "blocked"
 */
async function getUserAccess(userId) {
  var conn = getConnection();
  if (!conn) return null;

  var client = TableClient.fromConnectionString(conn, TABLE_NAME);

  var entity;
  try {
    entity = await client.getEntity(userId, ROW_KEY);
  } catch (err) {
    if (err.statusCode === 404 || err.code === "ResourceNotFound") return null;
    throw err;
  }

  return {
    userId: entity.partitionKey,
    userEmail: entity.userEmail ? String(entity.userEmail) : null,
    accessState: entity.accessState ? String(entity.accessState) : "allowed",
    updatedAt: entity.updatedAt ? String(entity.updatedAt) : null,
    updatedBy: entity.updatedBy ? String(entity.updatedBy) : null,
    notes: entity.notes ? String(entity.notes) : null,
  };
}

/**
 * Quick check: is this user allowed to use the app?
 *
 * Safe default: if no record exists, user is allowed.
 * Only returns false if a record exists with accessState = "suspended" or "blocked".
 * On storage errors, defaults to allowed (fail-open for safety during rollout).
 */
async function isUserAllowed(context, req) {
  var principal = parsePrincipal(req);
  if (!principal) return true;

  try {
    var record = await getUserAccess(principal.userId);
    if (!record) return true;
    return record.accessState === "allowed";
  } catch (err) {
    try { context.log.error("access: lookup failed, defaulting to allowed", err); } catch (e) {}
    return true;
  }
}

var VALID_STATES = ["allowed", "suspended", "blocked"];

/**
 * Upsert a user access record into UserAccess table.
 * Throws on storage errors.
 */
async function upsertUserAccess(record) {
  var conn = getConnection();
  if (!conn) throw new Error("No storage connection string");

  var entity = {
    partitionKey: record.userId,
    rowKey: ROW_KEY,
    accessState: record.accessState,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
  };
  if (record.userEmail) entity.userEmail = record.userEmail;
  if (record.notes != null) entity.notes = record.notes;

  var client = TableClient.fromConnectionString(conn, TABLE_NAME);
  await client.createTable().catch(function () {});
  await client.upsertEntity(entity, "Merge");
}

module.exports = {
  TABLE_NAME: TABLE_NAME,
  ROW_KEY: ROW_KEY,
  VALID_STATES: VALID_STATES,
  getUserAccess: getUserAccess,
  upsertUserAccess: upsertUserAccess,
  isUserAllowed: isUserAllowed,
  parsePrincipal: parsePrincipal,
};
