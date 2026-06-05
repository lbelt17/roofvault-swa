// JM APP Roofing Systems Application Guide - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: RS-7869-APP-Installaion-Application-Guide.pdf
// Authoring target: 50 application guide questions grounded in source text.


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

const JM_APP_ROOFING_SYSTEMS_QUESTION_BANK_2026_RAW = {
  book: "JM APP Roofing Systems",
  questions: [
    {
      id: "JMAPP-001",
      type: "mcq",
      question: "A contractor receives a shipment of JM polyiso insulation pallets stored outdoors on grass near standing water. The plastic wrap is intact and the material arrived three days ago. Per the JM APP Application Guide, what is the correct storage and handling response?",
      options: [
        { id: "A", text: "Leave pallets in place; intact plastic wrap permits indefinite outdoor storage on any surface" },
        { id: "B", text: "Elevate pallets on a finished surface away from standing water, avoid rolling pallets on the ground, and do not install more insulation than can be fully covered with membrane the same day" },
        { id: "C", text: "Remove all packaging immediately and stack boards vertically against the parapet for ventilation" },
        { id: "D", text: "Store only on dirt if tarps are provided; grass is acceptable when wrap is undamaged" }
      ],
      answer: "B",
      explanation: "JM insulation must not be stored in or around standing water and pallets should be elevated on a finished surface rather than dirt or grass. Care must be taken to prevent damage during handling, and no more insulation should be installed than can be completely covered with membrane on the same day. Intact plastic-wrap packaging may allow up to two weeks of outside storage without tarps, but proper elevation and drainage remain essential.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-002",
      type: "mcq",
      question: "During a pre-install meeting for an adhered APP system, the foreman asks which face of JM polyiso boards must contact the deck. What does the guide require?",
      options: [
        { id: "A", text: "Either face may be used if the board is mechanically fastened" },
        { id: "B", text: "Install with the printed \"This side down\" face toward the deck; this is required for adhered systems and recommended under mechanically attached membranes" },
        { id: "C", text: "Install with the foil face up regardless of printing" },
        { id: "D", text: "Orientation applies only to tapered boards at drains" }
      ],
      answer: "B",
      explanation: "All Johns Manville polyiso boards are printed with installation directions of \"This side down.\" This method is required for adhered systems and recommended when insulation is used under mechanically attached membranes. Foam insulation is combustible and must be protected from fire exposure during storage, transit, and application.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-003",
      type: "mcq",
      question: "Insulation wrapped in plastic bag packaging will remain on site for three weeks before installation. What does JM recommend before covering the pallets with a breathable tarpaulin?",
      options: [
        { id: "A", text: "Add a second layer of shrink wrap to seal the pallets completely" },
        { id: "B", text: "Slit the plastic shrink bag to allow venting, then cover with a breathable tarpaulin; for storage greater than one month, store indoors in a dry, ventilated warehouse" },
        { id: "C", text: "Remove all packaging and expose boards directly to weather for two weeks" },
        { id: "D", text: "No action is needed because bag packaging is weather-tight indefinitely" }
      ],
      answer: "B",
      explanation: "For plastic bag packaging, outside storage without tarps is adequate for less than two weeks if the bag arrives intact. For storage greater than two weeks, JM recommends slitting the plastic shrink bag before covering with a breathable tarpaulin to allow venting. Storage beyond one month should be indoors in a dry, well-ventilated warehouse.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-004",
      type: "mcq",
      question: "A roofer is tapering polyiso around a primary roof drain on a new APP project. What minimum taper area does the JM insulation guide specify?",
      options: [
        { id: "A", text: "12 in. x 12 in. (305 mm x 305 mm)" },
        { id: "B", text: "24 in. x 24 in. (610 mm x 610 mm)" },
        { id: "C", text: "36 in. x 36 in. (914 mm x 914 mm)" },
        { id: "D", text: "48 in. x 48 in. (1.22 m x 1.22 m)" }
      ],
      answer: "C",
      explanation: "Around drains and primary scuppers, insulation must be tapered a minimum of 36 in. x 36 in. (91.44 cm x 91.44 cm) for proper drainage. Insulation should always be cut to fit closely around roof penetrations.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-005",
      type: "mcq",
      question: "While installing polyiso over a fluted steel deck, the crew finds a 3/8 in. gap between adjacent board edges. How should this condition be corrected per JM?",
      options: [
        { id: "A", text: "Proceed; gaps up to 1/2 in. are acceptable on steel decks" },
        { id: "B", text: "Fill gaps greater than 1/4 in.; cut boards so edges are supported by the deck flange and neither board edge overlaps an open flute" },
        { id: "C", text: "Cover the gap with a strip of base sheet only" },
        { id: "D", text: "Remove one board and overlap the open flute by 2 in." }
      ],
      answer: "B",
      explanation: "When butting insulation layers over fluted steel decks, the edge of neither board may overlap an open flute; boards should be cut so the edge is about at the center of and supported by the flange. Any gaps between insulation greater than 1/4 in. should be filled.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-006",
      type: "mcq",
      question: "A designer proposes a single thick layer of roof insulation instead of two staggered layers on an adhered APP system. What performance benefit does JM cite for multiple-layer installation?",
      options: [
        { id: "A", text: "Multiple layers eliminate the need for mechanical fasteners on steel decks" },
        { id: "B", text: "Staggered joints in multiple layers block heat flow through insulation joints and fasteners, reduce stress at thick single joints, and can protect the membrane underside from plate damage when the top layer is adhered" },
        { id: "C", text: "Single-layer systems achieve better thermal performance than staggered multi-layer systems" },
        { id: "D", text: "Multiple layers are required only on nailable wood decks" }
      ],
      answer: "B",
      explanation: "Recent studies cited by JM indicate as much as 8% of thermal efficiency can be lost through joints and exposed fasteners in single-layer installations. Staggered joints in multiple layers block heat flow, distribute stress more evenly, protect the membrane from fastener plates when the top layer is adhered, and may stiffen the deck.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-007",
      type: "mcq",
      question: "Hot asphalt is being used to adhere insulation on a cold morning when the ambient temperature is 38°F (3°C). Which approach aligns with JM guidance?",
      options: [
        { id: "A", text: "Heat asphalt to any temperature above 200°F to compensate for cold air" },
        { id: "B", text: "Apply asphalt at EVT ± 25°F, use mechanical fasteners or the mop-and-flop method, limit board size to 4 ft x 4 ft, and exercise care below 40°F" },
        { id: "C", text: "Double the asphalt mop rate and use 4 ft x 8 ft boards for faster coverage" },
        { id: "D", text: "Cold asphalt application below 40°F is prohibited; work must stop until temperatures exceed 50°F" }
      ],
      answer: "B",
      explanation: "JM endorses NRCA/ARMA guidelines for heating asphalt to the Equiviscous Temperature (EVT) ± 25°F. Hot asphalt chills rapidly at 40°F, so mechanical attachment or the mop-and-flop method may be used. When adhering insulation with hot asphalt or cold adhesives, board size shall not exceed 4 ft x 4 ft, with special care below 40°F.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-008",
      type: "mcq",
      question: "A project team plans to mechanically attach roof insulation directly to a fluted steel deck. What does the JM guide state about this attachment method?",
      options: [
        { id: "A", text: "Mechanical attachment is one of several equal options including hot asphalt only" },
        { id: "B", text: "Mechanical attachment of insulation to steel decks is the only acceptable attachment method" },
        { id: "C", text: "Steel deck insulation must always be fully adhered with two-part urethane adhesive" },
        { id: "D", text: "Mechanical fasteners are prohibited over steel decks; use spot mopping only" }
      ],
      answer: "B",
      explanation: "Mechanical attachment of insulation to steel decks is the only acceptable attachment method. For current Factory Mutual requirements over insulated steel decks, the guide directs users to consult a JM Technical Services Specialist or the current FM Approvals RoofNav resource.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-009",
      type: "mcq",
      question: "An estimator reviews specification 3CIN-W for heat-welded APP over a poured concrete deck with JM ENRGY 3 insulation. What does the third character \"I\" in the designation indicate?",
      options: [
        { id: "A", text: "An insulated system over a nailable deck" },
        { id: "B", text: "A system for use over non-nailable decks, including suitable insulations such as ENRGY 3" },
        { id: "C", text: "An inverted (protected membrane) assembly only" },
        { id: "D", text: "A cold-applied system regardless of deck type" }
      ],
      answer: "B",
      explanation: "Specifications for use over structural decks that are not nailable—and over JM roof insulations offering a suitable receiving surface—are denoted by an \"I\" as the third character in the specification designation (e.g., 3CIN-W). Poured and precast concrete decks require priming with Asphalt Primer before hot asphalt application.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 21",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-010",
      type: "mcq",
      question: "A heat-welded APP cap sheet will be installed directly over two layers of JM roof insulation. Which product must form the top insulation layer?",
      options: [
        { id: "A", text: "Any JM polyiso or EPS product if joints are staggered" },
        { id: "B", text: "Fesco Board or ENRGY 3 regardless of surface finish" },
        { id: "C", text: "DuraBoard or DuraFoam only" },
        { id: "D", text: "Retro-Fit Board exclusively" }
      ],
      answer: "C",
      explanation: "For heat-weld application directly to insulation, the top layer of insulation must be DuraBoard or DuraFoam. Other JM insulations may be used in the system when they offer a suitable surface, but direct heat-welding to insulation requires one of these two products as the top layer.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 21",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-011",
      type: "mcq",
      question: "After a rain event, the GC asks the roofing crew to begin installing APP membrane over a base sheet that feels damp in several low areas. What does JM require?",
      options: [
        { id: "A", text: "Proceed if the surface is dry to the touch at the high point of the roof" },
        { id: "B", text: "Never apply roofing materials during rain or snow, or to wet surfaces, because trapped moisture can severely damage the membrane, insulation, and deck" },
        { id: "C", text: "Heat-weld only the field area and delay laps until the next day" },
        { id: "D", text: "Apply membrane if ambient temperature exceeds 50°F regardless of substrate moisture" }
      ],
      answer: "B",
      explanation: "JM requires that wet or damaged materials never be used and that roofing materials not be applied during rain or snow or to wet surfaces. Moisture trapped within the roofing system may cause severe damage to the membrane, insulation, and deck.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 22",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-012",
      type: "mcq",
      question: "A foreman plans to use traditional asphalt cut-back mastic as the full-bed adhesive under APP modified bitumen sheets. What is JM's position?",
      options: [
        { id: "A", text: "Cut-back mastics are acceptable under and over all APP products" },
        { id: "B", text: "JM does not recommend cut-back mastics under any APP modified bitumen product; MBR Cold Application Adhesive and MBR Utility Cement should be used for cold adhesive needs" },
        { id: "C", text: "Cut-back mastics are required on nailable decks only" },
        { id: "D", text: "Cut-back mastics may be used under APP if ambient temperature is above 70°F" }
      ],
      answer: "B",
      explanation: "JM does not recommend traditional asphalt cut-back mastics under any APP modified bitumen product because solvents can soften the membrane and cause blisters or granule loss. Cutback mastics over the membrane (e.g., to strip in base flashing edges) are acceptable, but JM MBR Cold Application Adhesive and MBR Utility Cement are preferred compatible alternatives.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 20",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-013",
      type: "mcq",
      question: "Post-install inspection finds several low areas where water remains 72 hours after a rain event. How does this affect JM Peak Advantage Guarantee eligibility?",
      options: [
        { id: "A", text: "Ponding is acceptable if less than 1 in. deep" },
        { id: "B", text: "Areas where water ponds for more than 48 hours are unacceptable and will not be eligible for a JM Peak Advantage Guarantee" },
        { id: "C", text: "Ponding voids only the coating warranty on smooth APP surfaces" },
        { id: "D", text: "Ponding is a maintenance issue only and does not affect guarantee eligibility" }
      ],
      answer: "B",
      explanation: "JM policy requires that deck and substrate design and installation result in the roof draining freely to outlets located to remove water promptly and completely. Areas where water ponds for more than 48 hours are unacceptable and will not be eligible for a JM Peak Advantage Guarantee.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 20",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-014",
      type: "mcq",
      question: "A CERTA-certified mechanic is heat-welding APP cap sheet on a mineral-surfaced membrane. After heating the 6 in. end lap, what additional step is required before seaming?",
      options: [
        { id: "A", text: "Apply cold process cement across the lap before rolling" },
        { id: "B", text: "Embed granules in the end lap area by heating and pressing with a rounded-point trowel or embedding tool" },
        { id: "C", text: "Remove all granules from the lap with a wire brush" },
        { id: "D", text: "Nail the end lap on 12 in. centers before heat welding" }
      ],
      answer: "B",
      explanation: "On mineral-surfaced membranes, prior to seaming the 6 in. end lap, granules must be embedded by heating the end lap area and pressing the granules into the compound with a rounded-point trowel or embedding tool. All laps should then be rolled with a lap roller.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 23",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-015",
      type: "mcq",
      question: "During heat-weld application, the applicator observes heavy smoke developing from the APP roll surface. What does this indicate and what are the correct lap dimensions?",
      options: [
        { id: "A", text: "Smoke confirms proper temperature; use 3 in. side laps and 4 in. end laps" },
        { id: "B", text: "Smoke indicates overheating; maintain approximately 330°F application temperature, 4 in. side laps, 6 in. end laps, and 1/8 in. to 3/8 in. bleed-out beyond the lap" },
        { id: "C", text: "Smoke is normal on the first course only; use 6 in. side laps and 6 in. end laps" },
        { id: "D", text: "Reduce heat until smoke stops, then adhere the lap with hot Type III asphalt" }
      ],
      answer: "B",
      explanation: "Heat-welding should bring the roll surface to approximately 330°F (166°C) until a sheen develops; smoke indicates overheating. Work proceeds from the lowest point with 4 in. side laps and 6 in. end laps so water flows over—not against—the lap. A 1/8 in. to 3/8 in. bleed-out of APP compound should extend beyond the lap. JM cautions never to adhere APP products with hot asphalt.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 22",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-016",
      type: "mcq",
      question: "An APP heat-welded project has a 4 in. per ft roof slope over a non-nailable concrete deck with insulation. How must the cap sheet be oriented and secured?",
      options: [
        { id: "A", text: "Sheets may run perpendicular or parallel to the incline with no back nailing up to 6 in. per ft" },
        { id: "B", text: "On slopes over 2-1/2 in. per ft, felts must run parallel to the incline and be back nailed at end laps with pressure-treated nailers spaced no more than 32 ft face-to-face" },
        { id: "C", text: "Heat-welded APP is limited to 2 in. per ft on non-nailable decks" },
        { id: "D", text: "Only mechanical attachment of the cap sheet is permitted; heat welding is prohibited above 2 in. per ft" }
      ],
      answer: "B",
      explanation: "Heat-welded APP may be applied on inclines up to 6 in. per ft with proper precautions. On slopes up to 2-1/2 in. per ft, sheets may run perpendicular or parallel. On non-nailable decks over 2-1/2 in. per ft, felts must run parallel to the incline and be back nailed using pressure-treated wood nailers at least 3-1/2 in. wide, spaced at the ridge and at intermediate points not exceeding 32 ft face-to-face for slopes between 2-1/2 in. and 6 in. per ft.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 23",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-017",
      type: "mcq",
      question: "When back nailing APP cap sheet at steep-slope nailers, what nail spacing and cap diameter does JM specify?",
      options: [
        { id: "A", text: "First nail 3/4 in. from the leading edge, remaining nails approximately 8-1/2 in. o.c. staggered across the nailer, with 1 in. minimum diameter caps; all nails covered by the next sheet lap" },
        { id: "B", text: "Nails 12 in. o.c. with no cap required if heat welded afterward" },
        { id: "C", text: "First nail 2 in. from the edge, nails 6 in. o.c. in a straight line" },
        { id: "D", text: "Nails 18 in. o.c. with 3/4 in. caps exposed at the lap" }
      ],
      answer: "A",
      explanation: "Cap sheet end laps are nailed across the sheet width with the first nail spaced 3/4 in. from the leading edge and remaining nails approximately 8-1/2 in. o.c., staggered across the nailer width to reduce tear risk along the nail line. Nails must have integral 1 in. minimum diameter caps (or be driven through such caps), and all nails must be covered by the lap of the next sheet.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 23",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-018",
      type: "mcq",
      question: "Intermediate plies of a two-ply felt APP system were completed on Monday. Weather delays cap sheet installation until the following Monday. What does JM allow?",
      options: [
        { id: "A", text: "Cap sheet may be delayed up to 10 business days if the base is covered with a tarp" },
        { id: "B", text: "Cap sheet installation must not be delayed more than 5 days; the surface must be dry, cleaned, and primed if contaminated before cap application" },
        { id: "C", text: "Unlimited delay is acceptable for multiple-felt systems in dry climates" },
        { id: "D", text: "Single-ply base felt systems may remain open up to 5 days without cap sheet" }
      ],
      answer: "B",
      explanation: "Under no circumstances shall modified bitumen cap sheet installation be delayed more than 5 days after completion of intermediate plies. Before cap application, the surface must be examined for moisture, cleaned and primed if contaminated, and dry. Only multiple-felt systems (two felts with modified cap sheet) may consider delay; single-ply felt or base felt systems must receive the cap sheet the same day.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 24",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-019",
      type: "mcq",
      question: "At 35°F (2°C), the crew prepares to heat-weld APP rolls stored on a pallet outside overnight. Which cold-weather practice is mandatory?",
      options: [
        { id: "A", text: "Double-stack pallets with tarps to retain heat" },
        { id: "B", text: "Store rolls on end in a heated trailer or building, warm rolls 15–20 minutes on the roof with the darker side up if below 40°F, never throw or drop rolls, do not double stack, and heat the substrate before welding" },
        { id: "C", text: "Heat-weld at higher flame settings without warming rolls" },
        { id: "D", text: "Apply cold adhesive only; heat welding is prohibited below 50°F" }
      ],
      answer: "B",
      explanation: "Precautions are mandatory below 40°F. Rolls must be stored on end in heated storage with only immediate-use rolls outside. Below 40°F, rolls should be heated or fully unwound and warmed on the roof 15–20 minutes with the darker side up. Never throw, drop, or double-stack rolls in cold weather. For heat-weld products, heat the substrate before rolling molten bitumen into place and pay special attention to lap adhesion.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 25",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-020",
      type: "mcq",
      question: "A hospital project prohibits open flame, so the team selects JM MBR Cold Application Adhesive for APP membrane installation. Which statement about this adhesive is correct?",
      options: [
        { id: "A", text: "The adhesive must be thinned with solvent to 1 gal/200 ft² for porous substrates" },
        { id: "B", text: "GlasPly Premier and GlasPly IV may be used as plies with this adhesive at standard coverage" },
        { id: "C", text: "Apply at approximately 1-1/2 gal/100 ft² over nonporous substrates; GlasPly Premier and GlasPly IV cannot be used with this material" },
        { id: "D", text: "The adhesive requires on-site mixing of Part A and Part B before use" }
      ],
      answer: "C",
      explanation: "MBR Cold Application Adhesive is used in the field at a nominal rate of 1-1/2 gal/100 ft² over nonporous substrates such as primed concrete or fiber glass base felts; porous insulations require higher coverage. The adhesive is ready to use without mixing or thinning. Fiber glass ply sheets GlasPly Premier and GlasPly IV cannot be used with this material.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 35",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-021",
      type: "mcq",
      question: "An APP system with asphalt-adhered base and intermediate felts will be installed on a 2-1/2 in. per ft slope over a non-nailable deck. What nailer spacing and asphalt type apply?",
      options: [
        { id: "A", text: "No nailers required; Type III asphalt only" },
        { id: "B", text: "Nailers spaced maximum 32 ft face-to-face using Type IV asphalt for slopes from 1/2 in. to 2 in. per ft, and 10 ft face-to-face with Type IV for slopes from 2 in. to 3 in. per ft" },
        { id: "C", text: "Nailers every 10 ft at all slopes with Type I asphalt" },
        { id: "D", text: "Cold-applied systems allow slopes to 6 in. per ft without nailers" }
      ],
      answer: "B",
      explanation: "APP systems incorporating asphalt-adhered felts may be applied on inclines up to 3 in. per ft. On non-nailable decks over 1/2 in. per ft, felts must run parallel to the incline and be back nailed using pressure-treated nailers. For slopes from 1/2 in. to 2 in. per ft, nailers are spaced maximum 32 ft face-to-face with Type IV asphalt; for 2 in. to 3 in. per ft, spacing is maximum 10 ft face-to-face with Type IV asphalt and half-length cap sheets.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 37",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-022",
      type: "mcq",
      question: "A designer specifies a protected roofing membrane assembly (PRMA) with JM APP modified bitumen over extruded polystyrene insulation. What minimum finished-roof slope does JM recommend?",
      options: [
        { id: "A", text: "1/8 in. per ft (10.4 mm/m)" },
        { id: "B", text: "1/4 in. per ft (20.8 mm/m)" },
        { id: "C", text: "1/2 in. per ft (41.7 mm/m)" },
        { id: "D", text: "1 in. per ft (83.3 mm/m)" }
      ],
      answer: "B",
      explanation: "Even with XPS products that include drainage channels, contact between membrane and insulation retards water flow. JM recommends a minimum 1/4 in. per ft slope on the finished roof membrane to greatly reduce water retained against the membrane after rain. Positive drainage must exist when designing a protected membrane roofing system.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 26",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-023",
      type: "mcq",
      question: "Ballast is being placed on a PRMA over APP membrane. What field and perimeter ballast rates does JM specify?",
      options: [
        { id: "A", text: "5–8 lb/ft² field; 10 lb/ft² at perimeter" },
        { id: "B", text: "10–12 lb/ft² (1,000–1,200 lb/100 ft²) in the field over filter fabric; 20 lb/ft² over a 4 ft width at perimeter and penetrations" },
        { id: "C", text: "20 lb/ft² uniform across entire roof" },
        { id: "D", text: "Ballast is optional if pavers are used in the field" }
      ],
      answer: "B",
      explanation: "Ballast similar to ASTM D 448 Gradation #57 is applied at approximately 10–12 lb/ft² in the field over filter fabric. At the roof perimeter and penetrations, ballast at 20 lb/ft² is required over a 4 ft wide area. Additional ballast is required at perimeters and penetrations beyond the standard field rate.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 27",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-024",
      type: "mcq",
      question: "The owner wants pavers placed directly on extruded polystyrene insulation in a PRMA walkway area without pedestals to reduce cost. What is the JM guarantee impact?",
      options: [
        { id: "A", text: "Direct-contact pavers are acceptable if ballast weight is increased 20%" },
        { id: "B", text: "Pavers must be on supports or pedestals providing at least 1/2 in. air space; roof areas with pavers in direct contact with insulation are excluded from JM Peak Advantage Guarantee coverage, including the thermal overlay portion" },
        { id: "C", text: "Only the membrane portion of the guarantee is affected; thermal coverage remains" },
        { id: "D", text: "Pedestals are recommended but not required for guarantee eligibility" }
      ],
      answer: "B",
      explanation: "Pavers used as ballast must be placed on supports or pedestals—commercial products or 6 in. square JM DynaTred Plus pieces providing minimum 1/2 in. air space—to allow moisture vapor venting. Without ventilation, insulation absorbs water and thermal performance drops. Roof areas with pavers in direct contact with insulation are excluded from JM Peak Advantage Guarantee coverage, including the thermal overlay portion.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 27",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-025",
      type: "mcq",
      question: "During PRMA insulation installation over an APP membrane, the crew finds 1/2 in. gaps between XPS board edges. How should they proceed?",
      options: [
        { id: "A", text: "Gaps up to 1 in. are acceptable if fabric overlaps 6 in." },
        { id: "B", text: "Place insulation channel side down, tightly butt boards with maximum allowable gap of 3/8 in., and install within approximately 3/4 in. of projections and cant strips" },
        { id: "C", text: "Fill gaps with spray foam before placing filter fabric" },
        { id: "D", text: "Stagger gaps and proceed; gap size is not specified for XPS" }
      ],
      answer: "B",
      explanation: "Extruded polystyrene roof insulation is placed directly on the membrane with channel side down. Boards should be tightly butted with a maximum allowable gap of 3/8 in. and installed to within approximately 3/4 in. of all projections and cant strips. In multilayer applications, subsequent layers are unattached with staggered joints and the bottom layer must be at least 2 in. thick and as thick or thicker than upper layers.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-026",
      type: "mcq",
      question: "Before torching begins on an APP re-roof, the safety manager reviews applicator qualifications. What training credential must heat-weld applicators maintain per JM?",
      options: [
        { id: "A", text: "OSHA 30-Hour Construction card only" },
        { id: "B", text: "A valid Certified Roofing Torch Applicator (CERTA) card as evidence of proper training in application, equipment handling, and safety" },
        { id: "C", text: "Manufacturer sales rep sign-off on the first day of the project" },
        { id: "D", text: "State roofing license without torch-specific training" }
      ],
      answer: "B",
      explanation: "The roofing contractor must verify that all applicators involved with open-flame modified bitumen application maintain and carry a valid CERTA card. Contractors must also ensure mechanics are trained in application, equipment handling, and safety measures, and that GC superintendents and building owners are advised of applicable torch safety precautions.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-027",
      type: "mcq",
      question: "Heat welding ends for the day at 4:00 PM on a large APP project. How long must fire watch continue according to JM safety guidelines?",
      options: [
        { id: "A", text: "Fire watch may end when the last torch is shut off" },
        { id: "B", text: "A fire watch never shorter than 1 hour after all application is completed for the day, potentially longer based on project size and building configuration, using infrared detection for hot spots" },
        { id: "C", text: "15 minutes is sufficient if extinguishers are within 50 ft" },
        { id: "D", text: "Fire watch is required only when LP gas is used, not for propane torches" }
      ],
      answer: "B",
      explanation: "A fire watch of sufficient length must be maintained during and after heat welding. The fire watch is never shorter than 1 hour after all application is completed for the day and may need to be longer depending on project size and building configuration. The person performing fire watch should use an infrared heat-sensing device to detect hot spots and smoldering materials at carts, wall flashings, penetrations, equipment, and the perimeter.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 30",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-028",
      type: "mcq",
      question: "An applicator will heat-weld APP near existing combustible curbs and wood blocking on an occupied building. What minimum fire-protection equipment and clearance practices does JM require?",
      options: [
        { id: "A", text: "One 5 lb water extinguisher per job; welding may occur within 10 ft of combustibles" },
        { id: "B", text: "At least one fully charged 20 lb minimum ABC dry chemical extinguisher per roofing mechanic, with additional units near the work area; never heat weld directly to or near combustible materials (e.g., the 35 ft rule), protect immovable combustibles with fire blankets, and shut off fans and cover openings" },
        { id: "C", text: "Fire extinguishers are optional if a fire watch is posted" },
        { id: "D", text: "Combustible materials need only be covered after welding is complete" }
      ],
      answer: "B",
      explanation: "JM requires at least one fully charged 20 lb minimum ABC-type dry chemical extinguisher for each roofing mechanic, with more available near the application area (e.g., within 50 ft) based on conditions. Never heat weld directly to or near combustible materials (including the 35 ft rule). Combustible materials must be moved or protected with fire blankets; fans must be shut off and openings covered. Mechanics need annual fire extinguisher training per OSHA 29 CFR 1910.157.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-029",
      type: "mcq",
      question: "A superintendent prepares wood nailers for parapet flashing on an APP project and asks whether creosote-treated blocking is acceptable. What does JM flashing preparation guidance require?",
      options: [
        { id: "A", text: "Creosote-treated nailers are preferred for durability at the perimeter" },
        { id: "B", text: "Use pressure-treated wood with salt preservative; treatment with creosote or asphaltic preservatives is not acceptable" },
        { id: "C", text: "Any treated lumber rated for ground contact is acceptable" },
        { id: "D", text: "Wood nailers are optional if stainless steel edge metal is used" }
      ],
      answer: "B",
      explanation: "Wood blocking for metal edging and flanged metal flashings must be pressure treated with a salt preservative. Treatment of nailers with creosote or asphaltic preservatives is not acceptable. Nailers must extend horizontally beyond metal flanges, be firmly attached per local code (FM Loss Prevention Data Sheet 1-49 provides nailer attachment guidance), and support proper flashing attachment.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 57",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-030",
      type: "mcq",
      question: "Base flashing is being installed on a frame wall with gypsum board facing the roof. Can gypsum board serve as the substrate for bituminous base flashing?",
      options: [
        { id: "A", text: "Yes, if primed with asphalt primer" },
        { id: "B", text: "No; frame walls require suitable solid backing, typically a mechanically attached bituminous base sheet, because gypsum wallboard is not acceptable as a substrate for bituminous flashings" },
        { id: "C", text: "Yes, for walls under 24 in. height only" },
        { id: "D", text: "Yes, when counterflashing is omitted" }
      ],
      answer: "B",
      explanation: "Frame walls are not acceptable to receive flashing unless suitable solid backing is provided. A bituminous base sheet is typically mechanically attached over the surface before flashing installation. Gypsum wallboard is not acceptable as a substrate for bituminous flashings. EIFS and stucco construction require suitable stops and sheet metal flashing to seal the top of base flashing.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 57",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-031",
      type: "mcq",
      question: "A QA inspector measures completed bituminous base flashing height above the roof field. What minimum height represents good roofing practice per JM unless the owner accepts lower height in writing?",
      options: [
        { id: "A", text: "4 in. (102 mm) minimum" },
        { id: "B", text: "8 in. (203 mm) minimum above the roof level, extending onto the roof membrane a minimum of 4 in." },
        { id: "C", text: "12 in. (305 mm) minimum with no membrane extension requirement" },
        { id: "D", text: "6 in. (152 mm) minimum if counterflashing is installed" }
      ],
      answer: "B",
      explanation: "Good roofing practice requires the top edge of all base flashings to be carried a minimum of 8 in. above the roof, with the flashing extending onto the roof membrane a minimum of 4 in. Lower heights may be used only by owner/design professional decision as a cost-saving measure, in which case guarantee coverage effectively stops at the top of the membrane base flashing.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 58",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-032",
      type: "mcq",
      question: "A mechanic is completing a PermaFlash pipe penetration on an APP roof. After masking an 8 in. perimeter, what are the correct scrim and cement thickness steps?",
      options: [
        { id: "A", text: "Apply one 60 mil coat and embed a single scrim piece extending 3 in. onto the roof" },
        { id: "B", text: "Precut PermaFlash Scrim starting 6 in. above the roof with fingers 6 in. onto the roof; apply 30 mil MBR Flashing Cement, embed first scrim, light coat, embed second target scrim, then re-coat entire masked area with 60 mil MBR Flashing Cement" },
        { id: "C", text: "Use PermaFlash Primer only without scrim for pipes under 4 in. diameter" },
        { id: "D", text: "Embed scrim in hot asphalt before applying PermaFlash Primer" }
      ],
      answer: "B",
      explanation: "PermaFlash penetration details use masking 8 in. above the roof and an 8 in. perimeter around the detail. The first scrim piece starts 6 in. above the roof with fingers 6 in. onto the roof (PermaFlash Scrim is 12 in. wide). A second target scrim lays flat with minimum 6 in. extension on the roof. The masked area receives a thin 30 mil MBR Flashing Cement coat before scrim embedment, then a final 60 mil re-coat after both scrim layers are embedded.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 64",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-033",
      type: "mcq",
      question: "Before applying PermaFlash coatings to a rusted pipe penetration, what surface preparation does JM require?",
      options: [
        { id: "A", text: "Wire brush only; primer is optional on metal" },
        { id: "B", text: "Ensure surfaces are clean, dry, and free of loose debris, dust, dirt, and rust; prepare surfaces with a grinder or other suitable means where necessary, then apply a light coating of PermaFlash Primer" },
        { id: "C", text: "Apply MBR Flashing Cement directly over rust to seal the penetration" },
        { id: "D", text: "Heat the penetration with a torch to burn off rust before priming" }
      ],
      answer: "B",
      explanation: "All PermaFlash surfaces must be clean, dry, and free of loose debris, dust, dirt, and rust before coating. Where necessary, surfaces should be prepared using a grinder or other suitable means. The penetration is then primed with a light coating of PermaFlash Primer applied with a rag or spray bottle—a brush may apply too liberally.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 63",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-034",
      type: "mcq",
      question: "JM Vapor Barrier SA is being installed over SA Primer on a deck that was exposed over the weekend. What lap dimensions and rolling equipment does the guide specify?",
      options: [
        { id: "A", text: "2 in. side laps, 4 in. end laps; hand pressure only" },
        { id: "B", text: "Minimum 3 in. side laps and 6 in. end laps with staggered endlaps; use a minimum 75 lb split linoleum roller over the entire surface and a 4 in. rubber roller in overlap areas" },
        { id: "C", text: "6 in. side laps, 12 in. end laps; no rolling required for self-adhered membrane" },
        { id: "D", text: "Butt joints are acceptable if primer is tacky" }
      ],
      answer: "B",
      explanation: "Vapor Barrier SA is rolled out over primed areas with staggered end laps, minimum 3 in. side laps, and 6 in. end laps. The silicone release liner is peeled while holding the membrane tight. A minimum 75 lb split linoleum roller must be used over the entire surface, and a 4 in. rubber roller must be used in overlap areas to ensure proper adhesion.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 122",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-035",
      type: "mcq",
      question: "A crew attempts to accelerate SA Primer drying on a vapor barrier project using a torch after cold weather. What does JM prohibit?",
      options: [
        { id: "A", text: "Using SA Primer Low VOC in temperatures below 40°F" },
        { id: "B", text: "Accelerating primer drying by heating with a torch; primer should be allowed to dry completely until tacky but not transferring to a clean dry finger" },
        { id: "C", text: "Rolling primer with a 3/8 in. nap roller" },
        { id: "D", text: "Mixing SA Primer before application" }
      ],
      answer: "B",
      explanation: "SA Primer and SA Primer Low VOC must be mixed well before use, applied uniformly without streaks or puddles, and allowed to dry completely. Primer must not be accelerated by heating with a torch. Properly dried primer should be tacky but should not transfer to a clean dry finger. Exposed membrane must be free of dust, frost, or debris before adhesive application.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 122",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-036",
      type: "mcq",
      question: "The membrane substrate for an APP heat-weld system must meet which condition before installation begins?",
      options: [
        { id: "A", text: "Clean, smooth, flat, and dry—using an approved JM product such as DuraBoard, JM APP Base Sheet, Ventsulation Felt, DuraFoam, or PermaPly 28, or an approved structural substrate" },
        { id: "B", text: "Primed only; smoothness requirements apply to cold-applied systems exclusively" },
        { id: "C", text: "Any insulation surface is acceptable if a base sheet is omitted" },
        { id: "D", text: "Substrate must be flooded with glaze coat asphalt before welding" }
      ],
      answer: "A",
      explanation: "The APP membrane substrate should be DuraBoard, JM APP Base Sheet, Ventsulation Felt, DuraFoam, PermaPly 28, or an approved structural substrate (GlasPly Premier and GlasPly IV in selected specifications). The surface must be clean, smooth, flat, and dry. Heat-weld installation also requires the receiving surface be firm, dry, smooth, flat, and free of debris and loose material.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 21",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-037",
      type: "mcq",
      question: "A wood board deck (not plywood) will receive a nailable APP specification. What must be installed under the base felt?",
      options: [
        { id: "A", text: "Asphalt primer only" },
        { id: "B", text: "One ply of sheathing paper next to the deck; sheathing paper is not required on plywood decks" },
        { id: "C", text: "Two plies of GlasPly IV mechanically attached" },
        { id: "D", text: "A vapor barrier SA membrane" }
      ],
      answer: "B",
      explanation: "Over wood board decks, one ply of sheathing paper must be used under the base felt next to the deck. Sheathing paper is not required on plywood decks. Nailable specifications are denoted by \"N\" or \"L\" as the third character in the specification designation and require a nailable base felt with fasteners appropriate to the deck type.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 21",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-038",
      type: "mcq",
      question: "When installing the entire APP roofing system, the GC requests leaving the base felt exposed for two weeks while interior work continues. What does JM say about phased construction?",
      options: [
        { id: "A", text: "Phased construction is recommended to allow trades access" },
        { id: "B", text: "Install the entire roofing system at one time; phased construction may cause blisters from entrapped moisture and poor adhesion from dust or foreign material on exposed felts" },
        { id: "C", text: "Phased construction is acceptable if the base felt is coated with aluminum paint" },
        { id: "D", text: "Only cap sheet installation must be continuous; base sheets may remain open indefinitely" }
      ],
      answer: "B",
      explanation: "JM recommends installing the entire roofing system at one time. Phased construction—leaving a partially completed system exposed overnight or longer—may result in blisters from entrapped moisture and poor adhesion due to dust or foreign materials collecting on exposed felts. Temporary roof covering procedures exist when the complete roof cannot be installed in one operation.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 22",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-039",
      type: "mcq",
      question: "A temporary roof is required on a nailable deck before winter shutdown. Which JM temporary covering option avoids a glaze coat of asphalt?",
      options: [
        { id: "A", text: "Single ply of base felt nailed only, left exposed indefinitely" },
        { id: "B", text: "Heat weld one layer of APP modified bitumen cap sheet (smooth or mineral surfaced) over the base felt with no glaze coat of asphalt applied" },
        { id: "C", text: "Install insulation only without membrane until spring" },
        { id: "D", text: "Apply 30 lb felt in cold adhesive without mechanical attachment" }
      ],
      answer: "B",
      explanation: "For nailable deck temporary roofs, JM options include nailing a base felt, then either mopping ply felt in Type III asphalt with a glaze coat—or, as an alternate, heat welding one layer of APP modified bitumen cap sheet over the base felt without applying a glaze coat of asphalt. When the permanent roof is installed, inspect, remove damaged areas, and install a new base felt or mechanically fastened insulation through the temporary roof.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 25",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-040",
      type: "mcq",
      question: "PRMA flashing design must extend the flashing material how far above the top of extruded polystyrene insulation?",
      options: [
        { id: "A", text: "4 in. (102 mm) minimum" },
        { id: "B", text: "8 in. (203 mm) minimum" },
        { id: "C", text: "12 in. (305 mm) minimum" },
        { id: "D", text: "Equal to the insulation thickness only" }
      ],
      answer: "B",
      explanation: "For protected roofing membrane assemblies using JM APP modified bitumen, flashing material must extend above the top of extruded polystyrene insulation a minimum of 8 in. (203 mm). Standard modified bitumen flashing details apply, and when specifications are modified for PRMA, the last digit of the designation changes to \"P\" (e.g., 3CIP-W).",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 26",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-041",
      type: "mcq",
      question: "Filter fabric is being installed over PRMA insulation before ballast placement. What lap and perimeter requirements apply?",
      options: [
        { id: "A", text: "6 in. lap minimum; fabric ends may occur anywhere at the perimeter" },
        { id: "B", text: "Loose lay with minimum 12 in. joint laps, no end laps within 6 ft of the perimeter, and fabric extending 2–3 in. above stone at perimeter and penetrations; wetting fabric helps hold it until ballast is placed" },
        { id: "C", text: "Fully adhere fabric with hot asphalt before ballast" },
        { id: "D", text: "Fabric is required only when pavers are used" }
      ],
      answer: "B",
      explanation: "Approved filter fabric is loose laid over XPS insulation with all joints lapped a minimum of 12 in. End laps must not occur within 6 ft of the perimeter. Fabric should extend 2–3 in. above the stone at the perimeter and penetrations. Wetting the fabric helps hold it in place until ballast is installed. Pavers on pedestals do not require fabric.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-042",
      type: "mcq",
      question: "An APP heat-weld crew positions rolls before welding. Which product orientation and unrolling technique does JM require?",
      options: [
        { id: "A", text: "Polyolefin side up; drop rolls from the pallet onto the deck to save time" },
        { id: "B", text: "Polyolefin side down; unroll completely, scroll both ends to the middle, then heat-weld while slowly unrolling the heated portion into place" },
        { id: "C", text: "Either side down if ambient temperature exceeds 70°F" },
        { id: "D", text: "Mineral side down on all cap sheets regardless of product labeling" }
      ],
      answer: "B",
      explanation: "Packaging must be removed and the appropriate side positioned for heat welding (polyolefin side down). APP sheets shall be rolled or scrolled into place as they are heat welded. The roll is aligned, fully unrolled, then rerolled from both ends to the middle (scrolling) before heat is applied to the coiled portion and the membrane is pressed into the substrate while unrolling.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 22",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-043",
      type: "mcq",
      question: "Insulation must be independently fastened on a mechanically attached APP system. When using insulation adhesives instead of fasteners on an adhered system, what board size limit applies?",
      options: [
        { id: "A", text: "Boards may be up to 4 ft x 8 ft if two-part urethane adhesive is used" },
        { id: "B", text: "Board sizes shall not exceed 4 ft x 4 ft when installed in JM insulation adhesives or hot/cold adhesive applications" },
        { id: "C", text: "No size limit applies on concrete decks" },
        { id: "D", text: "Only 2 ft x 4 ft boards are permitted with one-step foamable adhesive" }
      ],
      answer: "B",
      explanation: "Insulation must be independently fastened in mechanically attached and adhered systems. When adhering insulation—including hot asphalt, cold adhesives, two-part urethane bead adhesive, one-step foamable adhesive, or roofing systems urethane adhesive—board sizes shall not exceed 4 ft x 4 ft. Refer to product data sheets for adhesive coverage rates.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 7",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-044",
      type: "mcq",
      question: "A project specification references mechanically fastened base sheet pattern BM-6 from Section Three of the JM guide. What does this pattern indicate?",
      options: [
        { id: "A", text: "Fully adhered cover with 8-16-32 fastener spacing" },
        { id: "B", text: "Mechanically fastened base sheet with fasteners 6 in. on center" },
        { id: "C", text: "Adhered membrane pattern AD-8 for 4 ft x 4 ft boards" },
        { id: "D", text: "PRMA ballast hold-down pattern at 12 in. o.c." }
      ],
      answer: "B",
      explanation: "Section Three of the guide provides mechanically fastened base sheet fastening patterns. BM-6 denotes mechanically fastened base sheet attachment at 6 in. on center. Related patterns include AD-8 and AD-16 for adhered membrane insulation fastening and various BM patterns for different board sizes and fastener spacings.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 43",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-045",
      type: "mcq",
      question: "Metal counterflashing will be installed over bituminous base flashing on a parapet. Why does JM recommend metal for counterflashings but not for base flashings?",
      options: [
        { id: "A", text: "Metal base flashings are lighter and easier to install" },
        { id: "B", text: "Bituminous materials match the membrane expansion characteristics for base flashings, while metal's rigidity and extreme thermal movement make it unacceptable for base flashings though acceptable for counterflashings removed from standing water when properly installed" },
        { id: "C", text: "Metal base flashings are required on slopes over 1/4 in. per ft" },
        { id: "D", text: "Counterflashings must always be bituminous; metal is decorative only" }
      ],
      answer: "B",
      explanation: "Bituminous base flashing materials share the membrane's coefficient of expansion and contraction and work as a unit—they are the only acceptable material for base flashings in bituminous systems. Metal's rigidity and extreme movement with temperature changes make it unacceptable for base flashings, but metal cap or counterflashings are acceptable when removed from standing water and installed per industry sheet metal details.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 57",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-046",
      type: "mcq",
      question: "MBR Cold Application Adhesive will be used at 45°F (7°C) ambient temperature. How must the adhesive be conditioned before spreading?",
      options: [
        { id: "A", text: "Thin with xylene to improve flow at low temperatures" },
        { id: "B", text: "Store in a warm area approximately 70°F for 24 hours before use when temperature is below 50°F; adhesive may be installed between 40°F and 100°F" },
        { id: "C", text: "Heat adhesive buckets with an open flame until viscosity drops" },
        { id: "D", text: "Cold adhesive application is prohibited below 50°F under all circumstances" }
      ],
      answer: "B",
      explanation: "MBR Cold Application Adhesive may be installed at temperatures between 40°F and 100°F. When ambient temperature is below 50°F, adhesive must be stored in a warm area (approximately 70°F) for 24 hours before use to facilitate spreading. Temperature affects cure rate, but bonds ultimately exceed those of asphalt-adhered systems.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 25",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-047",
      type: "mcq",
      question: "Smooth-surfaced APP modified bitumen cap sheet has been installed on a project. What additional requirement applies to smooth APP-surfaced products?",
      options: [
        { id: "A", text: "No coating is required if the roof is protected by ballast" },
        { id: "B", text: "All smooth APP-surfaced products must be coated with a JM-approved coating per built-up roofing Paragraph 6.9 of Section 3b" },
        { id: "C", text: "Apply granules manually to the field area within 30 days" },
        { id: "D", text: "Smooth APP may remain uncoated if a JM Peak Advantage Guarantee is not requested" }
      ],
      answer: "B",
      explanation: "JM requires that all smooth APP-surfaced products be coated with a JM-approved coating. Acceptable roof coatings for APP systems are found in built-up roofing Paragraph 6.9 of Section 3b. Mineral-surfaced products do not carry this same field coating requirement.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 22",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-048",
      type: "mcq",
      question: "Extruded polystyrene insulation is staged on a PRMA project adjacent to the welding area. What fire hazard warning does JM issue for this material?",
      options: [
        { id: "A", text: "XPS is noncombustible and may be stored near open flame" },
        { id: "B", text: "Extruded polystyrene is combustible, must never be exposed to open flame or ignition sources, and deck systems must provide an adequate fire barrier; consult NFPA standards for foam storage protection" },
        { id: "C", text: "XPS fire hazard applies only below grade, not on roofs" },
        { id: "D", text: "Combustibility is addressed solely by increasing ballast weight" }
      ],
      answer: "B",
      explanation: "JM warns that extruded polystyrene insulation is combustible and may constitute a fire hazard if improperly used or installed. It must never be exposed to open flame or other ignition sources and should be used only as directed. All roof deck systems over which protected systems are installed should provide an adequate fire barrier for the foam. NFPA standards or the authority having jurisdiction govern foam storage protection.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 27",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-049",
      type: "mcq",
      question: "A mechanic heat-welding APP observes proper lap adhesion but no compound bleed-out at the side lap. What bleed-out dimension confirms acceptable welds?",
      options: [
        { id: "A", text: "No bleed-out is required if the lap roller passes without resistance" },
        { id: "B", text: "1/8 in. to 3/8 in. bleed-out of APP compound should extend beyond the lap after rolling with a lap roller" },
        { id: "C", text: "1/2 in. to 1 in. bleed-out is required on all heat-welded seams" },
        { id: "D", text: "Bleed-out is required only at end laps, not side laps" }
      ],
      answer: "B",
      explanation: "After heat welding, all laps should be rolled with a lap roller and a 1/8 in. to 3/8 in. bleed-out of APP compound should extend beyond the lap. Laps must be checked for proper adhesion. Heat is applied across the full roll width and along the 4 in. side lap of the previous roll in an L-shaped pattern.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 23",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "JMAPP-050",
      type: "mcq",
      question: "Before starting heat-welded APP application, which safety documentation must contractors review according to JM Section 2?",
      options: [
        { id: "A", text: "NFPA 701 only" },
        { id: "B", text: "Johns Manville Safety Guidelines for Heat Weld Application, ARMA Guide to Torch Safety, and ARMA Torch Safety Video—plus written fire department notice where required" },
        { id: "C", text: "Manufacturer product data sheets only; torch safety is optional" },
        { id: "D", text: "Local building permit without ARMA materials" }
      ],
      answer: "B",
      explanation: "For heat-weld application, all safety procedures must be reviewed before application. Contractors must understand and adhere to JM Safety Guidelines for Heat Weld Application, the ARMA Guide to Torch Safety, and the ARMA Torch Safety Video. Written notice must be given to the local fire department where required, and notice is always recommended when using LP gas even if not mandated.",
      cite: "RS-7869-APP-Installaion-Application-Guide.pdf - Page 20",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const JM_APP_ROOFING_SYSTEMS_QUESTION_BANK_2026 = {
  ...JM_APP_ROOFING_SYSTEMS_QUESTION_BANK_2026_RAW,
  questions: JM_APP_ROOFING_SYSTEMS_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = JM_APP_ROOFING_SYSTEMS_QUESTION_BANK_2026;
