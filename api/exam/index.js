module.exports = async function (context, req) {
  const book =
    (req.body && (req.body.book || req.body.fileName)) ||
    (req.query && (req.query.book || req.query.fileName)) || "Unknown.pdf";

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

  context.res = { status: 200, body: { ok: true, items, modelDeployment: "(sample)", sourceFiles: [book] } };
};
