// Ultra-Guard 5700 Silicone Mastic - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf
// Authoring target: 20 technical data sheet questions grounded in source text.


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

const ULTRA_GUARD_5700_MASTIC_QUESTION_BANK_2026_RAW = {
  book: "Ultra-Guard 5700 Silicone Mastic",
  questions: [
    {
      id: "UG5700M-001",
      type: "mcq",
      question: "A foreman is mobilizing for a silicone restoration. Several pipe boots, open seam laps, and a depressed area at a drain still need treatment before the open field is coated. Which product does the Ultra-Guard 5700 Mastic data sheet assign to that detail work?",
      options: [
        { id: "A", text: "Ultra-Guard 5700 Silicone Mastic for sealing penetrations, reinforcing seams, and waterproofing low areas including drains and scuppers" },
        { id: "B", text: "Brush-grade mastic for the entire open field only; details are excluded" },
        { id: "C", text: "Asphalt primer and granules at all details" },
        { id: "D", text: "Open-cell polyurethane foam to fill low areas before any silicone" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Silicone Mastic is a brush/trowel grade product used to seal around penetrations, reinforce seams, and waterproof low areas including drains and scuppers.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-002",
      type: "mcq",
      question: "A new plumbing vent penetration on a freshly sprayed SPF roof needs to be sealed before the silicone topcoat. Is Ultra-Guard 5700 Mastic within the manufacturer's stated recommended uses for this repair?",
      options: [
        { id: "A", text: "Yes; polyurethane foam is a recommended use, and the product is intended to seal around penetrations" },
        { id: "B", text: "No; mastic may be used only over built-up roofing" },
        { id: "C", text: "Only if the penetration is first wrapped with asphalt-saturated felt" },
        { id: "D", text: "Penetrations require the field coating only; mastic is for metal edges" }
      ],
      answer: "A",
      explanation: "Recommended uses include polyurethane foam, roof membranes, BUR, and metal. The product description specifically includes sealing around penetrations on assemblies such as SPF.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-003",
      type: "mcq",
      question: "QC finds a 14-inch open lap seam on an aging single-ply membrane before the silicone restoration continues. What is the correct detail product and purpose per the data sheet?",
      options: [
        { id: "A", text: "Reinforce the seam with Ultra-Guard 5700 Silicone Mastic before proceeding" },
        { id: "B", text: "Splice the seam with PVC weld rod only; silicone mastic is prohibited on membranes" },
        { id: "C", text: "Fill the seam with closed-cell foam and leave unsealed" },
        { id: "D", text: "Cover the seam with a peel-and-stick flashing and omit mastic" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Mastic can be used to reinforce seams. Roof membranes are among the recommended uses for the product.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-004",
      type: "mcq",
      question: "Standing water collects in a shallow sump around a primary drain on a silicone restoration project. The foreman needs to build and waterproof the low area before field coating. What does the data sheet identify as an intended mastic use?",
      options: [
        { id: "A", text: "Waterproof low areas, including drains and scuppers" },
        { id: "B", text: "Low areas must be corrected with rigid board insulation only" },
        { id: "C", text: "Drains may not receive mastic; only the field membrane may be coated" },
        { id: "D", text: "Apply mastic only after the 30-day final cure of the field coat" }
      ],
      answer: "A",
      explanation: "The product is used to waterproof low areas, including drains and scuppers, in addition to penetrations and seam reinforcement.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-005",
      type: "mcq",
      question: "A through-wall scupper box shows cracked sealant and minor ponding at the outlet transition on a BUR restoration. Which application category matches the manufacturer's stated mastic uses?",
      options: [
        { id: "A", text: "Waterproofing at scuppers and other low-area transitions" },
        { id: "B", text: "Full-field airless spray replacement for the entire roof" },
        { id: "C", text: "Interior ceiling repair only" },
        { id: "D", text: "Scupper work requires removal of all silicone before any repair" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Mastic is used to waterproof low areas including drains and scuppers. BUR is also among the recommended substrate uses.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-006",
      type: "mcq",
      question: "A pitch-pocket detail on a multi-ply built-up roof needs localized sealant work before the silicone system is completed. Does the technical data sheet support mastic use on this substrate?",
      options: [
        { id: "A", text: "Yes; BUR is a recommended use for Ultra-Guard 5700 Mastic" },
        { id: "B", text: "No; BUR details require coal-tar only" },
        { id: "C", text: "Only on new BUR; aged BUR must be torn off" },
        { id: "D", text: "BUR is approved for field spray only, not mastic" }
      ],
      answer: "A",
      explanation: "Recommended uses include polyurethane foam, roof membranes, BUR, and metal. Pitch-pocket and penetration detailing on BUR falls within the stated scope when performed by professional applicators.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-007",
      type: "mcq",
      question: "A metal equipment curb on a standing-seam roof has open terminations that must be sealed before the silicone restoration is accepted. What substrate scope does the data sheet provide?",
      options: [
        { id: "A", text: "Metal is a recommended use for Ultra-Guard 5700 Mastic detail work" },
        { id: "B", text: "Metal may receive only polyurethane foam, not silicone mastic" },
        { id: "C", text: "Metal details require welding only; sealants are prohibited" },
        { id: "D", text: "Mastic is limited to galvanized steel below 22 gauge only" }
      ],
      answer: "A",
      explanation: "Recommended uses explicitly include metal, along with polyurethane foam, roof membranes, and BUR.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-008",
      type: "mcq",
      question: "To speed production, a crew mounts Ultra-Guard 5700 Mastic in an airless rig to spray parapet joints. What application method does the data sheet authorize?",
      options: [
        { id: "A", text: "Brush or trowel application at thicknesses up to 1/4 inch" },
        { id: "B", text: "High-pressure airless spray at 4,500 psi minimum" },
        { id: "C", text: "Roller-only application with thinning solvent" },
        { id: "D", text: "Spray application is required for all silicone mastic" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Silicone Mastic is applied by brush or trowel at thicknesses up to 1/4 inch and should be applied directly from the container without thinning.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-009",
      type: "mcq",
      question: "At a drain bowl, the technician tries to feather a single 3/8-inch trowel pass of mastic to eliminate a deep low spot. What maximum thickness per application does the data sheet allow?",
      options: [
        { id: "A", text: "Up to 1/4 inch per application" },
        { id: "B", text: "Up to 1/2 inch per application" },
        { id: "C", text: "Unlimited thickness if each lift is wider than 12 inches" },
        { id: "D", text: "Maximum 1/16 inch; thicker build requires foam fill" }
      ],
      answer: "A",
      explanation: "The mastic is applied by brush or trowel at thicknesses up to 1/4 inch. A 3/8-inch single pass exceeds the published limit.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-010",
      type: "mcq",
      question: "Morning temperatures are cool and the crew wants to thin Ultra-Guard 5700 Mastic with solvent so it spreads faster around multiple pipe boots. What does the application section require?",
      options: [
        { id: "A", text: "Apply directly from the container without thinning" },
        { id: "B", text: "Thin up to 10% with water before brushing" },
        { id: "C", text: "Thin with xylene whenever ambient temperature is below 60°F" },
        { id: "D", text: "Thinning is required for all trowel work" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Silicone Mastic should be applied directly from the container without thinning. The product is a high-solids brush/trowel grade material.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-011",
      type: "mcq",
      question: "The foreman must order mastic for eight pipe-boot detail areas that each measure roughly 3 square feet. Using the published approximate coverage, how much material should be planned for those details before waste?",
      options: [
        { id: "A", text: "About 1 gallon, because eight areas totaling roughly 24 square feet align with approximately 25 square feet per gallon" },
        { id: "B", text: "One quart because details are always small-area work" },
        { id: "C", text: "Coverage is 100 square feet per gallon at penetrations" },
        { id: "D", text: "Coverage is determined by wind speed, not surface area" }
      ],
      answer: "A",
      explanation: "Approximate coverage is 25 square feet per gallon. Eight 3-square-foot detail areas total about 24 square feet, which maps to roughly one gallon before waste and thickness variables.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-012",
      type: "mcq",
      question: "A coping joint at a sun-exposed parapet will receive mastic before the field silicone coat. The owner asks why mastic is acceptable at a highly UV-exposed detail. What performance trait does the data sheet cite?",
      options: [
        { id: "A", text: "Outstanding UV resistance" },
        { id: "B", text: "UV exposure requires aluminum pigment in all mastic applications" },
        { id: "C", text: "Mastic must remain covered and cannot be used on exposed parapets" },
        { id: "D", text: "UV resistance is not listed; only heat resistance applies" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Mastic features exceptional adhesion, low temperature flexibility, high tensile, and outstanding UV resistance among its stated performance traits.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-013",
      type: "mcq",
      question: "A grease exhaust pipe penetration on a silicone roof needs localized sealant at the boot where elevated surface temperatures are expected. Which product description supports use in that detail environment?",
      options: [
        { id: "A", text: "High-solids, heat resistant, brush/trowel grade silicone mastic" },
        { id: "B", text: "Water-based acrylic maintenance coating" },
        { id: "C", text: "Open-cell foam sealant" },
        { id: "D", text: "Mastic is limited to interior applications only" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Silicone Mastic is described as a high-solids, heat resistant, single-component brush/trowel grade silicone mastic intended for roofing details such as penetrations.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-014",
      type: "mcq",
      question: "The project superintendent proposes using Ultra-Guard 5700 Mastic for the entire 25,000-square-foot open field to avoid mobilizing additional equipment. What does this product's description indicate about that plan?",
      options: [
        { id: "A", text: "Mastic is a brush/trowel grade detail product for penetrations, seams, drains, scuppers, and low areas—not a whole-field production method" },
        { id: "B", text: "Mastic is intended to replace all field coatings on large open areas" },
        { id: "C", text: "Mastic may be used only on metal; open fields must remain uncoated" },
        { id: "D", text: "Whole-field application is acceptable if applied in two 1/4-inch trowel passes" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Silicone Mastic is a brush/trowel grade material used to seal penetrations, reinforce seams, and waterproof low areas including drains and scuppers. The data sheet does not describe it as a full-field production coating for large open areas.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-015",
      type: "mcq",
      question: "A drain sump still holds water after the first 1/4-inch trowel pass of mastic has cured. The crew wants to add another pass to build the low area. What thickness rule governs each mastic application?",
      options: [
        { id: "A", text: "Each pass may be applied up to 1/4 inch; additional build requires another application within that limit" },
        { id: "B", text: "The second pass may be 1/2 inch because the first pass is cured" },
        { id: "C", text: "Only one pass is ever permitted at any detail" },
        { id: "D", text: "Additional passes require thinning the mastic 10%" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Silicone Mastic is applied by brush or trowel at thicknesses up to 1/4 inch. Additional build at a low area must respect that per-application limit rather than exceeding it in a single lift.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-016",
      type: "mcq",
      question: "A worker plans to use a cutting torch to heat a stuck mastic pail lid in the staging area beside open material. What flammability guidance applies to Ultra-Guard 5700 Mastic?",
      options: [
        { id: "A", text: "Flash point is 142°F; never use a welding or cutting torch on or near the drum and avoid open flame or spark sources" },
        { id: "B", text: "Silicone mastic is non-flammable and drums may be heated with a torch" },
        { id: "C", text: "Torch use is acceptable if the drum is more than 10 feet from the roof edge" },
        { id: "D", text: "Flash point applies only during cold-weather application, not at the drum" }
      ],
      answer: "A",
      explanation: "Flash point is 142°F (61°C). The flammability section warns to avoid open flame or spark sources and never use a welding or cutting torch on or near the drum.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-017",
      type: "mcq",
      question: "An RTU curb on SPF shows a gap where the foam meets the curb flange before topcoating. Why is mastic rather than foam fill the appropriate detail approach per the product scope?",
      options: [
        { id: "A", text: "Mastic is intended to seal penetrations and detail transitions on SPF, which is a recommended substrate" },
        { id: "B", text: "SPF curbs must be abandoned and replaced with wood blocking only" },
        { id: "C", text: "SPF may not receive any silicone products" },
        { id: "D", text: "Only spray foam may be used at curbs; mastic is for drains only" }
      ],
      answer: "A",
      explanation: "Polyurethane foam is a recommended use, and the mastic is intended to seal around penetrations and waterproof detail areas. It is not a field-applied spray foam product.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-018",
      type: "mcq",
      question: "A north-facing parapet detail will see winter cold-cycle movement after installation. Which performance trait from the data sheet supports selecting silicone mastic at that joint?",
      options: [
        { id: "A", text: "Low temperature flexibility" },
        { id: "B", text: "Open-cell breathability" },
        { id: "C", text: "Rigid cementitious setting" },
        { id: "D", text: "Mastic must not be used where temperatures drop below freezing" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Mastic features low temperature flexibility along with exceptional adhesion, high tensile, and outstanding UV resistance.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-019",
      type: "mcq",
      question: "After completing pipe boots, the foreman must prioritize the remaining detail list before releasing the roof to the field coating crew. Which sequence best matches the manufacturer's stated mastic applications?",
      options: [
        { id: "A", text: "Address open seams, drain/scupper low areas, and remaining penetrations with mastic before treating those areas as complete for field coating" },
        { id: "B", text: "Spray the field first, then return months later for all details" },
        { id: "C", text: "Details are optional if the field coat exceeds 22 dry mils" },
        { id: "D", text: "Only metal edges receive mastic; drains are field-coat only" }
      ],
      answer: "A",
      explanation: "The product is intended to reinforce seams and waterproof low areas including drains and scuppers, and to seal penetrations. Detail work is part of the silicone system preparation, not an optional afterthought.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700M-020",
      type: "mcq",
      question: "An unusual plaza drain detail falls outside the crew's normal GCMC assemblies. Before proceeding, what does the requirements section direct?",
      options: [
        { id: "A", text: "Consult General Coatings Manufacturing Corp. for specific application requirements and end uses" },
        { id: "B", text: "Proceed using any silicone product without manufacturer input" },
        { id: "C", text: "Substitute asphalt mastic if the detail is non-standard" },
        { id: "D", text: "Non-standard details may not use silicone under any circumstance" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 Mastic should be applied by professional applicators, and the data sheet directs consultation with General Coatings Manufacturing Corp. for specific application requirements and end uses when conditions are outside normal scope.",
      cite: "GCMC-TDS-Ultra-Guard-5700-Mastic-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const ULTRA_GUARD_5700_MASTIC_QUESTION_BANK_2026 = {
  ...ULTRA_GUARD_5700_MASTIC_QUESTION_BANK_2026_RAW,
  questions: ULTRA_GUARD_5700_MASTIC_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = ULTRA_GUARD_5700_MASTIC_QUESTION_BANK_2026;
