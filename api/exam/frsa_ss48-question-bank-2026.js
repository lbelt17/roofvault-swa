// FRSA Steep Slope Sections 4-8 (2026) - Deterministic Question Bank
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

const FRSA_SS48_QUESTION_BANK_2026_RAW = {
  book: "FRSA \u2013 Steep Slope Sections 4\u20138 (2026)",
  questions: [
  {
    id: "FRSA-021",
    type: "mcq",
    question: "When installing steep-slope underlayment, what is the most important principle regarding laps?",
    options: [
      { id: "A", text: "Laps should face upslope" },
      { id: "B", text: "Water should run against the lap" },
      { id: "C", text: "Laps must be water shedding, not backwater laps" },
      { id: "D", text: "Laps must be glued only" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-022",
    type: "mcq",
    question: "A horizontal lap between underlayment courses is called a:",
    options: [
      { id: "A", text: "End lap" },
      { id: "B", text: "Head lap" },
      { id: "C", text: "Valley lap" },
      { id: "D", text: "Field lap" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-023",
    type: "mcq",
    question: "In a two-layer underlayment system installed \"shingle fashion,\" each upper layer should:",
    options: [
      { id: "A", text: "Be glued only" },
      { id: "B", text: "Be nailed directly through both layers" },
      { id: "C", text: "Overlap the lower layer for double coverage" },
      { id: "D", text: "Be installed vertically" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-024",
    type: "mcq",
    question: "When mechanically attaching underlayment with cap nails, the drip edge should be installed:",
    options: [
      { id: "A", text: "Under the underlayment" },
      { id: "B", text: "Over the underlayment" },
      { id: "C", text: "Between two layers only" },
      { id: "D", text: "After shingles are installed" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-025",
    type: "mcq",
    question: "Three-tab shingles are typically:",
    options: [
      { id: "A", text: "24 inches long" },
      { id: "B", text: "Laminated double-layer throughout" },
      { id: "C", text: "Approximately 12 inches by 36 inches" },
      { id: "D", text: "Installed without adhesive" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-026",
    type: "mcq",
    question: "Architectural (laminated) shingles differ from three-tab shingles because they:",
    options: [
      { id: "A", text: "Have no adhesive strip" },
      { id: "B", text: "Have additional laminated layers creating dimensional appearance" },
      { id: "C", text: "Are thinner" },
      { id: "D", text: "Require no underlayment" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-027",
    type: "mcq",
    question: "The building code requires installers to follow:",
    options: [
      { id: "A", text: "Only the contractor's preference" },
      { id: "B", text: "The supplier's verbal advice" },
      { id: "C", text: "The manufacturer's published installation instructions" },
      { id: "D", text: "The foreman's experience" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-028",
    type: "mcq",
    question: "Improper nail placement in asphalt shingles can result in:",
    options: [
      { id: "A", text: "Improved wind resistance" },
      { id: "B", text: "Shiners and potential leaks" },
      { id: "C", text: "Better alignment" },
      { id: "D", text: "Increased warranty" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-029",
    type: "mcq",
    question: "In a closed-cut valley, fasteners should not be placed within how many inches of the valley centerline?",
    options: [
      { id: "A", text: "2 inches" },
      { id: "B", text: "4 inches" },
      { id: "C", text: "6 inches" },
      { id: "D", text: "12 inches" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-030",
    type: "mcq",
    question: "An open valley installation requires shingles to be:",
    options: [
      { id: "A", text: "Woven across the valley" },
      { id: "B", text: "Cemented directly over exposed nails" },
      { id: "C", text: "Trimmed along chalk lines and sealed to the valley lining" },
      { id: "D", text: "Installed without flashing" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-031",
    type: "mcq",
    question: "A cricket installed behind a chimney is used to:",
    options: [
      { id: "A", text: "Support ridge vent" },
      { id: "B", text: "Increase slope for aesthetic reasons" },
      { id: "C", text: "Divert water around the chimney" },
      { id: "D", text: "Secure hip tiles" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-032",
    type: "mcq",
    question: "Standing seam metal roofing panels typically use:",
    options: [
      { id: "A", text: "Exposed fasteners through panel face" },
      { id: "B", text: "Concealed clips for attachment" },
      { id: "C", text: "Roof cement for seams" },
      { id: "D", text: "Overlapping shingles" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-033",
    type: "mcq",
    question: "Mechanically seamed standing seam panels are generally:",
    options: [
      { id: "A", text: "Weaker than snap-lock" },
      { id: "B", text: "Installed with exposed screws" },
      { id: "C", text: "Stronger due to machine-seamed joint" },
      { id: "D", text: "Used only on flat roofs" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-034",
    type: "mcq",
    question: "One key installation requirement for metal roofing systems is to:",
    options: [
      { id: "A", text: "Avoid chalk lines" },
      { id: "B", text: "Eliminate backwater laps" },
      { id: "C", text: "Install panels randomly" },
      { id: "D", text: "Over-tighten fasteners" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-035",
    type: "mcq",
    question: "On tile roofs, underlayment is critical because tile:",
    options: [
      { id: "A", text: "Is completely watertight" },
      { id: "B", text: "Provides structural support" },
      { id: "C", text: "Is not a completely watertight system" },
      { id: "D", text: "Eliminates need for flashing" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-036",
    type: "mcq",
    question: "A two-ply tile underlayment system typically consists of:",
    options: [
      { id: "A", text: "Two self-adhered layers directly to deck" },
      { id: "B", text: "Anchor sheet mechanically attached with second layer adhered" },
      { id: "C", text: "Foam adhesive only" },
      { id: "D", text: "Tile only without membrane" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-037",
    type: "mcq",
    question: "In Florida's HVHZ, tile installations must comply with:",
    options: [
      { id: "A", text: "Only manufacturer instructions" },
      { id: "B", text: "FRA-TRI manual only" },
      { id: "C", text: "RASs and applicable NOAs" },
      { id: "D", text: "Contractor preference" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-038",
    type: "mcq",
    question: "All tile roof coverings in Florida must have:",
    options: [
      { id: "A", text: "Verbal approval from inspector" },
      { id: "B", text: "UL listing only" },
      { id: "C", text: "Florida Product Approval or Miami-Dade NOA" },
      { id: "D", text: "Insurance approval" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-039",
    type: "mcq",
    question: "Wood shingles differ from wood shakes because shingles are:",
    options: [
      { id: "A", text: "Split and rough-textured" },
      { id: "B", text: "Sawn on both sides with uniform thickness" },
      { id: "C", text: "Installed without underlayment" },
      { id: "D", text: "Thicker at the butt" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-040",
    type: "mcq",
    question: "Wood shakes are typically:",
    options: [
      { id: "A", text: "Machine laminated" },
      { id: "B", text: "Split from logs and thicker at the butt" },
      { id: "C", text: "Manufactured from fiberglass" },
      { id: "D", text: "Installed without ventilation" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-041",
    type: "mcq",
    question: "Slate headlap is typically:",
    options: [
      { id: "A", text: "1 inch" },
      { id: "B", text: "2 inches" },
      { id: "C", text: "3 inches" },
      { id: "D", text: "6 inches" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-042",
    type: "mcq",
    question: "To calculate slate exposure, you:",
    options: [
      { id: "A", text: "Divide length by 3" },
      { id: "B", text: "Subtract headlap from slate length and divide by 2" },
      { id: "C", text: "Multiply length by 2" },
      { id: "D", text: "Subtract exposure from width" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-043",
    type: "mcq",
    question: "For 24-inch slate with 3-inch headlap, exposure is:",
    options: [
      { id: "A", text: "9 inches" },
      { id: "B", text: "10 inches" },
      { id: "C", text: "10.5 inches" },
      { id: "D", text: "12 inches" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-044",
    type: "mcq",
    question: "Slate nails should:",
    options: [
      { id: "A", text: "Be shingle nails only" },
      { id: "B", text: "Be long enough to penetrate sheathing" },
      { id: "C", text: "Be aluminum roofing nails only" },
      { id: "D", text: "Be stapled" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-045",
    type: "mcq",
    question: "Many slate roof failures are attributed to:",
    options: [
      { id: "A", text: "Too much ventilation" },
      { id: "B", text: "Improper nailing" },
      { id: "C", text: "Excessive headlap" },
      { id: "D", text: "Overlapping too much" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Steep Slope Sections 4-8 (2026)",
    exhibitImage: "",
    imageRef: ""
  }
]};

const FRSA_SS48_QUESTION_BANK_2026 = {
  ...FRSA_SS48_QUESTION_BANK_2026_RAW,
  questions: FRSA_SS48_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FRSA_SS48_QUESTION_BANK_2026;
