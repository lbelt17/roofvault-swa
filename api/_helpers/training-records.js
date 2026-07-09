// api/_helpers/training-records.js — Azure Blob JSON storage for training completions

const { BlobServiceClient } = require("@azure/storage-blob");

const BLOB_PREFIX = "training-records/ppe";
const COURSE_NAME = "Personal Protection Equipment (PPE) Course";
const COURSE_VERSION = "PPE-COURSE-2026-V1";
const ACK_TEXT_VERSION = "PPE-ACK-2026-V1";

function getConn() {
  return (
    process.env.AZURE_STORAGE_CONNECTION_STRING ||
    process.env.TABLES_CONNECTION_STRING
  );
}

function getContainerName() {
  return process.env.BLOB_CONTAINER || "roofdocs";
}

async function getContainerClient() {
  const conn = getConn();
  if (!conn || !String(conn).trim()) {
    throw new Error("Azure storage connection string missing");
  }
  const service = BlobServiceClient.fromConnectionString(conn);
  const container = service.getContainerClient(getContainerName());
  await container.createIfNotExists();
  return container;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function makeRecordId(date) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return (
    "RV-PPE-" +
    date.getFullYear() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    "-" +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds()) +
    "-" +
    suffix
  );
}

function blobPathForRecord(recordId, date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  return BLOB_PREFIX + "/" + y + "/" + m + "/" + recordId + ".json";
}

async function readBlobJson(container, blobName) {
  const client = container.getBlockBlobClient(blobName);
  const download = await client.download();
  const chunks = [];
  for await (const chunk of download.readableStreamBody) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function saveTrainingRecord(record) {
  const container = await getContainerClient();
  const created = new Date(record.serverCreatedAt || Date.now());
  const blobName = blobPathForRecord(record.recordId, created);
  const blockBlob = container.getBlockBlobClient(blobName);
  const body = JSON.stringify(record, null, 2);
  await blockBlob.upload(body, Buffer.byteLength(body), {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });
  return { blobName: blobName, record: record };
}

async function listTrainingRecords(limit) {
  const max = typeof limit === "number" && limit > 0 ? limit : 100;
  const container = await getContainerClient();
  const entries = [];

  for await (const item of container.listBlobsFlat({ prefix: BLOB_PREFIX + "/" })) {
    entries.push({
      name: item.name,
      lastModified: item.properties && item.properties.lastModified
        ? new Date(item.properties.lastModified)
        : new Date(0),
    });
  }

  entries.sort(function (a, b) {
    return b.lastModified - a.lastModified;
  });

  const selected = entries.slice(0, max);
  const records = [];
  for (var i = 0; i < selected.length; i++) {
    try {
      records.push(await readBlobJson(container, selected[i].name));
    } catch (err) {
      /* skip unreadable blobs */
    }
  }

  records.sort(function (a, b) {
    return String(b.serverCreatedAt || "").localeCompare(String(a.serverCreatedAt || ""));
  });

  return records.slice(0, max);
}

function buildTrainingRecord(payload, meta) {
  const now = new Date();
  const recordId = makeRecordId(now);
  return {
    recordId: recordId,
    employeeFullName: payload.employeeFullName,
    company: payload.company,
    role: payload.role || "",
    employeeEmail: payload.employeeEmail || "",
    courseName: COURSE_NAME,
    courseVersion: COURSE_VERSION,
    courseSlug: "ppe",
    completionDateClient: payload.completionDateClient || "",
    serverCreatedAt: now.toISOString(),
    trainingItemsAcknowledged: [
      "PPE training video reviewed",
      "PPE lesson summaries reviewed",
      "PPE responsibilities acknowledged",
      "Electronic signature completed",
    ],
    acknowledgmentTextVersion: ACK_TEXT_VERSION,
    typedSignature: payload.typedSignature,
    source: "roofvault-ppe-course",
    userAgent: meta.userAgent || null,
    requesterIp: meta.requesterIp || null,
  };
}

module.exports = {
  COURSE_NAME: COURSE_NAME,
  COURSE_VERSION: COURSE_VERSION,
  ACK_TEXT_VERSION: ACK_TEXT_VERSION,
  buildTrainingRecord: buildTrainingRecord,
  saveTrainingRecord: saveTrainingRecord,
  listTrainingRecords: listTrainingRecords,
};
