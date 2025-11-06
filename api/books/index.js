/**
 * /api/books — returns field + values for the dropdown.
 * If BOOKS_LIST env var is empty, use a helpful default list so UI always renders.
 */
module.exports = async function (context, req) {
  try {
    const raw = process.env.BOOKS_LIST || "";
    let values = raw
      .split(/[|,]/)
      .map(s => s && s.trim())
      .filter(Boolean);

    if (values.length === 0) {
      // sensible defaults (you can change these later or set BOOKS_LIST in SWA App Settings)
      values = [
        "NRCA Manual (Part 1)",
        "NRCA Manual (Part 2)",
        "IIBEC Guide",
        "ASTM D6878 (TPO)",
        "Roofing Design & Practice"
      ];
    }

    context.res = {
      headers: { "Content-Type": "application/json" },
      body: { field: "docName", values }
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok:false, error: String(e && e.message || e) }
    };
  }
};
