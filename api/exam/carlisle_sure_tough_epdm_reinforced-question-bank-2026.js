// Carlisle Sure-Tough EPDM Reinforced - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF (internal only, never served via /api/book or /api/books):
//   sources/manufacturers/carlisle/pds/2025-07-sure-tough-epdm-reinforced-pds.pdf
// Per-question provenance lives in:
//   sources/manufacturers/carlisle/citations.json
//
// Question authoring target was 7 (the honest expert-level capacity of this
// 2-page PDS, agreed with product owner). Every question is scenario-based,
// derived from PDS facts, and paraphrased - no marketing prose copied
// verbatim. Concepts that overlap with the Sure-Seal PDS (cold-weather
// splicing, 90F jobsite-storage rule) are intentionally NOT repeated here;
// they are asked once, in the Sure-Seal bank.

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

const CARLISLE_SURE_TOUGH_EPDM_REINFORCED_QUESTION_BANK_2026_RAW = {
  book: "Carlisle Sure-Tough EPDM Reinforced",
  questions: [
    {
      id: "CARST-001",
      type: "mcq",
      question: "A contractor is bidding two similar warehouse projects with foot-traffic-heavy HVAC zones on the rooftop. The specifier asks: 'Given Sure-Seal Kleen Non-Reinforced is meaningfully cheaper per square foot than Sure-Tough Reinforced, why specify Sure-Tough at all?' Per the Sure-Tough EPDM Reinforced PDS, the BEST justification is:",
      options: [
        { id: "A", text: "Sure-Tough's internal polyester reinforcement provides ~60% greater resistance to punctures (per ASTM D5635 and Federal Method 2031) compared to non-reinforced membranes, directly addressing maintenance-traffic risk on rooftop HVAC zones, and is backed by Carlisle's longest puncture warranty" },
        { id: "B", text: "Sure-Tough has a deeper black color that absorbs more solar heat, which lowers heating costs in cold climates" },
        { id: "C", text: "Sure-Tough is a fluid-applied (liquid) system whereas Sure-Seal Kleen is sheet-applied, making cleanup faster" },
        { id: "D", text: "Sure-Tough seams require no primer because the polyester scrim provides chemical adhesion at the splice" }
      ],
      answer: "A",
      explanation: "The PDS explicitly states the puncture advantage: \"60% greater resistance to punctures (as measured by ASTM D5635 and Federal Method 2031) compared to non-reinforced membranes,\" and that the product is \"backed by the industry's longest puncture warranty.\" The mechanism is the embedded polyester scrim, which distributes point loads from foot traffic, dropped tools, and gravel kicked across the membrane during maintenance visits. The other options are fabrications: both products are EPDM SHEET membranes (not fluid-applied), the dark-EPDM cold-climate logic applies to non-reinforced Sure-Seal Kleen as well (not a Sure-Tough differentiator), and Sure-Tough seams use the SAME primer + Factory-Applied Tape (or hand-applied SecurTAPE) approach as Sure-Seal Kleen - the scrim does not eliminate the primer step.",
      cite: "Carlisle Sure-Tough EPDM Reinforced PDS - p. 1, Features and Benefits",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARST-002",
      type: "mcq",
      question: "A property owner of a mixed-use building with apartments directly under the roof deck asks the contractor to use a mechanically fastened Sure-Tough EPDM assembly (Design MFS) to keep installation labor low. Per the Sure-Tough PDS, what is a SPECIFIC installation-time consideration the contractor should disclose BEFORE the owner signs off on MFS?",
      options: [
        { id: "A", text: "MFS designs require every fastener to be installed dipped in primer to seal the puncture point" },
        { id: "B", text: "The PDS notes that 'sheet flutter/noise may occur on mechanically fastened systems' - on a building with occupied space directly under the roof deck, particularly residential, this can produce acoustic complaints from tenants during wind events; offering a Fully Adhered (Design A) alternative is part of the contractor's professional duty in this scenario" },
        { id: "C", text: "MFS designs cannot be used with the 75-mil membrane thickness" },
        { id: "D", text: "MFS designs require a 30-year warranty deposit at the time of contract signing" }
      ],
      answer: "B",
      explanation: "The PDS contains a specific installation note for MFS systems: \"Sheet flutter/noise may occur on mechanically fastened systems.\" On occupied space directly below the deck - particularly residential - this can translate into tenant complaints during high-wind events as the membrane lifts and slaps between fastener rows. Disclosing this upfront and offering a Fully Adhered (Design A) alternative is part of the contractor's professional duty. The other options are fabricated: there is no fastener-primer requirement, MFS supports all three Sure-Tough thicknesses (45, 60, 75 mil), and there is no warranty deposit prerequisite anywhere in the PDS.",
      cite: "Carlisle Sure-Tough EPDM Reinforced PDS - p. 2, Installation (MFS/MR sheet flutter note)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARST-003",
      type: "mcq",
      question: "A reviewer is comparing the Typical Properties tables for Sure-Tough EPDM at 45-mil, 60-mil, and 75-mil. The PDS shows 'Thickness Over Scrim' (TOS) minimums of 0.015 in. (0.381 mm) for the 45- and 60-mil membranes but 0.032 in. (0.81 mm) for the 75-mil membrane. A junior estimator concludes that 'TOS scales linearly with overall thickness.' What is the CORRECT interpretation per the PDS?",
      options: [
        { id: "A", text: "The PDS confirms TOS scales linearly with thickness; the 0.032 value for 75-mil is a printing variant that should be averaged with the 0.015 values" },
        { id: "B", text: "TOS represents the thickness of the bonding adhesive applied during install, not the membrane material" },
        { id: "C", text: "The Carlisle PDS uses TOS as a measure of weathering-package thickness that is independent of the membrane's nominal mil rating" },
        { id: "D", text: "TOS measures the EPDM material above the internal polyester scrim; the 75-mil version carries roughly DOUBLE the TOS of the 45/60-mil versions (0.032 in. vs 0.015 in. typical) - a non-linear step that gives the 75-mil product a disproportionately greater material reservoir above the scrim, which translates into longer service life under foot traffic and weathering before the scrim is exposed" }
      ],
      answer: "D",
      explanation: "TOS - Thickness Over Scrim - measures only the EPDM material above the internal polyester reinforcement. The 45-mil and 60-mil Sure-Tough membranes share a 0.015 in. minimum TOS (typical 0.016 / 0.020 in.), while the 75-mil membrane jumps to 0.032 in. typical - more than DOUBLE the TOS of the 60-mil. That is a deliberate, non-linear design choice that protects the scrim with substantially more wear material on the heaviest product, directly extending service life under foot traffic and weathering. The wrong options invert what TOS represents (it is not adhesive, not a separate weathering-package marker independent of mil) and ignore the explicit published values in the PDS.",
      cite: "Carlisle Sure-Tough EPDM Reinforced PDS - p. 2, Typical Properties and Characteristics (Thickness Over Scrim)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARST-004",
      type: "mcq",
      question: "A specifier writing a roof spec for a museum addition wants Carlisle Sure-Tough 60-mil but is unsure how to reference the product in the project manual. The PDS notes Sure-Tough 'meets or exceeds the minimum requirements set forth by ASTM D4637 for Type II reinforced EPDM single-ply roofing membranes.' For the spec writer, what does the ASTM D4637 Type II designation MOST IMPORTANTLY signal to a downstream reviewer?",
      options: [
        { id: "A", text: "Type II means the membrane uses a non-halogenated flame retardant" },
        { id: "B", text: "Type II identifies the product as a REINFORCED EPDM membrane (vs Type I non-reinforced) under the same governing standard - which signals that the product is dimensioned, tested, and rated against the criteria appropriate for scrim-reinforced single-ply EPDM (for example, Breaking Strength replaces Tensile Strength as the primary failure measure) rather than the non-reinforced criteria" },
        { id: "C", text: "Type II means the membrane is suitable only for slopes greater than 3 inches per foot" },
        { id: "D", text: "Type II is a sustainability designation tied to recycled content thresholds (pre-consumer plus post-consumer)" }
      ],
      answer: "B",
      explanation: "ASTM D4637 is the governing material standard for non-reinforced and scrim-reinforced EPDM single-ply roofing membranes. Type I covers non-reinforced (e.g., Sure-Seal Kleen) and Type II covers reinforced (e.g., Sure-Tough). When a spec writer references Type II, they signal that the product is qualified, dimensioned, and tested against the reinforced-product criteria - which differ in important ways from Type I. For example, the PDS reports Breaking Strength (ASTM D751 Grab Method) as the failure measure rather than Tensile Strength (D412), because the scrim, not the rubber alone, carries the load. Flame retardant chemistry, slope eligibility, and recycled content are independent attributes not encoded in the Type designation.",
      cite: "Carlisle Sure-Tough EPDM Reinforced PDS - p. 2, Typical Properties (ASTM D4637 Type II)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARST-005",
      type: "mcq",
      question: "A quality reviewer notices that the Sure-Tough Typical Properties table reports 'Breaking Strength, min, lbf (N)' tested per ASTM D751 (Grab Method) - whereas the Sure-Seal Kleen Non-Reinforced PDS reports 'Tensile Strength, min, psi (MPa)' tested per ASTM D412 with a Die C specimen. What is the BEST explanation for why the two PDS documents use different test methods on the two product families?",
      options: [
        { id: "A", text: "Carlisle considers ASTM D412 obsolete and is phasing it out; the next revision of the Sure-Seal Kleen PDS will adopt D751" },
        { id: "B", text: "Both methods produce numerically equivalent results; the choice between them is editorial preference at the PDS authoring step" },
        { id: "C", text: "Reinforced products report Breaking Strength via the Grab Method (ASTM D751) because the property being measured is the whole composite (rubber + scrim) failing together - a 'grab' of the full sheet - while non-reinforced products report Tensile Strength via Die C (ASTM D412) because that test measures the rubber compound itself; the relevant failure mode is fundamentally different between Type I and Type II EPDMs" },
        { id: "D", text: "The Grab Method is used because reinforced EPDM is too thick to fit in a Die C jig" }
      ],
      answer: "C",
      explanation: "For a non-reinforced (Type I) EPDM, the rubber matrix IS the load-carrying element; ASTM D412 with a Die C specimen measures the rubber compound's tensile strength and ultimate elongation - direct properties of the polymer. For a reinforced (Type II) EPDM, the load is shared with the polyester scrim and the failure mode is composite rupture, so ASTM D751 Grab Method is the appropriate test - it pulls a strip of the whole assembly and reports breaking force in lbf, not pure-rubber psi. Choosing the wrong test for the wrong product type produces meaningless cross-product comparisons. The PDS using different methods is not editorial preference; it is the correct test for each product family. Specimen-jig fit and PDS-revision timing are unrelated.",
      cite: "Carlisle Sure-Tough EPDM Reinforced PDS - p. 2, Typical Properties (Breaking Strength, ASTM D751)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARST-006",
      type: "mcq",
      question: "A project specification calls for an enhanced wind-uplift rating in the perimeter zone of a mechanically fastened Sure-Tough EPDM roof. The contractor wants to install the same 10-ft Sure-Tough field sheets across the entire roof, including the perimeter, to reduce labor and minimize roll counts. Per the Sure-Tough PDS, what is the CORRECT response?",
      options: [
        { id: "A", text: "10-ft field sheets cannot be installed on any portion of any Sure-Tough roof; the maximum sheet width is 6.5 ft" },
        { id: "B", text: "10-ft sheets are acceptable everywhere because the polyester scrim makes sheet width irrelevant for uplift performance" },
        { id: "C", text: "Carlisle offers Sure-Tough in 5-ft (1.5 m) and 6.5-ft (1.98 m) widths described in the PDS as 'ideal for use as perimeter sheets and to achieve certain uplift ratings' in 45- and 60-mil thicknesses; using narrower perimeter sheets brings the fastener rows closer together in the high-load corner/edge zones, which is how enhanced uplift ratings are commonly satisfied on MFS assemblies" },
        { id: "D", text: "Carlisle requires 5-ft sheets only on roofs over 100,000 sq ft, regardless of zone" }
      ],
      answer: "C",
      explanation: "The PDS explicitly identifies the 5-ft and 6.5-ft widths as perimeter-sheet products intended to help achieve specific uplift ratings (in the 45- and 60-mil thicknesses). The mechanism is fastener density: a narrower sheet means more fastener rows per linear foot in the perimeter, which is the zone where wind uplift loads are highest. Installing 10-ft field sheets across the perimeter compromises the wind-uplift rating because the fastener row spacing widens. The 100,000 sq ft threshold (option D) is fabricated; option B ignores how MFS uplift is engineered; option A misstates the maximum width (10-ft and even wider field sheets are standard in the product line).",
      cite: "Carlisle Sure-Tough EPDM Reinforced PDS - p. 1, Overview (5-ft and 6.5-ft perimeter sheets)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARST-007",
      type: "mcq",
      question: "A spec reviewer notices the Sure-Tough PDS states the membranes meet or exceed UL Class A requirements 'for slopes up to 3 inches per foot (76.2 mm), depending on the assembly.' A contractor proposes a Sure-Tough installation on a section of roof that pitches at 4 inches per foot. Per the PDS, what is the CORRECT response?",
      options: [
        { id: "A", text: "The PDS's UL Class A statement covers slopes only up to 3 inches per foot; a 4-inch-per-foot slope is outside the cited assembly conditions, so the contractor must verify Class A compliance under a different assembly listing - or substitute a product family explicitly rated at the steeper slope - before proceeding" },
        { id: "B", text: "UL Class A applies at any slope because EPDM is inherently fire-resistant" },
        { id: "C", text: "The Sure-Tough 75-mil thickness automatically extends UL Class A coverage to 6 inches per foot, so the 4-inch-per-foot installation is allowed in the 75-mil product" },
        { id: "D", text: "UL Class A is irrelevant on slopes above 1 inch per foot because the fire-test conditions assume low-slope only" }
      ],
      answer: "A",
      explanation: "The PDS is precise: \"meet or exceed UL Class A requirements for slopes up to 3 inches per foot (76.2 mm), depending on the assembly.\" Two things matter: (1) the 3-inch limit, which a 4-inch slope exceeds, and (2) 'depending on the assembly,' which signals that fire rating is assembly-dependent (deck type, insulation type, attachment design), not membrane-dependent. A specifier confronted with a 4-inch-per-foot slope cannot assume Class A automatically applies; the listing must be verified against the steeper-slope assembly OR a product family with explicit Class A coverage at that slope must be substituted. Thickness alone does not extend the slope envelope (option C is fabricated), and the test conditions for UL Class A are not slope-irrelevant (option D inverts the standard's logic).",
      cite: "Carlisle Sure-Tough EPDM Reinforced PDS - p. 1, Overview (UL Class A up to 3-inch slope)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const CARLISLE_SURE_TOUGH_EPDM_REINFORCED_QUESTION_BANK_2026 = {
  ...CARLISLE_SURE_TOUGH_EPDM_REINFORCED_QUESTION_BANK_2026_RAW,
  questions: CARLISLE_SURE_TOUGH_EPDM_REINFORCED_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = CARLISLE_SURE_TOUGH_EPDM_REINFORCED_QUESTION_BANK_2026;
