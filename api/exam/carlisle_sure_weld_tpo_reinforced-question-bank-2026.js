// Carlisle Sure-Weld TPO Reinforced - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF (internal only, never served via /api/book or /api/books):
//   sources/manufacturers/carlisle/pds/2026-01-sure-weld-tpo-reinforced-pds.pdf
// Per-question provenance lives in:
//   sources/manufacturers/carlisle/citations.json
//
// Question authoring target was 10 (the honest expert-level capacity of this
// PDS, agreed with product owner; the TPO PDS is materially denser than the
// two EPDM PDS documents). Every question is scenario-based, derived from
// the PDS facts, and paraphrased - no marketing prose copied verbatim.

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

const CARLISLE_SURE_WELD_TPO_REINFORCED_QUESTION_BANK_2026_RAW = {
  book: "Carlisle Sure-Weld TPO Reinforced",
  questions: [
    {
      id: "CARSW-001",
      type: "mcq",
      question: "A specifier is finalizing a Sure-Weld TPO 60-mil installation on a steel deck and is choosing between Carlisle-approved attachment designs. The design team has flagged that they want to minimize the number of holes punched through the MEMBRANE during attachment - separate from deck-penetration considerations. Per the Sure-Weld TPO PDS, which install design is the BEST match for that constraint?",
      options: [
        { id: "A", text: "Mechanically Fastened, because the fasteners are concealed under the seam overlap once the next membrane sheet is welded over them" },
        { id: "B", text: "Induction-Welded, because the system pre-fastens induction welding PLATES under the membrane and the welding tool then fuses the membrane to the plate from above; the membrane itself is never punctured by fasteners during attachment" },
        { id: "C", text: "Fully-Adhered, because bonding adhesive eliminates all rooftop fasteners through both deck and insulation in every case" },
        { id: "D", text: "Hot-air-welded only, because the PDS lists three install methods and one of them is hot-air seam welding alone" }
      ],
      answer: "B",
      explanation: "The PDS describes three attachment designs. (1) Mechanically Fastened: membrane is attached to the deck via PLATES AND FASTENERS that overlap with the next membrane sheet - the membrane IS punctured at every fastener line, even if the holes end up under the seam. (2) Induction-Welded: 'membrane is attached over a suitable substrate via an induction welding tool being placed over the membrane where a fastened TPO induction welding plate is located to weld the two components together' - the welding plates are fastened below the membrane and the membrane is welded to them from above, never punctured. (3) Fully-Adhered uses bonding adhesive for the membrane, but the insulation underneath is typically mechanically fastened to the deck, so 'eliminates all rooftop fasteners' overstates it. Option D mis-reads the PDS - hot-air welding is the SEAM technology used in ALL three designs, not a fourth attachment method.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 1, Installation (three attachment designs)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-002",
      type: "mcq",
      question: "A crew is installing Sure-Weld TPO with the optional APEEL Protective Film still adhered. The roof requires several detail cuts around drains and curbs. The foreman is about to use a razor blade to score the membrane along the layout lines while the APEEL film is still in place. Per the Sure-Weld PDS, what is the MOST IMPORTANT correction?",
      options: [
        { id: "A", text: "Score the membrane through the APEEL using two light passes to avoid pressing too hard" },
        { id: "B", text: "Razor-blade cuts through APEEL are fine on detail work but not on field seams" },
        { id: "C", text: "Do NOT use razor blades or other sharp tools to cut the APEEL Protective Film while it is still adhered to the TPO membrane - pull the APEEL away from the area to be cut FIRST, then perform the cut on the bare membrane, because razor pressure on the film can damage the underlying TPO sheet" },
        { id: "D", text: "Replace the razor blade with a heated knife; the heat helps the blade slip through the APEEL without contacting the membrane" }
      ],
      answer: "C",
      explanation: "The PDS gives a specific warning: \"Do not use razor blades or other sharp tools to cut the APEEL Protective Film while it is still adhered to the TPO membrane as damage to the underlying membrane may occur. Pull the protective film away from the membrane prior to cutting.\" The correct procedure is therefore to peel the APEEL off the area to be cut BEFORE scoring the membrane. Two-pass cutting, field-vs-detail exceptions, and heated knives are all fabricated workarounds - the PDS rule is unconditional. The PDS also notes a separate safety concern during APEEL removal: a static electric charge can develop, so flammable products on the roof must have closed lids and a fire extinguisher should be readily available.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 2, Precautions (APEEL razor prohibition)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-003",
      type: "mcq",
      question: "A general contractor is sequencing trades and asks the roofing contractor to leave the APEEL Protective Film on the new Sure-Weld TPO field for an extended period to protect against MEP rough-in foot traffic. Per the Sure-Weld PDS, what is the LONGEST the APEEL film can remain in place before degradation becomes a concern?",
      options: [
        { id: "A", text: "14 days" },
        { id: "B", text: "30 days" },
        { id: "C", text: "60 days" },
        { id: "D", text: "Up to 90 days; beyond that the PDS no longer guarantees the film's heat- and UV-resistance, and degraded film becomes harder to remove cleanly from the membrane surface" }
      ],
      answer: "D",
      explanation: "The PDS states: \"In areas that do not require heat-welding, the APEEL Protective Film can be left in place for up to 90 days without degrading due to its excellent heat- and UV-resistance.\" Beyond 90 days the film's heat- and UV-resistance properties are no longer warranted; degraded film can become difficult to remove cleanly and may leave residue. The 14/30/60-day options are conservative without basis in the PDS; allowing indefinite exposure misreads the explicit 90-day language.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 2, APEEL Protective Film (90-day window)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-004",
      type: "mcq",
      question: "A contractor bidding a 200,000 sq ft warehouse roof is evaluating whether to install Carlisle's 16-ft Sure-Weld TPO instead of the standard 10-ft sheets. The owner is skeptical about paying any premium for wider rolls. Per the PDS, what is the STRONGEST single business case the contractor can make?",
      options: [
        { id: "A", text: "Installing 16-ft sheets produces up to ~60% fewer seams versus 10-ft sheets - fewer rolls to load and stage, fewer rolls to kick out and align, fewer T-joint patches, and significantly fewer seams to weld, probe, and inspect; on a 200,000 sq ft roof those reductions translate to material labor savings and faster project completion" },
        { id: "B", text: "16-ft sheets are required by ASTM D6878 for roofs above 150,000 sq ft" },
        { id: "C", text: "16-ft sheets are the only Sure-Weld product variant that includes the OctaGuard XT weathering package" },
        { id: "D", text: "16-ft sheets cost less per square foot than 10-ft sheets" }
      ],
      answer: "A",
      explanation: "The PDS lists the 16-ft Sure-Weld TPO benefits explicitly: \"Fewer rolls to load and stage on a job saves crane time and labor at the beginning of each project. Fewer rolls to position, kick-out, and align during installation saves labor. Up to 60% fewer seams vs. 10-foot TPO. Fewer seams to weld, probe, and inspect, saving considerable time during installation. Fewer T-joint patches to install on each roof. Less waste and trash from packaging. Less time spent on each project.\" On a 200,000 sq ft job those labor and inspection savings dominate the per-square-foot pricing math. The other options invent constraints: ASTM D6878 does not impose roof-size width requirements, OctaGuard XT is the weathering package on ALL Sure-Weld TPO regardless of width, and 16-ft material is not categorically cheaper per square foot.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 2, Wider is Better (16-Foot TPO Benefits)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-005",
      type: "mcq",
      question: "A specifier is designing a Sure-Weld TPO roof over a wood structural deck (combustible) with a sloped section pitching at 3/4 inch per foot. Standard Sure-Weld TPO has a documented limitation in this scenario. Per the PDS, what is the CORRECT response?",
      options: [
        { id: "A", text: "Standard Sure-Weld TPO can be used at any slope; only TPO color choice is restricted at this pitch" },
        { id: "B", text: "The wood deck must be replaced with non-combustible material before any Sure-Weld TPO can be installed at any slope" },
        { id: "C", text: "The PDS notes that the High Slope (HS) formula 'opens assemblies for slopes greater than 1/2\" over combustible and non-combustible deck types where standard TPO is restricted'; Sure-Weld HS - formulated with additional flame retardant for higher-slope fire-code approvals - is the appropriate selection at this 3/4-inch-per-foot slope over the combustible deck" },
        { id: "D", text: "The contractor should substitute 16-ft Sure-Weld field sheets instead of standard 10-ft sheets to compensate for the slope" }
      ],
      answer: "C",
      explanation: "The PDS is specific: standard Sure-Weld TPO is restricted on combustible and non-combustible decks above 1/2-inch-per-foot slopes, and the Sure-Weld High Slope (HS) formulation - 'formulated with additional flame retardant for higher-slope fire code approvals' - opens those assemblies for slopes greater than 1/2 inch. On a 3/4-inch-per-foot slope over a wood deck, HS is the correct product variant. Replacing the deck (option B) is over-engineering. Option A ignores the restriction. Sheet width (option D) is unrelated to fire-code compliance at slope.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 1, Features and Benefits (HS formula)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-006",
      type: "mcq",
      question: "A facility manager is planning to mount a row of large skylight light wells directly onto a recently installed Sure-Weld TPO roof. The contractor estimates that direct solar gain plus reflected heat from the curb metal could push the membrane surface near a skylight to roughly 165-170\u00b0F on summer afternoons. Per the Sure-Weld PDS, what is the MOST APPROPRIATE response?",
      options: [
        { id: "A", text: "Membrane temperature is not a concern as long as the membrane is fully bonded to the substrate" },
        { id: "B", text: "The PDS specifies a maximum sustained temperature of 160\u00b0F (71\u00b0C) for the TPO membrane; predicted operating temperatures of 165-170\u00b0F exceed that limit, so the contractor must redesign the curb/flashing detail (insulation under the curb, reflective curb covers, shielding, or a higher-temperature-rated detail product) to manage the heat load BEFORE the skylight is installed" },
        { id: "C", text: "Use Sure-Weld 80-mil Extra in place of standard 60-mil; the thicker product is rated for unlimited sustained temperatures" },
        { id: "D", text: "Repaint the curb metal flat black so the heat is drawn away from the membrane" }
      ],
      answer: "B",
      explanation: "The PDS states: \"Maximum sustained temperature not to exceed 160\u00b0F (71\u00b0C) for TPO membrane.\" Heat above this limit accelerates the oxidative aging mechanism (the PDS quantifies elsewhere that oxidation roughly doubles for each 18\u00b0F / 10\u00b0C temperature increase). Membrane near skylights, equipment plinths, and reflective curb metal frequently exceeds 160\u00b0F on hot days, and the contractor's design must mitigate that condition - not ignore it. Switching to 80-mil Extra does not lift the temperature ceiling (option C invents an unlimited rating the PDS does not provide). Black curb metal would worsen the problem by absorbing more heat (option D is the wrong direction). Bonding has nothing to do with the temperature ceiling (option A).",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 2, Precautions (max sustained 160\u00b0F)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-007",
      type: "mcq",
      question: "A roof consultant is modeling expected service life for a Sure-Weld TPO installation in two cities: one with summer rooftop membrane temperatures averaging 140\u00b0F and one averaging 158\u00b0F. Both sites use the same membrane, same assembly, and same flashings. Per the Sure-Weld PDS heat-aging language, what is the BEST way to characterize the difference in oxidative aging rate between the two sites?",
      options: [
        { id: "A", text: "Oxidation rate is approximately the same at both sites because both are below the 160\u00b0F sustained-temperature ceiling" },
        { id: "B", text: "The cooler site oxidizes 50% faster because lower temperatures allow more oxygen absorption into the membrane" },
        { id: "C", text: "Oxidation rate is unrelated to membrane temperature once the membrane is installed under a bonded assembly" },
        { id: "D", text: "Oxidation rate roughly DOUBLES for every 18\u00b0F (10\u00b0C) increase in roof membrane temperature; the 18\u00b0F gap between the two sites implies the hotter site's TPO is aging at roughly twice the oxidation rate of the cooler site - a real and material driver of expected service life" }
      ],
      answer: "D",
      explanation: "The PDS states explicitly: \"Heat aging accelerates the oxidation rate that roughly doubles for each 18\u00b0F (10\u00b0C) increase in roof membrane temperature. Oxidation (reaction with oxygen) is one of the primary chemical degradation mechanisms of roofing materials.\" A 158\u00b0F site is 18\u00b0F warmer than a 140\u00b0F site, which means the oxidation rate is roughly double. That is a quantifiable service-life modifier. Option A misreads the rule (the doubling does not pivot at 160\u00b0F - 160\u00b0F is the sustained-temperature ceiling, not the oxidation threshold). Option B inverts the chemistry. Option C contradicts the PDS.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 1, Heat Aging (oxidation doubles per 18\u00b0F)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-008",
      type: "mcq",
      question: "A specifier is choosing among 45-mil, 60-mil, and 80-mil Sure-Weld TPO Extra for a mid-rise roof that has BOTH pedestrian-access maintenance routes AND a planned PV array installation with frequent crew traffic carrying tools. Per the dynamic puncture data (ASTM D5635-04 using the most recently modified impact head) in the PDS, what does the PDS say about watertightness after impact for each thickness?",
      options: [
        { id: "A", text: "All three thicknesses fail at 10 J; thickness does not affect dynamic puncture watertightness" },
        { id: "B", text: "The PDS provides only static puncture data, not dynamic puncture data" },
        { id: "C", text: "Per the PDS, 45-mil was watertight after a 12.5 J (9.2 ft-lbf) impact, 60-mil was watertight after 22.5 J (16.6 ft-lbf), and 80-mil Extra was watertight after 30.0 J (22.1 ft-lbf); each step up provides materially greater impact resistance, and for a roof that combines maintenance traffic AND PV crew tool drops the 80-mil Extra is the defensible selection because dropped-tool energies regularly fall in the 20-30 J range" },
        { id: "D", text: "Dynamic puncture is the same as static puncture; ASTM D5635-04 has been withdrawn" }
      ],
      answer: "C",
      explanation: "The PDS provides specific dynamic puncture energy thresholds for each thickness tested per ASTM D5635-04: 45-mil (1.14 mm) was watertight after an impact energy of 12.5 J (9.2 ft-lbf), 60-mil (1.52 mm) after 22.5 J (16.6 ft-lbf), and 80-mil (2.03 mm) Extra after 30.0 J (22.1 ft-lbf). The progression is materially significant - roughly doubling from 45-mil to 60-mil and rising substantially again to 80-mil. For a roof that combines maintenance traffic AND PV crew tool drops, the 80-mil Extra is the defensible selection because dropped-tool impact energies regularly fall in the 20-30 J range. Options A and D contradict the PDS data and the standard; option B incorrectly claims dynamic data is missing when it is in fact a supplemental approvals/statement in the PDS.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 2, Supplemental Approvals (ASTM D5635-04)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-009",
      type: "mcq",
      question: "A roll of Sure-Weld TPO was stored on a job site partially uncovered for several weeks, with one end of the roll exposed to outdoor weather. The crew wants to install that roll today and heat-weld seams as usual. Per the Sure-Weld PDS, what is the REQUIRED step before any of the weather-exposed area can be heat-welded into the field?",
      options: [
        { id: "A", text: "The weather-exposed portion must be discarded; the PDS allows no recovery once a roll has been weather-exposed" },
        { id: "B", text: "The weather-exposed portion must be prepared with Weathered Membrane Cleaner prior to hot-air welding - surface contaminants from outdoor exposure interfere with the surface-fusion weld, and the cleaner restores a weldable surface chemistry" },
        { id: "C", text: "Apply primer (the type used on EPDM splices) to the weld area to neutralize the weather contamination before welding" },
        { id: "D", text: "Heat the weld area with a hot-air gun for 90 seconds before welding to drive off moisture; that satisfies the weather-exposure requirement" }
      ],
      answer: "B",
      explanation: "The PDS gives a specific instruction for weather-exposed TPO: \"Membrane that has been exposed to the weather must be prepared with Weathered Membrane Cleaner prior to hot-air welding.\" Outdoor exposure deposits surface contaminants (UV-oxidized film, dirt, biological matter) that prevent a full surface-fusion weld; the cleaner restores a weldable surface chemistry. Discarding the roll (option A) is unnecessary and is not what the PDS prescribes. Primer (option C) is an EPDM splicing technology, not a TPO weld-prep technique. Pre-heating (option D) only drives off moisture - which is not the issue - and does not remove chemical surface contamination.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 2, Precautions (Weathered Membrane Cleaner)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "CARSW-010",
      type: "mcq",
      question: "A building owner in California wants a Patina Green Sure-Weld TPO roof for aesthetics, expects the roof to qualify for California Title 24 cool-roof compliance AND for NSF P151 rainwater catchment, and assumes the standard warranty will protect the green color from UV fading. Per the Sure-Weld PDS, which combination of facts is CORRECT?",
      options: [
        { id: "A", text: "Color membrane warranties do NOT cover fading from UV exposure (the PDS states this explicitly), California Title 24 compliance is footnoted as 'White and Tan only,' and NSF P151 certification is footnoted as 'White only, produced in Tooele, UT and Carlisle, PA' - Patina Green satisfies none of these three owner expectations and all three need to be disclosed before contract signing" },
        { id: "B", text: "Patina Green is covered for fading under the standard Sure-Weld warranty" },
        { id: "C", text: "California Title 24 compliance applies to all Sure-Weld special colors, including Patina Green, when used in mechanically attached assemblies" },
        { id: "D", text: "NSF P151 certification applies to every Sure-Weld color when the membrane is fully adhered" }
      ],
      answer: "A",
      explanation: "The PDS contains three relevant constraints, all of which apply against the owner's expectations: (1) \"Color membranes will 'fade' over time mainly due to the ultraviolet portion of sunlight... Warranties for color membranes do not cover fading of colors\" - so Patina Green will fade over time and the warranty will not pay for it. (2) The 'California Title 24 compliant' bullet is footnoted 'White and Tan only' - Patina Green does not qualify for the Title 24 cool-roof credit. (3) The 'NSF P151 certification for rainwater catchment' bullet is footnoted 'White only, produced in Tooele, UT and Carlisle, PA' - Patina Green is not rainwater-catchment certified. All three of the owner's expectations are therefore wrong; the contractor's professional duty is to disclose all three before contract signing.",
      cite: "Carlisle Sure-Weld TPO Reinforced PDS - p. 2, Precautions (color fading) + p. 1, Sustainable Attributes (Title 24, NSF P151)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const CARLISLE_SURE_WELD_TPO_REINFORCED_QUESTION_BANK_2026 = {
  ...CARLISLE_SURE_WELD_TPO_REINFORCED_QUESTION_BANK_2026_RAW,
  questions: CARLISLE_SURE_WELD_TPO_REINFORCED_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = CARLISLE_SURE_WELD_TPO_REINFORCED_QUESTION_BANK_2026;
