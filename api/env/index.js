module.exports = async function (context, req) {
  function mask(v){ if (!v) return null; return v.length <= 8 ? "***" : (v.slice(0,4) + "…" + v.slice(-4)); }
  const want = [
    "OPENAI_ENDPOINT","OPENAI_API_KEY","OPENAI_DEPLOYMENT","OPENAI_API_VERSION",
    "AZURE_OPENAI_ENDPOINT","AZURE_OPENAI_API_KEY","AZURE_OPENAI_DEPLOYMENT",
    "AOAI_ENDPOINT","AOAI_API_KEY","AOAI_DEPLOYMENT",
    "SEARCH_ENDPOINT","SEARCH_API_KEY","SEARCH_INDEX"
  ];
  const seen = {};
  for (const k of want) seen[k] = process.env[k] ? { present:true, sample: mask(process.env[k]) } : { present:false };

  context.res = {
    headers: { "Content-Type": "application/json" },
    body: {
      ok: true,
      note: "Values are masked. Ensure OPENAI_* vars are present and correct.",
      env: seen
    }
  };
};
