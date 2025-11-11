/**
 * /api/peek
 * Inspect your Azure Search index with fields that exist in your schema.
 *   - GET /api/peek             -> list up to 20 docs (unordered)
 *   - GET /api/peek?q=membrane  -> simple content search
 *   - GET /api/peek?top=5       -> control rows (max 50)
 */
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

module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") { context.res = cors({ ok:true }); return; }

    const missing = ["SEARCH_ENDPOINT","SEARCH_KEY","SEARCH_INDEX"].filter(k => !process.env[k]);
    if (missing.length) { context.res = cors({ ok:false, error:"Missing env", missing }, 500); return; }

    const q = (req.query?.q || "").trim();
    const top = Math.max(1, Math.min(parseInt(req.query?.top || "20", 10) || 20, 50));

    const base = SEARCH_ENDPOINT.replace(/\/+$/, "");
    const url = `${base}/indexes('${encodeURIComponent(SEARCH_INDEX)}')/docs/search?api-version=2023-11-01`;

    const body = {
      search: q || "*",
      top,
      queryType: "simple",
      // your index exposes these fields:
      select: "metadata_storage_name,metadata_storage_path,id,content",
      searchFields: "content"
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "api-key": SEARCH_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    if (!r.ok) {
      throw new Error(`Search HTTP ${r.status}: ${json?.error?.message || json?.message || text}`);
    }

    const items = (json?.value || []).map(v => ({
      name: v?.metadata_storage_name || "",
      path: v?.metadata_storage_path || "",
      id: v?.id || "",
      // include a tiny preview so we can sanity-check hits
      preview: (v?.content || "").toString().slice(0, 200)
    }));

    context.res = cors({ ok:true, count: items.length, items });
  } catch (e) {
    context.res = cors({ ok:false, error: String(e?.message || e) }, 500);
  }
};
