// FRSA Modified, Liquid-Applied & Coating Systems (Sections 11-13) - Deterministic Question Bank
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

const FRSA_MOD1113_QUESTION_BANK_2026_RAW = {
  book: "FRSA \u2013 Modified/Liquid/Coatings Sections 11\u201313 (2026)",
  questions: [
  {
    id: "FRSA-MOD-001",
    type: "mcq",
    question: "Torch-applied modified bitumen sheets are commonly how wide?",
    options: [
      { id: "A", text: "24 inches" },
      { id: "B", text: "30 inches" },
      { id: "C", text: "36 inches" },
      { id: "D", text: "39-3/8 inches (1 meter)" }
    ],
    answer: "D",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-002",
    type: "mcq",
    question: "Many torch-applied modified sheets are approximately:",
    options: [
      { id: "A", text: "40 mils thick" },
      { id: "B", text: "80 mils thick" },
      { id: "C", text: "160 mils thick" },
      { id: "D", text: "20 mils thick" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-003",
    type: "mcq",
    question: "When installing modified membranes, laps are generally laid:",
    options: [
      { id: "A", text: "Parallel to slope only" },
      { id: "B", text: "Perpendicular to slope" },
      { id: "C", text: "Diagonally" },
      { id: "D", text: "Randomly" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-004",
    type: "mcq",
    question: "If the slope exceeds 2:12, membrane sheets may be run:",
    options: [
      { id: "A", text: "Perpendicular only" },
      { id: "B", text: "In a basket weave" },
      { id: "C", text: "Parallel to slope (strapping)" },
      { id: "D", text: "Vertically only" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-005",
    type: "mcq",
    question: "End laps in modified systems should be:",
    options: [
      { id: "A", text: "Aligned continuously" },
      { id: "B", text: "Staggered 2-3 feet apart" },
      { id: "C", text: "Butted tightly" },
      { id: "D", text: "Glued without overlap" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-006",
    type: "mcq",
    question: "Modified membranes are often able to transition from horizontal to vertical surfaces without fracturing because they are:",
    options: [
      { id: "A", text: "Thinner than built-up plies" },
      { id: "B", text: "More rigid" },
      { id: "C", text: "More flexible" },
      { id: "D", text: "Coal tar based" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-007",
    type: "mcq",
    question: "Modified rolls should be stored:",
    options: [
      { id: "A", text: "Lying flat" },
      { id: "B", text: "On end" },
      { id: "C", text: "Hanging" },
      { id: "D", text: "Stacked horizontally" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-008",
    type: "mcq",
    question: "Most manufacturers recommend stacking modified rolls no more than:",
    options: [
      { id: "A", text: "One high" },
      { id: "B", text: "Two high" },
      { id: "C", text: "Three high" },
      { id: "D", text: "Four high" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-009",
    type: "mcq",
    question: "Mopped modified systems typically require the use of:",
    options: [
      { id: "A", text: "Type I asphalt" },
      { id: "B", text: "Type II asphalt" },
      { id: "C", text: "Type III or Type IV asphalt" },
      { id: "D", text: "Coal tar only" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-010",
    type: "mcq",
    question: "Over existing asphalt gravel-surfaced membranes, most mopped modified products require:",
    options: [
      { id: "A", text: "Direct torch application" },
      { id: "B", text: "A protection board" },
      { id: "C", text: "No preparation" },
      { id: "D", text: "Cold adhesive only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-011",
    type: "mcq",
    question: "Liquid-applied roofing systems typically require reinforcement to be:",
    options: [
      { id: "A", text: "Glued after curing" },
      { id: "B", text: "Placed into a liquid base coat" },
      { id: "C", text: "Mechanically fastened" },
      { id: "D", text: "Torch applied" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-012",
    type: "mcq",
    question: "After reinforcement is placed in a liquid-applied system, it must be:",
    options: [
      { id: "A", text: "Left dry" },
      { id: "B", text: "Saturated with additional liquid coating" },
      { id: "C", text: "Mechanically fastened" },
      { id: "D", text: "Covered with gravel immediately" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-013",
    type: "mcq",
    question: "Before applying a roof coating, which condition must be verified?",
    options: [
      { id: "A", text: "Roof must be new" },
      { id: "B", text: "Roof must have remaining service life" },
      { id: "C", text: "Roof must have ponding water" },
      { id: "D", text: "Roof must be metal only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-014",
    type: "mcq",
    question: "If a roof has wet insulation, it is generally:",
    options: [
      { id: "A", text: "Ideal for coating" },
      { id: "B", text: "A good candidate for liquid systems" },
      { id: "C", text: "Not a candidate for coatings" },
      { id: "D", text: "Irrelevant to coating performance" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-015",
    type: "mcq",
    question: "Which of the following is a non-destructive evaluation method?",
    options: [
      { id: "A", text: "Core cutting" },
      { id: "B", text: "Thermal scanning" },
      { id: "C", text: "Removing insulation" },
      { id: "D", text: "Cutting flashing" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-016",
    type: "mcq",
    question: "A millage gauge is used to measure:",
    options: [
      { id: "A", text: "Roof slope" },
      { id: "B", text: "Membrane width" },
      { id: "C", text: "Coating thickness" },
      { id: "D", text: "Insulation depth" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-017",
    type: "mcq",
    question: "Airless spray equipment is commonly used for:",
    options: [
      { id: "A", text: "Asphalt kettles" },
      { id: "B", text: "Fastening base sheets" },
      { id: "C", text: "Applying coatings" },
      { id: "D", text: "Welding seams" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-018",
    type: "mcq",
    question: "Dirty white roof coatings lose performance because they:",
    options: [
      { id: "A", text: "Become thicker" },
      { id: "B", text: "Lose reflectivity" },
      { id: "C", text: "Increase insulation value" },
      { id: "D", text: "Harden too quickly" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-019",
    type: "mcq",
    question: "Roof coatings require:",
    options: [
      { id: "A", text: "No maintenance" },
      { id: "B", text: "Periodic cleaning and maintenance" },
      { id: "C", text: "Full tear-off after 1 year" },
      { id: "D", text: "Gravel surfacing" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-020",
    type: "mcq",
    question: "If a coating does not meet current code or manufacturer warranty requirements, it:",
    options: [
      { id: "A", text: "Can still be installed" },
      { id: "B", text: "Should be installed thicker" },
      { id: "C", text: "May not be an acceptable system" },
      { id: "D", text: "Is automatically approved" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-021",
    type: "mcq",
    question: "SBS modified bitumen is typically torch-applied because:",
    options: [
      { id: "A", text: "It requires no heat" },
      { id: "B", text: "Heat activates the self-adhering backing for proper bond" },
      { id: "C", text: "It is coal tar based" },
      { id: "D", text: "Cold adhesive is not available" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-022",
    type: "mcq",
    question: "A wet film thickness gauge is used during coating application to:",
    options: [
      { id: "A", text: "Measure cured coating thickness" },
      { id: "B", text: "Verify wet coat thickness before curing" },
      { id: "C", text: "Test insulation R-value" },
      { id: "D", text: "Measure membrane width" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-023",
    type: "mcq",
    question: "Cold-applied modified bitumen uses:",
    options: [
      { id: "A", text: "Torch only" },
      { id: "B", text: "Solvent-based or water-based adhesive, no torch" },
      { id: "C", text: "Coal tar mopping" },
      { id: "D", text: "Ballast only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-024",
    type: "mcq",
    question: "Infrared moisture scanning can identify:",
    options: [
      { id: "A", text: "Coating color only" },
      { id: "B", text: "Wet insulation by temperature differential" },
      { id: "C", text: "Membrane thickness" },
      { id: "D", text: "Slope direction" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-MOD-025",
    type: "mcq",
    question: "APP modified bitumen differs from SBS in that APP is:",
    options: [
      { id: "A", text: "Elastomeric like rubber" },
      { id: "B", text: "Plastic-based and typically heat-welded or torch-applied" },
      { id: "C", text: "Cold-applied only" },
      { id: "D", text: "Used only for steep-slope" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Modified/Liquid/Coatings Sections 11-13 (2026)",
    exhibitImage: "",
    imageRef: ""
  }
]};

const FRSA_MOD1113_QUESTION_BANK_2026 = {
  ...FRSA_MOD1113_QUESTION_BANK_2026_RAW,
  questions: FRSA_MOD1113_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FRSA_MOD1113_QUESTION_BANK_2026;
