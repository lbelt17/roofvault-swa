// api/_helpers/calendar.js — Azure Table Storage helpers for Calendar events
// Table: CalendarEvents | PK: "events" | RK: timestamp + random suffix

const { TableClient } = require("@azure/data-tables");

const TABLE_NAME = "CalendarEvents";
const PARTITION_KEY = "events";

function getConn() {
  return (
    process.env.TABLES_CONNECTION_STRING ||
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
}

function getClient() {
  const conn = getConn();
  if (!conn || !String(conn).trim()) {
    throw new Error("Calendar storage connection string missing");
  }
  return TableClient.fromConnectionString(conn, TABLE_NAME);
}

async function ensureTable(client) {
  try {
    await client.createTable();
  } catch {
    /* already exists */
  }
}

function makeRowKey() {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

function entityToEvent(e) {
  return {
    id: e.rowKey,
    partitionKey: e.partitionKey,
    name: e.name || "",
    date: e.date || "",
    time: e.time || "",
    organization: e.organization || "",
    description: e.description || "",
    status: e.status || "pending",
    createdAt: e.createdAt || "",
  };
}

async function getAllEvents() {
  const client = getClient();
  await ensureTable(client);
  const iter = client.listEntities({
    queryOptions: { filter: `PartitionKey eq '${PARTITION_KEY}'` },
  });
  const out = [];
  for await (const e of iter) out.push(entityToEvent(e));
  return out;
}

async function getApprovedEvents() {
  const client = getClient();
  await ensureTable(client);
  const iter = client.listEntities({
    queryOptions: {
      filter: `PartitionKey eq '${PARTITION_KEY}' and status eq 'approved'`,
    },
  });
  const out = [];
  for await (const e of iter) out.push(entityToEvent(e));
  return out;
}

async function createEvent(event) {
  const client = getClient();
  await ensureTable(client);
  const entity = {
    partitionKey: PARTITION_KEY,
    rowKey: makeRowKey(),
    name: String((event && event.name) || "").trim(),
    date: String((event && event.date) || "").trim(),
    time: String((event && event.time) || "").trim(),
    organization: String((event && event.organization) || "").trim(),
    description: String((event && event.description) || "").trim(),
    status: (event && event.status) || "pending",
    createdAt: new Date().toISOString(),
  };
  await client.createEntity(entity);
  return entityToEvent(entity);
}

async function updateEventStatus(partitionKey, rowKey, status) {
  const client = getClient();
  await ensureTable(client);
  await client.updateEntity(
    {
      partitionKey: partitionKey || PARTITION_KEY,
      rowKey,
      status,
    },
    "Merge"
  );
}

module.exports = {
  getAllEvents,
  getApprovedEvents,
  createEvent,
  updateEventStatus,
};
