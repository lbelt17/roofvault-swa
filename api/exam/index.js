// api/exam/index.js — TEMP: instant sample so UI never hangs
module.exports = async function (context, req) {
  try {
    const book =
      (req.body && (req.body.book || req.body.fileName)) ||
      (req.query && (req.query.book || req.query.fileName)) || "Unknown.pdf";

    // minimal sample (3 items) so the page renders immediately
    const items = [
      "1. MCQ: Sanity question for " + book + ". Choose B.\nA. A\nB. B\nC. C\nD. D\nAnswer: B\nWhy: Pipeline check.\nCites: Preview",
      "2. T/F: This should be True.\nAnswer: True\nWhy: Pipeline check.\nCites: Preview",
      "3. Short Answer: Type TEST.\nAnswer: TEST\nWhy: Pipeline check.\nCites: Preview"
    ];

    context.res = {
      status: 200,
      body: {
        ok: true,
        items,
        modelDeployment: "(sample)",
        sourceFiles: [book],
        diag: {
          receivedMethod: req.method,
          hasSearchVars: !!(process.env.SEARCH_ENDPOINT && process.env.SEARCH_INDEX && process.env.SEARCH_API_KEY),
          hasAOAI: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT && process.env.AZURE_OPENAI_API_KEY)
        }
      }
    };
  } catch (e) {
    context.res = { status: 500, body: { error: "exam temp error", details: String(e.message || e) } };
  }
};
