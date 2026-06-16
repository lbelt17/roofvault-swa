// Karnak 670HS Karna-Sil Ultra - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: 670hs-karna-sil-ultra-pds.pdf
// Authoring target: 30 technical data sheet questions grounded in source text.

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

const KARNAK_670HS_KARNA_SIL_ULTRA_QUESTION_BANK_2026_RAW = {
  book: "Karnak 670HS Karna-Sil Ultra",
  questions: [
    {
      id: "K670HS-001",
      type: "mcq",
      question: "A restoration contractor plans 670HS Karna-Sil Ultra over newly sprayed polyurethane foam completed yesterday. Is this within the manufacturer's stated uses?",
      options: [
        { id: "A", text: "Yes; newly sprayed polyurethane foam is among the listed approved uses" },
        { id: "B", text: "No; SPF must weather 90 days before any silicone may be applied" },
        { id: "C", text: "SPF requires 180 Karna-Sil Ultra Epoxy Primer on all foam projects" },
        { id: "D", text: "SPF may only receive acrylic coatings, not silicone" },
      ],
      answer: "A",
      explanation: "670HS Karna-Sil Ultra is designed for newly sprayed polyurethane foam, previously silicone coated roofs, bare galvanized metal, concrete, and multiple membrane types.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-002",
      type: "mcq",
      question: "A foreman plans 670HS over a smooth built-up asphalt (BUR) roof installed 60 days ago. What aging requirement does Karnak specify for new BUR?",
      options: [
        { id: "A", text: "New BUR may be coated after 30 days identical to modified bitumen" },
        { id: "B", text: "New BUR surfaces must be allowed to age a minimum of 90 to 180 days" },
        { id: "C", text: "Smooth BUR requires no aging when 406 Tru-Grip is applied first" },
        { id: "D", text: "BUR is not listed as an approved substrate for 670HS" },
      ],
      answer: "B",
      explanation: "New BUR surfaces must be allowed to age a minimum of 90 to 180 days before 670HS application.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-003",
      type: "mcq",
      question: "A crew will coat painted metal decking with 670HS Karna-Sil Ultra. What primer requirement does the data sheet specify for painted metal?",
      options: [
        { id: "A", text: "No primer is required on any metal surface" },
        { id: "B", text: "Painted metal requires 406 Tru-Grip Base Coat only" },
        { id: "C", text: "Painted metal requires 180 Karna-Sil Ultra Epoxy Primer" },
        { id: "D", text: "Painted metal must be abrasive blasted to bare galvanized before silicone" },
      ],
      answer: "C",
      explanation: "Bare galvanized metal does not require primer, but painted metal requires 180 Karna-Sil Ultra Epoxy Primer.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-004",
      type: "mcq",
      question: "An estimator prices 670HS over granule modified bitumen without any base coat or primer. What does Karnak require for smooth and granule modified bitumen membranes?",
      options: [
        { id: "A", text: "Modified bitumen may receive direct silicone without primer after 30 days" },
        { id: "B", text: "Only 502MS Karna-Flex may be used as a tie-in, not a field primer" },
        { id: "C", text: "Modified bitumen is not approved for 670HS under any preparation" },
        { id: "D", text: "Requires 406 Tru-Grip Base Coat, 405 Bond-N-Shield Base Coat, or 180 Karna-Sil Ultra Epoxy Primer" },
      ],
      answer: "D",
      explanation: "Smooth and granule modified bitumen membranes require 406 Tru-Grip Base Coat, 405 Bond-N-Shield Base Coat, or 180 Karna-Sil Ultra Epoxy Primer.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-005",
      type: "mcq",
      question: "A concrete parking structure roof will receive 670HS Karna-Sil Ultra. Does Karnak require a primer on concrete?",
      options: [
        { id: "A", text: "Concrete roofs are listed with no primer required" },
        { id: "B", text: "Concrete requires 180 epoxy primer on all horizontal applications" },
        { id: "C", text: "Concrete requires 507 SPC Primer/Wash identical to EPDM prep" },
        { id: "D", text: "Concrete is not an approved substrate for silicone coatings" },
      ],
      answer: "A",
      explanation: "Concrete roofs are listed as an approved use with no primer required for 670HS Karna-Sil Ultra.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-006",
      type: "mcq",
      question: "During EPDM surface preparation for 670HS, a crew uses only TSP substitute and water for power washing. What cleaner does Karnak specify for EPDM preparation?",
      options: [
        { id: "A", text: "Any household detergent at 1000 psi is sufficient for EPDM" },
        { id: "B", text: "799 Wash-N-Prep Roof Cleaner or 507 SPC Primer/Wash for EPDM only" },
        { id: "C", text: "EPDM requires abrasive grinding, not chemical washing" },
        { id: "D", text: "507 SPC is prohibited on EPDM; use 799 only on metal" },
      ],
      answer: "B",
      explanation: "Power wash with 799 Wash-N-Prep Roof Cleaner or 507 SPC Primer/Wash (EPDM Only) and water at minimum 2000 psi.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-007",
      type: "mcq",
      question: "A silicone crew applies the first coat of 670HS at 10:00 a.m. and wants to apply a second coat at 11:30 a.m. on a cool, humid morning (50°F, 20% RH). What recoat guidance does Karnak provide?",
      options: [
        { id: "A", text: "Recoat may occur immediately after a 30-minute flash-off period" },
        { id: "B", text: "Second coats require 24 to 48 hours minimum on all silicone systems" },
        { id: "C", text: "Allow the previous coat to cure 2 to 8 hours dependent upon temperature and humidity before subsequent coats" },
        { id: "D", text: "670HS is single-coat only; recoat is never permitted" },
      ],
      answer: "C",
      explanation: "If additional coats are applied, allow the previous coat to cure 2 to 8 hours dependent upon temperature and humidity. At 50°F and 20% RH, cure may be slower.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-008",
      type: "mcq",
      question: "A foreman plans to recoat a 670HS field area 30 hours after the first coat was applied. What timing limit does Karnak specify for subsequent coats?",
      options: [
        { id: "A", text: "Recoat may occur anytime within 7 days without adhesion risk" },
        { id: "B", text: "Silicone recoat windows are unlimited once the first coat is tack-free" },
        { id: "C", text: "Recoat must wait 30 days for full cure before any second coat" },
        { id: "D", text: "Subsequent coats should be applied within 24 hours of the previous application to ensure uniform adhesion" },
      ],
      answer: "D",
      explanation: "Subsequent coats should be applied within 24 hours of the previous application to ensure uniform adhesion.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-009",
      type: "mcq",
      question: "After spray applying 670HS, the inspector notes pinholes in the cured film. What application quality requirement does the data sheet state?",
      options: [
        { id: "A", text: "Applied coating film should be even and free of pinholes" },
        { id: "B", text: "Pinholes are acceptable if coverage rate meets 1.5 gallons per 100 sq. ft." },
        { id: "C", text: "Pinholes self-heal during the 30-day final cure period" },
        { id: "D", text: "Pinholes are only a concern on vertical applications" },
      ],
      answer: "A",
      explanation: "670HS should be applied so the coating film is even and free of pinholes.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-010",
      type: "mcq",
      question: "A project spec calls for ceramic granule embedment in the final 670HS coat for aesthetics and toughness. What sequence does Karnak specify?",
      options: [
        { id: "A", text: "Broadcast granules into the primer before any silicone is applied" },
        { id: "B", text: "Apply ceramic roofing granules immediately into the final coat after application, back-roll into the coating, allow to cure, then blow off or sweep loose granules" },
        { id: "C", text: "Granules must be mixed into the pail before spraying the first coat" },
        { id: "D", text: "Granule embedment is prohibited on horizontal silicone roofs" },
      ],
      answer: "B",
      explanation: "To improve aesthetics, impact resistance, and toughness, ceramic roofing granules should be applied immediately into the final coat after application, back-rolled into the coating, cured, then loose granules blown off or swept.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-011",
      type: "mcq",
      question: "A spray operator connects 670HS to hoses previously used for acrylic coating application. What hose caution does Karnak specify?",
      options: [
        { id: "A", text: "Acrylic and silicone hoses may be interchanged if flushed with water" },
        { id: "B", text: "Hose contamination matters only below 40°F application temperature" },
        { id: "C", text: "Do not use hoses that have been used to spray acrylic coatings" },
        { id: "D", text: "Acrylic hoses are preferred because they reduce silicone viscosity" },
      ],
      answer: "C",
      explanation: "Do not use hoses that have been used to spray acrylic coatings with 670HS Karna-Sil Ultra.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-012",
      type: "mcq",
      question: "A spray crew sets up for 670HS field application. What minimum working pressure at the gun tip does Karnak require?",
      options: [
        { id: "A", text: "3000 psi minimum at the gun tip" },
        { id: "B", text: "1500 psi is sufficient for high-solids silicone" },
        { id: "C", text: "Pressure is determined solely by the equipment manufacturer with no Karnak minimum" },
        { id: "D", text: "Minimum of 5500 psi working pressure at the gun tip" },
      ],
      answer: "D",
      explanation: "Spray application requires a high-pressure airless spray unit with minimum of 5500 psi working pressure at the gun tip, plus 3 gallon per minute pump output.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-013",
      type: "mcq",
      question: "An applicator selects a 1/2-inch ID hose for 670HS spray work. What hose specification does the data sheet list?",
      options: [
        { id: "A", text: "Hoses should be jacketed for prevention of moisture contamination and have 3/4-inch ID" },
        { id: "B", text: "1/2-inch ID hoses are preferred for low VOC silicone" },
        { id: "C", text: "Any hose ID is acceptable if working pressure exceeds 3000 psi" },
        { id: "D", text: "Hose ID is irrelevant; only tip orifice size matters" },
      ],
      answer: "A",
      explanation: "Hoses should be jacketed for prevention of moisture contamination, have 3/4-inch ID, and tip size should be minimum 0.041 orifice.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-014",
      type: "mcq",
      question: "A spray technician needs to select a spray tip for 670HS. What minimum orifice size does Karnak specify?",
      options: [
        { id: "A", text: "0.021 orifice for fine mist coverage" },
        { id: "B", text: "Minimum tip orifice size of 0.041" },
        { id: "C", text: "0.055 orifice required only on vertical applications" },
        { id: "D", text: "Tip size is not specified; pump GPM alone determines atomization" },
      ],
      answer: "B",
      explanation: "Tip size should be a minimum size 0.041 orifice for spray application of 670HS.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-015",
      type: "mcq",
      question: "A pump rated at 2 gallons per minute is available for 670HS spray application. Does it meet Karnak equipment requirements?",
      options: [
        { id: "A", text: "Yes; 2 GPM exceeds minimum requirements for silicone" },
        { id: "B", text: "GPM requirements apply only to acrylic coatings, not silicone" },
        { id: "C", text: "No; the pump must have a 3 gallon per minute output" },
        { id: "D", text: "2 GPM is acceptable when hose ID is increased to 1 inch" },
      ],
      answer: "C",
      explanation: "The pump must have a 3 gallon per minute output for 670HS spray application.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-016",
      type: "mcq",
      question: "An estimator calculates standard field coverage for 670HS on a 15,000 sq. ft. smooth BUR restoration. What default coverage rate does Karnak list for most applications?",
      options: [
        { id: "A", text: "1 gallon per 100 sq. ft. at 12 wet mils" },
        { id: "B", text: "3 gallons per 100 sq. ft. required on every substrate" },
        { id: "C", text: "0.75 gallons per 100 sq. ft. when applied over primer" },
        { id: "D", text: "1.5 gallons per 100 sq. ft. (24 wet mils) in a single coat for most applications" },
      ],
      answer: "D",
      explanation: "Apply in a single coat at 1.5 gallons per 100 sq. ft. (24 wet mils) for most applications.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-017",
      type: "mcq",
      question: "A foreman wants to apply up to 3 gallons per 100 sq. ft. of 670HS in one application on a horizontal approved substrate. Is this permitted?",
      options: [
        { id: "A", text: "Yes; may be applied up to 3 gallons per 100 sq. ft. on approved horizontal substrates in one application where applicable" },
        { id: "B", text: "No; 670HS is always limited to 1.5 gallons per 100 sq. ft." },
        { id: "C", text: "3 gallons per 100 sq. ft. is only permitted on vertical walls" },
        { id: "D", text: "Maximum single-pass coverage is 2 gallons per 100 sq. ft. on any substrate" },
      ],
      answer: "A",
      explanation: "670HS may be applied up to 3 gallons per 100 sq. ft. on approved horizontal substrates in one application, where applicable.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-018",
      type: "mcq",
      question: "At 95°F and 90% relative humidity, how long does Karnak list for 670HS cure time?",
      options: [
        { id: "A", text: "24 to 48 hours identical to acrylic coatings" },
        { id: "B", text: "2 hours at 95°F and 90% RH" },
        { id: "C", text: "8 hours at 95°F regardless of humidity" },
        { id: "D", text: "30 days final cure before foot traffic" },
      ],
      answer: "B",
      explanation: "Cure time is listed as 2 hours at 95°F and 90% RH, compared to 8 hours at 50°F and 20% RH.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-019",
      type: "mcq",
      question: "A crew arrives when the roof temperature is 45°F for 670HS application. What application temperature range does Karnak specify?",
      options: [
        { id: "A", text: "40°F to 120°F identical to acrylic elastomerics" },
        { id: "B", text: "32°F minimum for moisture-curing silicone" },
        { id: "C", text: "50°F to 120°F; application should not begin at 45°F" },
        { id: "D", text: "45°F is acceptable if the coating is heated to 70°F in the pail" },
      ],
      answer: "C",
      explanation: "Recommended application temperature is 50°F to 120°F. Apply at temperatures 50°F to 120°F.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-020",
      type: "mcq",
      question: "Rain is expected 20 hours after 670HS application will finish. Should the crew proceed?",
      options: [
        { id: "A", text: "Yes; silicone cures in 2 hours and rain at 20 hours is acceptable" },
        { id: "B", text: "Rain within 12 hours is the only restriction for silicone coatings" },
        { id: "C", text: "Rain restrictions apply only when granules are embedded" },
        { id: "D", text: "No; do not apply if rain is expected within 24 hours after application" },
      ],
      answer: "D",
      explanation: "Do not apply if rain is expected within 24 hours after application.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-021",
      type: "mcq",
      question: "A crew mixes half a 5-gallon pail of 670HS and plans to store the remainder for next week. What does Karnak state about mixing?",
      options: [
        { id: "A", text: "Once product is mixed, the entire container should be used" },
        { id: "B", text: "Partial pails may be resealed and used within 30 days" },
        { id: "C", text: "Mixing is optional for brush application only" },
        { id: "D", text: "Mix only with a drill paddle under 500 RPM for 30 seconds" },
      ],
      answer: "A",
      explanation: "Mix coating prior to application with a 3-inch diameter mixer for 5-gallon pails. Once product is mixed, the entire container should be used.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-022",
      type: "mcq",
      question: "Standing water is observed 24 hours after rainfall on a roof scheduled for 670HS. What drainage requirement does Karnak cite?",
      options: [
        { id: "A", text: "Ponding is acceptable if silicone is applied at 3 gallons per 100 sq. ft." },
        { id: "B", text: "All surfaces must have positive drainage; NRCA criteria require no standing water 48 hours after rain stops" },
        { id: "C", text: "Positive drainage is required only on newly sprayed foam" },
        { id: "D", text: "Drainage requirements are waived on previously silicone coated roofs" },
      ],
      answer: "B",
      explanation: "All surfaces must have positive drainage. NRCA criteria judge proper slope as no evidence of standing water 48 hours after rain stops.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-023",
      type: "mcq",
      question: "A new SBS granule modified membrane was installed 25 days ago. The owner wants 670HS applied next week. Has the minimum weathering period been met?",
      options: [
        { id: "A", text: "Yes; 25 days exceeds the 21-day industry standard" },
        { id: "B", text: "SBS membranes require 90 to 180 days before any silicone" },
        { id: "C", text: "No; SBS granular modified membranes must weather a minimum of 30 days" },
        { id: "D", text: "Granule modified membranes may be coated immediately with primer" },
      ],
      answer: "C",
      explanation: "SBS and APP granular modified membranes and smooth surface APP membranes must be allowed to weather a minimum of 30 days.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-024",
      type: "mcq",
      question: "A spray crew is setting up 670HS on a windy day and asks about static spark risk. What safety caution does Karnak provide for spraying?",
      options: [
        { id: "A", text: "Static sparks are not a concern with low VOC silicone" },
        { id: "B", text: "Grounding is required only when VOC exceeds 450 g/L" },
        { id: "C", text: "Spray application is prohibited when wind exceeds 5 mph" },
        { id: "D", text: "Equipment should be grounded to avoid accidental ignition due to static sparks when spraying" },
      ],
      answer: "D",
      explanation: "If spraying, equipment should be grounded to avoid accidental ignition due to static sparks.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-025",
      type: "mcq",
      question: "A foreman needs to patch open seams before 670HS field coating. Which Karnak repair products does the data sheet list for seams, flashings, splits, and cracks?",
      options: [
        { id: "A", text: "502MS Karna-Flex, 505MS Karna-Flex WB, 671 Karna-Seal, or appropriate sealants or caulking materials" },
        { id: "B", text: "19 Ultra Rubberized Flashing Cement only" },
        { id: "C", text: "406 Tru-Grip only; mastics are not approved for seam repair" },
        { id: "D", text: "Any polyurethane caulk from a hardware store" },
      ],
      answer: "A",
      explanation: "Patch and repair seams, flashings, damaged areas, splits, and cracks with 502MS Karna-Flex, 505MS Karna-Flex WB, 671 Karna-Seal, or appropriate sealants or caulking materials.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-026",
      type: "mcq",
      question: "A specifier asks which ASTM standard the 670HS data sheet references for silicone roof coatings.",
      options: [
        { id: "A", text: "ASTM D6083 Type I for acrylic elastomerics" },
        { id: "B", text: "ASTM D 6694" },
        { id: "C", text: "ASTM D2824 Type III for fibered aluminum" },
        { id: "D", text: "ASTM D 2370 for elongation testing only" },
      ],
      answer: "B",
      explanation: "670HS Karna-Sil Ultra is associated with ASTM D 6694 in the physical properties section.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-027",
      type: "mcq",
      question: "A cold-storage facility owner asks about the cured film service temperature range for 670HS. What does Karnak list?",
      options: [
        { id: "A", text: "-15°F to 180°F matching acrylic elastomerics" },
        { id: "B", text: "15°F to 180°F identical to aluminum coatings" },
        { id: "C", text: "-75°F to 380°F for the cured silicone film" },
        { id: "D", text: "Service temperature is not published for silicone coatings" },
      ],
      answer: "C",
      explanation: "Service temperature for the cured film is -75°F to 380°F.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-028",
      type: "mcq",
      question: "A vertical parapet wall will receive 670HS and the foreman worries one coat may not build enough film thickness. What does Karnak note about vertical application?",
      options: [
        { id: "A", text: "Vertical application is prohibited for 670HS" },
        { id: "B", text: "Vertical surfaces always require double the horizontal coverage rate" },
        { id: "C", text: "Vertical work must use brush only; spray is not permitted" },
        { id: "D", text: "Vertical application may require multiple coats to achieve desired film thickness" },
      ],
      answer: "D",
      explanation: "670HS may be used on vertical as well as horizontal applications. Vertical application may require multiple coats to achieve desired film thickness.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-029",
      type: "mcq",
      question: "A sales rep pitches white 670HS for an energy rebate. What initial solar reflectance does the data sheet list?",
      options: [
        { id: "A", text: "0.87 initial solar reflectance (white only) with 0.70 after 3-year aging" },
        { id: "B", text: "0.86 initial, matching 501 Elasto-Brite acrylic" },
        { id: "C", text: "0.63 initial, matching fibered aluminum coatings" },
        { id: "D", text: "Solar reflectance is not listed for high-solids silicone" },
      ],
      answer: "A",
      explanation: "White 670HS has 0.87 initial solar reflectance and 0.70 after 3-year aging, with initial thermal emittance of 0.89.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K670HS-030",
      type: "mcq",
      question: "A warehouse stores 670HS drums in a shed that may reach 105°F in summer. What storage temperature limit does Karnak specify?",
      options: [
        { id: "A", text: "No maximum storage temperature is listed" },
        { id: "B", text: "Do not store above 100°F; keep containers properly sealed indoors in a cool well-ventilated area" },
        { id: "C", text: "Silicone may be stored up to 120°F matching application temperature" },
        { id: "D", text: "Drums must be stored below 50°F to prevent cure" },
      ],
      answer: "B",
      explanation: "Keep containers properly sealed when stored indoors in a cool well-ventilated area. Do not store above 100°F.",
      cite: "670hs-karna-sil-ultra-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
  ]
};

const KARNAK_670HS_KARNA_SIL_ULTRA_QUESTION_BANK_2026 = {
  ...KARNAK_670HS_KARNA_SIL_ULTRA_QUESTION_BANK_2026_RAW,
  questions: KARNAK_670HS_KARNA_SIL_ULTRA_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = KARNAK_670HS_KARNA_SIL_ULTRA_QUESTION_BANK_2026;
