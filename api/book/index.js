const {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    const name = String(req.query.name || "").trim();
    if (!name) {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: { ok: false, error: "Missing ?name=" },
      };
      return;
    }

    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.BLOB_CONTAINER;

    if (!conn || !containerName) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: {
          ok: false,
          error: "Missing AZURE_STORAGE_CONNECTION_STRING or BLOB_CONTAINER",
        },
      };
      return;
    }

    // Parse account name/key from connection string (needed to sign SAS)
    const kv = Object.fromEntries(
      conn.split(";").map((pair) => {
        const i = pair.indexOf("=");
        return i > 0 ? [pair.slice(0, i), pair.slice(i + 1)] : [pair, ""];
      })
    );

    const accountName = kv.AccountName;
    const accountKey = kv.AccountKey;

    if (!accountName || !accountKey) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: { ok: false, error: "Invalid storage connection string" },
      };
      return;
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // ✅ Try both: exact name AND name + ".pdf"
    const candidates = [];
    candidates.push(name);

    if (!name.toLowerCase().endsWith(".pdf")) {
      candidates.push(`${name}.pdf`);
    }

    let foundBlobName = null;

    for (const candidate of candidates) {
      const bc = containerClient.getBlobClient(candidate);
      // eslint-disable-next-line no-await-in-loop
      if (await bc.exists()) {
        foundBlobName = candidate;
        break;
      }
    }

    if (!foundBlobName) {
      context.res = {
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: { ok: false, error: "Blob not found", tried: candidates },
      };
      return;
    }

    const blobClient = containerClient.getBlobClient(foundBlobName);

    // SAS: read-only, short TTL
    const sharedKey = new StorageSharedKeyCredential(accountName, accountKey);
    const expiresOn = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const sas = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: foundBlobName,
        permissions: BlobSASPermissions.parse("r"),
        expiresOn,
        protocol: SASProtocol.Https,
      },
      sharedKey
    ).toString();

    const url = `${blobClient.url}?${sas}`;

    context.res = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: { ok: true, name: foundBlobName, url },
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: String((e && e.message) || e) },
    };
  }
};
