// Carlisle Sure-Flex PVC Field Install - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF (internal only, never served via /api/book or /api/books):
//   sources/manufacturers/carlisle/install-guides/2023-09-carlisle-thermoplastics-field-guide.pdf
// Per-question provenance lives in:
//   sources/manufacturers/carlisle/citations.json
//
// Question authoring target was 10 (the honest expert-level capacity of the
// Sure-Flex PVC portion of the Field Guide, agreed with product owner).
// Every question is scenario-based, derived from the Field Guide install
// procedures, and paraphrased - no marketing prose copied verbatim.
//
// Scope discipline vs the companion TPO Field Install bank:
//   - This bank does NOT repeat concepts that already live in the TPO bank
//     when the source rule is identical for both products (e.g., test welds
//     twice daily on like membrane over same substrate; 24-hour seam-cleaning
//     rule; membrane securement at perimeters/curbs/skylights/expansion
//     joints/2-in-12 angle changes; penetration securement MFS-vs-adhered
//     thresholds). Those are covered in the TPO bank.
//   - PVC questions focus on rules that DIFFER materially from TPO:
//     PVC Membrane Cleaner flash-off, PVC auto-welder starting parameters,
//     PVC bleed-out interpretation (proper weld indicator vs TPO defect),
//     aged-PVC bottom-side weld fallback, PVC seam-probe tip geometry, and
//     PVC-specific cleaner selection.

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

