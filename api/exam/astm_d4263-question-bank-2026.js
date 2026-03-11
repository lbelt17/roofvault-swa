// ASTM D4263 (2026) - Deterministic Question Bank
// Standard Test Method for Indicating Moisture in Concrete by the Plastic Sheet Method
// BANK-ONLY (exam generation only, NOT listed in /api/books)
// Reproducibility tag: 4470
// Source: One-page ASTM D4263 sheet (extracted text)

function sanitizeText(s) {
  if (typeof s !== "string") return s;
  const map = {
    "\u00e2\u20ac\u2122": "\u2019",
    "\u00e2\u20ac\u0153": "\u201c",
    "\u00e2\u20ac\u009d": "\u201d",
    "\u00e2\u20ac\u201c": "\u2013",
    "\u00e2\u20ac\u201d": "\u2014",
    "\u00e2\u20ac\u00a6": "\u2026",
    "\u00c2\u00bd": "\u00bd",
    "\u00c2\u00bc": "\u00bc",
    "\u00c2\u00be": "\u00be",
    "\u00c2\u00b0": "\u00b0",
    "\u00c2\u00ae": "\u00ae",
    "\u00c2\u00a9": "\u00a9",
    "\u00c2\u00b1": "\u00b1",
    "\u00c2\u00b7": "\u00b7",
    "\u00c3\u2014": "\u00d7",
    "\u00c3\u00a9": "\u00e9",
    "\u00c3\u00a8": "\u00e8",
    "\u00c3\u00aa": "\u00ea",
    "\u00c3\u00a1": "\u00e1",
    "\u00c3\u00b3": "\u00f3",
    "\u00c3\u00ba": "\u00fa",
    "\u00c3\u00b1": "\u00f1",
    "\u00c2\u00a0": " ",
    "\u00e2\u20ac": "\u201d"
  };
  let out = s;
  for (const [bad, good] of Object.entries(map)) out = out.split(bad).join(good);
  return out;
}

function sanitizeOption(o) {
  if (!o || typeof o !== "object") return o;
  return { ...o, text: typeof o.text === "string" ? sanitizeText(o.text) : o.text };
}

function sanitizeQuestion(q) {
  if (!q || typeof q !== "object") return q;
  const out = { ...q };
  for (const f of ["question", "explanation", "cite"]) {
    if (typeof out[f] === "string") out[f] = sanitizeText(out[f]);
  }
  if (Array.isArray(out.options)) out.options = out.options.map(sanitizeOption);
  return out;
}

