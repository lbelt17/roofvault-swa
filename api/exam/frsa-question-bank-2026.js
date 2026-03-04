// FRSA General Sections 1-3 (2026) - Deterministic Question Bank
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

const FRSA_QUESTION_BANK_2026_RAW = {
  book: "FRSA - General Sections 1-3 (2026)",
  questions: [
  {
    id: "FRSA-001",
    type: "mcq",
    question: "In a typical roofing company organizational structure, who is ultimately responsible for accounting, personnel management, sales, and overall operations?",
    options: [
      { id: "A", text: "General Superintendent" },
      { id: "B", text: "Roofing Foreman" },
      { id: "C", text: "Chief Executive Officer (CEO)" },
      { id: "D", text: "Office Administrator" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-002",
    type: "mcq",
    question: "What is the primary responsibility of the General Superintendent/Operations Manager?",
    options: [
      { id: "A", text: "Installing roofing materials" },
      { id: "B", text: "Managing day-to-day project operations, safety, scheduling, and quality control" },
      { id: "C", text: "Handling company payroll" },
      { id: "D", text: "Ordering office supplies" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-003",
    type: "mcq",
    question: "In roofing terminology, a \"Mechanic\" is best described as:",
    options: [
      { id: "A", text: "A worker who only installs mechanical equipment" },
      { id: "B", text: "A highly experienced roof technician who has learned the trade" },
      { id: "C", text: "The entry-level crew member" },
      { id: "D", text: "A subcontractor hired for repairs" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-004",
    type: "mcq",
    question: "On a new construction project, who typically has overall authority over all subcontractors, including the roofing contractor?",
    options: [
      { id: "A", text: "Roofing Foreman" },
      { id: "B", text: "Building Owner" },
      { id: "C", text: "General Contractor" },
      { id: "D", text: "Manufacturer's Representative" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-005",
    type: "mcq",
    question: "Why must roofing contractors coordinate closely with plumbing contractors during installation?",
    options: [
      { id: "A", text: "Plumbers install skylights" },
      { id: "B", text: "Plumbers install internal roof drains and drain pans" },
      { id: "C", text: "Plumbers install vapor retarders" },
      { id: "D", text: "Plumbers handle structural steel framing" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-006",
    type: "mcq",
    question: "Roof slope is defined as:",
    options: [
      { id: "A", text: "The total length of the roof ridge" },
      { id: "B", text: "The ratio of vertical rise to horizontal run" },
      { id: "C", text: "The thickness of the roof deck" },
      { id: "D", text: "The height of the parapet wall" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-007",
    type: "mcq",
    question: "A roof with a slope of 6:12 means:",
    options: [
      { id: "A", text: "The roof rises 6 inches for every 12 feet of run" },
      { id: "B", text: "The roof rises 6 feet for every 12 feet of run" },
      { id: "C", text: "The roof rises 6 inches for every 12 inches of run" },
      { id: "D", text: "The roof rises 12 inches for every 6 inches of run" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-008",
    type: "mcq",
    question: "Most low-slope roofs are designed with a minimum slope of:",
    options: [
      { id: "A", text: "Dead level (0 slope)" },
      { id: "B", text: "1/8 inch per foot" },
      { id: "C", text: "1/4 inch per foot" },
      { id: "D", text: "1 inch per foot" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-009",
    type: "mcq",
    question: "A valley on a steep-slope roof is:",
    options: [
      { id: "A", text: "The highest point of the roof" },
      { id: "B", text: "The flat field area of the roof" },
      { id: "C", text: "The V-shaped intersection of two roof slopes" },
      { id: "D", text: "The metal installed at the roof edge" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-010",
    type: "mcq",
    question: "Which of the following best describes a roof assembly?",
    options: [
      { id: "A", text: "Only the roof covering" },
      { id: "B", text: "The roof covering and underlayment only" },
      { id: "C", text: "The deck, roof system, and roof covering" },
      { id: "D", text: "The structural framing only" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-011",
    type: "mcq",
    question: "What is the difference between a recover and a replacement?",
    options: [
      { id: "A", text: "A recover removes insulation; a replacement does not" },
      { id: "B", text: "A recover installs new roofing over existing roofing; a replacement removes the existing roof first" },
      { id: "C", text: "A replacement is only for steep-slope roofs" },
      { id: "D", text: "A recover requires structural framing changes" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-012",
    type: "mcq",
    question: "A tear-off involves:",
    options: [
      { id: "A", text: "Installing a second membrane over the existing roof" },
      { id: "B", text: "Removing the existing membrane and possibly insulation before installing a new system" },
      { id: "C", text: "Cutting expansion joints into the deck" },
      { id: "D", text: "Removing only the flashing" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-013",
    type: "mcq",
    question: "Alligatoring on a built-up roof refers to:",
    options: [
      { id: "A", text: "Structural deck deflection" },
      { id: "B", text: "Cracking of the surfacing bitumen resembling alligator skin" },
      { id: "C", text: "Improper fastener placement" },
      { id: "D", text: "Seam separation in single-ply systems" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-014",
    type: "mcq",
    question: "Positive roof drainage means the roof must:",
    options: [
      { id: "A", text: "Drain completely within 12 hours" },
      { id: "B", text: "Drain within 24 hours regardless of deflection" },
      { id: "C", text: "Drain within 48 hours after precipitation considering structural deflection" },
      { id: "D", text: "Have internal drains only" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-015",
    type: "mcq",
    question: "A cricket is installed on a roof to:",
    options: [
      { id: "A", text: "Support HVAC equipment" },
      { id: "B", text: "Increase insulation R-value" },
      { id: "C", text: "Divert water around penetrations or toward drains" },
      { id: "D", text: "Reinforce the roof deck" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-016",
    type: "mcq",
    question: "Which membrane type is classified as thermoplastic?",
    options: [
      { id: "A", text: "Coal tar pitch" },
      { id: "B", text: "PVC" },
      { id: "C", text: "Asphalt" },
      { id: "D", text: "Coal tar" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-017",
    type: "mcq",
    question: "A parapet wall is:",
    options: [
      { id: "A", text: "A wall entirely below the roof line" },
      { id: "B", text: "A wall that extends entirely above the roof" },
      { id: "C", text: "A structural roof beam" },
      { id: "D", text: "A type of insulation" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-018",
    type: "mcq",
    question: "If a roof measures 200 feet by 120 feet, what is the total square footage?",
    options: [
      { id: "A", text: "22,000 sq. ft." },
      { id: "B", text: "23,000 sq. ft." },
      { id: "C", text: "24,000 sq. ft." },
      { id: "D", text: "26,000 sq. ft." }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-019",
    type: "mcq",
    question: "How many roofing squares are in a 24,000 square-foot roof?",
    options: [
      { id: "A", text: "200 squares" },
      { id: "B", text: "220 squares" },
      { id: "C", text: "240 squares" },
      { id: "D", text: "260 squares" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-020",
    type: "mcq",
    question: "To convert inches to a fraction of a foot, you divide the number of inches by:",
    options: [
      { id: "A", text: "10" },
      { id: "B", text: "12" },
      { id: "C", text: "24" },
      { id: "D", text: "100" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA General Sections 1-3 (2026)",
    exhibitImage: "",
    imageRef: ""
  }
]};

const FRSA_QUESTION_BANK_2026 = {
  ...FRSA_QUESTION_BANK_2026_RAW,
  questions: FRSA_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FRSA_QUESTION_BANK_2026;
