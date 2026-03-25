const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  try {
    const conn = process.env.TABLES_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn) {
      context.res = { status: 500, body: { error: "No connection string" } };
      return;
    }

    const client = TableClient.fromConnectionString(conn, "Usage");

    const principal = req.headers["x-ms-client-principal"];
    if (!principal) {
      context.res = { status: 401, body: { error: "No user" } };
      return;
    }

    const decoded = JSON.parse(Buffer.from(principal, "base64").toString("utf8"));
    const userId = decoded.userId;

    const month = new Date().toISOString().slice(0,7).replace("-", "");

    const entity = await client.getEntity(userId, month).catch(() => null);

    context.res = {
      status: 200,
      body: entity || { message: "No usage yet" }
    };

  } catch (e) {
    context.res = { status: 500, body: { error: e.message } };
  }
};
