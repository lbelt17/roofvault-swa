// FRSA Maintenance Section 15 (2026) - Deterministic Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)

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

const FRSA_MAINT15_QUESTION_BANK_2026_RAW = {
  book: "FRSA \u2013 Maintenance Section 15 (2026)",
  questions: [
  {
    id: "FRSA-MAINT-001",
    type: "mcq",
    question: "Many roofing problems go unnoticed because roofs are often:",
    options: [
      { id: "A", text: "Inspected daily" },
      { id: "B", text: "Visible from inside the building" },
      { id: "C", text: "\"Out of sight, out of mind\"" },
      { id: "D", text: "Covered with coatings" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-002",
    type: "mcq",
    question: "Properly conducted roof repairs can:",
    options: [
      { id: "A", text: "Shorten roof life" },
      { id: "B", text: "Void all warranties" },
      { id: "C", text: "Help a roof reach or exceed its life expectancy" },
      { id: "D", text: "Eliminate maintenance" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-003",
    type: "mcq",
    question: "Using improper materials for a quick repair may:",
    options: [
      { id: "A", text: "Improve drainage" },
      { id: "B", text: "Increase roof life" },
      { id: "C", text: "Shorten roof life and increase future repair costs" },
      { id: "D", text: "Improve warranty coverage" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-004",
    type: "mcq",
    question: "When repairing asphalt shingles, the repair material should be:",
    options: [
      { id: "A", text: "EPDM" },
      { id: "B", text: "TPO" },
      { id: "C", text: "Asphalt-based" },
      { id: "D", text: "PVC" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-005",
    type: "mcq",
    question: "TPO membrane can properly repair:",
    options: [
      { id: "A", text: "PVC systems" },
      { id: "B", text: "EPDM systems" },
      { id: "C", text: "TPO systems only" },
      { id: "D", text: "Modified bitumen systems" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-006",
    type: "mcq",
    question: "PVC membrane is compatible for repairs on:",
    options: [
      { id: "A", text: "EPDM roofs" },
      { id: "B", text: "PVC roofs" },
      { id: "C", text: "Asphalt shingle roofs" },
      { id: "D", text: "Built-up roofs only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-007",
    type: "mcq",
    question: "EPDM materials should be used to repair:",
    options: [
      { id: "A", text: "EPDM systems" },
      { id: "B", text: "PVC systems" },
      { id: "C", text: "TPO systems" },
      { id: "D", text: "Asphalt systems" }
    ],
    answer: "A",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-008",
    type: "mcq",
    question: "Some products that may work across multiple systems include:",
    options: [
      { id: "A", text: "Fasteners only" },
      { id: "B", text: "Caulking and certain coatings" },
      { id: "C", text: "Asphalt only" },
      { id: "D", text: "Torch-applied sheets" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-009",
    type: "mcq",
    question: "If wet insulation is discovered during a repair, it should be:",
    options: [
      { id: "A", text: "Covered over" },
      { id: "B", text: "Left in place" },
      { id: "C", text: "Replaced before completing repairs" },
      { id: "D", text: "Sealed with coating" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-010",
    type: "mcq",
    question: "Trapping water inside a roofing system can lead to:",
    options: [
      { id: "A", text: "Improved insulation" },
      { id: "B", text: "Deck deterioration and system failure" },
      { id: "C", text: "Increased reflectivity" },
      { id: "D", text: "Improved adhesion" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-011",
    type: "mcq",
    question: "An incorrect valley repair may result in:",
    options: [
      { id: "A", text: "Improved water flow" },
      { id: "B", text: "Extended roof life" },
      { id: "C", text: "Continued leaks and premature failure" },
      { id: "D", text: "Better aesthetics" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MAINT-012",
    type: "mcq",
    question: "Roof repairs directly affect a roof's:",
    options: [
      { id: "A", text: "Color" },
      { id: "B", text: "Slope" },
      { id: "C", text: "Remaining life expectancy" },
      { id: "D", text: "Width" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Maintenance Section 15 (2026)",
    exhibitImage: "",
    imageRef: ""
  }
]};

const FRSA_MAINT15_QUESTION_BANK_2026 = {
  ...FRSA_MAINT15_QUESTION_BANK_2026_RAW,
  questions: FRSA_MAINT15_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FRSA_MAINT15_QUESTION_BANK_2026;
