const {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential
} = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    const name = String(req.query.name || "").trim();
    if (!name) {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: { ok: false, error: "Missing ?name=" }
      };
      return;
    }

    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.BLOB_CONTAINER;

    if (!conn || !containerName) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: { ok: false, error: "Missing AZURE_STORAGE_CONNECTION_STRING or BLOB_CONTAINER" }
      };
      return;
    }

    // Parse account name/key from connection string
    const parts = Object.fromEntries(
      conn.split(";").map(kv => {
        const i = kv.indexOf("=");
        return i > 0 ? [kv.slice(0, i), kv.slice(i + 1)] : [kv, ""];
      })
    );

    const accountName = parts.AccountName;
    const accountKey = parts.AccountKey;

    if (!accountName || !accountKey) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: { ok: false, error: "Invalid storage connection string" }
      };
      return;
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
    const blobClient = containerClient.getBlobClient(blobName);

    const exists = await blobClient.exists();
    if (!exists) {
      context.res = {
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: { ok: false, error: "Blob not found", tried: blobName }
      };
      return;
    }

    const sharedKey = new StorageSharedKeyCredential(accountName, accountKey);
    const expiresOn = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const sas = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        expiresOn,
        protocol: SASProtocol.Https
      },
      sharedKey
    ).toString();

    const url = `${blobClient.url}?${sas}`;

    context.res = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: { ok: true, name: blobName, url }
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: String((e && e.message) || e) }
    };
  }
};
