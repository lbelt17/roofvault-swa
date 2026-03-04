// FRSA Low Slope Sections 9-11 (2026) - Deterministic Question Bank
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

const FRSA_LS911_QUESTION_BANK_2026_RAW = {
  book: "FRSA \u2013 Low Slope Sections 9\u201311 (2026)",
  questions: [
  {
    id: "FRSA-LS-001",
    type: "mcq",
    question: "A built-up roof (BUR) typically consists of multiple layers of:",
    options: [
      { id: "A", text: "Single-ply membrane only" },
      { id: "B", text: "Alternating layers of bitumen and reinforcing ply sheets" },
      { id: "C", text: "Rigid insulation boards only" },
      { id: "D", text: "Coated metal panels" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-002",
    type: "mcq",
    question: "Modified bitumen membranes are typically classified as:",
    options: [
      { id: "A", text: "SBS (styrene-butadiene-styrene) or APP (atactic polypropylene)" },
      { id: "B", text: "EPDM or TPO" },
      { id: "C", text: "Coal tar pitch only" },
      { id: "D", text: "PVC only" }
    ],
    answer: "A",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-003",
    type: "mcq",
    question: "Which single-ply membrane is considered thermoplastic?",
    options: [
      { id: "A", text: "EPDM" },
      { id: "B", text: "TPO" },
      { id: "C", text: "Neoprene" },
      { id: "D", text: "CSPE" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-004",
    type: "mcq",
    question: "Insulation used in low-slope roof assemblies is typically installed:",
    options: [
      { id: "A", text: "Above the membrane only" },
      { id: "B", text: "Below the deck only" },
      { id: "C", text: "Between the deck and the membrane" },
      { id: "D", text: "In place of the membrane" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-005",
    type: "mcq",
    question: "Mechanical attachment of low-slope membranes typically involves:",
    options: [
      { id: "A", text: "Adhesive only, no fasteners" },
      { id: "B", text: "Plates and fasteners or screws through the membrane" },
      { id: "C", text: "Ballast only" },
      { id: "D", text: "Welding seams only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-006",
    type: "mcq",
    question: "A ballasted roof system uses:",
    options: [
      { id: "A", text: "Only adhesive to hold the membrane" },
      { id: "B", text: "Stone or pavers to hold the membrane in place" },
      { id: "C", text: "Exposed fasteners through the membrane" },
      { id: "D", text: "Mechanical clips only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-007",
    type: "mcq",
    question: "Heat-welded seams are typically used with:",
    options: [
      { id: "A", text: "EPDM only" },
      { id: "B", text: "TPO and PVC membranes" },
      { id: "C", text: "Built-up roofing only" },
      { id: "D", text: "Modified bitumen only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-008",
    type: "mcq",
    question: "Scrim in a roofing membrane provides:",
    options: [
      { id: "A", text: "Waterproofing only" },
      { id: "B", text: "Reinforcement and dimensional stability" },
      { id: "C", text: "UV resistance only" },
      { id: "D", text: "Fire resistance only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-009",
    type: "mcq",
    question: "A vapor retarder is typically required when:",
    options: [
      { id: "A", text: "The interior humidity is lower than exterior" },
      { id: "B", text: "Interior humidity is significantly higher than exterior" },
      { id: "C", text: "No insulation is present" },
      { id: "D", text: "The deck is concrete only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-010",
    type: "mcq",
    question: "Reglet flashing is used for:",
    options: [
      { id: "A", text: "Field membrane attachment" },
      { id: "B", text: "Parapet and wall termination" },
      { id: "C", text: "Drain installation only" },
      { id: "D", text: "Insulation fastening" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-011",
    type: "mcq",
    question: "Flood coating on a BUR refers to:",
    options: [
      { id: "A", text: "Applying adhesive for single-ply" },
      { id: "B", text: "Applying a final layer of bitumen and surfacing" },
      { id: "C", text: "Flood testing the deck" },
      { id: "D", text: "Coating metal flashings" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-012",
    type: "mcq",
    question: "Coal tar pitch in BUR is different from asphalt because coal tar:",
    options: [
      { id: "A", text: "Is less resistant to water" },
      { id: "B", text: "Has better water resistance and different chemical properties" },
      { id: "C", text: "Cannot be used with fabric plies" },
      { id: "D", text: "Is only used for steep-slope" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-013",
    type: "mcq",
    question: "Cover boards are used in low-slope assemblies to:",
    options: [
      { id: "A", text: "Replace the membrane" },
      { id: "B", text: "Protect insulation from foot traffic and fastener penetration" },
      { id: "C", text: "Provide primary waterproofing" },
      { id: "D", text: "Replace the vapor retarder" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-014",
    type: "mcq",
    question: "Expansion joints in low-slope roofs are installed to:",
    options: [
      { id: "A", text: "Improve drainage" },
      { id: "B", text: "Accommodate structural movement" },
      { id: "C", text: "Support HVAC equipment" },
      { id: "D", text: "Reduce insulation thickness" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-015",
    type: "mcq",
    question: "A cant strip at the base of a wall is used to:",
    options: [
      { id: "A", text: "Support the drain" },
      { id: "B", text: "Provide a gradual transition and reduce stress at the base flashing" },
      { id: "C", text: "Hold ballast" },
      { id: "D", text: "Fasten the membrane" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-016",
    type: "mcq",
    question: "EPDM is classified as:",
    options: [
      { id: "A", text: "Thermoplastic" },
      { id: "B", text: "Thermoset (elastomeric)" },
      { id: "C", text: "Modified bitumen" },
      { id: "D", text: "Built-up roofing" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-017",
    type: "mcq",
    question: "Ponding water on a low-slope roof can cause:",
    options: [
      { id: "A", text: "Improved membrane life" },
      { id: "B", text: "Premature deterioration, organic growth, and structural loading" },
      { id: "C", text: "Better insulation performance" },
      { id: "D", text: "Reduced thermal expansion" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-018",
    type: "mcq",
    question: "Tapered insulation is used primarily to:",
    options: [
      { id: "A", text: "Reduce R-value" },
      { id: "B", text: "Provide positive drainage to roof drains" },
      { id: "C", text: "Support heavier ballast" },
      { id: "D", text: "Eliminate the need for flashing" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-019",
    type: "mcq",
    question: "SBS modified bitumen is typically installed with:",
    options: [
      { id: "A", text: "Heat welding only" },
      { id: "B", text: "Torch application, cold adhesive, or self-adhered systems" },
      { id: "C", text: "Ballast only" },
      { id: "D", text: "Liquid adhesive only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-020",
    type: "mcq",
    question: "A fully adhered membrane system:",
    options: [
      { id: "A", text: "Uses only mechanical fasteners" },
      { id: "B", text: "Is bonded to the substrate with adhesive over the entire area" },
      { id: "C", text: "Relies on ballast only" },
      { id: "D", text: "Uses no attachment" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-021",
    type: "mcq",
    question: "Peripheral attachment in a mechanically attached system refers to:",
    options: [
      { id: "A", text: "Fasteners only in the field" },
      { id: "B", text: "Fasteners primarily at the perimeter with loose or semi-attached field" },
      { id: "C", text: "Adhesive at edges only" },
      { id: "D", text: "Ballast at edges only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-022",
    type: "mcq",
    question: "Factory seams in single-ply membranes are:",
    options: [
      { id: "A", text: "Never used" },
      { id: "B", text: "Made at the factory to create wider rolls; field seams join rolls" },
      { id: "C", text: "Replaced by field welding only" },
      { id: "D", text: "Used only for EPDM" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-023",
    type: "mcq",
    question: "Fastener spacing in mechanically attached systems is determined by:",
    options: [
      { id: "A", text: "Contractor preference only" },
      { id: "B", text: "Wind uplift design, manufacturer specifications, and code" },
      { id: "C", text: "Drainage requirements only" },
      { id: "D", text: "Ballast weight only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-024",
    type: "mcq",
    question: "Gravel surfacing on a BUR helps:",
    options: [
      { id: "A", text: "Reduce membrane thickness" },
      { id: "B", text: "Protect bitumen from UV and provide ballast" },
      { id: "C", text: "Improve drainage only" },
      { id: "D", text: "Eliminate the need for flashing" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-LS-025",
    type: "mcq",
    question: "A base flash turns up the wall; the counterflash:",
    options: [
      { id: "A", text: "Replaces the base flash" },
      { id: "B", text: "Covers the top of the base flash and sheds water outward" },
      { id: "C", text: "Is installed under the membrane" },
      { id: "D", text: "Is used only on steep-slope roofs" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Low Slope Sections 9-11 (2026)",
    exhibitImage: "",
    imageRef: ""
  }
]};

const FRSA_LS911_QUESTION_BANK_2026 = {
  ...FRSA_LS911_QUESTION_BANK_2026_RAW,
  questions: FRSA_LS911_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FRSA_LS911_QUESTION_BANK_2026;
