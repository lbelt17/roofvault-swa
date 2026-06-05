// Elevate UltraPly TPO Application Guide - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: 166964.pdf (32 pages)
// Authoring target: ~48 installation/application certification questions grounded in source text.
// Topics: safety/jobsite, substrate prep, wood nailers, vapor barriers, base sheet,
// insulation attachment, membrane install/seaming, weld windows, probing, cold weather,
// ballast restrictions, flashing, tie-ins, fanfold EPS, destructive test welds, etc.


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

const ELEVATE_ULTRAPLY_TPO_QUESTION_BANK_2026_RAW = {
  book: "Elevate UltraPly TPO Application Guide",
  questions: [
    {
      id: "ELTPO-001",
      type: "mcq",
      question: "A crew is bonding TPO membrane on an occupied hospital using solvent-based adhesive while rooftop air-handling intakes are operating. Per Elevate jobsite safety guidance, what precaution is required?",
      options: [
        { id: "A", text: "No special precautions are needed if the adhesive is Elevate-branded" },
        { id: "B", text: "Take suitable precautions because adhesive solvent fumes may be drawn into the building through rooftop intakes" },
        { id: "C", text: "Shut down all rooftop equipment permanently before any adhesive work" },
        { id: "D", text: "Use heat guns to accelerate flash-off so fumes dissipate faster" }
      ],
      answer: "B",
      explanation: "Elevate warns that fumes from adhesive solvents may be drawn into the building during installation through rooftop intakes on occupied buildings, and suitable precautions must be taken. Heat guns or open flames must not be used to dry adhesives and primers.",
      cite: "166964.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-002",
      type: "mcq",
      question: "During a winter install at 35°F (2°C), the foreman notices condensation forming on freshly applied solvent-based primer. What does the Elevate Application Guide require?",
      options: [
        { id: "A", text: "Continue application and rely on the welder heat to evaporate condensation" },
        { id: "B", text: "Discontinue application until ambient conditions no longer cause condensation and the membrane is clean and dry" },
        { id: "C", text: "Switch to oil-base roof cement to improve cold-weather adhesion" },
        { id: "D", text: "Apply primer at double coverage to overcome condensation" }
      ],
      answer: "B",
      explanation: "When outside temperature is below 40°F (4°C), certain temperature and humidity combinations can cause condensation on solvent-based adhesives and primers. If this occurs, application must be discontinued until conditions improve and surfaces are clean and dry.",
      cite: "166964.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-003",
      type: "mcq",
      question: "A mechanic proposes using generic bituminous roof cement to seal a TPO curb flashing detail. Per Elevate product cautions, this approach is:",
      options: [
        { id: "A", text: "Acceptable when temperatures are below 40°F" },
        { id: "B", text: "Acceptable only at perimeter terminations" },
        { id: "C", text: "Not permitted—oil-base or bituminous-base roof cement must not be used with any Elevate TPO products" },
        { id: "D", text: "Permitted if covered with TPO membrane within 24 hours" }
      ],
      answer: "C",
      explanation: "Elevate explicitly prohibits oil-base or bituminous-base roof cement with any Elevate TPO products. Direct contact with asphalt products can also stain the membrane.",
      cite: "166964.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-004",
      type: "mcq",
      question: "The general contractor asks the roofing foreman to perform core-cut destructive testing for project close-out documentation. According to Elevate substrate preparation policy, what is the consequence?",
      options: [
        { id: "A", text: "Elevate recognizes third-party destructive test results for warranty issuance" },
        { id: "B", text: "Destructive testing by others is not recognized; damage from such testing may prevent Elevate from issuing a warranty" },
        { id: "C", text: "Destructive testing is required before any re-cover application" },
        { id: "D", text: "Only nuclear moisture scans require Elevate pre-approval" }
      ],
      answer: "B",
      explanation: "Elevate does not approve of or recognize destructive testing by others for project close-out or contract requirements. Any damage caused by such testing may prevent Elevate from issuing a warranty, and Elevate is not responsible for repair costs resulting from testing.",
      cite: "166964.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-005",
      type: "mcq",
      question: "Before installing UltraPly TPO on a re-cover project, the crew finds ponded water and trace frost on the existing roof surface. What must occur first?",
      options: [
        { id: "A", text: "Proceed if frost is less than 1/8 inch thick" },
        { id: "B", text: "Install a temporary vapor barrier over the frost to encapsulate moisture" },
        { id: "C", text: "Remove ponded water, snow, frost, and/or ice present in more than trace amounts from all work surfaces" },
        { id: "D", text: "Mechanically attach membrane immediately to lock down remaining moisture" }
      ],
      answer: "C",
      explanation: "Ponded water, snow, frost, and/or ice present in more than trace amounts must be removed from work surfaces prior to installing the Elevate TPO system. Cold-weather guidance also requires the roof surface to be dry because trace moisture can cause poor adhesion and moisture entrapment.",
      cite: "166964.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-006",
      type: "mcq",
      question: "While preparing a concrete deck, the crew finds surface voids 3/8 inch (9.5 mm) wide in the immediate membrane substrate. How must these be addressed before roofing proceeds?",
      options: [
        { id: "A", text: "Fill with roofing mastic only" },
        { id: "B", text: "Fill all surface voids greater than 1/4 inch (6.35 mm) wide with insulation" },
        { id: "C", text: "Leave voids open if covered by base sheet" },
        { id: "D", text: "Overlay with membrane only; voids under 1/2 inch need no treatment" }
      ],
      answer: "B",
      explanation: "All surface voids of the immediate membrane substrate greater than 1/4 inch (6.35 mm) wide must be filled with insulation. Additionally, Elevate does not accept concrete substrates sealed with chemical sealers or silicon surface treatments for warranted systems.",
      cite: "166964.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-007",
      type: "mcq",
      question: "A project specification calls for pressure-treated wood nailers at parapets. The metal fabricator plans to use aluminum counterflashing in direct contact with the treated nailers. Per Elevate wood nailer requirements, this is:",
      options: [
        { id: "A", text: "Required for coastal corrosion resistance" },
        { id: "B", text: "Acceptable if nails are hot-dipped galvanized G185" },
        { id: "C", text: "Not permitted—aluminum fasteners, flashings, and accessories must not make direct contact with treated wood nailers" },
        { id: "D", text: "Permitted when nailers are kiln-dried Southern Pine" }
      ],
      answer: "C",
      explanation: "When treated wood nailers are required, aluminum fasteners, flashings, and accessory products must not make direct contact with them. Uncoated or painted metal (except 300-series stainless) also must not contact treated nailers. UltraPly TPO membrane may be used as a separator when compatibility is uncertain.",
      cite: "166964.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-008",
      type: "mcq",
      question: "A carpenter is stocking non-treated wood nailers on the roof before installation. What storage practice does Elevate require?",
      options: [
        { id: "A", text: "Lay nailers flat on the deck exposed to weather for acclimation" },
        { id: "B", text: "Properly elevate and cover non-treated wood to protect from weather and keep dry while stored on the roof" },
        { id: "C", text: "Soak nailers in primer to prevent moisture absorption" },
        { id: "D", text: "Store nailers only in the mechanical room until membrane is installed" }
      ],
      answer: "B",
      explanation: "Wood nailers must be kiln-dried structural grade #2 or better (Southern Pine or Douglas Fir). While stored on the roof, non-treated wood must be properly elevated and covered to protect from weather and keep dry. Nailers must also be firmly fastened to resist a minimum force of 200 lb/f (890 N) in any direction.",
      cite: "166964.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-009",
      type: "mcq",
      question: "Wood nailers are being installed to receive metal edge flashing on a tapered insulation assembly. What dimensional relationship must the nailer maintain relative to the insulation and metal flange?",
      options: [
        { id: "A", text: "Nailer height may be 1 inch below insulation thickness; flange overhang is unrestricted" },
        { id: "B", text: "Total nailer height must match total insulation thickness; nailer must exceed metal flange width by at least 1/2 inch (13 mm)" },
        { id: "C", text: "Nailers must be 2 inches taller than insulation to allow for ballast" },
        { id: "D", text: "Nailer width must equal flange width exactly for weld alignment" }
      ],
      answer: "B",
      explanation: "Total wood nailer height must match the total thickness of insulation being used. Nailers shall be a minimum 2x4 nominal (1-1/2 x 3-1/2 in actual) and exceed the width of any attached metal flange by at least 1/2 inch (13 mm). A 1/8 inch (3.2 mm) gap is required between each nailer length and at direction changes.",
      cite: "166964.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-010",
      type: "mcq",
      question: "On a new poured-in-place concrete deck, non-treated wood nailers will be installed directly over the deck. What separator is required?",
      options: [
        { id: "A", text: "A layer of fanfold EPS only" },
        { id: "B", text: "A waterproof separator membrane between the non-treated lumber and the deck" },
        { id: "C", text: "Hot asphalt flood coat" },
        { id: "D", text: "No separator is required for concrete decks" }
      ],
      answer: "B",
      explanation: "For new construction over poured-in-place decks or fill, and all recover projects, a waterproof separator membrane must be placed between non-treated lumber and the deck. This protects the nailer and roof assembly from moisture at the deck interface.",
      cite: "166964.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-011",
      type: "mcq",
      question: "A vapor barrier specification calls for Elevate V-Force Membrane over a gypsum deck. What substrate preparation step is mandatory before membrane placement?",
      options: [
        { id: "A", text: "No primer is required on any deck type" },
        { id: "B", text: "Prime all substrates except metal decks with either Elevate SA Water Based or SA Solvent Based Primer" },
        { id: "C", text: "Apply oil-base primer to improve peel strength" },
        { id: "D", text: "Solid mop gypsum with Type IV asphalt before V-Force installation" }
      ],
      answer: "B",
      explanation: "For V-Force Membrane, all substrates except metal decks must be primed with Elevate SA Water Based or SA Solvent Based Primer. V-Force is positioned with minimum 3-inch side laps and 6-inch end laps, with side laps shingled up the slope and end laps staggered a minimum of 12 inches.",
      cite: "166964.pdf - Page 7",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-012",
      type: "mcq",
      question: "During V-Force FR vapor barrier installation on a steel deck, the applicator is planning lap locations. How must laps be supported at flute locations?",
      options: [
        { id: "A", text: "Laps may span open flutes without support if adhesive is pressure-sensitive" },
        { id: "B", text: "Laps of sheets should be supported by deck flutes; cover flutes at end-lap locations with 24-gauge 6-inch-wide metal strips spanning the flutes" },
        { id: "C", text: "Fill all flutes with lightweight concrete before vapor barrier installation" },
        { id: "D", text: "End laps are not permitted on steel decks" }
      ],
      answer: "B",
      explanation: "On steel decks, laps of V-Force FR sheets should be supported by deck flutes. Flutes where end laps will occur must be covered with 24-gauge 6-inch (152.4 mm) wide metal strips spanning the flutes, attached with #10 pancake head screws through 9/32-inch oval holes. All side and head laps are a minimum of 3 inches.",
      cite: "166964.pdf - Page 7",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-013",
      type: "mcq",
      question: "A base sheet installer is about to run the base ply into direct contact with the TPO cap sheet at a roof edge detail. Per Elevate base sheet requirements, this practice is:",
      options: [
        { id: "A", text: "Recommended to simplify edge flashing" },
        { id: "B", text: "Acceptable only on slopes below 1/4:12" },
        { id: "C", text: "Prohibited—roofing base ply shall never touch roofing single ply, even at roof edges, laps, tapered edge strips, and cants" },
        { id: "D", text: "Permitted if both sheets are Elevate-compatible" }
      ],
      answer: "C",
      explanation: "Roofing base ply shall never touch roofing single ply, even at roof edges, laps, tapered edge strips, and cants. Fishmouths and unsealed side laps must be cut out and repaired. Fully adhered base sheets that are not fully and continuously bonded must be replaced.",
      cite: "166964.pdf - Page 7",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-014",
      type: "mcq",
      question: "The design calls for a base sheet in solid hot asphalt mopping directly over Elevate ISO 95+ GL polyisocyanurate insulation. What does Elevate require?",
      options: [
        { id: "A", text: "Solid mopping directly to polyiso is acceptable at EVT" },
        { id: "B", text: "The base sheet must not be installed in solid asphalt mopping directly to polyiso; use mechanical or spot asphalt attachment, or install an approved coverboard overlay first" },
        { id: "C", text: "Only Type I asphalt may contact polyiso" },
        { id: "D", text: "Polyiso must be fanfold EPS before asphalt mopping" }
      ],
      answer: "B",
      explanation: "Base or ply sheets must not be installed in solid mopping of asphalt directly to polyisocyanurate insulation. The base sheet must be mechanically attached or spot attached using ASTM D312 Type III or IV asphalt or Elevate SEBS mopping asphalt. An overlay of approved coverboard (Structodek HD, SECUROCK, DensDeck, DEXcell, etc.) may be installed over polyiso before the base sheet.",
      cite: "166964.pdf - Page 8",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-015",
      type: "mcq",
      question: "A 39-inch Elevate-compatible base sheet is being mechanically attached with insulation plates and fasteners. What is the required fastening pattern in the side laps and field?",
      options: [
        { id: "A", text: "6 inches o.c. in side laps; single row at 24 inches o.c. in field" },
        { id: "B", text: "12 inches o.c. in side laps; two staggered rows at 18 inches o.c. in field, each row approximately 13 inches in from sheet sides" },
        { id: "C", text: "18 inches o.c. in side laps only; no field fasteners required" },
        { id: "D", text: "9 inches o.c. in side laps; cap nails in two rows at 12 inches o.c." }
      ],
      answer: "B",
      explanation: "Using Elevate insulation plates and fasteners, compatible base sheets must be mechanically attached 12 inches o.c. in side laps and 18 inches o.c. in two staggered rows in the field, with each row approximately 13 inches in from the sides. Side laps require minimum 3 inches; end laps minimum 6 inches with 12-inch minimum offset from cap sheet laps.",
      cite: "166964.pdf - Page 8",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-016",
      type: "mcq",
      question: "On a plywood deck, the contractor proposes attaching the base sheet with cap nails through an existing insulated built-up roof. Per Elevate cap nail limitations, this is:",
      options: [
        { id: "A", text: "Standard practice for recover projects" },
        { id: "B", text: "Not permitted—cap nails cannot attach a base sheet through an existing insulated roof" },
        { id: "C", text: "Permitted at 9 inches o.c. in side laps only" },
        { id: "D", text: "Permitted if gravel has been removed from the BUR" }
      ],
      answer: "B",
      explanation: "Cap nails with 1-inch steel heads may attach base sheets to plywood, wood plank, and OSB decks at 9 inches o.c. in side laps and 18 inches o.c. in two staggered field rows. Cap nails cannot attach insulation, attach a base sheet through an existing insulated roof, attach over gravel-surfaced BUR, or through smooth-surfaced uninsulated BUR over 1/2 inch thick.",
      cite: "166964.pdf - Page 8",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-017",
      type: "mcq",
      question: "A two-layer polyiso assembly is being installed. How must joints between insulation layers be arranged?",
      options: [
        { id: "A", text: "Joints may align vertically for faster installation" },
        { id: "B", text: "All joints between layers shall be staggered a minimum of 6 inches (152 mm)" },
        { id: "C", text: "Only the top layer joints require staggering" },
        { id: "D", text: "Staggering is required only on metal decks" }
      ],
      answer: "B",
      explanation: "When installing multiple layers of insulation, all joints between layers must be staggered a minimum of 6 inches. Insulation must fit penetrations and nailers with no gaps greater than 1/4 inch unfilled, and the membrane must not be left unsupported over spaces greater than 1/4 inch.",
      cite: "166964.pdf - Page 9",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-018",
      type: "mcq",
      question: "After overdriving a fastener into insulation, the mechanic removes it and intends to reinstall in the same hole. What does Elevate direct?",
      options: [
        { id: "A", text: "Reinstall the same fastener immediately to maintain wind rating" },
        { id: "B", text: "Fill the hole with pourable sealer and reuse it" },
        { id: "C", text: "Do not reinstall a fastener into the same hole after removal" },
        { id: "D", text: "Double-stack plates in the same hole for compensation" }
      ],
      answer: "C",
      explanation: "Fasteners must be fully seated but not overdriven, using a properly adjusted clutch or depth-sensing drill—not a standard single-speed drill. If a fastener must be removed after installation, it must not be reinstalled into the same hole.",
      cite: "166964.pdf - Page 9",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-019",
      type: "mcq",
      question: "The specification lists ISOGARD HD insulation with asphalt attachment. According to Elevate insulation attachment guidance, this combination is:",
      options: [
        { id: "A", text: "Standard for all warranty terms" },
        { id: "B", text: "Acceptable at EVT minus 25°F" },
        { id: "C", text: "Not permitted—Resista/ISOGARD CG and ISOGARD HD may not be asphalt attached" },
        { id: "D", text: "Permitted only on concrete decks" }
      ],
      answer: "C",
      explanation: "Insulation may be attached with solid mopping of Elevate SEBS asphalt or ASTM D312 Type III or IV asphalt, but Resista/ISOGARD CG and ISOGARD HD may not be asphalt attached. Asphalt must be at manufacturer's stated EVT less approximately 25°F at installation, with roughly 25-30 lb per 100 ft² coverage.",
      cite: "166964.pdf - Page 9",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-020",
      type: "mcq",
      question: "A recover project will use Alleguard Fanfold EPS under a mechanically attached UltraPly TPO membrane. What minimum preliminary fastening is required for warranty compliance per Table 1?",
      options: [
        { id: "A", text: "One fastener per 64 ft²" },
        { id: "B", text: "Minimum 5 fasteners and plates per 32 ft² into appropriate substrate" },
        { id: "C", text: "Fanfold may be loose-laid without fasteners in recover applications" },
        { id: "D", text: "12 inches o.c. in side laps only" }
      ],
      answer: "B",
      explanation: "Alleguard Fanfold rigid board insulation must be preliminarily fastened with appropriate fasteners and plates at a minimum of 5 fasteners and plates per 32 ft² into appropriate substrate, and is approved for appropriate re-cover applications only. Fanfold must be Type VIII, minimum 1/2 inch thick, with a suitable facer—bare EPS must never contact PVC, PVC KEE, or residual asphalt.",
      cite: "166964.pdf - Page 10",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-021",
      type: "mcq",
      question: "An owner requests a 30-year Red Shield warranty on a system using Fanfold EPS instead of Elevate insulation/coverboard. What warranty limitation applies?",
      options: [
        { id: "A", text: "Fanfold qualifies for full 30-year terms with increased fastening" },
        { id: "B", text: "Maximum Red Shield warranty term for systems including Fanfold is 20 years; hail and cut/puncture protection are not available" },
        { id: "C", text: "Fanfold voids all warranty coverage" },
        { id: "D", text: "Fanfold is limited to 15 years only on steel decks" }
      ],
      answer: "B",
      explanation: "The maximum Red Shield warranty term for systems including Fanfold is 20 years. Wind speeds up to 55 MPH may be approved based on project characteristics. Hail and Cut & Puncture Protection are not available when Fanfold is used in lieu of Elevate insulation and/or coverboard.",
      cite: "166964.pdf - Page 10",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-022",
      type: "mcq",
      question: "Before installing Fanfold over an existing single-ply membrane in a recover application, what surface preparation does Elevate require?",
      options: [
        { id: "A", text: "Leave the existing membrane intact and adhere Fanfold with bonding adhesive" },
        { id: "B", text: "Cut existing single-ply into 10 ft x 10 ft grids and detach/remove all flashings and base tie-ins before attaching Fanfold" },
        { id: "C", text: "Overlay Fanfold directly without modifying existing flashings" },
        { id: "D", text: "Sand the membrane surface with a wire brush before Fanfold attachment" }
      ],
      answer: "B",
      explanation: "Existing single-ply membrane should be cut into 10 ft x 10 ft grids, and all flashings and base tie-ins should be detached/removed before attaching Fanfold with appropriate fasteners and plates. Damaged or wet existing components must be removed/replaced. Adjacent Fanfold sheets should be laid parallel and staggered every 2 feet.",
      cite: "166964.pdf - Page 10",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-023",
      type: "mcq",
      question: "A ballasted TPO system is proposed over mechanically attached polyiso insulation on DensDeck. Per Elevate ballast restrictions, this design is:",
      options: [
        { id: "A", text: "Approved if stone ballast exceeds 12 lb/ft²" },
        { id: "B", text: "Not permitted—ballasted systems are not allowed when membrane is over mechanically attached insulation or directly over hard surfaces such as DensDeck" },
        { id: "C", text: "Permitted only with 80-mil membrane" },
        { id: "D", text: "Permitted when perimeter is fully adhered" }
      ],
      answer: "B",
      explanation: "Ballasted systems are not permitted when membrane is installed directly over mechanically attached insulation or over hard surfaces such as HailGard/ISOGARD HG, ISOGARD HD, DensDeck, SECUROCK, DEXcell, OSB, or concrete. Ballast systems are also not approved when Elevate Platinum System warranties are desired. Adhesive attachment of insulation is acceptable for ballasted systems if required.",
      cite: "166964.pdf - Page 9",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-024",
      type: "mcq",
      question: "A fully adhered UltraPly TPO panel has just been unrolled on a warm morning. How long must the panel relax before attaching or splicing?",
      options: [
        { id: "A", text: "No relaxation period is required on warm days" },
        { id: "B", text: "10 minutes minimum" },
        { id: "C", text: "30 minutes minimum before attaching or splicing" },
        { id: "D", text: "24 hours to eliminate sheet memory" }
      ],
      answer: "C",
      explanation: "For adhered membrane, place the panel starting at the low side, unroll over the acceptable substrate, and allow the panel to relax for 30 minutes before attaching or splicing. The adhered system should be installed so seams shed or run parallel to water flow wherever possible, with 3-1/2 inch marked side laps and minimum 3-inch end laps.",
      cite: "166964.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-025",
      type: "mcq",
      question: "While applying bonding adhesive for a fully adhered field sheet, the applicator is approaching the seam area that will later be hot-air welded. What is required at the seam zone?",
      options: [
        { id: "A", text: "Extend adhesive 2 inches into the seam for stronger bond" },
        { id: "B", text: "Stop bonding adhesive short of the seam area; all bonding adhesive must be completely removed from the seam area before welding" },
        { id: "C", text: "Spray adhesive across the full width including seams for uniformity" },
        { id: "D", text: "Apply primer only in the seam area after adhesive flash-off" }
      ],
      answer: "B",
      explanation: "Always stop bonding adhesive short of the membrane seam area. Care must be taken not to apply bonding adhesive over any area to be hot-air welded to another sheet or flashing. All bonding adhesive must be completely removed from the seam area before welding.",
      cite: "166964.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-026",
      type: "mcq",
      question: "The crew performs the Touch-Push Test on flashed-off bonding adhesive and observes wet, stringy adhesive when lifting the finger. What should they do?",
      options: [
        { id: "A", text: "Mate the membrane immediately and broom vigorously" },
        { id: "B", text: "Add heat with a heat gun to accelerate curing" },
        { id: "C", text: "Wait—the adhesive is not ready for mating until it does not stick or string and is ready throughout its thickness" },
        { id: "D", text: "Dilute adhesive with splice wash and reapply" }
      ],
      answer: "C",
      explanation: "The Touch-Push Test requires touching the adhesive with a clean, dry finger and pushing forward at an angle. If motion exposes wet or stringy adhesive when the finger is lifted, the adhesive is not ready for mating. Flash-off time varies with temperature, wind, and humidity.",
      cite: "166964.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-027",
      type: "mcq",
      question: "Membrane panels have been open overnight (>12 hours) and accumulated jobsite dust before splicing. What surface preparation is required before welding?",
      options: [
        { id: "A", text: "Wipe with denatured alcohol only" },
        { id: "B", text: "Wash mating surfaces with Splice Wash SW-100 and allow to dry" },
        { id: "C", text: "Brush dust off and weld immediately" },
        { id: "D", text: "Apply bonding adhesive over the seam to encapsulate contamination" }
      ],
      answer: "B",
      explanation: "If membrane has been open for more than 12 hours or becomes contaminated with dirt, debris, or moisture, mating surfaces must be washed with Splice Wash SW-100 and allowed to dry before welding. For seaming, clean at least 6 inches wide on both sheets when using SW-100 prior to welding activity.",
      cite: "166964.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-028",
      type: "mcq",
      question: "On an FM-insured steel deck project with mechanically attached UltraPly TPO, how must field membrane attachment orientation relate to deck panels?",
      options: [
        { id: "A", text: "Parallel to deck panels for fewer fasteners" },
        { id: "B", text: "Perpendicular to deck panels per FM 1-29 when Factory Mutual insured or specified" },
        { id: "C", text: "Diagonal at 45 degrees to deck ribs" },
        { id: "D", text: "Orientation is optional on steel decks" }
      ],
      answer: "B",
      explanation: "Elevate suggests field attachment run perpendicular to steel deck panels. If a project is Factory Mutual insured or specified, per FM 1-29 attachment must run perpendicular to deck panels. Mechanically attached systems use up to four half-width perimeter sheets, with 6-inch marked side laps and minimum 3-inch end laps.",
      cite: "166964.pdf - Page 12",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-029",
      type: "mcq",
      question: "A mechanic is securing a half-sheet perimeter panel with UltraPly TPO seam plates before heat welding. Where must each fastener be positioned relative to the sheet edge and weld zone?",
      options: [
        { id: "A", text: "At the outer membrane edge for maximum pull-out resistance" },
        { id: "B", text: "2 inches inside the membrane edge and 1 inch from the area to be heat welded" },
        { id: "C", text: "Centered in the 6-inch lap without regard to weld line" },
        { id: "D", text: "Through the weld area to combine attachment and seaming" }
      ],
      answer: "B",
      explanation: "The inside edge of the half-sheet lap is fastened with approved UltraPly TPO seam plates and fasteners. Each fastener is positioned 2 inches inside the membrane edge and 1 inch from the area to be heat welded per lap splice details. Fastener heads must be flush within the countersunk portion of the seam plate.",
      cite: "166964.pdf - Page 12",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-030",
      type: "mcq",
      question: "A Wide Weld batten strip system is being installed. How must the batten be positioned relative to the membrane edge for proper Wide Weld seam alignment?",
      options: [
        { id: "A", text: "Flush with the membrane cut edge" },
        { id: "B", text: "Centered 3-9/16 inches (90.5 mm) from the membrane edge" },
        { id: "C", text: "6 inches outside the membrane edge" },
        { id: "D", text: "Directly under the printed lap line without offset" }
      ],
      answer: "B",
      explanation: "For Wide Weld systems, the inside edge of the half-sheet lap is fastened with appropriate batten strips. To position the batten for the Wide Weld seam, center the batten 3-9/16 inches from the membrane edge. Field-cut battens require rounded ends, burr removal, and 2-inch membrane circle patches centered under cut batten ends.",
      cite: "166964.pdf - Page 13",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-031",
      type: "mcq",
      question: "Stone ballast is being spread on an approved ballasted UltraPly TPO roof. What minimum ballast rate and stone type does Elevate specify?",
      options: [
        { id: "A", text: "Never less than 5 lb/ft² using pea gravel" },
        { id: "B", text: "Never less than 10 lb/ft² (4.5 kg/ft²) using ASTM #4 stone" },
        { id: "C", text: "Never less than 15 lb/ft² using river rock" },
        { id: "D", text: "Ballast rate is at installer discretion with no minimum" }
      ],
      answer: "B",
      explanation: "Stone ballast must be spread at the rate specified by the project designer but never less than 10 lb/ft² using ASTM #4 stone. Ballast must be distributed with soft rubber-tired ballast buggies, spread around penetrations by hand, and walkway ballast displaced by pads must be redistributed to maintain the specified average rate.",
      cite: "166964.pdf - Page 14",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-032",
      type: "mcq",
      question: "At the start of a welding shift after lunch, the robotic welder was shut down for 90 minutes and ambient temperature dropped 15°F. What quality verification does Elevate require before resuming production welds?",
      options: [
        { id: "A", text: "Visual inspection only if yesterday's welds passed" },
        { id: "B", text: "Destructive tests at the beginning of each welding day and every time there is an interruption in the welding process" },
        { id: "C", text: "Destructive tests only at final inspection" },
        { id: "D", text: "Probe welds only—destructive tests are optional" }
      ],
      answer: "B",
      explanation: "Destructive tests must be completed at the beginning of each day of welding and every time there is an interruption in the welding process (power failure, welder shutdown, change in jobsite conditions, after lunch, etc.) to verify adequate seam strength. Test welds with scrap membrane should also be used to dial in proper temperatures after breaks and temperature swings.",
      cite: "166964.pdf - Page 15",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-033",
      type: "mcq",
      question: "A welder completes a vertical curb flashing seam using a handheld heat welder. What minimum seam width is required for hand-welded seams?",
      options: [
        { id: "A", text: "1 inch minimum" },
        { id: "B", text: "1-1/2 inches minimum—the same as automatic welds" },
        { id: "C", text: "2 inches (50 mm) minimum, using silicone hand rollers for proper compression" },
        { id: "D", text: "4-1/2 inches minimum for all vertical work" }
      ],
      answer: "C",
      explanation: "Seams made with an automatic welder must be a minimum of 1-1/2 inches wide. Seams made with a hand welder must be a minimum of 2 inches wide, using silicone hand rollers to assure proper compression. Handheld welders are required on vertical welds or where automatic welders are not practical.",
      cite: "166964.pdf - Page 15",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-034",
      type: "mcq",
      question: "After completing field welds on a warm afternoon, the QA inspector arrives while seams are still warm to the touch. When should seam probing begin?",
      options: [
        { id: "A", text: "Immediately while seams are warm for better penetration detection" },
        { id: "B", text: "After seams have cooled; probe with a dull cotter pin puller type tool" },
        { id: "C", text: "Probing is optional if automatic welder was used" },
        { id: "D", text: "Only probe every tenth seam to avoid membrane damage" }
      ],
      answer: "B",
      explanation: "Probe all completed welds with a dull cotter pin puller type tool to verify seam integrity, paying special attention to hand-welded areas such as corners, T-joints, and angle changes. Do not probe welds until they have cooled. Insufficiently fused welds must be repaired daily.",
      cite: "166964.pdf - Page 16",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-035",
      type: "mcq",
      question: "A mechanic wants to seal exposed TPO scrim at cut edges using a solvent-weld technique instead of cut edge sealant. Per Elevate seaming requirements, this is:",
      options: [
        { id: "A", text: "Preferred for faster detail work" },
        { id: "B", text: "Acceptable on vertical flashings only" },
        { id: "C", text: "Not acceptable—solvent welding is NOT acceptable; exposed scrim edges must be sealed daily with UltraPly TPO Clear Cut Edge Sealant" },
        { id: "D", text: "Acceptable if followed by probing" }
      ],
      answer: "C",
      explanation: "All edges of TPO reinforced membrane with scrim exposed must be sealed daily with Elevate UltraPly TPO Clear Cut Edge Sealant after cleaning with Splice Wash SW-100. Solvent welding is explicitly not acceptable for this purpose.",
      cite: "166964.pdf - Page 16",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-036",
      type: "mcq",
      question: "Membrane transitions up a 8-inch curb where the deck-to-curb angle change exceeds 1 inch in 12 inches. What additional securement does Elevate require at this location?",
      options: [
        { id: "A", text: "Adhesive only—no mechanical securement at curbs" },
        { id: "B", text: "Secure membrane at all locations where it goes through an angle change greater than 1 inch in 12 inches using base tie-in details" },
        { id: "C", text: "Mechanical securement only at roof edges, not curbs" },
        { id: "D", text: "Ballast curbs with stone within 3 feet" }
      ],
      answer: "B",
      explanation: "Secure the membrane at all locations where it goes through an angle change greater than 1 inch in 12 inches—roof edges, curbs, interior walls, etc. HD seam plates with Elevate fasteners are typically installed 12 inches o.c. for standard applications per base tie-in details.",
      cite: "166964.pdf - Page 16",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-037",
      type: "mcq",
      question: "A project targeting a 30-year TPO warranty proposes using UltraPly TPO QuickSeam Reinforced Perimeter Fastening Strip (RPFS) at parapets. Per Elevate base tie-in guidance, RPFS is:",
      options: [
        { id: "A", text: "Required for all Platinum warranties" },
        { id: "B", text: "Acceptable for 25- and 30-year warranties with increased plate spacing" },
        { id: "C", text: "Not acceptable for 25- and 30-year warranties on TPO installations" },
        { id: "D", text: "Acceptable only on ballasted systems" }
      ],
      answer: "C",
      explanation: "QuickSeam RPFS attachment involves heavy-duty seam plates at maximum 12 inches o.c., primer on membrane mating surfaces, bonding adhesive with Touch-Push Test verification, and rolling over QuickSeam tape. However, QuickSeam RPFS is not acceptable for 25- and 30-year warranties on TPO installations.",
      cite: "166964.pdf - Page 16",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-038",
      type: "mcq",
      question: "A 4-inch PVC vent pipe will be flashed with an Elevate TPO Pre-Molded Pipe Flashing that is slightly undersized. The installer plans to cut the pre-molded flashing vertically to fit. What does Elevate require?",
      options: [
        { id: "A", text: "Vertical cuts are acceptable if sealed with cut edge sealant" },
        { id: "B", text: "Do not cut or patch TPO Pre-Molded Pipe Flashings vertically to assist installation" },
        { id: "C", text: "Vertical cuts are permitted on pipes under 2 inches diameter" },
        { id: "D", text: "Cut vertically only on the non-weather side" }
      ],
      answer: "B",
      explanation: "Flash penetrations with Elevate TPO Pre-Molded Pipe Flashings wherever possible, and do not cut or patch them vertically to assist installation. When pre-molded flashings are not feasible, use UltraPly TPO unsupported flashing. Refer to TIS for minimum and maximum pipe diameters for pre-molded flashings.",
      cite: "166964.pdf - Page 17",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-039",
      type: "mcq",
      question: "Tapered insulation is being set around a cast iron roof drain on a new UltraPly TPO installation. What maximum slope into the drain is permitted?",
      options: [
        { id: "A", text: "1/4 inch in 12 inches" },
        { id: "B", text: "1/2 inch in 12 inches" },
        { id: "C", text: "1 inch in 12 inches (25 mm in 305 mm)" },
        { id: "D", text: "2 inches in 12 inches for positive drainage" }
      ],
      answer: "C",
      explanation: "Install tapered insulation with suitable bonding surfaces around drains to provide a smooth transition from the roof surface to the drain. Slope into the drain cannot be greater than 1 inch in 12 inches. Membrane drain openings should allow 1/2 to 3/4 inch of membrane inside the clamping ring with round bolt holes punched—not cut back to bolt holes.",
      cite: "166964.pdf - Page 17",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-040",
      type: "mcq",
      question: "A process pipe on the roof will operate at 180°F (82°C) in service. How must the UltraPly TPO flashing be detailed?",
      options: [
        { id: "A", text: "Flash directly to the hot pipe with reinforced TPO" },
        { id: "B", text: "Protect TPO components from direct contact when in-service temperature exceeds 160°F; flash to an intermediate cool sleeve per Elevate details" },
        { id: "C", text: "Use Water Block Seal only without a sleeve" },
        { id: "D", text: "Hot pipes require no special detail if pipe is insulated" }
      ],
      answer: "B",
      explanation: "Protect UltraPly TPO components from direct contact with steam or heat sources when the in-service temperature is more than 160°F (71°C). In all such cases, flash to an intermediate cool sleeve per Elevate details rather than bonding directly to the hot pipe surface.",
      cite: "166964.pdf - Page 17",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-041",
      type: "mcq",
      question: "Parapet wall flashing will extend 10 feet up a stucco exterior wall. The wall surface is textured and uneven. What termination approach is required?",
      options: [
        { id: "A", text: "Single termination bar at the top only because height is under 72 inches" },
        { id: "B", text: "No intermittent attachment required for any wall under 12 feet" },
        { id: "C", text: "Intermittent termination is required at 36 inches on center because the wall surface does not meet smooth-wall conditions" },
        { id: "D", text: "Adhere membrane only without mechanical terminations on stucco" }
      ],
      answer: "C",
      explanation: "Membrane may extend up to 72 inches without intermittent attachment only when the wall is smooth (plywood, flush masonry, etc.) AND termination is a termination bar or flashing under coping to the outside face. Intermittent termination at 36 inches o.c. is required when flashing height exceeds 72 inches, when the wall surface is uneven (stucco, cobblestone, corrugated metal, etc.), or when the substrate is non-structural.",
      cite: "166964.pdf - Page 18",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-042",
      type: "mcq",
      question: "Before installing sheet metal coping on a completed UltraPly TPO roof, the sheet metal crew asks whether the membrane system must already be watertight. What does Elevate state about sheet metal work?",
      options: [
        { id: "A", text: "Sheet metal provides primary waterproofing; membrane seals are secondary" },
        { id: "B", text: "Sheet metal work is not waterproofing—the installed membrane roofing system must be made watertight before metal application" },
        { id: "C", text: "Metal may be installed first if using Elevate brand edge metal" },
        { id: "D", text: "Watertightness is required only at drains" }
      ],
      answer: "B",
      explanation: "Sheet metal work is not waterproofing. The installed membrane roofing system must be made watertight before metal application. No roof system is complete until all edges are terminated to prevent water infiltration, typically using manufactured or shop-fabricated metal detailing.",
      cite: "166964.pdf - Page 18",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-043",
      type: "mcq",
      question: "An owner requests a full system warranty with 90 MPH wind coverage but wants to use sheet metal edge details fabricated by a non-Elevate shop. What does Elevate permit?",
      options: [
        { id: "A", text: "Sheet metal by others is acceptable with SMACNA fabrication only" },
        { id: "B", text: "Sheet metal by others is not permitted on projects requiring full system warranties and wind speed coverage equal to or greater than 90 mph" },
        { id: "C", text: "Any 24-gauge steel edge metal qualifies automatically" },
        { id: "D", text: "Deviation requests are not required for edge metal" }
      ],
      answer: "B",
      explanation: "Sheet metal work by others is not permitted on projects requiring full system warranties and wind speed coverage equal to or greater than 90 mph. If metal by others is submitted via deviation for warranty consideration, minimum requirements include shop/factory-formed components per SMACNA/NRCA, 24-ga G-90 Kynar steel or 0.040-inch aluminum, and supporting deviation documentation with the PIN form.",
      cite: "166964.pdf - Page 19",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-044",
      type: "mcq",
      question: "At the end of a workday, an open membrane edge remains unsecured at a partially completed tie-in location. What is the roofing applicator's responsibility?",
      options: [
        { id: "A", text: "Leave the edge open if no rain is forecast" },
        { id: "B", text: "Establish a watertight temporary seal at any loose membrane edge before leaving for the day or before inclement weather" },
        { id: "C", text: "Weight the edge with ballast pavers only" },
        { id: "D", text: "Temporary seals are the general contractor's responsibility" }
      ],
      answer: "B",
      explanation: "At completion of each day's work or before inclement weather, a watertight temporary seal must be established at any loose membrane edge. Install a temporary seal or flashing strip to prevent moisture flowing beneath completed sections. Membrane contaminated with night-seal sealant must be cut away and discarded before work resumes.",
      cite: "166964.pdf - Page 23",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-045",
      type: "mcq",
      question: "A puncture repair is needed on an in-service UltraPly TPO membrane. What minimum repair patch dimension does Elevate require for a single pinhole?",
      options: [
        { id: "A", text: "Patch must match hole size exactly" },
        { id: "B", text: "Repair material must extend minimum 2 inches beyond the affected area in all directions (minimum 4 x 4 inches for a pinhole), with rounded corners" },
        { id: "C", text: "6 x 6 inches minimum for all repairs regardless of damage size" },
        { id: "D", text: "1 inch beyond damage if using unsupported flashing" }
      ],
      answer: "B",
      explanation: "Repair damaged membrane with like material. Repair material must extend a minimum of 2 inches beyond the boundary of the affected area in all directions—for example, a pinhole requires a minimum 4 x 4 inch patch. Round all corners of the repair piece. If more than six damage locations occur within 100 ft², install new membrane extending 6 inches beyond the damaged area border.",
      cite: "166964.pdf - Page 24",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-046",
      type: "mcq",
      question: "A crew will heat-weld new TPO membrane to aged in-service membrane after cleaning. What cleaning step does Elevate identify as most critical for weld performance?",
      options: [
        { id: "A", text: "Single wipe with splice wash only" },
        { id: "B", text: "Thorough cleaning with denatured alcohol on existing membrane weld areas after initial detergent cleaning and drying" },
        { id: "C", text: "Steel wire brush scrubbing to expose fresh polymer" },
        { id: "D", text: "Apply bonding adhesive to both surfaces instead of welding" }
      ],
      answer: "B",
      explanation: "After detergent and water cleaning, rinsing, drying, and SW-100 wipe, heat-welding areas on existing membrane must be cleaned a second time with denatured alcohol and wiped with a clean cotton rag. Elevate states thorough denatured alcohol cleaning is the most critical procedure to ensure performance of new-to-existing membrane heat-welds. Steel wire brushes must never be used.",
      cite: "166964.pdf - Page 24",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-047",
      type: "mcq",
      question: "Using Table 2 weld windows, a welder runs 45-80 mil UltraPly TPO with a Leister VARIMAT V2 at 2.2 ft/min speed. What airflow and temperature settings fall within the published weld window?",
      options: [
        { id: "A", text: "70% airflow at 858°F" },
        { id: "B", text: "80% airflow at 789°F" },
        { id: "C", text: "90% airflow at 950°F" },
        { id: "D", text: "60% airflow at 700°F" }
      ],
      answer: "A",
      explanation: "Table 2 lists weld windows for 45-80 mil material on the Leister VARIMAT V2 at 2.2 ft/min with 70% airflow at 858°F, among other speed/airflow combinations. Settings must be validated throughout the day including start/stop times and weather changes, with visual observation during welding to avoid scorching.",
      cite: "166964.pdf - Page 25",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-048",
      type: "mcq",
      question: "An InvisiWeld induction system is specified over a steel deck. What minimum insulation thickness over the metal deck is required for induction welding equipment operation?",
      options: [
        { id: "A", text: "1/2 inch minimum" },
        { id: "B", text: "1 inch minimum" },
        { id: "C", text: "1-1/2 inches (38 mm) minimum" },
        { id: "D", text: "3 inches minimum" }
      ],
      answer: "C",
      explanation: "InvisiWeld systems require a minimum 1-1/2 inches of insulation over the metal deck for operation of induction welding equipment. FanFold insulation is not approved directly under InvisiWeld applications without the Elevate InvisiWeld Cardboard Disc (TIS 1150). Contact a Regional Technical Coordinator for more information.",
      cite: "166964.pdf - Page 9",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-049",
      type: "mcq",
      question: "A superintendent is laying out Elevate UltraPly TPO X-Tred Walkway Pads near a primary roof drain. Per the Application Guide walkway pad instructions, what minimum clearance is required between the walkway pad and any roof drainage device?",
      options: [
        { id: "A", text: "4 inches (102 mm)" },
        { id: "B", text: "12 inches (305 mm)" },
        { id: "C", text: "18 inches (0.45 m)" },
        { id: "D", text: "36 inches (914 mm)" }
      ],
      answer: "C",
      explanation: "Walkway pad sections must be positioned with at least a 4-inch gap for positive drainage and at least 4 inches from any system seam or penetration, but a minimum of 18 inches (0.45 m) must be maintained between the walkway pad and any roof drainage device.",
      cite: "166964.pdf - Page 23",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "ELTPO-050",
      type: "mcq",
      question: "A technician finds a pinhole puncture in an in-service Elevate UltraPly TPO membrane and prepares a heat-welded repair patch. How far beyond the damaged area must the repair material extend in all directions?",
      options: [
        { id: "A", text: "1 inch (25 mm) minimum" },
        { id: "B", text: "2 inches (51 mm) minimum" },
        { id: "C", text: "4 inches (102 mm) minimum" },
        { id: "D", text: "6 inches (152 mm) minimum" }
      ],
      answer: "B",
      explanation: "Repair material must extend a minimum of 2 inches (51 mm) beyond the boundary of the affected area in all directions. A pinhole therefore requires at least a 4 inch x 4 inch patch. All corners of the repair piece must be rounded.",
      cite: "166964.pdf - Page 24",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const ELEVATE_ULTRAPLY_TPO_QUESTION_BANK_2026 = {
  ...ELEVATE_ULTRAPLY_TPO_QUESTION_BANK_2026_RAW,
  questions: ELEVATE_ULTRAPLY_TPO_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = ELEVATE_ULTRAPLY_TPO_QUESTION_BANK_2026;
