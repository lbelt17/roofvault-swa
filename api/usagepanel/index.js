var TableClient = require("@azure/data-tables").TableClient;

var TABLE_NAME = "Usage";
var JSON_HEADERS = { "Content-Type": "application/json" };

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

module.exports = async function (context, req) {
  var principal = parsePrincipal(req);
  if (!principal || !principal.email) {
    context.res = { status: 401, headers: JSON_HEADERS, body: { ok: false, error: "Authentication required" } };
    return;
  }

  var OWNER_EMAILS;
  try {
    OWNER_EMAILS = require("../_helpers/owners").OWNER_EMAILS;
  } catch (err) {
    context.log.error("usagepanel: failed to load owners helper", err);
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Internal configuration error" } };
    return;
  }

  if (!OWNER_EMAILS.includes(principal.email)) {
    context.res = { status: 403, headers: JSON_HEADERS, body: { ok: false, error: "Forbidden" } };
    return;
  }

  var conn = process.env.TABLES_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn || !String(conn).trim()) {
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "No storage connection" } };
    return;
  }

  try {
    var client = TableClient.fromConnectionString(conn, TABLE_NAME);
    var entities = client.listEntities();
    var usersMap = {};

    for await (var entity of entities) {
      var uid = entity.partitionKey;
      if (!usersMap[uid]) {
        usersMap[uid] = {
          userId: uid,
          userEmail: null,
          latestMonth: null,
          bookView: 0,
          chatQuestion: 0,
          examGenerate: 0,
          totalPromptTokens: 0,
          totalCompletionTokens: 0,
          lastActive: null,
        };
      }

      var user = usersMap[uid];

      if (entity.userEmail) user.userEmail = String(entity.userEmail);

      user.bookView += typeof entity.bookView === "number" ? entity.bookView : 0;
      user.chatQuestion += typeof entity.chatQuestion === "number" ? entity.chatQuestion : 0;
      user.examGenerate += typeof entity.examGenerate === "number" ? entity.examGenerate : 0;
      user.totalPromptTokens += typeof entity.totalPromptTokens === "number" ? entity.totalPromptTokens : 0;
      user.totalCompletionTokens += typeof entity.totalCompletionTokens === "number" ? entity.totalCompletionTokens : 0;

      var rk = entity.rowKey;
      if (!user.latestMonth || rk > user.latestMonth) user.latestMonth = rk;

      var la = entity.lastActive ? String(entity.lastActive) : null;
      if (la && (!user.lastActive || la > user.lastActive)) user.lastActive = la;
    }

    var users = Object.values(usersMap).sort(function (a, b) {
      if (!a.lastActive && !b.lastActive) return 0;
      if (!a.lastActive) return 1;
      if (!b.lastActive) return -1;
      return b.lastActive.localeCompare(a.lastActive);
    });

    context.res = {
      status: 200,
      headers: JSON_HEADERS,
      body: { ok: true, count: users.length, users: users },
    };
  } catch (err) {
    context.log.error("usagepanel: read failed", err);
    context.res = { status: 500, headers: JSON_HEADERS, body: { ok: false, error: "Could not read usage data" } };
  }
};
