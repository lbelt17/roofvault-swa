const { SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX } = process.env;

function jsonRes(body, status = 200) {
  return { status, headers: {
    "Content-Type":"application/json",
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type"
  }, body: JSON.stringify(body) };
}

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
        headers: Object.assign({ "Content-Type":"application/json", "Content-Length": Buffer.byteLength(data) }, headers||{})
      }, (res) => {
        let text = ""; res.on("data", c => text += c); res.on("end", () => resolve({ status: res.statusCode, ok: res.statusCode>=200&&res.statusCode<300, text }));
      });
      req.on("error", reject); req.write(data); req.end();
    } catch (e) { reject(e); }
  });
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") { context.res = jsonRes({ ok:true }); return; }

  const q = (req.body?.query || req.query?.q || "").toString().trim();
  const top = Math.max(1, Math.min(20, Number(req.body?.top || req.query?.top || 10)));

  const seen = {
    SEARCH_ENDPOINT: !!(SEARCH_ENDPOINT && SEARCH_ENDPOINT.trim()),
    SEARCH_KEY: !!(SEARCH_KEY && SEARCH_KEY.trim()),
    SEARCH_INDEX: !!(SEARCH_INDEX && SEARCH_INDEX.trim()),
  };
  if (!seen.SEARCH_ENDPOINT || !seen.SEARCH_KEY || !seen.SEARCH_INDEX) {
    context.res = jsonRes({ ok:false, error:"Missing SEARCH_* env", seen }, 200); return;
  }

  const base = SEARCH_ENDPOINT.replace(/\/+$/, "");
  const url = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;
  let resp;
  try {
    resp = await postJson(url, { "api-key": SEARCH_KEY }, {
      search: q || "*",
      top,
      searchMode: "any",
      queryType: "simple",
      select: "content,metadata_storage_name,metadata_storage_path",
    });
  } catch (e) {
    context.res = jsonRes({ ok:false, error:"network", detail:String(e&&e.message||e) }, 200); return;
  }

  let parsed = null; try { parsed = JSON.parse(resp.text) } catch {}
  if (!resp.ok) {
    context.res = jsonRes({ ok:false, status: resp.status, error: parsed?.error?.message || parsed?.message || resp.text }, 200); return;
  }

  const rows = Array.isArray(parsed?.value) ? parsed.value : [];
  const items = rows.slice(0, top).map((v, i) => ({
    id: i+1,
    name: v?.metadata_storage_name || "",
    path: v?.metadata_storage_path || "",
    text: (v?.content || "").toString().slice(0, 500)  // preview
  }));

  context.res = jsonRes({ ok:true, query:q, count: items.length, items });
};
