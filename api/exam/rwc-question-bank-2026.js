// RWC Study Guide 2026 - Deterministic Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)

// Sanitize affects only human-readable text display fields.
// IDs, paths (exhibitImage, imageRef), answer logic are never touched.
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

const RWC_QUESTION_BANK_2026_RAW = {
  book: "IIBEC - RWC Study Guide (2026)",
  questions: [
  {
    id: "RWC-001",
    type: "mcq",
    question: "The excavation for the basement of a new office building has been completed. It has been determined that the under-slab waterproofing will be applied directly over the prepared grade. prior to any preliminary working (\"mud\") slab being poured on-site. Which type of waterproofing material should be installed?",
    options: [
      { id: "A", text: "acrylic modified cementitious compound" },
      { id: "B", text: "bentonite clay panels" },
      { id: "C", text: "rubberized asphalt membrane" },
      { id: "D", text: "thermoplastic CPE membrane" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-002",
    type: "mcq",
    question: "Which type of material only becomes waterproof when exposed to moisture?",
    options: [
      { id: "A", text: "acrylic modified cement" },
      { id: "B", text: "bentonite clay panels" },
      { id: "C", text: "hot rubberized asphalt membrane" },
      { id: "D", text: "thermoplastic membrane" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-003",
    type: "multi",
    question: "A concrete structure constructed over a retail area is intended to be a pedestrian walkway to gain access to an adjacent building. Which two systems would be used to waterproof the top surface of the concrete structure? (Choose two.)",
    options: [
      { id: "A", text: "two-ply modified-bitumen membrane with an aluminum foil-faced surfacing" },
      { id: "B", text: "polyurethane coating with embedded sand aggregate surfacing" },
      { id: "C", text: "prefabricated cardboard bentonite panels with concrete pavers" },
      { id: "D", text: "PVC single-ply membrane with metal walkway planks" }
    ],
    answer: "B,D",
    multi: true,
    correctIndexes: [1,3],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-004",
    type: "multi",
    question: "Pavers will be installed on pedestals that are to be placed over a waterproofing membrane applied on a concrete plaza deck. Which two materials would be installed between the pedestals and waterproofing membrane? (Choose two.)",
    options: [
      { id: "A", text: "high density polyisocyanurate insulation board" },
      { id: "B", text: "extruded polystyrene insulation board" },
      { id: "C", text: "exterior glass mat gypsum board" },
      { id: "D", text: "prefabricated drainage composite panel" }
    ],
    answer: "B,D",
    multi: true,
    correctIndexes: [1,3],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-005",
    type: "mcq",
    question: "A concrete contractor has submitted a Request for Substitution for replacing the specified PVC water stop with a hydrophilic rubber water stop in the vertical and horizontal foundation joints. You approve this request under what condition?",
    options: [
      { id: "A", text: "Make the replacement, but not in the keyway of the foundation wall or slab" },
      { id: "B", text: "Make the replacement, but not on the in-board side of the reinforcing bars" },
      { id: "C", text: "Make the replacement, but not within 1 inch [25 mm] of the concrete face" },
      { id: "D", text: "Make the replacement, but not at the top and side of the keyway" }
    ],
    answer: "C",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-006",
    type: "mcq",
    question: "While designing the connecting tunnel between an existing office building and a new car park garage, it was determined that the tunnel would need to be protected from damage due to moisture. The tunnel will be constructed using a cast-in-place concrete floor and ceiling slab with 8-inch [200 mm] thick reinforced concrete masonry unit walls. The geotechnical report indicates that the tunnel will be exposed to hydrostatic pressure on a seasonal basis. Which material should be applied to the exterior of the tunnel construction?",
    options: [
      { id: "A", text: "fiber-reinforced cement parging" },
      { id: "B", text: "self-adhered modified-bitumen membrane (bithuthene)" },
      { id: "C", text: "siloxane compound" },
      { id: "D", text: "clay emulsified asphalt" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-007",
    type: "multi",
    question: "For conditions requiring void (carton) forms due to expansive soils, which have two waterproofing Systems would you recommend for use as positive-side under-slab waterproofing? (Choose two.)",
    options: [
      { id: "A", text: "adhesive-coated HDPEsheet waterproofing" },
      { id: "B", text: "Bentonite sheet waterproofing" },
      { id: "C", text: "thermoplastic sheet waterproofing" },
      { id: "D", text: "cementitious waterproofing" }
    ],
    answer: "A,C",
    multi: true,
    correctIndexes: [0,2],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-008",
    type: "multi",
    question: "Chronic leaks have been occurring in a parking deck with a cast concrete slab wearing surface over the waterproofing system installed on a structural concrete substrate. Which two actions should be performed to rehabilitate the waterproofing? (Choose two.)",
    options: [
      { id: "A", text: "Clean the surface of the concrete topping slab and apply crystalline waterproofing" },
      { id: "B", text: "Remove the topping slab, install hot-fluid-applied polymer-modified asphalt waterproofing," },
      { id: "C", text: "Remove the topping slab, install bentonite panel waterproofing, and place a new 6-inch" },
      { id: "D", text: "Prepare the surface of the concrete topping slab and install a new hot-fluid-applied polymer" }
    ],
    answer: "B,C",
    multi: true,
    correctIndexes: [1,2],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-009",
    type: "mcq",
    question: "Refer to Exhibit #1 Which waterproofing is an acceptable material for the condition represented in the photograph, shown in the exhibit?",
    options: [
      { id: "A", text: "bentonite sheets" },
      { id: "B", text: "butyl rubber" },
      { id: "C", text: "liquid-applied membranes" },
      { id: "D", text: "PVC sheets" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-01.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-01.jpg"
  },
  {
    id: "RWC-010",
    type: "mcq",
    question: "A parking garage deck waterproofing system has horizontal joints that are expected to experience 50% movement. According to ASTM C920, the horizontal joints should be treated with which sealant? (SIKA 2 C-SL) (M=Multi Component=Self Leveling, P=Pedestrian Traffic Class 50= 50% movement, T=roadways)",
    options: [
      { id: "A", text: "Type M, Grade NS, Class 25" },
      { id: "B", text: "Type M, Grade P, Class 50, Use T" },
      { id: "C", text: "Type M, Grade P, Class 25, Use T" },
      { id: "D", text: "Type M, Grade NS, Class 50, Use NT" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-011",
    type: "mcq",
    question: "According to ASTM C981, what are the conditions related to drainage for a concrete plaza, over occupied space, with a built-up asphalt bituminous membrane for waterproofing?",
    options: [
      { id: "A", text: "The deck can be level since these membranes can withstand ponding" },
      { id: "B", text: "The deck must be sloped 1/4 inch/foot [2%] to drain" },
      { id: "C", text: "The deck must be sloped 1/8 inch/foot [1%] to drain" },
      { id: "D", text: "The deck can be level only if you use a drainage board over the membrane" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-012",
    type: "mcq",
    question: "Which waterproofing system would be applied to concrete that was placed seven days ago and may be subject to dynamic cracks?",
    options: [
      { id: "A", text: "prefabricated bentonite geocomposite sheet" },
      { id: "B", text: "fully adhered polymer-modified bitumen sheet" },
      { id: "C", text: "crystalline cementitious waterproofing" },
      { id: "D", text: "liquid-applied bitumen-extended urethane" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-013",
    type: "mcq",
    question: "Joints in a concrete substrate are to be placed at 30 feet [9 m] on-center. What represents the joint movement and adequate joint width required with a Coefficient of Linear Expansion for concrete of 6.20 X 10^ (-6) inch/ (inch. degree F) [11.1 X 10^ (-6) mm/ (mm. degree C)], with a low temperature of 40 degrees F [4 degrees C] and a high temp of 140 degrees F [60 degrees C], sealant movement of 50%, and zero tolerances?",
    options: [
      { id: "A", text: "movement = 0.2232 inch [5.6 mm]; joint size = 3/8 inch [9 mm]" },
      { id: "B", text: "movement = 0.2232 inch [5.6 mm]; joint size = 1/2 inch [13 mm]" },
      { id: "C", text: "movement = 0.3125 inch [7.8 mm]; joint size = 5/8 inch [16 mm]" },
      { id: "D", text: "movement = 0.3125 inch [7.8mm]; joint size = 3/8 inch [9 mm]" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-014",
    type: "mcq",
    question: "You are asked to specify a sealant for a parking deck expansion joint. The structural engineer has indicated the 1 inch [25 mm] wide joint will need to accommodate up to &frac12;” inch [12.5 mm] movement. Which sealant would you recommend? (M=Multicomponent, NS=Non-Sag, T=roadways) (&frac12;=50% movement)",
    options: [
      { id: "A", text: "Type S; Grade NS; Use T; movement up to 25%" },
      { id: "B", text: "Type M; Grade NS; Use T; movement up to 50% (SIKA 2C-NS)" },
      { id: "C", text: "Type S; Grade P; Use NT; movement up to 125%" },
      { id: "D", text: "Type M; Grade P; Use NT; movement up to 25%" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-015",
    type: "multi",
    question: "You are considering several designs for the perimeter details of a proposed vegetative waterproofing assembly. According to the RCI (now IIBEC) Waterproofing Manual, which two advantages would a 4-foot [1.2 m] wide ballasted strip have over a monolithic concrete traffic slab in this scenario? (Choose two.)",
    options: [
      { id: "A", text: "access to repair membrane flashings" },
      { id: "B", text: "prevention of root growth towards membrane flashings" },
      { id: "C", text: "ventilation of root systems" },
      { id: "D", text: "compliance with wind uplift requirements" }
    ],
    answer: "A,C",
    multi: true,
    correctIndexes: [0,2],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-016",
    type: "mcq",
    question: "What is a water table?",
    options: [
      { id: "A", text: "An underground lake that intersects the footings" },
      { id: "B", text: "The level of water in the ground below which the soil is saturated" },
      { id: "C", text: "Water that is retained by an impermeable clay layer" },
      { id: "D", text: "Water flows across the foundation from one side to the other" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-017",
    type: "mcq",
    question: "What describes a safe oxygen level for human occupancy in an excavation greater than four feet deep? [What describes a safe oxygen level for human occupancy in a confined space?]",
    options: [
      { id: "A", text: "an oxygen level greater than 10.5%, but less than 12.8%" },
      { id: "B", text: "an oxygen level greater than 16.5%, but less than 19.5%" },
      { id: "C", text: "an oxygen level greater than 19.5%, but less than 23.5%" },
      { id: "D", text: "an oxygen level greater than 23.5%, but less than 33.3%" }
    ],
    answer: "C",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-018",
    type: "multi",
    question: "You are specifying a self-adhesive rubberized asphalt membrane for a below-grade foundation wall.Which two design considerations should be included in your specifications? (Choose two.)",
    options: [
      { id: "A", text: "Treat cracks less than 1/16 inch [1.6 mm]" },
      { id: "B", text: "Ensure substrate is clean, dry, and frost-free" },
      { id: "C", text: "Prime the substrate" },
      { id: "D", text: "Prepare voids and honeycombs with silicone sealant" }
    ],
    answer: "B,C",
    multi: true,
    correctIndexes: [1,2],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-019",
    type: "mcq",
    question: "Refer to Exhibit #2 During the preliminary design of a third-floor employee terrace area for a new office building, you are asked to design the terrace drainage system. The configuration of the terrace area is shown in the exhibit. The design rainfall is 4 inches per hour. Due to available space in the ceiling plenum, the maximum roof leader pipe slope is limited to 1/4 inch per foot [2 percent]. Referring to the exhibit, what is the size and slope of the last section of the horizontal roof leader? Is piping required before continuing down through the building?",
    options: [
      { id: "A", text: "6-inch diameter pipe at 1/2 inch per foot slope [4 percent]" },
      { id: "B", text: "6-inch diameter pipe at 1/4 inch per foot slope [2 percent]" },
      { id: "C", text: "6-inch diameter pipe at 1/8 inch per foot slope [1 percent]" },
      { id: "D", text: "8-inch diameter pipe at 1/8 inch per foot slope [1 percent]" }
    ],
    answer: "D",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-02.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-02.jpg"
  },
  {
    id: "RWC-020",
    type: "multi",
    question: "You are asked to investigate water infiltration problems on the topmost level of a below-grade parking garage. The upper surface of the garage at grade is grass-covered. From inside the garage, you can see that the main garage roof structure is composed of 5-foot [1.5 m] wide single-span precast concrete double-tees. After heavy rains and snow melts, water leaks appear through the joints between the precast members in widely dispersed areas of the garage. A recent building condition report indicates that the garage structure is about 30 years old, and the original waterproofing consists of an organic felt built-up membrane. The total area of the waterproofed surface is approximately 20,000 square feet [1,860 square meters]. Which two investigative procedures would be appropriate to determine remedial action? (Choose two.)",
    options: [
      { id: "A", text: "Conduct a series of 25 4-inch [100 mm] diameter test cores through the full" },
      { id: "B", text: "Remove the landscaping material at the roof/wall junction at the exterior edge" },
      { id: "C", text: "Perform chloride ion tests on the concrete to establish the extent of corrosion" },
      { id: "D", text: "Dig three test openings 6 feet by 6 feet [1.8 m by 1.8 m] in size, chosen over" }
    ],
    answer: "B,D",
    multi: true,
    correctIndexes: [1,3],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-021",
    type: "mcq",
    question: "Refer to Exhibit #3. You observed the crack shown in the exhibit at a below-grade parking garage. Which repair method should you recommend?",
    options: [
      { id: "A", text: "self-adhering tape" },
      { id: "B", text: "chemical grout injection" },
      { id: "C", text: "Route and seal the crack with silicone sealant" },
      { id: "D", text: "Route and seal the crack with urethane sealant" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-03.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-03.jpg"
  },
  {
    id: "RWC-022",
    type: "mcq",
    question: "You are asked to perform quality control testing on an extensive garden roof with a 15-degree slope. The membrane is black, fully adhered to EPDM over rigid insulation. Which test should you use?",
    options: [
      { id: "A", text: "EFVM" },
      { id: "B", text: "nuclear" },
      { id: "C", text: "capacitance" },
      { id: "D", text: "ASTM D5957 flood test" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-023",
    type: "mcq",
    question: "Refer to Exhibit #4. The exhibit shows a wet-film thickness measurement on a liquid-applied membrane with an 80% solids content based on the measured wet-film thickness shown on the exhibit. What is the expected minimum dry-film thickness at the measured location? (60mils-12mils=48)",
    options: [
      { id: "A", text: "12.5" },
      { id: "B", text: "44" },
      { id: "C", text: "48" },
      { id: "D", text: "52" }
    ],
    answer: "C",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-04.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-04.jpg"
  },
  {
    id: "RWC-024",
    type: "multi",
    question: "What types of construction joints can be used for a water stop? Choose Two.",
    options: [
      { id: "A", text: "Construction" },
      { id: "B", text: "Recessed" },
      { id: "C", text: "Expansion" },
      { id: "D", text: "Contraction" }
    ],
    answer: "C,D",
    multi: true,
    correctIndexes: [2,3],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-025",
    type: "mcq",
    question: "According to ASTM 5957 Standard Guide for Flood Testing, what is the height of the amount of water that can be used to form a hydrostatic head?",
    options: [
      { id: "A", text: "2”" },
      { id: "B", text: "4”" },
      { id: "C", text: "6”" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-026",
    type: "mcq",
    question: "ASTM C-898 Standard in 1978 for Liquid Applied Membranes. (LAM)",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-027",
    type: "mcq",
    question: "ASTM C-981 Standard in 1978 for Built-Up Bituminous Applied Membranes.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-028",
    type: "mcq",
    question: "ASTM C 989 & C 891 Established three design principles for plaza waterproofing",
    options: [
      { id: "A", text: "Slope: Sloping for the structural deck is required for dependable drainage" },
      { id: "B", text: "Insulation: Need for thermal insulation. (reduces thermal heat transfer & stress on" },
      { id: "C", text: "Drainage: Need for a drainage course above the membrane" }
    ],
    answer: "",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: "",
    needsReview: true
  },
  {
    id: "RWC-029",
    type: "mcq",
    question: "A Protected Membrane Roof System is one that allows removal of overburden to maintain the membrane by using pedestal pavers.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-030",
    type: "mcq",
    question: "Plaza Waterproofing systems use an overburden that cannot be easily removed, such as concrete, dirt, etc.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-031",
    type: "mcq",
    question: "According to the Manual of Below Grade Waterproofing Systems, Hydrostatic pressure typically ranges from 30-62.4 PSF per square foot of depth.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-032",
    type: "mcq",
    question: "Passive Resistance can be accomplished by installing under-slab drains and footing drains directed to the storm water system.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-033",
    type: "mcq",
    question: "Grading to control surface water run off should be a minimum slope of 5% or greater for the first 10 feet. (BOCA Code states a 1-12 ratio, and that translates to 8.7%)",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-034",
    type: "mcq",
    question: "ASTM D 2487: Refers to the aggregate types and sizes used for drainage.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-035",
    type: "mcq",
    question: "Damproofing resists water vapor migration. Perimeter drainage is typically the best practice recommended when using damp proofing. Foundation walls and slabs on ground.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-036",
    type: "mcq",
    question: "Positive side: Waterproofing resists hydrostatic pressure and vapor migration. In cases where the water table is above 6 inches below the slab, and cannot be maintained at that level.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-037",
    type: "mcq",
    question: "Waterproofing is defined as a material or system that can prevent leakage of water through a subsurface building component under hydrostatic pressure.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-038",
    type: "mcq",
    question: "Three types of waterproofing commonly used are: Positive side. Negative side. Integral (admixture)",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-039",
    type: "mcq",
    question: "Metallic oxide: Cementitious coatings were replaced by crystalline in the 1990s.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-040",
    type: "mcq",
    question: "Bentonite materials are a poor choice for soils that have intermittent moisture.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-041",
    type: "mcq",
    question: "Elastomeric sheets of modified bitumen with high breaking strains are best over unstable substrates.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-042",
    type: "mcq",
    question: "Negative side waterproofing: Do not apply if the following conditions occur:",
    options: [
      { id: "A", text: "Presence of corrosive soil chemicals" },
      { id: "B", text: "Exposure to freeze-thaw cycling" },
      { id: "C", text: "Low interior humidity requirement" },
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-043",
    type: "mcq",
    question: "Three common types of positive side waterproofing are.",
    options: [
      { id: "A", text: "Liquid Applied Membranes. (LAM)" },
      { id: "B", text: "Bentonite" },
      { id: "C", text: "Self-adhering Sheets (SBS)" },
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-044",
    type: "mcq",
    question: "Negative side waterproofing can resist a hydrostatic head of 200 PSI, and is typically used for:",
    options: [
      { id: "A", text: "Foundation interior walls (residential)" },
      { id: "B", text: "Parking garage walls below grade" },
      { id: "C", text: "Tunnels" },
      { id: "D", text: "Liquid Storage tanks (water)" }
    ],
    answer: "",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: "",
    needsReview: true
  },
  {
    id: "RWC-045",
    type: "mcq",
    question: "Three categories for sheet-applied waterproofing are:",
    options: [
      { id: "A", text: "Elastomeric" },
      { id: "B", text: "Thermoplastic" },
      { id: "C", text: "Modified Bitumen" },
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-046",
    type: "mcq",
    question: "BUR Waterproofing system consisting of coal tar is the least environmentally friendly system.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-047",
    type: "mcq",
    question: "ASTM D5295 or ACI 515: Specifications related to surface preparation for waterproofing coatings.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-048",
    type: "mcq",
    question: "Loose-laid Membranes: Materials for waterproofing systems can be limited to PVC and Butyl membranes.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-049",
    type: "mcq",
    question: "Adhered waterproofing membranes offer two advantages:",
    options: [
      { id: "A", text: "Easier leak detection" },
      { id: "B", text: "Less probability of slippage during backfilling or settlement of poorly compacted fill" },
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-050",
    type: "mcq",
    question: "ASTM Test Method D95: Limits the water absorption of membranes to a maximum rate of 5%.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-051",
    type: "mcq",
    question: "Crystalline waterproofing is self-healing and can bridge cracks up to 3mm. (0.12)",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-052",
    type: "mcq",
    question: "Corrosive Soils: The Only positive side is that waterproofing membranes canprotect a structure from corrosive soils.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-053",
    type: "mcq",
    question: "CRD C48-73: Test method for crystalline waterproofing to determine permeability of coatings on concrete as determined by the US Army Corps of Engineers.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-054",
    type: "mcq",
    question: "Hot Applied: Built up bituminous waterproofing, AKA hot applied waterproofing, long record of success and is considered the oldest waterproofing system.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-055",
    type: "mcq",
    question: "Built-up Membranes: Do not use organic felts for flashings and protective layers. Specify felts as ASTM D227 Type IV or Type VI.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-056",
    type: "mcq",
    question: "Modified Bitumen: Sheet waterproofing 60 mils has an elongation break at 150% vs 2% BUR Systems.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-057",
    type: "mcq",
    question: "Blind Side Applications MB: Modified bitumen waterproofing is unsuitable for blind side applications & has poor UV resistance.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-058",
    type: "mcq",
    question: "Liquid Applied Membranes Failures are noted as:",
    options: [
      { id: "A", text: "Pinholing. (wet substrate MVT)" },
      { id: "B", text: "Cratering. (poor surface prep)" },
      { id: "C", text: "Wrinkling. (poor surface prep)" },
      { id: "D", text: "Blistering. (moisture migration through coating)" },
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-059",
    type: "mcq",
    question: "Bentonite waterproofing: Requires a minimum of 30 psf of water, forming a hydrostatic head for the system to perform correctly over time.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-060",
    type: "mcq",
    question: "Plaza waterproofing for a remedial application: can cost up to 10 times the original application due to overburden removal and cleaning required to service the membrane.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-061",
    type: "mcq",
    question: "ASTM C-981: for built-up membrane application.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-062",
    type: "mcq",
    question: "ASTM C989: Liquid-applied membrane application.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-063",
    type: "mcq",
    question: "Slope: Structural deck sloping best practices for waterproofing the structural deck are 2%.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-064",
    type: "mcq",
    question: "LAM: Minimum solid content for applications is 65% solids, and typical products have 80% solids.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-065",
    type: "mcq",
    question: "XPS: 60 psi insulation is required for the type and density of insulation used in waterproofing plaza decks for parking garage applications. DOW Plazamate is an example of the referenced insulation board.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-066",
    type: "mcq",
    question: "Base flashing Penetrations: Plaza deck waterproofing should be 6 inches apart.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-067",
    type: "mcq",
    question: "Base flashing: For plaza deck waterproofing should extend at least 8-12 inches above the wearing course and be installed prior to the waterproofing membrane.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-068",
    type: "mcq",
    question: "ASTM D 5957: Flood testing standard for plaza membranes. Uses 4 “of water for the test.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-069",
    type: "mcq",
    question: "Topping slab: Design over a precast deck, minimum 3,000 psi, 3 inches thick with welded wire.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-070",
    type: "mcq",
    question: "Contributing factors to waterproofing failures are:",
    options: [
      { id: "A", text: "Design error. (architect and engineers not coordinating)" },
      { id: "B", text: "Negligent construction practices. (not using protection & drainage boards)" },
      { id: "C", text: "Defective materials (manufacturer)" },
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-071",
    type: "mcq",
    question: "ASTM D5295: Preparation of Concrete Surfaces for Adhered Membrane Waterproofing Systems.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-072",
    type: "mcq",
    question: "Bentonite: Backfilling ASTM D155790% maximum density for proper application.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-073",
    type: "mcq",
    question: "ASTM E1907: Standard Practice for Determining Moisture-Related Acceptability of Concrete Floors to receive Moisture-Sensitive Finishes.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-074",
    type: "mcq",
    question: "Hydrostatic Head vs Waterproofing Walls: Below-grade structures typically need to resist hydrostatic surrounding soils.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-075",
    type: "mcq",
    question: "Hydrostatic Head Calculation: Multiply the height of the water column in feet by 0.433 to get the",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-076",
    type: "mcq",
    question: "The 90%- 1% Principal: As much as 90% of all water intrusion problems occur within 1% of the total building or structure exterior surface areas.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-077",
    type: "mcq",
    question: "The Second Most Important Principal Waterproofing: 99% of all leaks are attributable to causes other than material or system failures.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-078",
    type: "mcq",
    question: "Four Types of Cementitious Waterproofing Materials are:",
    options: [
      { id: "A", text: "Metallic" },
      { id: "B", text: "Capillary Systems" },
      { id: "C", text: "Chemical Additive" },
      { id: "D", text: "Acrylic Modified" },
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-079",
    type: "mcq",
    question: "Bentonite composition: 85-90% montmorillonite clay and 15 % natural sediments like volcanic ash.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-080",
    type: "mcq",
    question: "ASTM C-836 enables fluid-applied systems to bridge cracking up to 1/16th wide.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-081",
    type: "mcq",
    question: "Hydrophobic waterproofing resins expand in the presence of water? (reactive)",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-082",
    type: "mcq",
    question: "According to ASTM 5957 Water Testing of Assemblies minimum height of the low point for water is 1” and max height at the low point is 4”. In a 24-72 hour Test.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-083",
    type: "mcq",
    question: "For the soldier pile below-grade application, what should be inspected during the application of waterproofing?",
    options: [
      { id: "A", text: "Lag board gaps and frequency" },
      { id: "B", text: "Water intrusion through soil" },
      { id: "C", text: "None of the above" }
    ],
    answer: "A,B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: "",
    needsReview: true
  },
  {
    id: "RWC-084",
    type: "mcq",
    question: "Sleeved penetration Waterproofing recommends a non-shrink grout and a mechanical seal embedded into the edges of the grout.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-085",
    type: "mcq",
    question: "Minimum distance for penetrations, drains, for HARA (Hot Rubber)",
    options: [
      { id: "A", text: "6”" },
      { id: "B", text: "12”" },
      { id: "C", text: "18”" },
      { id: "D", text: "24”" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-086",
    type: "multi",
    question: "Test the fluid-applied waterproofing to determine whether the slab is ready after 28 days of cure. Pick 2.",
    options: [
      { id: "A", text: "Matt Test" },
      { id: "B", text: "Calcium Chloride Test" },
      { id: "C", text: "Peel Test (Tape Test)" },
      { id: "D", text: "Cross Cut" }
    ],
    answer: "A,C",
    multi: true,
    correctIndexes: [0,2],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-087",
    type: "mcq",
    question: "Moisture Detection Methods for Concrete in Forensic Water Intrusion Investigations.",
    options: [
      { id: "A", text: "Capacitance Test" },
      { id: "B", text: "Infrared Testing" },
      { id: "C", text: "Nuclear Testing" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-088",
    type: "multi",
    question: "Types of concrete waterproofing: pick 2.",
    options: [
      { id: "A", text: "Integral Crystalline Admixture" },
      { id: "B", text: "Air entrainment" },
      { id: "C", text: "Entrained Retarders" },
      { id: "D", text: "Densifier, Silicates" }
    ],
    answer: "A,D",
    multi: true,
    correctIndexes: [0,3],
    expectedSelections: 2,
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-089",
    type: "mcq",
    question: "What are the best ways to deal with asbestos found in a waterproofing system or a wall?",
    options: [
      { id: "A", text: "Dry Ice blast, which reduces wet waste" },
      { id: "B", text: "Encapsulate the wall and add another waterproof layer" },
      { id: "C", text: "Strip with chemicals and remediate by disposing of it at a proper landfill" },
      { id: "D", text: "Grind off the wall and remediate by disposing of it at a proper landfill" }
    ],
    answer: "B",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-090",
    type: "mcq",
    question: "Spray method for testing. Designed to locate and identify anomalies in a vertical wall.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    explanation: "",
    cite: "RWC Study Guide 2026",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "RWC-091",
    type: "mcq",
    question: "93. Identify A in the diagram below.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    correctIndexes: [0],
    explanation: "",
    cite: "RWC Study Guide 2026",
    needsReview: false,
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-05.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-05.jpg"
  },
  {
    id: "RWC-092",
    type: "mcq",
    question: "103. A PVC dumbbell is specifically designed to be used in a construction joint, particularly where minimal movement is expected, as it acts as a \"water stop\" to prevent water from seeping through the joint when embedded in concrete on both sides. Overlap 10cm or 4 inches.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    correctIndexes: [0],
    explanation: "",
    cite: "RWC Study Guide 2026",
    needsReview: false,
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-06.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-06.jpg"
  },
  {
    id: "RWC-093",
    type: "mcq",
    question: "106. ASTM 5989 Waterproofing detail at cavity wall with flashing.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    correctIndexes: [0],
    explanation: "",
    cite: "RWC Study Guide 2026",
    needsReview: false,
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-07.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-07.jpg"
  },
  {
    id: "RWC-094",
    type: "mcq",
    question: "107. NRCA detail reinforcing strip over a joint (slip sheet condition).",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    correctIndexes: [0],
    explanation: "",
    cite: "RWC Study Guide 2026",
    needsReview: false,
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-08.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-08.jpg"
  },
  {
    id: "RWC-095",
    type: "mcq",
    question: "108. NRCA clearance for pipes on walls at planters (horizontal & vertical 12 inches).",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    correctIndexes: [0],
    explanation: "",
    cite: "RWC Study Guide 2026",
    needsReview: false,
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-09.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-09.jpg"
  },
  {
    id: "RWC-096",
    type: "mcq",
    question: "109. NRCA foundation wall brick ledge termination.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    correctIndexes: [0],
    explanation: "",
    cite: "RWC Study Guide 2026",
    needsReview: false,
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-10.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-10.jpg"
  },
  {
    id: "RWC-097",
    type: "mcq",
    question: "110. NRCA foundation wall components waterproofing assembly.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    correctIndexes: [0],
    explanation: "",
    cite: "RWC Study Guide 2026",
    needsReview: false,
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-11.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-11.jpg"
  },
  {
    id: "RWC-098",
    type: "mcq",
    question: "111. IIBEC cavity wall waterproofing detail with metal flashing.",
    options: [
      { id: "A", text: "True" },
      { id: "B", text: "False" }
    ],
    answer: "A",
    correctIndexes: [0],
    explanation: "",
    cite: "RWC Study Guide 2026",
    needsReview: false,
    exhibitImage: "/exhibits/rwc-2026/rwc-exhibit-12.jpg",
    imageRef: "/exhibits/rwc-2026/rwc-exhibit-12.jpg"
  }
]
};

const RWC_QUESTION_BANK_2026 = {
  ...RWC_QUESTION_BANK_2026_RAW,
  questions: RWC_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion),
};

module.exports = RWC_QUESTION_BANK_2026;
