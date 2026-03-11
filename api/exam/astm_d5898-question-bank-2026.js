// ASTM D5898 (2026) - Deterministic Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
// Reproducibility tag: 4470

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

const ASTM_D5898_QUESTION_BANK_2026_RAW = {
  book: "ASTM D5898 \u2013 Adhered Sheet Waterproofing (2026)",
  questions: [
  {
    id: "ASTM-D5898-001",
    type: "mcq",
    question: "ASTM D5898 covers standard details for adhered sheet waterproofing on which types of structures?",
    options: [
      { id: "A", text: "Steep-slope residential roofs" },
      { id: "B", text: "Below grade structures and plazas" },
      { id: "C", text: "Above-grade curtain wall assemblies" },
      { id: "D", text: "Standing-seam metal roof systems" }
    ],
    answer: "B",
    explanation: "Section 1.1 states the guide covers details for typical conditions encountered in adhered sheet waterproofing on below grade structures and plazas.",
    cite: "ASTM D5898, Section 1.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-002",
    type: "mcq",
    question: "Which waterproofing type is explicitly excluded from the scope of ASTM D5898?",
    options: [
      { id: "A", text: "Modified bitumen membranes" },
      { id: "B", text: "Polymeric sheet membranes" },
      { id: "C", text: "Liquid applied waterproofing" },
      { id: "D", text: "Vulcanized elastomeric membranes" }
    ],
    answer: "C",
    explanation: "Section 1.2 explicitly states the guide does not cover liquid applied waterproofing.",
    cite: "ASTM D5898, Section 1.2",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-003",
    type: "mcq",
    question: "According to ASTM D5898, adhered sheet waterproofing is applied directly to which surfaces?",
    options: [
      { id: "A", text: "Wood framing and plywood sheathing" },
      { id: "B", text: "Concrete or masonry surfaces below grade" },
      { id: "C", text: "Steel deck with rigid insulation" },
      { id: "D", text: "Gypsum board substrates above grade" }
    ],
    answer: "B",
    explanation: "Section 3.2.1 defines the system as applied directly to concrete or masonry surfaces below grade.",
    cite: "ASTM D5898, Section 3.2.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-004",
    type: "mcq",
    question: "What is an \"elevated slab\" as defined in ASTM D5898?",
    options: [
      { id: "A", text: "A slab-on-grade with a vapor retarder" },
      { id: "B", text: "A framed or suspended concrete slab over a habitable or useable space" },
      { id: "C", text: "A mud mat cast on the subgrade" },
      { id: "D", text: "A wearing course over a plaza deck" }
    ],
    answer: "B",
    explanation: "Section 3.2.2 defines an elevated slab as a framed or suspended concrete slab over a habitable or useable space.",
    cite: "ASTM D5898, Section 3.2.2",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-005",
    type: "mcq",
    question: "In ASTM D5898, a \"fillet\" is defined as:",
    options: [
      { id: "A", text: "A metal strip used to terminate membrane edges" },
      { id: "B", text: "A structural reinforcement at expansion joints" },
      { id: "C", text: "Liquid applied modified bitumen or mastic used at internal corners to form a transition of less than 90 degrees" },
      { id: "D", text: "A prefabricated drain flange" }
    ],
    answer: "C",
    explanation: "Section 3.2.3 defines a fillet as liquid applied modified bitumen or mastic used at internal corners prior to membrane application to form a transition of less than 90 degrees.",
    cite: "ASTM D5898, Section 3.2.3",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-006",
    type: "mcq",
    question: "What does the abbreviation \"LAM\" stand for in ASTM D5898?",
    options: [
      { id: "A", text: "Laminated asphalt membrane" },
      { id: "B", text: "Liquid applied membrane" },
      { id: "C", text: "Low-adhesion mat" },
      { id: "D", text: "Layered aggregate material" }
    ],
    answer: "B",
    explanation: "Section 3.3.1 defines LAM as liquid applied membrane.",
    cite: "ASTM D5898, Section 3.3.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-007",
    type: "mcq",
    question: "In ASTM D5898, the abbreviation \"MTL\" stands for:",
    options: [
      { id: "A", text: "Metal termination lining" },
      { id: "B", text: "Modified thermoplastic layer" },
      { id: "C", text: "Non-corrosive metal" },
      { id: "D", text: "Moisture transmission level" }
    ],
    answer: "C",
    explanation: "Section 3.3.5 defines MTL as non-corrosive metal.",
    cite: "ASTM D5898, Section 3.3.5",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-008",
    type: "mcq",
    question: "What does the abbreviation \"NR\" mean in the context of ASTM D5898?",
    options: [
      { id: "A", text: "Natural rubber" },
      { id: "B", text: "Non-reinforced" },
      { id: "C", text: "Not recommended" },
      { id: "D", text: "Neoprene rated" }
    ],
    answer: "C",
    explanation: "Section 3.3.4 defines NR as not recommended.",
    cite: "ASTM D5898, Section 3.3.4",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-009",
    type: "mcq",
    question: "According to ASTM D5898, who should provide shop drawings of each waterproofing condition?",
    options: [
      { id: "A", text: "The structural engineer" },
      { id: "B", text: "The building owner" },
      { id: "C", text: "The applicator" },
      { id: "D", text: "The general contractor" }
    ],
    answer: "C",
    explanation: "Section 5.1 states the applicator should provide shop drawings of each condition to confirm field conditions and verify understanding of the design intent.",
    cite: "ASTM D5898, Section 5.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-010",
    type: "mcq",
    question: "Why are protection materials required over all waterproofing according to ASTM D5898?",
    options: [
      { id: "A", text: "To increase the thermal resistance of the assembly" },
      { id: "B", text: "To prevent damage from backfill, reinforcing chairs, and construction traffic" },
      { id: "C", text: "To serve as a vapor retarder" },
      { id: "D", text: "To provide a bonding surface for cladding" }
    ],
    answer: "B",
    explanation: "Section 6.1 states protection materials are required to prevent damage from backfill, reinforcing chairs, and construction traffic.",
    cite: "ASTM D5898, Section 6.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-011",
    type: "mcq",
    question: "Which of the following is NOT listed in ASTM D5898 as a protection material for waterproofing?",
    options: [
      { id: "A", text: "Asphalt composition boards" },
      { id: "B", text: "Plastic drainage panels" },
      { id: "C", text: "Extruded polystyrene insulation" },
      { id: "D", text: "Fiberglass batt insulation" }
    ],
    answer: "D",
    explanation: "Section 6.2 lists asphalt composition boards, plastic drainage panels, low density expanded polystyrene boards, and extruded polystyrene insulation. Fiberglass batt insulation is not mentioned.",
    cite: "ASTM D5898, Section 6.2",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-012",
    type: "mcq",
    question: "Low density expanded polystyrene boards and some types of plastic drainage panels are not suitable for protection on which surfaces?",
    options: [
      { id: "A", text: "Vertical surfaces" },
      { id: "B", text: "Horizontal surfaces" },
      { id: "C", text: "Curved surfaces" },
      { id: "D", text: "Interior surfaces" }
    ],
    answer: "B",
    explanation: "Section 6.2 states that low density expanded polystyrene boards and some types of plastic drainage panels are not suitable for protection on horizontal surfaces.",
    cite: "ASTM D5898, Section 6.2",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-013",
    type: "mcq",
    question: "When should protection materials be installed after waterproofing application?",
    options: [
      { id: "A", text: "Within 30 days" },
      { id: "B", text: "After the backfill is placed" },
      { id: "C", text: "As soon as possible after the membrane is completed or water tested" },
      { id: "D", text: "Only after the full building is enclosed" }
    ],
    answer: "C",
    explanation: "Section 6.2 states protection should be installed as soon as possible after the membrane, or each portion of it, is completed or water tested.",
    cite: "ASTM D5898, Section 6.2",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-014",
    type: "mcq",
    question: "Protection is also required where membranes terminate above grade and may be exposed to:",
    options: [
      { id: "A", text: "Foot traffic" },
      { id: "B", text: "Wind uplift" },
      { id: "C", text: "Ultra-violet light" },
      { id: "D", text: "Hydrostatic pressure" }
    ],
    answer: "C",
    explanation: "Section 6.1 states protection is required where membranes terminate above grade and may be exposed to ultra-violet light.",
    cite: "ASTM D5898, Section 6.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-015",
    type: "mcq",
    question: "For which membrane types does ASTM D5898 state that separate reinforcement is generally NOT required?",
    options: [
      { id: "A", text: "Built-up membranes" },
      { id: "B", text: "Modified bitumen membranes" },
      { id: "C", text: "Polymeric and vulcanized elastomeric membranes" },
      { id: "D", text: "Hot-applied coal tar systems" }
    ],
    answer: "C",
    explanation: "Section 7.1 states that separate reinforcement generally is not required for polymeric and vulcanized elastomeric membranes.",
    cite: "ASTM D5898, Section 7.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-016",
    type: "mcq",
    question: "What is the minimum reinforcement specified in ASTM D5898?",
    options: [
      { id: "A", text: "Two plys" },
      { id: "B", text: "One ply" },
      { id: "C", text: "Three plys" },
      { id: "D", text: "Four plys" }
    ],
    answer: "B",
    explanation: "Section 7.3 states the minimum reinforcement is one ply.",
    cite: "ASTM D5898, Section 7.3",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-017",
    type: "mcq",
    question: "Additional reinforcement plys should extend at least how far beyond the corner or penetration?",
    options: [
      { id: "A", text: "3 in. (75 mm)" },
      { id: "B", text: "4 in. (100 mm)" },
      { id: "C", text: "6 in. (150 mm)" },
      { id: "D", text: "8 in. (200 mm)" }
    ],
    answer: "C",
    explanation: "Section 7.4 states additional plys should extend at least 6 in. (150 mm) beyond the corner or penetration.",
    cite: "ASTM D5898, Section 7.4",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-018",
    type: "mcq",
    question: "Each succeeding reinforcement ply should extend how far beyond the previous ply?",
    options: [
      { id: "A", text: "2 in. (50 mm)" },
      { id: "B", text: "3 in. (75 mm)" },
      { id: "C", text: "4 in. (100 mm)" },
      { id: "D", text: "6 in. (150 mm)" }
    ],
    answer: "B",
    explanation: "Section 7.4 states each succeeding ply should extend 3 in. (75 mm) beyond the previous ply.",
    cite: "ASTM D5898, Section 7.4",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-019",
    type: "mcq",
    question: "Flashing at penetrations should accommodate what type of movement?",
    options: [
      { id: "A", text: "Wind-induced lateral movement" },
      { id: "B", text: "Differential movement between the slab and the pipe, conduit, or drain" },
      { id: "C", text: "Seismic uplift only" },
      { id: "D", text: "Thermal expansion of the membrane only" }
    ],
    answer: "B",
    explanation: "Section 8.1 states flashing at penetrations should accommodate differential movement between the slab and the pipe, conduit, or drain.",
    cite: "ASTM D5898, Section 8.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-020",
    type: "mcq",
    question: "What type of drains are preferred for installation in the structural slab according to ASTM D5898?",
    options: [
      { id: "A", text: "PVC drains with threaded connections" },
      { id: "B", text: "Copper drains with soldered flanges" },
      { id: "C", text: "Cast iron drains with flanges flush with or slightly below the slab" },
      { id: "D", text: "Stainless steel drains with clamp rings only" }
    ],
    answer: "C",
    explanation: "Section 8.1 states cast iron drains, cast into the slab with flanges flush with or slightly below the slab, are preferred.",
    cite: "ASTM D5898, Section 8.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-021",
    type: "mcq",
    question: "Structural expansion joints should be designed to permit:",
    options: [
      { id: "A", text: "Water flow between structural elements" },
      { id: "B", text: "Independent movement of structural elements on each side of the joint" },
      { id: "C", text: "Continuous membrane without reinforcement" },
      { id: "D", text: "Direct bonding of the wearing surface to the slab" }
    ],
    answer: "B",
    explanation: "Section 9.1 states structural expansion joints should be designed to permit independent movement of structural elements on each side of the joint.",
    cite: "ASTM D5898, Section 9.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-022",
    type: "mcq",
    question: "What is the purpose of a mud mat according to ASTM D5898?",
    options: [
      { id: "A", text: "To serve as the primary waterproofing layer" },
      { id: "B", text: "To provide drainage below the slab" },
      { id: "C", text: "To be cast on the subgrade to support waterproofing" },
      { id: "D", text: "To insulate the foundation wall" }
    ],
    answer: "C",
    explanation: "Section 11.1 states mud mats are cast on the subgrade to support waterproofing.",
    cite: "ASTM D5898, Section 11.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-023",
    type: "mcq",
    question: "How should waterproofing membranes on horizontal surfaces be handled at planters and equipment supports?",
    options: [
      { id: "A", text: "Terminated at the edge of the planter" },
      { id: "B", text: "Carried under planters and supports without interruption" },
      { id: "C", text: "Replaced with liquid applied membrane under supports" },
      { id: "D", text: "Omitted under planters if drainage is provided" }
    ],
    answer: "B",
    explanation: "Section 12.1 states waterproofing membranes on horizontal surfaces should be carried under planters and supports without interruption.",
    cite: "ASTM D5898, Section 12.1",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-024",
    type: "mcq",
    question: "According to ASTM D5898, waterproofing should NOT be terminated:",
    options: [
      { id: "A", text: "At a brick shelf" },
      { id: "B", text: "Below grade" },
      { id: "C", text: "At a parapet wall" },
      { id: "D", text: "At an expansion joint cover" }
    ],
    answer: "B",
    explanation: "Section 13.7 (Fig. 9 and Fig. 10 notes) states waterproofing should not be terminated below grade because water can migrate behind the sheet through cracks above the reglet.",
    cite: "ASTM D5898, Section 13.7",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "ASTM-D5898-025",
    type: "mcq",
    question: "Counterflashing should be carried at least how high above grade behind permanent cladding?",
    options: [
      { id: "A", text: "4 in. (100 mm)" },
      { id: "B", text: "6 in. (150 mm)" },
      { id: "C", text: "8 in. (200 mm)" },
      { id: "D", text: "12 in. (300 mm)" }
    ],
    answer: "C",
    explanation: "Section 13.7 states counterflashing should be carried at least 8 in. (200 mm) above grade behind a permanent cladding.",
    cite: "ASTM D5898, Section 13.7",
    exhibitImage: "",
    imageRef: ""
  }
]};

const ASTM_D5898_QUESTION_BANK_2026 = {
  ...ASTM_D5898_QUESTION_BANK_2026_RAW,
  questions: ASTM_D5898_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = ASTM_D5898_QUESTION_BANK_2026;
