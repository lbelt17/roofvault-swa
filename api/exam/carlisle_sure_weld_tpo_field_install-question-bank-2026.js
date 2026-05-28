// Carlisle Sure-Weld TPO Field Install - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF (internal only, never served via /api/book or /api/books):
//   sources/manufacturers/carlisle/install-guides/2023-09-carlisle-thermoplastics-field-guide.pdf
// Per-question provenance lives in:
//   sources/manufacturers/carlisle/citations.json
//
// Question authoring target was 12 (the honest expert-level capacity of the
// Sure-Weld TPO portion of the Field Guide, agreed with product owner).
// Every question is scenario-based, derived from the Field Guide install
// procedures, and paraphrased - no marketing prose copied verbatim.
//
// Concepts intentionally NOT repeated from carlisle_sure_weld_tpo_reinforced
// (the PDS bank):
//   - CARSW-002 / CARSW-003 - APEEL razor + 90-day exposure window
//   - CARSW-006 - 160 F max sustained membrane temperature
//   - CARSW-007 - oxidation rate doubles per 18 F
//   - CARSW-009 - Weathered Membrane Cleaner basics for weather-exposed rolls
//                 (the Field Install bank covers the 24-hour seam-cleaning
//                 rule and aged-membrane Primer Pad slurry prep instead -
//                 different install-judgment angles)

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

