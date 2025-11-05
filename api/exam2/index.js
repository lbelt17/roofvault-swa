module.exports = async function (context, req) {
  try {
    const method = (req.method || "GET").toUpperCase();
    const book =
      (method === "POST"
        ? (req.body && (req.body.book || req.body.fileName))
        : (req.query && (req.query.book || req.query.fileName))) || "Unknown.pdf";

    // Minimal sample so we can verify the route is live from your UI
    const items = [
`1. MCQ: Route sanity for ${book}. Which endpoint is working now?
A. /api/exam
B. /api/exam2
C. /api/ghost
D. /api/none
Answer: B
Why: We deployed a new function name to bypass old routing.`,
`2. T/F: The old /api/exam route was returning HTML instead of JSON.
Answer: True
Why: SWA fell back to your SPA because that route wasn't registered/deployed.`,
`3. Short Answer: After this test, what should we generate?
Answer: 50-question exam
Why: That's the end goal.`
    ];

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { ok: true, items, modelDeployment: "(sample)", sourceFiles: [book] }
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: "exam2 error", details: String(e && e.message || e) }
    };
  }
};
