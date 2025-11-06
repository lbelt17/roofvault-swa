/**
 * Minimal books endpoint.
 * Returns a facet field name and a list of book titles.
 * To customize, set an App Setting BOOKS_LIST with comma- or pipe-separated values.
 * Example:  BOOKS_LIST="NRCA Manual, IIBEC Guide, ASTM D6878"
 */
module.exports = async function (context, req) {
  try {
    const raw = process.env.BOOKS_LIST || "";
    const values = raw
      .split(/[|,]/)
      .map(s => s && s.trim())
      .filter(Boolean);

    const body = {
      field: "docName",   // your exam API can ignore or use this; "(All Books)" still works
      values              // [] by default; customize via BOOKS_LIST later
    };

    context.res = {
      headers: { "Content-Type": "application/json" },
      body
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok:false, error: String(e && e.message || e) }
    };
  }
};
