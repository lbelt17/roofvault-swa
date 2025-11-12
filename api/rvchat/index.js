const { SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX } = process.env;

function jsonRes(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

// Tiny https POST without external deps
function postJson(url, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    try {
      const { URL } = require("node:url");
      const u = new URL(url);
      const isHttps = u.protocol === "https:";
      const mod = require(isHttps ? "node:https" : "node:http");
      const data = JSON.stringify(bodyObj || {});
      const req = mod.request({
        method: "POST",
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: u.pathname + (u.search || ""),
        headers: Object.assign({
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data)
        }, headers || {})
      }, (res) => {
        let text = "";
        res.on("data", (c) => text += c);
        res.on("end", () => resolve({ status: res.statusCode, ok: res.statusCode>=200&&res.statusCode<300, text }));
      });
      req.on("error", reject);
      req.write(data);
      req.end();
    } catch (e) { reject(e); }
  });
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") { context.res = jsonRes({ ok:true }); return; }

  // Show env presence (not values)
  const seen = {
    SEARCH_ENDPOINT: !!(SEARCH_ENDPOINT && SEARCH_ENDPOINT.trim()),
    SEARCH_KEY: !!(SEARCH_KEY && SEARCH_KEY.trim()),
    SEARCH_INDEX: !!(SEARCH_INDEX && SEARCH_INDEX.trim())
  };
  if (!seen.SEARCH_ENDPOINT || !seen.SEARCH_KEY || !seen.SEARCH_INDEX) {
    context.res = jsonRes({ ok:false, layer:"search", seen, error:"Missing search env var(s)" }, 200);
    return;
  }

  const base = SEARCH_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;
  let resp;
  try {
    resp = await postJson(url, { "api-key": SEARCH_KEY }, {
      search: "membrane",
      top: 5,
      select: "metadata_storage_name"
    });
  } catch (e) {
    context.res = jsonRes({ ok:false, layer:"search", seen, networkError:String(e&&e.message||e) }, 200);
    return;
  }

  let parsed = null;
  try { parsed = JSON.parse(resp.text); } catch {}

  // Return diagnostics without throwing 500s
  context.res = jsonRes({
    ok: resp.ok,
    layer: "search",
    status: resp.status,
    seen,
    hitNames: Array.isArray(parsed?.value) ? parsed.value.map(v => v?.metadata_storage_name || "unknown") : [],
    rawError: resp.ok ? null : (parsed?.error?.message || parsed?.message || resp.text || null)
  });
};