const ASTM_D4263_QUESTION_BANK_2026_RAW = {
  book: "ASTM D4263 \u2013 Plastic Sheet Method for Indicating Moisture in Concrete (2026)",
  questions: [
  {
    id: "ASTM-D4263-001",
    type: "mcq",
    question: "According to ASTM D4263 Scope, what does the plastic sheet method indicate?",
    options: [
      { id: "A", text: "Compressive strength of concrete" },
      { id: "B", text: "Moisture in concrete" },
      { id: "C", text: "Air content of concrete" },
      { id: "D", text: "Slump of concrete" }
    ],
    answer: "B",
    explanation: "The scope states the test method is for indicating moisture in concrete.",
    cite: "ASTM D4263, Section 1 Scope",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-002",
    type: "mcq",
    question: "According to ASTM D4263 Significance and Use, when is the test typically performed?",
    options: [
      { id: "A", text: "After demolition" },
      { id: "B", text: "Prior to application of moisture-sensitive finishes or coatings" },
      { id: "C", text: "During concrete placement" },
      { id: "D", text: "After curing only" }
    ],
    answer: "B",
    explanation: "Significance and Use states the test is used prior to applying moisture-sensitive materials.",
    cite: "ASTM D4263, Section 4 Significance and Use",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-003",
    type: "mcq",
    question: "What type of plastic sheet is specified in ASTM D4263 Materials?",
    options: [
      { id: "A", text: "PVC" },
      { id: "B", text: "Polyethylene" },
      { id: "C", text: "Polypropylene" },
      { id: "D", text: "Polystyrene" }
    ],
    answer: "B",
    explanation: "The materials section specifies a polyethylene plastic sheet.",
    cite: "ASTM D4263, Section 6 Materials",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-004",
    type: "mcq",
    question: "Per ASTM D4263 Cautions, what should be avoided during the test?",
    options: [
      { id: "A", text: "Humidity" },
      { id: "B", text: "Direct sunlight, direct heat, and damage to the sheet" },
      { id: "C", text: "Low temperature only" },
      { id: "D", text: "Wind" }
    ],
    answer: "B",
    explanation: "The cautions section states to avoid direct sunlight, direct heat, and damage to the plastic sheet.",
    cite: "ASTM D4263, Cautions",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-005",
    type: "mcq",
    question: "What is the minimum contact duration specified in ASTM D4263 Procedure?",
    options: [
      { id: "A", text: "4 h" },
      { id: "B", text: "8 h" },
      { id: "C", text: "16 h" },
      { id: "D", text: "24 h" }
    ],
    answer: "C",
    explanation: "The procedure specifies a minimum contact duration of approximately 16 h.",
    cite: "ASTM D4263, Section 9 Procedure",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-006",
    type: "mcq",
    question: "Per ASTM D4263 Sampling, how many test areas are recommended per 500 ft²?",
    options: [
      { id: "A", text: "One" },
      { id: "B", text: "Two" },
      { id: "C", text: "Four" },
      { id: "D", text: "Ten" }
    ],
    answer: "A",
    explanation: "The sampling section recommends one test area per 500 ft².",
    cite: "ASTM D4263, Section 8 Sampling",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-007",
    type: "mcq",
    question: "What approximate plastic sheet size does ASTM D4263 Procedure specify?",
    options: [
      { id: "A", text: "12 in. x 12 in." },
      { id: "B", text: "18 in. x 18 in." },
      { id: "C", text: "24 in. x 24 in." },
      { id: "D", text: "36 in. x 36 in." }
    ],
    answer: "B",
    explanation: "The procedure specifies an approximate plastic sheet size of 18 in. x 18 in.",
    cite: "ASTM D4263, Section 9 Procedure",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-008",
    type: "mcq",
    question: "What does ASTM D4263 specify regarding precision and bias?",
    options: [
      { id: "A", text: "Precision and bias have been fully established" },
      { id: "B", text: "Precision and bias have not been established" },
      { id: "C", text: "Only precision has been established" },
      { id: "D", text: "Only bias has been established" }
    ],
    answer: "B",
    explanation: "The precision and bias section states that precision and bias have not been established for this test method.",
    cite: "ASTM D4263, Section 12 Precision and Bias",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-009",
    type: "mcq",
    question: "Which keywords are listed in ASTM D4263?",
    options: [
      { id: "A", text: "Steel, corrosion, coating" },
      { id: "B", text: "Concrete, moisture, plastic sheet" },
      { id: "C", text: "Roofing, membrane, waterproofing" },
      { id: "D", text: "Adhesive, flooring, vapor" }
    ],
    answer: "B",
    explanation: "The keywords section lists concrete, moisture, and plastic sheet.",
    cite: "ASTM D4263, Section 13 Keywords",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D4263-010",
    type: "mcq",
    question: "According to ASTM D4263, what tape width is suggested for sealing the plastic sheet?",
    options: [
      { id: "A", text: "1 in." },
      { id: "B", text: "2 in." },
      { id: "C", text: "3 in." },
      { id: "D", text: "4 in." }
    ],
    answer: "B",
    explanation: "The procedure suggests a tape width of approximately 2 in. for sealing the sheet to the concrete.",
    cite: "ASTM D4263, Section 9 Procedure",
    exhibitImage: "",
    imageRef: ""
  }
]};

const ASTM_D4263_QUESTION_BANK_2026 = {
  ...ASTM_D4263_QUESTION_BANK_2026_RAW,
  questions: ASTM_D4263_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = ASTM_D4263_QUESTION_BANK_2026;