const CARLISLE_SURE_WELD_TPO_FIELD_INSTALL_QUESTION_BANK_2026_RAW = {
  book: "Carlisle Sure-Weld TPO Field Install",
  questions: [
    {
      id: "CARTW-001",
      type: "mcq",
      question: "A crew is firing up an auto-welder on the first morning of a Sure-Weld TPO 60-mil installation. Their welder isn't one of the named models in the Field Guide's auto-welder set-up chart, so they need a generic starting point. Per the Field Guide's TPO common-installation-issues guidance, what is the agreed-upon STARTING reference for all Sure-Weld TPO thicknesses on an auto-welder, and what does a proper seam look like once it's running correctly?",
      options: [
        { id: "A", text: "Start at 1,000 F with travel speed at 12 ft/min and airflow at 100 percent; a proper hot-air weld has no voids or wrinkles and must be at least 1.5 inches wide" },
        { id: "B", text: "Start at 1,094 F (the PVC reference) at 8.5 ft/min, 100 percent airflow - it's the densest membrane chemistry so it works as a worst-case starting point for TPO" },
        { id: "C", text: "Start at 900 F, 18 ft/min, 75 percent airflow - the lower temperature reduces the chance of overheating on the first run" },
        { id: "D", text: "Skip the starting reference entirely and adjust by eye until the seam looks fully fused - no documented starting point applies to unlisted welders" }
      ],
      answer: "A",
      explanation: "Section 4 of the Field Guide gives one starting point that applies across all Sure-Weld TPO thicknesses on an auto-welder: 1,000 F at 12 ft/min with 100 percent airflow. The same section defines an acceptable seam as having no voids or wrinkles and being at least 1.5 inches wide. Option B confuses TPO with PVC - the PVC starting reference (1,094 F at 8.5 ft/min) is different chemistry; using it on TPO risks bleed-out and overheating. Option C is a smoke-reduction setting from the PVC chart, not a TPO starting point. Option D ignores the documented baseline; the chart exists precisely so that crews have a defensible starting reference even when their welder isn't one of the named models.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-002",
      type: "mcq",
      question: "A flashing detailer is hand-welding a TPO target patch around a pipe penetration. The crew lead wants to confirm the hand-welder settings and the visible-quality check for the finished seam. Per the Field Guide's Common Installation Issues guidance for Sure-Weld TPO, which combination is correct?",
      options: [
        { id: "A", text: "Flashing setting at 6, membrane setting at 7, minimum seam width 1.0 inch" },
        { id: "B", text: "Flashing setting at 7, membrane setting at 8, minimum seam width 1.5 inches, no voids or wrinkles" },
        { id: "C", text: "Whatever setting produces visible smoke - smoke is the indicator that the membrane is fully fused" },
        { id: "D", text: "Flashing setting at 9, membrane setting at 10, with a 2-inch minimum seam width to compensate for hand-welder variability" }
      ],
      answer: "B",
      explanation: "The Field Guide's Section 4 guidance for reducing cold welds on TPO is explicit: 'Hand welding flashing the welder should be set at #7 and for membrane set at #8. A proper hot air welded seam has no voids or wrinkles and must be at least 1.5 inches wide.' Option A under-sets both controls and under-specifies the seam width, increasing cold-weld risk. Option C is dangerous and wrong - visible smoke from a hand-welder commonly indicates overheating or contamination burning off, not a quality indicator. Option D over-sets the heat (settings above 8 risk scorching the scrim) and the 2-inch width is not the Field Guide's spec.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-003",
      type: "mcq",
      question: "A roofing superintendent is challenged by a young foreman: 'We test-welded this morning when we set up, the welder hasn't been touched since, and conditions feel about the same. Why do we have to stop and run another test weld this afternoon?' Per the Field Guide's daily-QC discipline for Sure-Weld TPO, what is the BEST response?",
      options: [
        { id: "A", text: "The afternoon test weld is optional if morning ambient and roof-surface temperatures haven't changed materially" },
        { id: "B", text: "Test welds are only required after deliberate welder adjustments; if nothing changed, no second test is required" },
        { id: "C", text: "The Field Guide requires a test weld at the start of each morning AND each afternoon on a piece of LIKE membrane over the SAME substrate, because rooftop conditions (ambient temperature, deck temperature, humidity, contamination) shift over the workday and a fresh test catches a drifting welder before a whole day's seams have to be torn out and re-welded" },
        { id: "D", text: "The afternoon test exists for hand-welders only; auto-welders are stable enough that the morning test covers the full day" }
      ],
      answer: "C",
      explanation: "Section 4 of the Field Guide says: 'Perform a test weld at the start of each morning and afternoon on a piece of like membrane over the same substrate.' The discipline exists because the welding result is sensitive to membrane temperature, substrate temperature, ambient temperature, humidity, and dust/dew - all of which shift across the workday. The test medium matters too: same scrim, same thickness, same substrate. A morning-only test can pass and then have the welder drift quietly by mid-afternoon; the afternoon test catches that drift before a whole stretch of production seam has to be cut out. Options A, B, and D all rationalize skipping the documented afternoon test - which is exactly the discipline failure the rule is designed to prevent.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-004",
      type: "mcq",
      question: "Heavy storms delayed work, and one stretch of TPO membrane was rolled out and lapped but the LAP SEAM was not heat-welded before end-of-day - and now it has been more than 24 hours since the membrane was placed. The crew is ready to weld it tomorrow morning, conditions look clean and dry. Per the Field Guide, what is required before welding that lap?",
      options: [
        { id: "A", text: "Nothing special - if there is no visible contamination, just dry the surface with a clean rag and weld" },
        { id: "B", text: "Cut out the un-welded section and replace with new membrane - the 24-hour window has been exceeded, so the membrane is no longer weldable" },
        { id: "C", text: "Heat the surface with a hot-air gun for 60 seconds to drive off any contamination before welding" },
        { id: "D", text: "Clean the seam area with a Splice Wipe soaked in Weathered Membrane Cleaner (the 24-hour rule applies regardless of conditions), then allow the cleaned area to vent for at least 10 minutes before welding" }
      ],
      answer: "D",
      explanation: "Section 4 has a specific 24-hour rule: 'Seams that are not welded within 24 hours should be cleaned with a Splice Wipe soaked with Weathered Membrane Cleaner regardless of conditions. Allow the cleaned area to vent for at least 10 minutes prior to welding again.' The 'regardless of conditions' wording is the key - it doesn't matter whether the surface looks clean. UV exposure, fine wind-blown contamination, and surface oxidation begin within hours and prevent a proper fusion weld; the cleaner restores a weldable chemistry. The 10-minute vent matters because welding into solvent-wet surface chemistry causes its own cold-weld failure mode. Option A skips the documented rule. Option B is overkill - the membrane isn't ruined, it just needs prep. Option C drives off moisture but does not remove chemical contamination.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-005",
      type: "mcq",
      question: "A re-roofing crew is tying NEW Sure-Weld TPO membrane into an EXISTING TPO roof that was installed about three years ago (well over the one-year aged threshold). They need to heat-weld the new sheet to the old one. Per the Field Guide, what is the correct surface-prep procedure for the aged TPO before the new seam can be welded down?",
      options: [
        { id: "A", text: "Work up a slurry on the aged membrane using a Primer Pad and Weathered Membrane Cleaner; remove the residue with a Splice Wipe; wipe again with a CLEAN Splice Wipe and Weathered Membrane Cleaner; allow the area to vent at least 10 minutes before welding" },
        { id: "B", text: "Pressure-wash the aged TPO with clean water and detergent, allow to dry overnight, then weld in the morning" },
        { id: "C", text: "Apply EPDM splice primer to the aged TPO weld area - same surface-prep concept, different membrane chemistry" },
        { id: "D", text: "Aged TPO over one year is generally not weldable; cut back the existing roof 6 inches beyond the tie-in and bond a strip of new TPO to the substrate before welding" }
      ],
      answer: "A",
      explanation: "Section 4 prescribes a specific procedure for welding aged TPO (over one year): use a Primer Pad with Weathered Membrane Cleaner to work up a SLURRY on the aged surface; remove the residue using a Splice Wipe; wipe again with a clean Splice Wipe and Weathered Membrane Cleaner; then allow the area to vent at least 10 minutes prior to welding. The slurry step is what distinguishes aged-membrane prep from the basic 24-hour weld-prep procedure - the abrasive pad mechanically lifts the oxidized surface layer that ordinary cleaning alone won't remove. Option B (pressure-wash) leaves the chemical oxidation layer in place. Option C uses the wrong product family - EPDM splice primer is not a TPO weld-prep technology. Option D treats aged TPO as un-weldable, which contradicts the Field Guide's documented method.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (aged membrane welding)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-006",
      type: "mcq",
      question: "An eager apprentice runs to a freshly welded TPO seam with a seam probe within about five minutes of the auto-welder passing, wanting to confirm the seam is good. Per the Field Guide's seam-probing discipline, what is the problem with that timing, and how should seam probing actually be scheduled across the workday?",
      options: [
        { id: "A", text: "Probing immediately after welding can pull the still-soft membrane apart and falsely indicate a bad seam; probing must occur AFTER thoroughly probing-cooled seams (a separate 5-minute limit), and probing only needs to happen at the end of the workday so the welder doesn't lose production time" },
        { id: "B", text: "Probing must happen ONLY once the hot-air weld has thoroughly cooled - a minimum of 20 minutes per the Field Guide - and seams must be probed THROUGHOUT the day so the welder can be adjusted while problems are still small; probe-found deficiencies must be repaired routinely throughout the day and no later than end-of-day" },
        { id: "C", text: "Probing is only required on hand-welded sections; auto-welder seams are inspected visually only" },
        { id: "D", text: "Probing should be done with maximum hand-pressure to ensure that any weak point will fail under the probe; this guarantees no defective seam ever reaches the building owner" }
      ],
      answer: "B",
      explanation: "Section 4: 'Probing seams must be done once hot air welds have thoroughly cooled (min. 20 minutes). Hot air weld seams must be probed throughout the day to check seam quality and to make proper adjustments to hot air welding equipment. The repair of deficiencies must be done routinely throughout the day but no later than the end of each workday.' Two integrated points: (1) WAIT for the seam to cool (minimum 20 minutes) - probing a hot seam pulls apart still-soft polymer and gives a false defect reading; (2) probe THROUGHOUT the day, not just at end-of-day, so welder drift is caught and the welder is adjusted while only a small area is affected. Option A inverts both rules (5-min limit doesn't exist, end-of-day-only is wrong). Option C is wrong - both auto and hand-welded seams must be probed. Option D is wrong - probes are designed to detect deficiencies, not to load-test seams to failure.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (Seam Probing)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-007",
      type: "mcq",
      question: "A designer is laying out fastener-and-plate lines for a mechanically fastened Sure-Weld TPO assembly on a building with parapets, two roof-top skylight curbs, a deck-to-deck expansion joint, and an interior step where the deck angles upward by about 3 inches over a 12-inch run. Per the Field Guide's Section 4 securement requirements, where is membrane securement REQUIRED?",
      options: [
        { id: "A", text: "Only at parapets and the expansion joint - the skylight curbs and the small angle-change are handled by the curb flashing and the membrane lay itself" },
        { id: "B", text: "Only at the perimeter (the parapets) - all interior conditions use the field fastening pattern and need no additional securement" },
        { id: "C", text: "At the perimeters of each roof level, at the curbs (skylights and other roof curbs), at the expansion joint, AND at every inside deck angle change greater than 2 inches in 12 (so the 3-in-12 step requires securement as well)" },
        { id: "D", text: "At every penetration AND only at angle changes greater than 6 inches in 12 - the smaller step does not trigger additional securement" }
      ],
      answer: "C",
      explanation: "Section 4 lists membrane securement requirements explicitly: 'Membrane securement must be installed at perimeters of each roof level, curbs, skylights, expansion joints and all inside deck angle changes greater than 2 inches in 12.' The 3-in-12 step in this scenario exceeds the 2-in-12 threshold and therefore requires securement, on top of the parapet-perimeter, curb, and expansion-joint securement. The reason for the rule is wind-uplift behavior: any change in plane creates a stress concentration where the membrane tries to lift off the substrate, and a securement line transfers that load into the deck. Option A skips curbs (which are explicitly listed). Option B treats only the perimeter (a partial answer that misses curbs, expansion joints, and angle changes). Option D uses the wrong threshold (6-in-12 is not the rule; 2-in-12 is).",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (Membrane Securement)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-008",
      type: "mcq",
      question: "Two roofs are being built side-by-side: Roof A is a fully-adhered Sure-Weld TPO assembly and Roof B is a mechanically fastened Sure-Weld TPO assembly. Both roofs have several 4-inch sanitary vents and a few 8-inch sealant pockets around clusters of small conduit. Per the Field Guide's Section 4 securement rules around PENETRATIONS and sealant pockets, how do the two roofs differ?",
      options: [
        { id: "A", text: "Securement is required at every penetration and every sealant pocket on both roofs regardless of size - the same rule applies to adhered and mechanically fastened systems" },
        { id: "B", text: "Securement is not required at penetrations on either roof - perimeter securement is sufficient" },
        { id: "C", text: "Securement is required on Roof A (the adhered roof) only - the membrane needs the extra restraint because there are no field fasteners" },
        { id: "D", text: "On Roof B (mechanically fastened), securement is required at ALL pipe penetrations and ALL sealant pockets regardless of size; on Roof A (adhered), securement is required around pipes ONLY when the pipe diameter exceeds 18 inches and around sealant pockets ONLY when the pocket exceeds 12 inches - the 4-inch vents and 8-inch pockets on Roof A do not trigger securement" }
      ],
      answer: "D",
      explanation: "Section 4 distinguishes between mechanically fastened and adhered systems for penetration-area securement: 'Membrane securement is also required around all pipe penetrations and sealant pockets regardless of size on mechanically fastened systems. On adhered systems only when the pipe diameter exceeds 18 inches in size or the sealant pocket exceeds 12 inches in size is membrane securement required.' The reason the rule is split is uplift behavior: in a mechanically fastened system, the membrane is free to billow between fastener lines, so any local stress riser at a penetration needs to be restrained; in a fully adhered system, the bonding adhesive already restrains the membrane, so additional securement is only needed at penetrations large enough to create a local discontinuity (>18 inches for pipes, >12 inches for pockets). Option A and option C both miss the system-dependent threshold. Option B ignores the rule entirely.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (Membrane Securement - penetrations)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-009",
      type: "mcq",
      question: "A foreman inspecting a fresh Sure-Weld TPO hot-air-welded seam sees a dark, glossy line along the edge where the bottom side of the upper sheet appears to have melted and flowed out from under the lap. Per the Field Guide, what is this called, what does it indicate, and what is the correct field repair?",
      options: [
        { id: "A", text: "Bleed-out, which indicates the weld has been OVERHEATED; the repair is a non-reinforced TPO flashing piece overlaying the deficiency at least 2 inches in all directions and welded 100 percent" },
        { id: "B", text: "Bleed-out, which is the normal sign of a proper TPO weld (the same indicator used for PVC); no repair needed" },
        { id: "C", text: "Burn-through, requiring removal of the entire seam length back to the next T-joint and full re-installation of a new membrane sheet" },
        { id: "D", text: "Cold-flow, indicating UNDER-heating; the repair is to re-run the auto-welder over the seam at the same settings to add more heat" }
      ],
      answer: "A",
      explanation: "Section 4 explains: 'Overheating of welds is evident when bleed-out occurs. Bleed-out is the dark underside of the membrane that begins to melt and flow. Bleed-out will not occur with Sure-Weld TPO membrane if properly welded. If overheating is evident, a piece of non-reinforced flashing may be used for a repair. The non-reinforced flashing should overlay the deficiency 2 inches in all directions and be welded 100 percent.' Important nuance for TPO vs PVC: on TPO, bleed-out is a DEFECT (over-temperature); on PVC the Field Guide notes that 'a proper weld for PVC will exhibit a little bit of bleed-out at the overlap step-off' - so the same visual indicator is interpreted opposite ways. Option B inverts the TPO rule. Option C is overkill - the prescribed repair is local, not full re-installation. Option D misdiagnoses the condition; re-running the welder at the same (already-too-high) settings makes it worse.",
      cite: "Carlisle Thermoplastics Field Guide - p. 36, Section 4 - Common Installation Issues (Overheated Welds)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-010",
      type: "mcq",
      question: "It is mid-November on a Sure-Weld TPO project. Daytime highs are around 50 F but overnight lows are forecast in the mid-30s. The crew is using TPO Pressure-Sensitive Coverstrip on metal-edge details. Per the Field Guide's staging-and-storage guidance, what overnight-storage decision is correct for the PS Coverstrip rolls, and why does it matter?",
      options: [
        { id: "A", text: "Leave the PS Coverstrip rolls on the roof under a breathable tarp - thermoplastic accessories simply need a tarp regardless of temperature" },
        { id: "B", text: "Use hot boxes (or an equivalent heated, dry enclosure) to keep the PS Coverstrip at a minimum product temperature of 40 F overnight; storing and using PS Coverstrip below 40 F results in a loss of adhesive tack and, in extreme cases, an inadequate bond to the substrate - storage above 90 F can also shorten shelf life" },
        { id: "C", text: "Bring the PS Coverstrip rolls into a heated trailer overnight at exactly 70 F so that the adhesive activates fully before morning use" },
        { id: "D", text: "Freezing PS Coverstrip overnight is fine because the adhesive recovers fully once the roll warms up on the rooftop the next morning" }
      ],
      answer: "B",
      explanation: "Section 5: 'Storage and use of TPO PS Coverstrip at temperatures below 40 F will result in a loss of adhesive tack, and in extreme cases will result in an inadequate bond to the substrate. Overnight storage must be available to keep the temperature of the TPO PS Coverstrip at a minimum of 40 F. Hot boxes for jobsite storage must be provided to maintain a minimum product temperature of 40 F. TPO PS Coverstrip must be stored in a dry area.' The same section also warns the other direction: jobsite storage above 90 F may affect product shelf life. Option A ignores the 40 F minimum and the dry-storage requirement. Option C is unnecessarily specific and not what the Field Guide prescribes; the rule is a MINIMUM of 40 F, not a target of 70 F. Option D is wrong - the document explicitly says a sub-40 F event causes tack loss, and in extreme cases inadequate bond, which the warm-up does not reverse.",
      cite: "Carlisle Thermoplastics Field Guide - p. 38, Section 5 - Staging and Storage Best Practices (Pressure-Sensitive Products)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-011",
      type: "mcq",
      question: "A re-roof crew arrives on a clear spring morning at 47 F to install Sure-Weld SAT (Self Adhering Technology) TPO membrane. The job ambient is forecast to climb to 60 F by mid-day. The crew lead asks: 'Can we start laying SAT membrane now since it will warm up later?' Per the Field Guide's storage and install guidance for SAT TPO, what is the correct answer?",
      options: [
        { id: "A", text: "Yes, start now - SAT TPO has no ambient install threshold; only the substrate temperature matters" },
        { id: "B", text: "Yes, but only if the membrane rolls are pre-heated to 70 F before unrolling" },
        { id: "C", text: "No - SAT TPO membrane must be installed at ambient temperatures ABOVE 50 F; the crew must wait until ambient passes 50 F before laying SAT membrane" },
        { id: "D", text: "No - SAT TPO requires an ambient temperature above 75 F to activate the factory pressure-sensitive adhesive" }
      ],
      answer: "C",
      explanation: "Section 5: 'SAT TPO membrane must be installed at ambient temperatures above 50 F (10 C).' This is a hard ambient-temperature install threshold, separate from the storage-temperature discussion for PS Coverstrip. The factory-applied pressure-sensitive adhesive on SAT requires enough ambient heat to bond properly to the substrate during the install pass; below 50 F, the adhesive does not develop full tack and the result is similar to the sub-40 F PS Coverstrip failure - a roof that looks installed but has not actually achieved bond. Option A omits the documented threshold. Option B tries to compensate for ambient with a roll-warming trick - but the Field Guide is explicit about AMBIENT temperature, not roll temperature. Option D over-states the threshold; 75 F is not the rule, 50 F is.",
      cite: "Carlisle Thermoplastics Field Guide - p. 38, Section 5 - Staging and Storage Best Practices (Membrane and Flashing - SAT TPO)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARTW-012",
      type: "mcq",
      question: "A re-roof project is going over an EXISTING standing-seam metal roof in good structural shape. The owner wants Sure-Weld TPO. The contractor is choosing among the Sure-Weld TPO system designs documented in the Field Guide's Section 1 - Description of Systems. Which Sure-Weld TPO design is PURPOSE-BUILT for this metal-retrofit scenario, and what makes it distinct from the other mechanically attached Sure-Weld TPO options?",
      options: [
        { id: "A", text: "The Sure-Weld Adhered system, because bonding adhesive bonds directly to the metal pan without needing fasteners" },
        { id: "B", text: "The Sure-Weld SAT (Self Adhering Technology) system, because the factory pressure-sensitive adhesive is engineered for metal substrates" },
        { id: "C", text: "The Sure-Weld Spectro-Weld Mechanically Fastened system, because it uses only white membrane and is therefore the reflective choice for metal recovers" },
        { id: "D", text: "The Sure-Weld TPO Metal Retrofit Mechanically Fastened Roofing System, which is documented as its own attachment design in Section 1 alongside Sure-Weld MFS, Spectro-Weld MFS, and Induction-Welded Grid MFS; the Field Guide explicitly lists two attachment options for the Metal Retrofit system (Option 1 - PS RUSS Strip; Option 2 - Linear Induction Welded), reflecting that the metal pans (not flat insulation board) drive the attachment design" }
      ],
      answer: "D",
      explanation: "The Field Guide's Section 1 lists Sure-Weld TPO Mechanically Fastened systems in four distinct flavors - Sure-Weld MFS, Spectro-Weld MFS, Induction-Welded Grid MFS, and Sure-Weld TPO Metal Retrofit MFS - plus separate Adhered system descriptions for Sure-Weld, Spectro-Weld, and Sure-Weld SAT. The Metal Retrofit system exists because attaching membrane over a metal pan (rather than a flat insulation board) requires either a PS RUSS strip securement design (Option 1) or a Linear Induction Welded design (Option 2); the document calls these out as the two install options for that scenario. Option A confuses systems - the Adhered system documented in Section 1 is described over substrate (typically insulation or cover board), not over metal pans. Option B mis-applies SAT, which is a self-adhering system intended for approved insulation/substrate, not for metal-pan retrofit. Option C confuses Spectro-Weld (a TPO product variant available in MFS or Adhered) with the Metal Retrofit system - white-only is a Spectro-Weld product fact, not a metal-retrofit selection rationale.",
      cite: "Carlisle Thermoplastics Field Guide - p. 1-2, Section 1 - Description of Systems (Metal Retrofit Mechanically Fastened)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const CARLISLE_SURE_WELD_TPO_FIELD_INSTALL_QUESTION_BANK_2026 = {
  ...CARLISLE_SURE_WELD_TPO_FIELD_INSTALL_QUESTION_BANK_2026_RAW,
  questions: CARLISLE_SURE_WELD_TPO_FIELD_INSTALL_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = CARLISLE_SURE_WELD_TPO_FIELD_INSTALL_QUESTION_BANK_2026;
