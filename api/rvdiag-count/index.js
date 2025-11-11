const { SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX } = process.env;

function cors(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

async function rest(path, opts = {}) {
  const url = SEARCH_ENDPOINT.replace(/\/+$/, "") + path;
  const r = await fetch(url, {
    method: opts.method || "GET",
    headers: {
      "api-key": SEARCH_KEY,
      "Content-Type": "application/json"
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: r.ok, status: r.status, text, json };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") { context.res = cors({ ok:true }); return; }
  const missing = [];
  if (!SEARCH_ENDPOINT) missing.push("SEARCH_ENDPOINT");
  if (!SEARCH_KEY) missing.push("SEARCH_KEY");
  if (!SEARCH_INDEX) missing.push("SEARCH_INDEX");
  if (missing.length) { context.res = cors({ ok:false, error:"Missing env", missing }, 500); return; }

  try {
    // 1) Exact count via REST ($count)
    const countResp = await rest(`/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/$count?api-version=2023-11-01`);
    const count = countResp.ok ? Number(countResp.text) : null;

    // 2) Peek a single doc via REST search
    const docResp = await rest(`/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`, {
      method: "POST",
      body: { search: "*", top: 1 }
    });

    const sample = docResp.ok && docResp.json?.value?.length ? docResp.json.value[0] : null;
    const keys = sample ? Object.keys(sample).sort() : [];

    context.res = cors({
      ok: true,
      index: SEARCH_INDEX,
      count,
      sampleKeys: keys,
      samplePreview: sample ? Object.fromEntries(
        keys.slice(0, 8).map(k => [k, typeof sample[k] === "string" ? sample[k].slice(0, 200) : sample[k]])
      ) : null,
      rawErrors: {
        countOk: countResp.ok ? undefined : { status: countResp.status, body: countResp.text },
        docOk: docResp.ok ? undefined : { status: docResp.status, body: docResp.text }
      }
    });
  } catch (e) {
    context.res = cors({ ok:false, error:String(e?.message||e) }, 500);
  }
};
