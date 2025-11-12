const { AOAI_ENDPOINT, AOAI_KEY, AOAI_DEPLOYMENT } = process.env;

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

  const seen = {
    AOAI_ENDPOINT: !!(AOAI_ENDPOINT && AOAI_ENDPOINT.trim()),
    AOAI_KEY: !!(AOAI_KEY && AOAI_KEY.trim()),
    AOAI_DEPLOYMENT: !!(AOAI_DEPLOYMENT && AOAI_DEPLOYMENT.trim())
  };
  if (!seen.AOAI_ENDPOINT || !seen.AOAI_KEY || !seen.AOAI_DEPLOYMENT) {
    context.res = jsonRes({ ok:false, layer:"aoai", seen, error:"Missing AOAI env var(s)" }, 200);
    return;
  }

  const base = AOAI_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/openai/deployments/${encodeURIComponent(AOAI_DEPLOYMENT)}/chat/completions?api-version=2024-06-01`;

  let resp;
  try {
    resp = await postJson(url, { "api-key": AOAI_KEY }, {
      temperature: 0,
      max_tokens: 10,
      messages: [
        { role: "system", content: "You are a test probe." },
        { role: "user", content: "Say OK." }
      ]
    });
  } catch (e) {
    context.res = jsonRes({ ok:false, layer:"aoai", seen, networkError:String(e&&e.message||e) }, 200);
    return;
  }

  let parsed = null;
  try { parsed = JSON.parse(resp.text); } catch {}

  context.res = jsonRes({
    ok: resp.ok,
    layer: "aoai",
    status: resp.status,
    seen,
    message: parsed?.choices?.[0]?.message?.content || null,
    rawError: resp.ok ? null : (parsed?.error?.message || parsed?.message || resp.text || null)
  });
};