const CARLISLE_SURE_FLEX_PVC_FIELD_INSTALL_QUESTION_BANK_2026_RAW = {
  book: "Carlisle Sure-Flex PVC Field Install",
  questions: [
    {
      id: "CARPV-001",
      type: "mcq",
      question: "A crew is cleaning a Sure-Flex PVC seam with PVC Membrane Cleaner and the foreman pressures the lead welder to start welding right away because the crew is behind schedule. The lead welder pushes back. Per the Field Guide's PVC cold-weld guidance in Section 4, what is the documented flash-off requirement, and what is the long-term failure mode if it is rushed?",
      options: [
        { id: "A", text: "Allow the PVC Membrane Cleaner solvents to thoroughly flash off (up to 15 minutes) before welding; rushing the flash-off can produce a cold weld - a weld that is not properly fused and that lets the weld area SEPARATE later as the roof goes through natural thermal expansion and contraction" },
        { id: "B", text: "Wipe the cleaner residue with a dry rag and weld immediately; the rag removes the solvent and the weld is ready" },
        { id: "C", text: "Allow exactly 60 seconds of flash-off; the cleaner is fast-evaporating and longer waits introduce dust contamination" },
        { id: "D", text: "PVC Membrane Cleaner does not require any flash-off period; the heat from the welder drives off the solvent during the weld pass" }
      ],
      answer: "A",
      explanation: "Section 4: 'When cleaning PVC it is important to allow the solvents from the PVC Membrane Cleaner to thoroughly flash-off prior to welding. This will take up to 15 minutes to occur. If this procedure is rushed the PVC membrane may exhibit cold welding. Cold welding is defined as a weld that is not properly fused together, allowing the weld area to separate after natural expansion and contraction occurs in the roofing system.' The key insight for an installer is that a cold weld can LOOK fine on installation day - it only fails after the roof has gone through some thermal cycles, by which time the crew is long gone and the membrane is delaminating along the lap. Option B (wipe with a dry rag) doesn't address the solvent inside the surface chemistry of the membrane. Option C invents a 60-second rule the document doesn't state. Option D is dangerous - welding into solvent-wet PVC is exactly the cold-weld failure mechanism the Field Guide warns against.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (Reduce the chance for cold welds on PVC membranes)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-002",
      type: "mcq",
      question: "A crew that previously did mostly Sure-Weld TPO work is moving to a Sure-Flex PVC project. The lead welder pulls out the TPO starting parameters and is about to dial in 1,000 F at 12 ft/min, 100 percent airflow on the auto-welder. The job superintendent stops him. Per the Field Guide's Section 4 starting reference for Sure-Flex PVC on auto-welders, what should the welder dial in instead?",
      options: [
        { id: "A", text: "1,000 F at 12 ft/min, 100 percent airflow - PVC and TPO are both thermoplastics, so the same starting reference applies" },
        { id: "B", text: "1,094 F at 8.9 ft/min as a generic Sure-Flex PVC starting point for all thicknesses; if using the Leister V-2 welder specifically, the speed can be utilized up to 10.2 ft/min" },
        { id: "C", text: "1,200 F at 6 ft/min - PVC is denser than TPO so it always needs more heat and a slower pass" },
        { id: "D", text: "900 F at 9.5 ft/min, 100 percent airflow - the smoke-reduction setting because PVC produces more visible smoke than TPO" }
      ],
      answer: "B",
      explanation: "Section 4 of the Field Guide gives a PVC-specific generic starting point: 'A good starting point for welding all types and thickness of Sure-Flex PVC on auto-welders is 1,094 F at 8.9 ft/min. Using the Leister V-2 welder the speed can be utilized up to 10.2 ft/min.' Compare this to the TPO baseline (1,000 F at 12 ft/min, 100 percent airflow) - the PVC needs more heat AND a slower pass, because the chemistry is different. Option A imports the TPO parameters and will produce cold welds on PVC. Option C overstates - the Field Guide does not require 1,200 F or 6 ft/min as a starting baseline. Option D refers to the Smoke Reduction Welding setting (a specialized low-smoke configuration shown in the p. 35 chart), not the documented general-purpose starting point.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (PVC auto-welder starting parameters)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-003",
      type: "mcq",
      question: "A foreman who has spent his whole career on Sure-Weld TPO is inspecting his first Sure-Flex PVC seam. He sees a thin dark line of darker bottom material that has flowed slightly out from the overlap step-off. On TPO he knows that bleed-out means an OVERHEATED defect that needs a non-reinforced flashing patch. Per the Field Guide, what should he conclude about this PVC seam?",
      options: [
        { id: "A", text: "The PVC seam is overheated (same indicator as TPO) and needs a non-reinforced flashing patch overlay" },
        { id: "B", text: "The PVC seam is under-heated; bleed-out on PVC means the welder ran too cold and the top ply didn't fully bond" },
        { id: "C", text: "On Sure-Flex PVC, a little bit of bleed-out at the overlap step-off is actually the indicator of a PROPER weld (bleed-out on PVC is the darker bottom ply starting to flow from the heat melting the sheet); the visual diagnostic is INVERTED relative to TPO and this seam should be accepted" },
        { id: "D", text: "Bleed-out is meaningless on PVC because PVC chemistry doesn't allow surface flow at any temperature" }
      ],
      answer: "C",
      explanation: "Section 4: 'A proper weld for PVC will exhibit a little bit of bleed-out at the overlap step-off. Bleed-out is when the darker bottom ply actually starts to flow from the heat melting the sheet.' This is the OPPOSITE interpretation from TPO, where the same section says 'Overheating of welds is evident when bleed-out occurs.' The two chemistries respond differently to heat: on TPO the bleed-out indicates the membrane has been driven past the design weld temperature; on PVC a small amount of bleed-out at the step-off is the indicator that the bond zone reached the proper fusion temperature. The trap for cross-trained foremen is exactly this seam: they see bleed-out and reach for a patch, when the right call is to accept the seam. Option A imports the TPO rule and would damage a sound PVC seam. Option B inverts the rule incorrectly. Option D is contradicted by the Field Guide's explicit definition of bleed-out on PVC.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (PVC bleed-out as proper-weld indicator)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-004",
      type: "mcq",
      question: "A re-roof crew is patching into an EXISTING Sure-Flex PVC roof that is about 6 years old. Initial test welds on the top surface of the aged sheet fail repeatedly - the bond is not achieving proper fusion despite correct welder settings and proper PVC Membrane Cleaner flash-off. Per the Field Guide's guidance for PVC membranes 5-7 years and older, what is the documented field workaround?",
      options: [
        { id: "A", text: "Cut out the aged PVC entirely and bond a fresh PVC strip to the substrate before any tie-in welding" },
        { id: "B", text: "Apply heat aging primer (an EPDM primer technology) to restore the surface chemistry" },
        { id: "C", text: "Increase the auto-welder temperature by 200 F above the published PVC starting point until a proper weld is achieved" },
        { id: "D", text: "Utilize the BOTTOM side of the aged sheet (the side that has not seen weathering and is generally more stable for welding); the Field Guide notes welding PVC 5-7 years and older may be difficult on the weathered top side, and the unweathered bottom side is the documented fallback" }
      ],
      answer: "D",
      explanation: "Section 4: 'Welding PVC membranes that are 5-7 years or older category may be difficult to achieve proper fusion. You may have to utilize the bottom side of the older sheet that has not seen weathering and is generally more stable for welding.' The why-it-works: PVC weathers from the top down - UV exposure, plasticizer migration, and oxidative loss happen at the exposed surface, while the underside (which has been protected against the substrate) retains its original chemistry. Flipping a section of aged sheet exposes a fresh surface that welds the way a younger PVC sheet would. Option A (cut out and bond) is much more invasive than the Field Guide's prescribed method. Option B borrows an EPDM-splicing primer that is not a PVC technology. Option C is dangerous - over-heating PVC by 200 F above the baseline causes scorching, bleed-out distortion, and scrim damage; it does not solve the chemistry problem.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (aged PVC welding)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-005",
      type: "mcq",
      question: "A crew that has done TPO work for years is now probing Sure-Flex PVC seams for the first time. They reach for the same TPO seam-probe tool they have always used. Per the Field Guide's PVC seam-probing guidance in Section 4, what TWO things must be different when probing PVC versus TPO?",
      options: [
        { id: "A", text: "The PVC membrane must be THOROUGHLY COOLED before probing, AND the probe-tip geometry must be DULLER and FLATTER than a TPO probe tip; the duller/flatter tip protects the PVC membrane from being scored by the same sharper TPO probe" },
        { id: "B", text: "The membrane must be probed while it is still warm to detect cold welds, AND a sharper TPO-style probe must be used to ensure the probe finds any deficiency" },
        { id: "C", text: "PVC probing is identical to TPO probing - same tool, same timing, same technique" },
        { id: "D", text: "PVC seams should not be probed at all because PVC self-heals minor weld voids during thermal cycling" }
      ],
      answer: "A",
      explanation: "Section 4: 'When probing PVC make sure the membrane is thoroughly cooled. Proceed with probing making sure the probe point is duller and has a flatter point compared to TPO probing.' Two distinct PVC-specific requirements: (1) the membrane must be thoroughly cooled before probing - the same cooling-discipline principle as TPO (no probing of warm-plastic seams), and (2) the PROBE GEOMETRY is different: a duller/flatter tip is documented for PVC versus TPO. The reason for the duller tip is that PVC surface chemistry is more vulnerable to being scored by a sharp metal point; a TPO-style sharp tip can leave a small surface gouge in PVC that becomes a long-term failure initiation site. Option B inverts both rules. Option C ignores the documented chemistry-specific tool difference. Option D is wrong - the Field Guide explicitly tells crews to probe PVC seams, with the corrected tool, throughout the day.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (PVC seam probing)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-006",
      type: "mcq",
      question: "A specifier is choosing between Sure-Flex PVC and Sure-Flex KEE HP for a large-footprint warehouse. The owner has selected Slate Gray as the membrane color. The specifier needs to know which Sure-Flex products are available in the requested color and what widths each product offers so the seam layout can be planned. Per the Section 1 product-family descriptions in the Field Guide, which combination is correct?",
      options: [
        { id: "A", text: "Slate Gray is available in both Sure-Flex PVC and Sure-Flex KEE HP, and both products are offered in 40.5\", 5', 81\", and 10' widths" },
        { id: "B", text: "Slate Gray is available in Sure-Flex PVC ONLY (not in Sure-Flex KEE HP); Sure-Flex PVC is offered in 40.5\", 5', 81\", and 10' widths while Sure-Flex KEE HP is offered only in 5' and 10' widths; both products are available in 50, 60, and 80 mil thicknesses" },
        { id: "C", text: "Sure-Flex KEE HP is available in 40.5\" widths only because the higher-performance HP polymer is harder to extrude wide; Slate Gray is exclusive to KEE HP" },
        { id: "D", text: "Width and color selection is identical between Sure-Flex PVC and Sure-Flex KEE HP; the only difference is the price point" }
      ],
      answer: "B",
      explanation: "Section 1 of the Field Guide describes the two product families separately. Sure-Flex PVC Mechanically Fastened: White, Gray, Tan, Light Gray, and Slate Gray colors; 40.5\", 5', 81\", and 10' widths; 50, 60, and 80 mil thicknesses. Sure-Flex KEE HP Mechanically Fastened: White, Gray, Tan, and Light Gray colors (NOT Slate Gray); 5' and 10' widths only; same 50/60/80 mil thicknesses. The width difference matters for seam-layout planning: a building with 81\" planned coursing simply cannot be done in Sure-Flex KEE HP without re-coursing. The color difference matters for owner-requested aesthetics: if the owner wants Slate Gray, the project goes to Sure-Flex PVC by definition. Option A overstates KEE HP's options. Option C reverses the width relationship. Option D ignores the documented per-product differences.",
      cite: "Carlisle Thermoplastics Field Guide - p. 1-2, Section 1 - Description of Systems (Sure-Flex PVC and Sure-Flex KEE HP product families)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-007",
      type: "mcq",
      question: "A roof maintenance technician needs to clean general traffic grime and footprints off the surface of a Sure-Flex PVC roof at the end of a job. The shop has both Weathered Membrane Cleaner (used on Sure-Weld TPO) and PVC Membrane Cleaner on the truck. Per the Field Guide's Section 7 Clean Up procedure, which cleaner should be used on Sure-Flex membrane, and why does the chemistry-specific selection matter?",
      options: [
        { id: "A", text: "Either cleaner is acceptable on either chemistry; both are thermoplastic-rated and interchangeable" },
        { id: "B", text: "Weathered Membrane Cleaner; it is the strongest cleaner and works on all single-ply membranes" },
        { id: "C", text: "PVC Membrane Cleaner is documented for cleaning the surface of Sure-Flex Membrane in Section 7 Clean Up; Weathered Membrane Cleaner is documented for Sure-Weld Membrane. The cleaner is selected for chemical compatibility with the membrane surface - using the wrong-chemistry cleaner risks attacking the membrane surface or under-performing on contamination removal" },
        { id: "D", text: "Neither product should be used on the surface of an installed roof - both are weld-prep solvents only; only soapy water and clean-water rinse may be used post-installation" }
      ],
      answer: "C",
      explanation: "Section 7 Clean Up: 'For Sure-Weld membrane, Weathered Membrane Cleaner can be used to clean the surface of the membrane. For Sure-Flex Membrane, PVC Membrane Cleaner can be used to clean the surface of the membrane.' The Field Guide pairs each cleaner with each chemistry deliberately. Beyond the documented pairing, the underlying logic is that PVC plasticizers and TPO chemistry respond differently to different solvent systems: the chemistry-matched cleaner is engineered for surface compatibility with that membrane. Option A understates the chemistry-specific design of each cleaner. Option B applies the TPO cleaner to PVC; Option D over-restricts (soapy water and rinse is one option, but the Field Guide also explicitly approves PVC Membrane Cleaner on PVC and Weathered Membrane Cleaner on TPO).",
      cite: "Carlisle Thermoplastics Field Guide - p. 93, Section 7 - Daily Procedures (Clean Up)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-008",
      type: "mcq",
      question: "A QA inspector cuts a test-weld coupon across a Sure-Flex PVC seam, lets it cool for about 10 minutes, and pulls it apart to verify weld quality. He sees the membrane separating in plies and exposing the scrim reinforcement. The newer crew assumes the weld failed because something is delaminating. Per the Field Guide's Section 7 Test Welds procedure, what does this PULL-APART OBSERVATION actually indicate?",
      options: [
        { id: "A", text: "Yes, the weld failed - any delamination during a peel test indicates a bad weld and the seam must be cut out and re-welded" },
        { id: "B", text: "Inconclusive - the test must be repeated after 24 hours of full cure before any conclusion can be drawn" },
        { id: "C", text: "The 10-minute cool-down was too short; the test is invalid and should be re-cut after waiting 30 minutes" },
        { id: "D", text: "Delamination of the MEMBRANE FROM THE SCRIM REINFORCEMENT is the documented INDICATOR OF A PROPERLY WELDED SEAM - the seam itself held, so the failure path moved INTO the membrane body itself, demonstrating that the welded lap is stronger than the membrane scrim bond. The test passed" }
      ],
      answer: "D",
      explanation: "Section 7 Test Welds: 'Peel the test sample apart after it has thoroughly cooled (approximately 10 minutes) and examine for a consistent 1.5 inch wide minimum weld. Delamination of the membrane from the scrim-reinforcement is an indication of a properly welded seam.' This is one of the most counter-intuitive ideas for new crews: a 'good' test result is when the test coupon TEARS in its body (membrane peeling away from the internal scrim) rather than separating at the welded lap. The reasoning is that a properly fused weld is now STRONGER than the bond between membrane plies and the scrim - so when you peel the coupon, the weak link is no longer the weld; it's the membrane itself. Option A misreads the delamination signal as a defect. Option B introduces a 24-hour wait that the Field Guide does not require. Option C invents a 30-minute test-weld cool-down (Section 7 Test Welds specifies approximately 10 minutes for the test-coupon peel; the 30-minute figure applies separately to the Daily Procedures Seam Probing protocol, not the test-weld peel test).",
      cite: "Carlisle Thermoplastics Field Guide - p. 93, Section 7 - Daily Procedures (Test Welds)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-009",
      type: "mcq",
      question: "A welder running Sure-Flex PVC on an auto-welder pauses and notices that the membrane is starting to show a faint discoloration / scorching at the edge of the weld track. Per the Field Guide's Section 7 Test Welds seam-quality troubleshooting, what is the diagnostic, and what are the documented corrective adjustments?",
      options: [
        { id: "A", text: "Discolored or scorched membrane indicates over-heating at the weld track. The documented corrections are to either INCREASE THE SPEED or DECREASE THE TEMPERATURE SETTING - both move the operating point away from the over-heating regime" },
        { id: "B", text: "Discoloration is normal during the first 100 feet of weld production as the auto-welder reaches steady-state; no adjustment is needed" },
        { id: "C", text: "The correct response is to INCREASE the temperature; discoloration means the membrane was not yet at full fusion temperature and the visible color change is normal heat-affected zone" },
        { id: "D", text: "Stop work, abandon the auto-welder, and hand-weld the remainder of the project; auto-welders are not reliable on PVC" }
      ],
      answer: "A",
      explanation: "Section 7 Test Welds, seam-quality troubleshooting: 'Discolored or scorched membrane - Increase speed or decrease temperature setting if membrane discolors.' Both adjustments reduce the heat that the membrane absorbs per unit length: increasing the speed shortens the dwell time at temperature, and decreasing the temperature setting reduces the energy delivered. Either change pulls the operating point back from the over-heating regime. The welder picks whichever adjustment fits the welder model and the current seam-width target. Option B rationalizes an actual defect as 'normal warm-up.' Option C inverts the correction and would burn through the membrane and damage the scrim. Option D over-reacts - the Field Guide documents the corrective adjustment, not abandonment of the equipment.",
      cite: "Carlisle Thermoplastics Field Guide - p. 93-94, Section 7 - Daily Procedures (Test Welds, seam-quality troubleshooting)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARPV-010",
      type: "mcq",
      question: "A re-roof bid is going over an existing METAL roof using Sure-Flex PVC. The specifier is finalizing the Carlisle attachment design. Per the Field Guide's Section 1 description of the Sure-Flex PVC and KEE HP Metal Retrofit Mechanically Fastened Roofing System, what are the TWO documented installation options, and how does this differ from the Sure-Weld TPO Metal Retrofit system?",
      options: [
        { id: "A", text: "Both Sure-Flex PVC Metal Retrofit and Sure-Weld TPO Metal Retrofit use the same two options: PS RUSS Strip (Option 1) and Linear Induction Welded (Option 2)" },
        { id: "B", text: "The Sure-Flex PVC and KEE HP Metal Retrofit MFS system documents two options: Option 1 - HALF SHEETS, and Option 2 - LINEAR INDUCTION WELDED. The Sure-Weld TPO Metal Retrofit system also offers Linear Induction Welded as Option 2 but its Option 1 is a PS RUSS Strip rather than Half Sheets - the Option 1 method is product-family-dependent" },
        { id: "C", text: "Sure-Flex PVC Metal Retrofit is only available as a fully-adhered system; mechanically fastened metal retrofit is reserved for TPO" },
        { id: "D", text: "Sure-Flex PVC Metal Retrofit MFS uses only Option 1 (Half Sheets); the Linear Induction Welded option applies to Sure-Weld TPO only" }
      ],
      answer: "B",
      explanation: "Section 1 lists the Sure-Flex PVC and KEE HP Metal Retrofit Mechanically Fastened Roofing System with two explicit options: 'Option 1 - Half Sheets' and 'Option 2 - Linear Induction Welded.' The parallel Sure-Weld TPO Metal Retrofit Mechanically Fastened Roofing System (also in Section 1) lists 'Option 1 - PS RUSS Strip' and 'Option 2 - Linear Induction Welded.' So the Linear Induction Welded path is common to both products, but the Option 1 path differs: Half Sheets on the PVC/KEE HP side, PS RUSS Strip on the TPO side. For a bid spec, the right call depends on which product family is going down. Option A imports the TPO Option 1 (PS RUSS Strip) into PVC and is wrong about the documented option list. Option C contradicts the Field Guide, which explicitly documents PVC and KEE HP Metal Retrofit as a Mechanically Fastened system. Option D omits the documented Linear Induction Welded option for PVC/KEE HP.",
      cite: "Carlisle Thermoplastics Field Guide - p. 2, Section 1 - Description of Systems (Sure-Flex PVC and KEE HP Metal Retrofit Mechanically Fastened)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const CARLISLE_SURE_FLEX_PVC_FIELD_INSTALL_QUESTION_BANK_2026 = {
  ...CARLISLE_SURE_FLEX_PVC_FIELD_INSTALL_QUESTION_BANK_2026_RAW,
  questions: CARLISLE_SURE_FLEX_PVC_FIELD_INSTALL_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = CARLISLE_SURE_FLEX_PVC_FIELD_INSTALL_QUESTION_BANK_2026;
