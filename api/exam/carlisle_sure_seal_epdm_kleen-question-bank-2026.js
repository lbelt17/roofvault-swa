// Carlisle Sure-Seal EPDM Kleen Non-Reinforced - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF (internal only, never served via /api/book or /api/books):
//   sources/manufacturers/carlisle/pds/2024-12-sure-seal-epdm-kleen-non-reinforced-pds.pdf
// Per-question provenance lives in:
//   sources/manufacturers/carlisle/citations.json
//
// Question authoring target was 6 (the honest expert-level capacity of this
// 2-page PDS, agreed with product owner). Every question is scenario-based,
// derived from the PDS facts, and paraphrased - no marketing prose copied
// verbatim. No filler.

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

const CARLISLE_SURE_SEAL_EPDM_KLEEN_QUESTION_BANK_2026_RAW = {
  book: "Carlisle Sure-Seal EPDM Kleen Non-Reinforced",
  questions: [
    {
      id: "CARSS-001",
      type: "mcq",
      question: "A design team has specified a mechanically fastened EPDM membrane assembly over a steel deck on a 60,000 sq ft warehouse to keep adhesive costs down. The contractor's salesperson proposes Sure-Seal Kleen Non-Reinforced 60-mil EPDM for the job. Per Carlisle's PDS for Sure-Seal Kleen Non-Reinforced, what is the BEST response?",
      options: [
        { id: "A", text: "Accept the proposal because non-reinforced EPDM has higher elongation than reinforced and will accommodate thermal cycling at the fasteners" },
        { id: "B", text: "Accept the proposal because the membrane is fire-retardant and therefore approved for any attachment design" },
        { id: "C", text: "Decline the non-reinforced product on this assembly because Sure-Seal Kleen Non-Reinforced is specified primarily for Design A (Fully Adhered) systems; a polyester-reinforced EPDM (the Sure-Tough family) is the right product when the design calls for mechanical attachment" },
        { id: "D", text: "Substitute hand-applied SecurTAPE for Factory-Applied Tape to compensate for the fastener loading on a non-reinforced sheet" }
      ],
      answer: "C",
      explanation: "Sure-Seal Kleen Non-Reinforced is identified by the PDS as a Type I non-reinforced EPDM (ASTM D4637) that is utilized primarily in Design A (Fully Adhered) systems across all three thicknesses (45, 60, 90 mil). Mechanically fastened assemblies transfer wind-uplift load through the membrane at each fastening line, which is exactly where an internal polyester scrim is needed to distribute that point load - this is why Carlisle offers a polyester-reinforced sibling product (the Sure-Tough family, ASTM D4637 Type II) that supports MFS (Mechanically Fastened) and MR (Metal Retrofit) designs in addition to Design A. High elongation, FR formulation, and seam tape choice are real attributes of the non-reinforced product, but none of them converts it into an appropriate selection for a mechanically attached assembly.",
      cite: "Carlisle Sure-Seal EPDM Kleen PDS - p. 2, Installation (Design A) / ASTM D4637 Type I",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSS-002",
      type: "mcq",
      question: "A 60-mil Sure-Seal Kleen Non-Reinforced EPDM roof is being installed at an ambient temperature of 35\u00b0F. The crew is applying Factory-Applied Tape splices between membrane panels. Per the PDS cold-weather splicing procedure (below 40\u00b0F), which sequence is CORRECT?",
      options: [
        { id: "A", text: "Heat the underside of the top sheet to soften the tape adhesive, press into place, then immediately roll the seam with a wide soft-rubber roller without further heating" },
        { id: "B", text: "Heat the primed area of the BOTTOM membrane with a hot-air gun as the top sheet (with Factory-Applied Tape) is applied and pressed into place; then heat the TOP side of the membrane with a hot-air gun before rolling the splice with a 2-inch steel hand roller" },
        { id: "C", text: "Apply primer hot, install the top sheet without additional heat, and roll once with a 2-inch steel roller; no top-side heating is required below 40\u00b0F" },
        { id: "D", text: "Pre-warm the entire roll of membrane in a heated trailer until both sheets are above 40\u00b0F, then splice with no further heating because the membrane will retain the warmth" }
      ],
      answer: "B",
      explanation: "The PDS specifies a two-step cold-weather splicing procedure for ambient below 40\u00b0F (5\u00b0C). Step 1: heat the primed area of the BOTTOM membrane with a hot-air gun while the top sheet carrying the Factory-Applied Tape is being applied and pressed into place. Step 2: before rolling the splice with a 2-inch-wide steel hand roller, apply heat to the TOP side of the membrane with a hot-air gun until the heated surface is hot to the touch. Both heating passes are required, and the roller is steel (for adequate splice-area pressure), not soft rubber. Pre-warming a roll in a trailer does not preserve splice-area temperature once the sheet is unrolled in cold ambient. The PDS also warns to be careful not to burn or blister the membrane, which is why the heat is targeted and the surface should be hot-to-the-touch but not scorched.",
      cite: "Carlisle Sure-Seal EPDM Kleen PDS - p. 2, Installation (Splicing below 40\u00b0F)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSS-003",
      type: "mcq",
      question: "A contractor receives a pallet of Sure-Seal Kleen Non-Reinforced membrane with Factory-Applied Tape (FAT) on a July project. The rolls will sit staged on the rooftop in direct sun for an estimated eight working days before installation begins, with daytime rooftop temperatures forecast in the high-90s \u00b0F. Per the PDS precautions, the MOST CORRECT action is:",
      options: [
        { id: "A", text: "Move the rolls into a shaded location and specifically shade the tape end of each roll until ready to use, because prolonged jobsite storage above 90\u00b0F (32\u00b0C) can affect FAT shelf life" },
        { id: "B", text: "Leave the rolls staged on the rooftop in direct sun; FAT is unaffected by ambient temperature because the tape was bonded to the membrane in a controlled factory environment" },
        { id: "C", text: "Apply primer to the FAT now (while the tape is still cool) to lock in adhesion before the heat exposure begins" },
        { id: "D", text: "Cover the rolls with a dark, heavy tarpaulin to block UV exposure completely, even though the tarpaulin will trap solar heat" }
      ],
      answer: "A",
      explanation: "The PDS gives two specific FAT precautions that together drive this answer. First: membranes with Factory-Applied Tape should NOT be exposed to prolonged jobsite storage temperatures in excess of 90\u00b0F (32\u00b0C), otherwise the shelf life of the tape may be affected. Second: when FAT membranes are used in warm, sunny weather, shade the tape end of the rolls until ready to use. FAT also carries a finite 1-year shelf life, meaning poor jobsite storage decisions chip away at an already bounded window. Leaving the rolls in direct sun violates both precautions. Pre-priming is a splicing step, not a storage protection. Dark, heavy tarpaulin traps solar heat and worsens the problem - the correct cover is shade, not opaque heat-absorbing material.",
      cite: "Carlisle Sure-Seal EPDM Kleen PDS - p. 2, Precautions",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSS-004",
      type: "mcq",
      question: "A building owner asks why the contractor is recommending 90-mil Sure-Seal Kleen Non-Reinforced when 60-mil is also offered, given the price step-up. Based on the PDS 30-Year Warranty discussion, the MOST ACCURATE justification is:",
      options: [
        { id: "A", text: "60-mil is not available in Sure-Seal Kleen Non-Reinforced; only 45-mil and 90-mil are offered, so 90-mil is the only option above 45-mil" },
        { id: "B", text: "The 30-year Sure-Seal EPDM warranty platform is built specifically around the 90-mil membrane combined with enhanced details and accessories, and that platform is also the basis for the optional add-on warranties covering hail, accidental punctures, and wind speeds up to 120 mph" },
        { id: "C", text: "90-mil is required because 60-mil cannot meet UL 2218 Class 4 hail rating" },
        { id: "D", text: "The PDS prohibits 60-mil over fully adhered assemblies, so 90-mil is the only thickness allowed in Design A" }
      ],
      answer: "B",
      explanation: "The PDS describes the 30-year Sure-Seal EPDM platform as a thicker, more durable membrane complemented by enhanced details and accessories, and explicitly identifies 90-mil EPDM as the membrane used for 30-year warranty installations. It also notes that this 30-year system is what makes the optional add-on warranties available - coverage for hail, accidental punctures, and wind speeds up to 120 mph. Sure-Seal Kleen Non-Reinforced is offered in 45-, 60-, AND 90-mil (so option A is factually wrong). UL 2218 Class 4 hail rating is driven by EPDM's elongation and weathering and is not limited to 90-mil (option C overstates the role of thickness). The PDS does NOT prohibit 60-mil from Design A (option D is fabricated). The accurate driver of the recommendation is the warranty platform itself: 90-mil is the gateway to the long-term and add-on warranties.",
      cite: "Carlisle Sure-Seal EPDM Kleen PDS - p. 1, 30-Year Warranty",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSS-005",
      type: "mcq",
      question: "A specifier on a Midwest hail-prone project is choosing between Sure-Seal Kleen Non-Reinforced EPDM and a thicker single-ply alternative that lacks comparable elongation. The owner asks: 'Why does Carlisle's PDS say non-reinforced EPDM achieves a UL 2218 Class 4 hail rating? Doesn't a thicker membrane always win on impact?' Per the PDS, the BEST single-sentence answer is:",
      options: [
        { id: "A", text: "Sure-Seal Kleen Non-Reinforced is fire-retardant, and FR membranes are automatically Class 4-rated under UL 2218" },
        { id: "B", text: "Only the 90-mil thickness of Sure-Seal Kleen Non-Reinforced can earn Class 4; the 45-mil and 60-mil products are limited to Class 1" },
        { id: "C", text: "Class 4 ratings depend solely on the substrate beneath the membrane, not on the membrane itself" },
        { id: "D", text: "Non-reinforced EPDM achieves UL 2218 Class 4 because the membrane's high ultimate elongation (typical 465%, well above the 300% ASTM D412 spec minimum) lets the rubber deform and absorb impact energy without rupturing, and that ductile response combined with weathering resistance is what drives the hail rating" }
      ],
      answer: "D",
      explanation: "The PDS connects hail resistance specifically to elongation and weathering rather than thickness alone. It cites EPDM's typical 465% ultimate elongation (per ASTM D412, vs a 300% spec minimum) and 41,480 kJ/m\u00b2 of total radiant exposure without cracking or crazing as the technical drivers of superior hail damage resistance (UL 2218 Class 4 rating). Thickness is part of the 30-year warranty platform discussion but is not the primary mechanism behind the Class 4 rating - ductility is. Fire-retardant formulation is a separate code-compliance attribute unrelated to hail testing. Substrate matters to total assembly performance but does not by itself confer the membrane's own UL 2218 rating. And the PDS does not restrict Class 4 to a single thickness in this product family.",
      cite: "Carlisle Sure-Seal EPDM Kleen PDS - p. 1, Features and Benefits (UL 2218 Class 4)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSS-006",
      type: "mcq",
      question: "A crew is installing 60-mil Sure-Seal Kleen Non-Reinforced over mechanically attached polyiso insulation in a Design A (Fully Adhered) assembly. The substrate and the underside of the membrane have both been coated with the appropriate Carlisle bonding adhesive within the open-time window. The crew rolls the membrane into place and immediately moves to the next sheet to keep the schedule. Per the PDS Design A procedure, what is the MOST IMPORTANT step being skipped?",
      options: [
        { id: "A", text: "No step is being skipped; rolling the membrane into place is the final step of Design A adhesion" },
        { id: "B", text: "Mechanical fasteners must be installed through the membrane to complete the Design A adhesion process" },
        { id: "C", text: "The membrane must be broomed down after being rolled into place - bonding adhesive achieves a continuous, void-free bond only when the membrane is intimately pressed into the adhesive layer to expel trapped air and ensure full contact" },
        { id: "D", text: "The seams must be heat-welded with a hot-air gun before brooming, because EPDM seams cannot be completed any other way" }
      ],
      answer: "C",
      explanation: "The PDS Design A procedure is explicit: insulation is mechanically fastened or adhered to the deck, then substrate and membrane are coated with the appropriate Carlisle bonding adhesive, AND the membrane is rolled into place AND broomed down. Brooming is the step that converts an as-laid sheet into a continuously bonded membrane by forcing the EPDM into the adhesive and pushing out trapped air. Skipping it leaves voids that become wind-uplift initiation points and visible blisters over time. Mechanical fasteners are NOT installed through the membrane in Design A (fasteners go through the insulation only). EPDM is not heat-welded the way TPO or PVC is; EPDM seams are completed with primer plus Factory-Applied Tape or hand-applied SecurTAPE.",
      cite: "Carlisle Sure-Seal EPDM Kleen PDS - p. 2, Installation (Design A)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const CARLISLE_SURE_SEAL_EPDM_KLEEN_QUESTION_BANK_2026 = {
  ...CARLISLE_SURE_SEAL_EPDM_KLEEN_QUESTION_BANK_2026_RAW,
  questions: CARLISLE_SURE_SEAL_EPDM_KLEEN_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = CARLISLE_SURE_SEAL_EPDM_KLEEN_QUESTION_BANK_2026;
