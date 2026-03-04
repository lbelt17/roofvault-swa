// FRSA Reroofing Section 14 (2026) - Deterministic Question Bank
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

const FRSA_RR14_QUESTION_BANK_2026_RAW = {
  book: "FRSA \u2013 Reroofing Section 14 (2026)",
  questions: [
  {
    id: "FRSA-RR-001",
    type: "mcq",
    question: "During reroofing, weak deck areas should be:",
    options: [
      { id: "A", text: "Ignored until tear-off" },
      { id: "B", text: "Marked and flagged or barricaded" },
      { id: "C", text: "Covered with insulation" },
      { id: "D", text: "Stepped over carefully" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-002",
    type: "mcq",
    question: "Reroofing projects often occur while the building is:",
    options: [
      { id: "A", text: "Vacant" },
      { id: "B", text: "Under demolition" },
      { id: "C", text: "Occupied with power on" },
      { id: "D", text: "Without utilities" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-003",
    type: "mcq",
    question: "When feasible, building power during reroofing should be:",
    options: [
      { id: "A", text: "Left untouched" },
      { id: "B", text: "Increased" },
      { id: "C", text: "De-energized and locked out" },
      { id: "D", text: "Covered with insulation" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-004",
    type: "mcq",
    question: "Overhead service lines running near roof edges present a serious risk of:",
    options: [
      { id: "A", text: "Slipping hazards" },
      { id: "B", text: "Electrocution" },
      { id: "C", text: "Ponding water" },
      { id: "D", text: "Wind uplift" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-005",
    type: "mcq",
    question: "Handling long metal edge or coping pieces near overhead power lines is dangerous because metal:",
    options: [
      { id: "A", text: "Is lightweight" },
      { id: "B", text: "Conducts electricity" },
      { id: "C", text: "Warps in heat" },
      { id: "D", text: "Attracts moisture" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-006",
    type: "mcq",
    question: "Conduit or cables lying on the roof surface should be:",
    options: [
      { id: "A", text: "Ignored" },
      { id: "B", text: "Cut immediately" },
      { id: "C", text: "Disconnected before being moved" },
      { id: "D", text: "Buried under insulation" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-007",
    type: "mcq",
    question: "A hidden hazard during reroofing may exist when conduit is located:",
    options: [
      { id: "A", text: "Only above the deck" },
      { id: "B", text: "Beneath the roof covering but above or below the deck" },
      { id: "C", text: "Inside HVAC units only" },
      { id: "D", text: "Within gravel surfacing" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-008",
    type: "mcq",
    question: "Penetrating a concealed gas line during reroofing is:",
    options: [
      { id: "A", text: "A minor inconvenience" },
      { id: "B", text: "Only a plumbing issue" },
      { id: "C", text: "A very serious hazard" },
      { id: "D", text: "Covered by warranty" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-009",
    type: "mcq",
    question: "Penetrating a concealed water line may:",
    options: [
      { id: "A", text: "Improve drainage" },
      { id: "B", text: "Cause serious problems for occupants" },
      { id: "C", text: "Improve insulation" },
      { id: "D", text: "Prevent ponding" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-010",
    type: "mcq",
    question: "On steep-slope reroofs, temporary water protection is often accomplished using:",
    options: [
      { id: "A", text: "Gravel surfacing" },
      { id: "B", text: "A dry-in underlayment" },
      { id: "C", text: "Torch-applied sheets" },
      { id: "D", text: "Coatings only" }
    ],
    answer: "B",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-011",
    type: "mcq",
    question: "On large low-slope reroofs where work cannot be completed in one day, a temporary tie-in is required to:",
    options: [
      { id: "A", text: "Improve insulation" },
      { id: "B", text: "Increase slope" },
      { id: "C", text: "Prevent water intrusion" },
      { id: "D", text: "Secure fall protection" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-012",
    type: "mcq",
    question: "A temporary tie-off/tie-in must not be:",
    options: [
      { id: "A", text: "Inspected" },
      { id: "B", text: "Documented" },
      { id: "C", text: "Disturbed before leaving the job" },
      { id: "D", text: "Covered with membrane" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-013",
    type: "mcq",
    question: "The primary function of the roofing trade during reroofing is to:",
    options: [
      { id: "A", text: "Increase R-value" },
      { id: "B", text: "Improve aesthetics" },
      { id: "C", text: "Keep water out of the building" },
      { id: "D", text: "Reduce labor hours" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-014",
    type: "mcq",
    question: "The method used for a temporary tie-in depends on:",
    options: [
      { id: "A", text: "Crew size" },
      { id: "B", text: "Roof color" },
      { id: "C", text: "Type of material in both roof systems" },
      { id: "D", text: "Equipment availability" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FRSA-RR-015",
    type: "mcq",
    question: "Fall protection requirements during reroofing must follow:",
    options: [
      { id: "A", text: "Manufacturer preference" },
      { id: "B", text: "OSHA only" },
      { id: "C", text: "Company fall protection program" },
      { id: "D", text: "Building owner request" }
    ],
    answer: "C",
    explanation: "",
    cite: "FRSA Reroofing Section 14 (2026)",
    exhibitImage: "",
    imageRef: ""
  }
]};

const FRSA_RR14_QUESTION_BANK_2026 = {
  ...FRSA_RR14_QUESTION_BANK_2026_RAW,
  questions: FRSA_RR14_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FRSA_RR14_QUESTION_BANK_2026;
