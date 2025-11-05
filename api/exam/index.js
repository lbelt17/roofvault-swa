module.exports = async function (context, req) {
  try {
    const method = (req.method || "GET").toUpperCase();
    let book = "Unknown.pdf";

    if (method === "POST") {
      book =
        (req.body && (req.body.book || req.body.fileName)) ||
        (req.query && (req.query.book || req.query.fileName)) ||
        "Unknown.pdf";
    } else {
      // GET
      book =
        (req.query && (req.query.book || req.query.fileName)) ||
        "Unknown.pdf";
    }

    // Return a tiny sample so the UI renders immediately
    const items = [
      `1. MCQ: Sanity question for ${book}. Choose B.
A. A
B. B
C. C
D. D
Answer: B
Why: Pipeline check.
Cites: Preview`,
      `2. T/F: This is True.
Answer: True
Why: Pipeline check.
Cites: Preview`,
      `3. Short Answer: Type TEST.
Answer: TEST
Why: Pipeline check.
Cites: Preview`
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
      body: { error: "exam error", details: String(e && e.message || e) }
    };
  }
};
