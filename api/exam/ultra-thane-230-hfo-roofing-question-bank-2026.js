// Ultra-Thane 230 HFO Roofing SPF - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: GCMC-TDS-Ultra-Thane-230-HF0.pdf
// Authoring target: 28 technical data sheet questions grounded in source text.


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

const ULTRA_THANE_230_HFO_ROOFING_QUESTION_BANK_2026_RAW = {
  book: "Ultra-Thane 230 HFO Roofing SPF",
  questions: [
    {
      id: "UTH230-001",
      type: "mcq",
      question: "The specifier notes heavy foot traffic and maintenance carts around several RTU curbs on a new Ultra-Thane 230 HFO roof. The foreman must confirm density with the supplier before mobilization. Which formulation direction does the technical data support for higher load areas?",
      options: [
        { id: "A", text: "2.5 lb density because it offers the highest published compressive strength" },
        { id: "B", text: "2.7 lb density because it is the only grade listed for wind uplift" },
        { id: "C", text: "3.0 lb density because it provides the greatest published compressive strength range" },
        { id: "D", text: "Density selection is irrelevant; all three grades share identical structural properties" }
      ],
      answer: "C",
      explanation: "Published compressive strength increases with density: 2.5 lb at 40-45 psi, 2.7 lb at 46 psi, and 3.0 lb at 50-60 psi. For curbs and concentrated loads, the foreman should request the higher-density formulation rather than memorizing a single psi value.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-002",
      type: "mcq",
      question: "A project manager schedules an untrained subcontractor crew to spray Ultra-Thane 230 HFO tomorrow because the drums arrived on site. What does the technical data sheet require before application proceeds?",
      options: [
        { id: "A", text: "Any licensed roofer may spray the foam if ambient temperature is above 32°F" },
        { id: "B", text: "Application only by trained and manufacturer-approved roofing experts familiar with the properties of this material" },
        { id: "C", text: "Training is optional when using a Graco proportioner with pre-set temperatures" },
        { id: "D", text: "Only the coating applicator must be certified; foam may be sprayed by general laborers" }
      ],
      answer: "B",
      explanation: "Ultra-Thane 230 HFO Roofing Foam is described as a sophisticated plural-component building product that should be applied only by trained and manufacturer-approved roofing experts familiar with the properties of this material.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-003",
      type: "mcq",
      question: "At 6:00 a.m. the deck surface reads 52°F (11°C) and rising. The crew asks whether they may begin spraying Ultra-Thane 230 HFO. What does the substrate temperature guidance allow in most instances?",
      options: [
        { id: "A", text: "Spray may begin only after the substrate reaches 65°F minimum" },
        { id: "B", text: "Application may proceed on surfaces as low as 50°F (10°C) in most instances" },
        { id: "C", text: "Substrate temperature is irrelevant if drum material is preheated to 125°F" },
        { id: "D", text: "Minimum substrate temperature is 32°F provided wind is below 15 mph" }
      ],
      answer: "B",
      explanation: "The technical data sheet states that Ultra-Thane 230 HFO Roofing Foam may be applied to surfaces with temperatures as low as 50°F (10°C) in most instances. Crews must still match reactivity grade and climatic limits to conditions.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-004",
      type: "mcq",
      question: "The spray day plan shows deck temperatures of 54°F at start-up, 76°F mid-morning, and 95°F after lunch on the same roof area. Per the published reactivity grades, how should the foreman stage material?",
      options: [
        { id: "A", text: "Winter grade for 50-60°F, Regular for 65-85°F, and Summer for above 90°F—change grade as deck temperature moves through each band" },
        { id: "B", text: "One Regular grade drum is acceptable for the entire day regardless of temperature swing" },
        { id: "C", text: "Summer grade only because afternoon heat controls reaction time" },
        { id: "D", text: "Reactivity grade is selected by drum color, not substrate temperature" }
      ],
      answer: "A",
      explanation: "Reactivity grades are tied to temperature bands: Winter 50-60°F (10-15°C), Regular 65-85°F (18-29°C), and Summer above 90°F (above 32°C). A foreman spraying through a wide daily swing must plan grade changes rather than running one grade all day.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-005",
      type: "mcq",
      question: "A foreman prepares a previously coated built-up roof deck for SPF recovery. The deck is dry and sound, but adhesion is critical. What priming approach does General Coatings recommend for optimum results?",
      options: [
        { id: "A", text: "No primer is required on any coated recovery deck" },
        { id: "B", text: "Prime roof surfaces using Ultra-Bond products for optimum results, then follow substrate-specific requirements for metals or uncertain moisture" },
        { id: "C", text: "Apply only a water mist to increase surface humidity before spraying" },
        { id: "D", text: "Use asphalt cut-back mastic as the sole bonding agent under the first foam pass" }
      ],
      answer: "B",
      explanation: "For optimum results, roof surfaces should be primed using Ultra-Bond products. Additional steps still apply for ferrous metals per SPFA, wash primer on galvanized or stainless steel, and epoxy sealing primer where moisture cannot be determined or controlled.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-006",
      type: "mcq",
      question: "The crew will spray over untreated carbon steel deck panels that have been cleaned but not yet coated. How should ferrous metal be prepared per the data sheet?",
      options: [
        { id: "A", text: "Spray directly onto clean bare steel without delay or primer" },
        { id: "B", text: "Prime untreated ferro-metallic substrates in accordance with SPFA Guidelines" },
        { id: "C", text: "Apply wash primer only; SPFA guidelines do not apply to steel" },
        { id: "D", text: "Delay spraying until steel reaches 90°F to promote adhesion" }
      ],
      answer: "B",
      explanation: "Untreated ferro-metallic substrates should be primed in accordance with SPFA Guidelines. All clean metal surfaces should be primed immediately with an approved primer.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-007",
      type: "mcq",
      question: "The substrate includes newly installed galvanized edge metal and stainless-steel counterflashing. What surface treatment is required before spraying Ultra-Thane 230 HFO?",
      options: [
        { id: "A", text: "No special treatment; galvanized and stainless surfaces are self-priming" },
        { id: "B", text: "Treat galvanized and stainless-steel surfaces with an appropriate wash primer prior to foam application" },
        { id: "C", text: "Apply epoxy sealing primer only; wash primer is prohibited on metals" },
        { id: "D", text: "Abrade to bright metal and spray within 24 hours without primer" }
      ],
      answer: "B",
      explanation: "Galvanized and stainless-steel surfaces should be treated with an appropriate wash primer prior to the application of Ultra-Thane 230 HFO Roofing Foam.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-008",
      type: "mcq",
      question: "A lightweight concrete deck tests at 8% moisture content, is clean, and dry. The owner asks whether priming is mandatory before SPF. What does the data sheet state for porous substrates such as wood and concrete?",
      options: [
        { id: "A", text: "Porous substrates always require epoxy sealing primer regardless of moisture readings" },
        { id: "B", text: "Porous substrates may not require priming if surfaces are clean and dry with less than 10% moisture content" },
        { id: "C", text: "Concrete must never receive foam without an Ultra-Bond primer" },
        { id: "D", text: "Moisture content is irrelevant if the deck is power-washed the same day" }
      ],
      answer: "B",
      explanation: "Porous substrates such as wood and concrete may not require priming if surfaces are clean and dry with less than 10% moisture content. When moisture cannot be determined or controlled, an epoxy sealing primer is recommended instead.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-009",
      type: "mcq",
      question: "A wood deck on an older building cannot be reliably moisture-tested, and the owner will not allow destructive sampling. What primer strategy does General Coatings recommend for best results?",
      options: [
        { id: "A", text: "Proceed without primer because wood is a porous substrate" },
        { id: "B", text: "Use an epoxy sealing primer when moisture content cannot be determined or controlled" },
        { id: "C", text: "Apply wash primer intended for galvanized metal" },
        { id: "D", text: "Delay installation until the deck is intentionally saturated to stabilize moisture" }
      ],
      answer: "B",
      explanation: "For best results on surfaces where moisture content cannot be determined or controlled, an epoxy sealing primer is recommended. Consult General Coatings Manufacturing Corp. for specific application requirements when conditions are uncertain.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-010",
      type: "mcq",
      question: "The iron worker finishes installing clean, bare steel deck panels at 2:00 p.m., but the SPF crew cannot reach that wing until the next morning. What does the substrate preparation section require regarding timing?",
      options: [
        { id: "A", text: "Clean metal may wait overnight unprimed if the deck is swept before spray" },
        { id: "B", text: "All clean metal surfaces should be primed immediately with an approved primer" },
        { id: "C", text: "Metal priming is required only on galvanized and stainless substrates" },
        { id: "D", text: "Delay priming until the deck reaches 65°F the next day" }
      ],
      answer: "B",
      explanation: "All clean metal surfaces should be primed immediately with an approved primer. Untreated ferro-metallic substrates must also be primed in accordance with SPFA Guidelines. Waiting overnight invites flash rust and adhesion risk.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-011",
      type: "mcq",
      question: "The spray rig operator verifies proportioner settings before the first pass. What mixing ratio by volume does the equipment section require?",
      options: [
        { id: "A", text: "1 part A to 2 parts B by volume" },
        { id: "B", text: "50 parts A to 50 parts B by volume" },
        { id: "C", text: "Variable ratio depending on reactivity grade selected" },
        { id: "D", text: "100% A-side with B-side used only as a catalyst at the gun" }
      ],
      answer: "B",
      explanation: "Proportioning equipment shall maintain a mixing ratio by volume of 50 parts A to 50 parts B. The equipment must be manufactured specifically for polyurethane foam application and of the heated airless type.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-012",
      type: "mcq",
      question: "A technician questions whether a standard unheated airless paint pump can substitute for SPF proportioning equipment on this project. What temperature must the mixed material maintain at the spray gun?",
      options: [
        { id: "A", text: "Ambient temperature is acceptable; heating is optional" },
        { id: "B", text: "120°F to 140°F (49 to 60°C) mixed material at the spray gun using heated airless proportioning equipment" },
        { id: "C", text: "180°F minimum at the gun to ensure 3.0 lb density" },
        { id: "D", text: "70°F at the gun; heat is only required in the hose when wind exceeds 15 mph" }
      ],
      answer: "B",
      explanation: "Equipment shall be of the heated airless type, capable of maintaining 120°F to 140°F (49 to 60°C) mixed material at the spray gun. Optimum spraying temperature will vary with substrate and ambient conditions.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-013",
      type: "mcq",
      question: "Drums sat in a trailer overnight and the lead applicator is ready to charge the rig at 5:30 a.m. What must be confirmed before spraying begins?",
      options: [
        { id: "A", text: "Only the ambient air temperature; drum contents equilibrate automatically" },
        { id: "B", text: "Material temperature with a thermometer or infrared gun before spraying" },
        { id: "C", text: "Drum lot numbers only; temperature is controlled by hose heat alone" },
        { id: "D", text: "B-component pressure release is unnecessary if drums were sealed" }
      ],
      answer: "B",
      explanation: "Material temperature should be confirmed with a thermometer or an infrared gun. Shelf life and storage guidance also note drums should be stored at 50-75°F and opened slowly if B-component pressure has built up from heat or sunlight.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-014",
      type: "mcq",
      question: "The foreman plans the first lift on a large flat area and asks the crew to install a single 3-inch pass to save time. What pass thickness range does the spraying section allow?",
      options: [
        { id: "A", text: "One continuous pass up to 3 inches is the recommended production method" },
        { id: "B", text: "Uniform passes ranging from 1/2 inch to 1 1/2 inch per pass" },
        { id: "C", text: "Maximum 1/4 inch per pass to prevent exotherm" },
        { id: "D", text: "Pass thickness is unlimited if the previous pass is above 70°F" }
      ],
      answer: "B",
      explanation: "Ultra-Thane 230 HFO should be installed in uniform passes ranging from 1/2 inch to 1 1/2 inch per pass. Pass thickness will vary with substrate temperature and applicator technique. Excessive single-pass thickness is identified as an improper technique that can cause dangerously high reaction temperatures.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-015",
      type: "mcq",
      question: "Between passes the lead applicator notes the previous lift has cooled to 65°F (18°C) while the crew stages the next pass. How does this affect adhesion per the data sheet?",
      options: [
        { id: "A", text: "Bond quality is unchanged as long as the surface is dry" },
        { id: "B", text: "Foam bonds best when the previous pass is still warm, above 70°F (21°C)" },
        { id: "C", text: "Previous passes must cool below 50°F before the next pass" },
        { id: "D", text: "Only the first pass requires warmth; subsequent passes may be cold-applied" }
      ],
      answer: "B",
      explanation: "Ultra-Thane 230 HFO bonds best when the previous pass is still warm (above 70°F [21°C]). Allowing the foam to cool excessively between passes can compromise inter-pass adhesion.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-016",
      type: "mcq",
      question: "Rain is forecast after 3:00 p.m. The crew finishes spraying at 11:00 a.m. but the elastomeric coating contractor cannot arrive until the next morning. What maximum uncoated exposure window does the data sheet allow?",
      options: [
        { id: "A", text: "Foam may remain uncoated indefinitely if the surface is swept clean" },
        { id: "B", text: "Perform best when coated the same day; may be left exposed up to 24 hours" },
        { id: "C", text: "Maximum 4 hours uncoated in all climates" },
        { id: "D", text: "Uncoated exposure is prohibited; coating must follow within 1 hour" }
      ],
      answer: "B",
      explanation: "Ultra-Thane 230 HFO performs best when coated the same day of application, however it may be left exposed for up to 24 hours. If exposure exceeds 24 hours, contact General Coatings Manufacturing Corp. for recommendations.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-017",
      type: "mcq",
      question: "At 7:00 a.m. the crew finds heavy dew on the deck and 82% relative humidity, though sustained wind is only 10 mph. May spraying proceed?",
      options: [
        { id: "A", text: "Yes, if substrate temperature exceeds 50°F and drums are preheated" },
        { id: "B", text: "No; do not spray when moisture is present as rain or dew, or when relative humidity is greater than 80%" },
        { id: "C", text: "Yes, dew is acceptable if the first pass is thin" },
        { id: "D", text: "Yes, because wind is below the 15 mph limit" }
      ],
      answer: "B",
      explanation: "Climatic conditions prohibit spraying when moisture is present in the form of rain, dew, or relative humidity greater than 80%, or when wind is in excess of 15 mph. Dew and 82% RH both violate the moisture limits even though wind is acceptable.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-018",
      type: "mcq",
      question: "Mid-afternoon sustained wind at the roof edge is reading 18 mph, the deck is dry, and RH is 55%. The substrate is 78°F. What is the correct production decision?",
      options: [
        { id: "A", text: "Spray continues because humidity is below 80%" },
        { id: "B", text: "Stop spraying; wind in excess of 15 mph is a climatic limit regardless of other acceptable readings" },
        { id: "C", text: "Spray only the leeward half of the roof" },
        { id: "D", text: "Reduce pass thickness to 1/4 inch and continue" }
      ],
      answer: "B",
      explanation: "No spraying should be done when there is wind in excess of 15 mph, in addition to limits on rain, dew, and relative humidity greater than 80%. Dry deck and moderate RH do not override the wind limit.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-019",
      type: "mcq",
      question: "After the final foam pass is complete, the coating subcontractor asks whether any UV-resistant topcoat may be used. What does the elastomeric coating section require?",
      options: [
        { id: "A", text: "Foam may remain uncoated up to 30 days in dry climates" },
        { id: "B", text: "Must be top coated with an approved UV reflective elastomeric coating applied per GCMC or the coating manufacturer's instructions" },
        { id: "C", text: "A single coat of aluminum asphalt is the only approved finish" },
        { id: "D", text: "Topcoating is optional on 3.0 lb density foam" }
      ],
      answer: "B",
      explanation: "Ultra-Thane 230 HFO must be top coated with an approved UV reflective elastomeric coating. All coatings shall be applied in accordance with General Coatings Manufacturing Corp. or other coating manufacturer's instructions.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-020",
      type: "mcq",
      question: "An HVAC contractor reports rooftop unit intake louvers 30 feet from the spray area. What job-site protection step does the data sheet require?",
      options: [
        { id: "A", text: "Shut down the building; intakes need no covering if personnel wear respirators" },
        { id: "B", text: "Cover all intake vents near the work area" },
        { id: "C", text: "Rotate the louvers away from the roof; covering is optional" },
        { id: "D", text: "Intake protection applies only to interior spray operations" }
      ],
      answer: "B",
      explanation: "Among the listed job-site protection measures, the data sheet requires covering all intake vents near the work area to prevent overspray entrainment into building air systems.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-021",
      type: "mcq",
      question: "A building maintenance worker plans to weld a curb patch on the same roof while the SPF crew is spraying two bays away. What does the job-site protection section prohibit?",
      options: [
        { id: "A", text: "Welding is allowed if a fire watch is posted 50 feet away" },
        { id: "B", text: "No welding, smoking, or open flames during spray operations" },
        { id: "C", text: "Welding is permitted after the first foam pass only" },
        { id: "D", text: "Open flames are allowed when using CO2 extinguishers on site" }
      ],
      answer: "B",
      explanation: "Job-site protection explicitly prohibits welding, smoking, or open flames while SPF operations are underway. A CO2 or dry chemical fire extinguisher must also be available at the job-site.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-022",
      type: "mcq",
      question: "During the first pass the operator notices the foam is collapsing, sticky, and not rising normally while the rig pressures appear stable. What improper condition does the data sheet identify that requires correction?",
      options: [
        { id: "A", text: "Substrate temperature above 70°F between passes" },
        { id: "B", text: "Off-ratio material, which is an improper application technique that can cause high reaction temperatures, fire risk, and persistent odors" },
        { id: "C", text: "Using Winter grade at 55°F substrate temperature" },
        { id: "D", text: "Coating the foam within 24 hours of application" }
      ],
      answer: "B",
      explanation: "Improper application techniques include, but are not limited to, excessive thickness of SPF, off-ratio material, and spraying into or under rising SPF. Off-ratio foam must be treated as improperly installed material.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-023",
      type: "mcq",
      question: "Quality control finds a section where the operator sprayed a 2-inch single pass and continued lifting into foam that was still rising. What does the data sheet identify as potential results of this improper technique?",
      options: [
        { id: "A", text: "Only cosmetic cell structure variation with no safety impact" },
        { id: "B", text: "Dangerously high reaction temperatures that may result in fire and offensive odors that may or may not dissipate" },
        { id: "C", text: "Improved R-value that eliminates the need for topcoat" },
        { id: "D", text: "Temporary odor only; the foam may remain in place without correction" }
      ],
      answer: "B",
      explanation: "Improper techniques include excessive thickness of SPF, off-ratio material, and spraying into or under rising SPF. Potential results include dangerously high reaction temperatures that may result in fire and offensive odors that may or may not dissipate.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-024",
      type: "mcq",
      question: "An inspector tags a bay with off-ratio foam and excessive pass thickness. What corrective action does the data sheet require?",
      options: [
        { id: "A", text: "Scarify the surface and apply a thicker elastomeric coating" },
        { id: "B", text: "Improperly installed SPF must be removed and replaced with properly installed materials" },
        { id: "C", text: "Allow 48 hours for odors to dissipate, then coat" },
        { id: "D", text: "Add a second foam pass at correct ratio to balance the assembly" }
      ],
      answer: "B",
      explanation: "Improperly installed SPF must be removed and replaced with properly installed materials. Surface coating alone does not correct fundamental installation defects such as off-ratio material or excessive lift thickness.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-025",
      type: "mcq",
      question: "B-component drums were stored in direct sunlight and the operator hears pressure release when breaking the bung. What storage-related hazard does the data sheet warn about?",
      options: [
        { id: "A", text: "A-side crystallizes in sunlight; B-side is unaffected" },
        { id: "B", text: "Storing the B component at increased temperatures or in direct sunlight for prolonged periods may cause pressure buildup in the storage vessel; open containers slowly" },
        { id: "C", text: "Sunlight exposure improves reactivity and shortens cream time" },
        { id: "D", text: "Only frozen B-component drums develop pressure" }
      ],
      answer: "B",
      explanation: "Storing the B component at increased temperatures or in direct sunlight for prolonged periods may cause a buildup of pressure in the storage vessel. Containers should be opened slowly to release pressure, and material temperature should be verified before spraying.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-026",
      type: "mcq",
      question: "A sprayer works on an open roof with good natural ventilation. What respiratory protection does the PPE section accept for well-ventilated roofing conditions?",
      options: [
        { id: "A", text: "Dust mask only because isocyanate settles quickly outdoors" },
        { id: "B", text: "Approved vapor cartridge respirator; Type C organic vapor cartridge respirators are acceptable in well-ventilated roofing application conditions" },
        { id: "C", text: "No respiratory protection is required outdoors" },
        { id: "D", text: "Paper surgical masks with face shield" }
      ],
      answer: "B",
      explanation: "Ultra-Thane 230 HFO requires PPE including an approved vapor cartridge respirator. In well-ventilated roofing application conditions, Type C organic vapor cartridge respirators are acceptable. A-side contains polymeric MDI isocyanate, a vapor inhalation hazard.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-027",
      type: "mcq",
      question: "A worker will enter a partially enclosed mechanical penthouse with limited airflow to spray a small SPF repair. What respiratory protection upgrade does the vapor inhalation section recommend for poorly ventilated conditions?",
      options: [
        { id: "A", text: "Continue with Type C cartridges because the repair is small" },
        { id: "B", text: "Full face masks or NIOSH/MSHA approved fresh air systems are recommended for poorly ventilated conditions" },
        { id: "C", text: "No respirator is needed if gloves and coveralls are worn" },
        { id: "D", text: "Surgical mask with organic vapor inserts is sufficient" }
      ],
      answer: "B",
      explanation: "The best protection against sensitizing vapors is a fresh air supply. In well-ventilated roofing conditions Type C organic vapor cartridge respirators are acceptable, but for poorly ventilated conditions full face masks or NIOSH/MSHA approved fresh air systems are recommended.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UTH230-028",
      type: "mcq",
      question: "A new helper asks what eye and face protection is required while working near the spray gun where A-side isocyanate is atomized. What does the technical data sheet require?",
      options: [
        { id: "A", text: "Safety glasses only; full-face protection is never required outdoors" },
        { id: "B", text: "Safety glasses, gloves, and protective clothing, with a full-face mask or OSHA-approved protective goggles because A-side contains polymeric MDI" },
        { id: "C", text: "Hard hat only; eye protection is the coating crew's responsibility" },
        { id: "D", text: "Face shields may be removed once the first pass is down" }
      ],
      answer: "B",
      explanation: "PPE requirements include safety glasses, gloves, and protective clothing, plus an approved vapor cartridge respirator. Spray Foam A-side contains polymeric MDI isocyanate, a vapor inhalation and skin hazard. Eye contact guidance requires a full-face mask or OSHA-approved protective goggles, with immediate flushing if exposure occurs.",
      cite: "GCMC-TDS-Ultra-Thane-230-HF0.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const ULTRA_THANE_230_HFO_ROOFING_QUESTION_BANK_2026 = {
  ...ULTRA_THANE_230_HFO_ROOFING_QUESTION_BANK_2026_RAW,
  questions: ULTRA_THANE_230_HFO_ROOFING_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = ULTRA_THANE_230_HFO_ROOFING_QUESTION_BANK_2026;
