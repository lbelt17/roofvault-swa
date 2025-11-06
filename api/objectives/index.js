module.exports = async function (context, req) {
  try {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "..", "..", "public", "objectives.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);
    context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: json };
  } catch (e) {
    context.res = { status: 500, body: { error: String(e?.message || e) } };
  }
};
