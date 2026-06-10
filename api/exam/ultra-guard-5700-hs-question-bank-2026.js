// Ultra-Guard 5700 HS Silicone Coating - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf
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

const ULTRA_GUARD_5700_HS_QUESTION_BANK_2026_RAW = {
  book: "Ultra-Guard 5700 HS Silicone Coating",
  questions: [
    {
      id: "UG5700HS-001",
      type: "mcq",
      question: "A spray foam contractor finishes an Ultra-Thane 230 HFO roof today and the silicone crew follows tomorrow. The owner asks what role Ultra-Guard 5700 HS plays on this assembly. What best describes the product per the technical data sheet?",
      options: [
        { id: "A", text: "A two-component polyurethane foam used to build slope to drain" },
        { id: "B", text: "A single-component silicone elastomeric roof coating used as a restoration system and to protect spray polyurethane foam" },
        { id: "C", text: "A water-based acrylic primer applied only under metal panels" },
        { id: "D", text: "A maintenance mastic for penetrations only, not for field membrane work" }
      ],
      answer: "B",
      explanation: "Ultra-Guard 5700 HS is a single-component silicone elastomeric roof coating used as a restoration system and to protect spray polyurethane foam. It is a high-solids, rapid-cure polymer with UV protection and ponding water resistance.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-002",
      type: "mcq",
      question: "A foreman is pricing a silicone restoration over an aging four-ply built-up roof in sound condition. Is Ultra-Guard 5700 HS within the manufacturer's stated recommended uses for this substrate?",
      options: [
        { id: "A", text: "No; the coating is approved only over spray polyurethane foam" },
        { id: "B", text: "Yes; BUR is among the recommended uses, along with polyurethane foam, roof membranes, and metal" },
        { id: "C", text: "Only if the BUR is first torn off to bare deck" },
        { id: "D", text: "Only when applied as a brush-grade mastic, not as a field coating" }
      ],
      answer: "B",
      explanation: "Recommended uses include polyurethane foam, roof membranes, BUR, and metal. A restoration over an existing BUR is within the product's stated application scope when prepared per GCMC requirements.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-003",
      type: "mcq",
      question: "Ponding water persists near a primary drain on a retail center roof slated for silicone restoration. The owner asks why Ultra-Guard 5700 HS is specified instead of a generic acrylic. Which product characteristic from the data sheet supports that decision?",
      options: [
        { id: "A", text: "The coating is open-cell and absorbs standing water to prevent overflow" },
        { id: "B", text: "The product is described as having superior ponding water resistance among its performance properties" },
        { id: "C", text: "Ponding areas require only brush-applied mastic, not silicone" },
        { id: "D", text: "Ponding resistance is achieved only when applied at 1 gallon per 100 square feet" }
      ],
      answer: "B",
      explanation: "Ultra-Guard 5700 HS is described as having superior properties including low temperature flexibility, UV protection, and ponding water resistance. Ponding areas still require proper system design and mil thickness, but ponding resistance is a stated product advantage.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-004",
      type: "mcq",
      question: "A restaurant client has a grease exhaust discharge that can heat the roof surface near a stack curb. The specifier asks whether Ultra-Guard 5700 HS is appropriate in that zone. What heat capability does the data sheet cite?",
      options: [
        { id: "A", text: "Excellent heat resistance up to 250°F (121°C)" },
        { id: "B", text: "Maximum service temperature 150°F; stack areas require aluminum coating" },
        { id: "C", text: "Heat resistance is not listed; only cold flexibility matters" },
        { id: "D", text: "Silicone coatings cannot be used within 50 feet of any exhaust" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 HS has excellent heat resistance up to 250°F (121°C), in addition to salt, acid, solvent, and fair alkali resistance. Local exhaust conditions still require proper detailing, but the published heat rating supports hot-zone consideration.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-005",
      type: "mcq",
      question: "After the first full spray pass on new SPF, the foreman measures 18 dry mils in several grid tests and wants to release the roof to the owner. What minimum dry film thickness does the data sheet require when used as a protective membrane over polyurethane foam?",
      options: [
        { id: "A", text: "15 dry mils, matching 1 gallon per 100 square feet" },
        { id: "B", text: "18 dry mils if the foam was coated within 24 hours" },
        { id: "C", text: "22 dry mils minimum over polyurethane foam" },
        { id: "D", text: "30 dry mils before any foot traffic is allowed" }
      ],
      answer: "C",
      explanation: "The theoretical dry film thickness is 15 mils at 1 gallon per 100 square feet, but the minimum recommended thickness when used as a protective membrane over polyurethane foam is 22 dry mils. Field QC must verify the SPF-specific minimum, not the generic coverage rate alone.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-006",
      type: "mcq",
      question: "The owner requests a 20-year performance target on a spray foam roof using Ultra-Guard 5700 HS. What coverage rate over spray foam does the data sheet list for that service life?",
      options: [
        { id: "A", text: "1.0 to 1.25 gallons per 100 square feet" },
        { id: "B", text: "1.5 to 2.0 gallons per 100 square feet" },
        { id: "C", text: "2.0 to 2.5 gallons per 100 square feet" },
        { id: "D", text: "2.5 to 3.0 gallons per 100 square feet" }
      ],
      answer: "D",
      explanation: "Coverage rate over spray foam for 20-year performance is 2.5 to 3 gallons per 100 square feet. Ten-year performance is 1.5 to 2 gallons and 15-year performance is 2 to 2.5 gallons per 100 square feet.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-007",
      type: "mcq",
      question: "A school district budgets for a 15-year silicone restoration cycle over existing SPF. How much material should the estimator plan per 100 square feet per the published coverage table?",
      options: [
        { id: "A", text: "1.5 to 2.0 gallons per 100 square feet" },
        { id: "B", text: "2.0 to 2.5 gallons per 100 square feet" },
        { id: "C", text: "2.5 to 3.0 gallons per 100 square feet" },
        { id: "D", text: "1.0 gallon per 100 square feet regardless of service life" }
      ],
      answer: "B",
      explanation: "For 15-year performance over spray foam, the data sheet lists 2 to 2.5 gallons per 100 square feet. Matching gallonage to the owner's service-life target is a core foreman estimating decision.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-008",
      type: "mcq",
      question: "A value-engineered proposal calls for the minimum silicone system on SPF with a 10-year performance expectation. What coverage range should the foreman carry per the data sheet?",
      options: [
        { id: "A", text: "1.5 to 2.0 gallons per 100 square feet" },
        { id: "B", text: "2.0 to 2.5 gallons per 100 square feet" },
        { id: "C", text: "2.5 to 3.0 gallons per 100 square feet" },
        { id: "D", text: "0.75 gallon per 100 square feet if two coats are applied" }
      ],
      answer: "A",
      explanation: "Ten-year performance over spray foam is 1.5 to 2 gallons per 100 square feet. Using only the 1 gallon per 100 square feet theoretical rate does not meet the longer service-life coverage targets.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-009",
      type: "mcq",
      question: "A new estimator assumes 1 gallon per 100 square feet will satisfy the SPF specification because that rate equals 15 dry mils on the data sheet. What must the foreman correct before ordering material?",
      options: [
        { id: "A", text: "One gallon per 100 square feet always exceeds the SPF minimum" },
        { id: "B", text: "The 15-mil rate is theoretical coverage; SPF still requires a minimum 22 dry mils protective membrane, which typically needs higher gallonage per the performance table" },
        { id: "C", text: "SPF projects require only brush application, not spray" },
        { id: "D", text: "Gallonage is determined by wind speed, not mil thickness" }
      ],
      answer: "B",
      explanation: "The data sheet lists 15 mils at 1 gallon per 100 square feet as theoretical dry film thickness, but the minimum recommended thickness over polyurethane foam is 22 dry mils. Service-life coverage rates over foam range from 1.5 to 3 gallons per 100 square feet.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-010",
      type: "mcq",
      question: "The coating rig is set up with a standard airless unit delivering 3,800 psi at the spray gun. May the crew proceed with field application of Ultra-Guard 5700 HS?",
      options: [
        { id: "A", text: "Yes, any airless pump above 3,000 psi is acceptable" },
        { id: "B", text: "No; a high-pressure airless pump capable of producing a minimum of 4,500 psi at the spray gun is required" },
        { id: "C", text: "Yes, if material is reduced with solvent to lower viscosity" },
        { id: "D", text: "No; only brush and roller application is permitted in the field" }
      ],
      answer: "B",
      explanation: "Ultra-Guard 5700 HS is designed for high-pressure airless spray equipment capable of producing a minimum of 4,500 psi at the spray gun. The pump should have minimum 3 gallons per minute output and be fed by a 5:1 transfer pump.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-011",
      type: "mcq",
      question: "The mechanic proposes running the coating pump at 2 gallons per minute from the machine without a transfer pump. What equipment configuration does the data sheet require?",
      options: [
        { id: "A", text: "Minimum 3 gallons per minute output fed by a 5:1 transfer pump" },
        { id: "B", text: "Minimum 1 gallon per minute with gravity feed from the drum" },
        { id: "C", text: "Transfer pump is optional when using 50-gallon drums" },
        { id: "D", text: "Output rate is irrelevant if hose length is under 100 feet" }
      ],
      answer: "A",
      explanation: "The pump should have a minimum of 3 gallons per minute output and be fed by a 5:1 transfer pump. Components must always be rated for pump pressure.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-012",
      type: "mcq",
      question: "At 75°F (24°C) and 50% relative humidity, the crew finished the first full coat at 9:00 a.m. without accelerator and wants to apply the second full coat at 1:00 p.m. the same day. What scheduling guidance applies?",
      options: [
        { id: "A", text: "Same-day second coat is acceptable once the surface feels dry to the touch" },
        { id: "B", text: "Hold the second full coat; recoat time is 7 to 10 days between coats even though single-coat dry time is greater than 3 hours at these conditions" },
        { id: "C", text: "Apply the second coat within 2 hours to lock adhesion" },
        { id: "D", text: "Wait 30 days before any second coat" }
      ],
      answer: "B",
      explanation: "Dry time at 75°F and 50% RH is greater than 3 hours without accelerator, but recoat time between coats is 7 to 10 days. A same-day second full coat violates the published recoat window regardless of surface feel.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-013",
      type: "mcq",
      question: "Rain is forecast for late afternoon and the owner will not accept another mobilization day. The foreman considers adding an accelerator package to Ultra-Guard 5700 HS. What dry-time change does the data sheet document at 75°F and 50% RH?",
      options: [
        { id: "A", text: "Dry time increases to more than 6 hours" },
        { id: "B", text: "Dry time decreases to less than 2 hours with accelerator versus greater than 3 hours without" },
        { id: "C", text: "Accelerator eliminates the need for any recoat window" },
        { id: "D", text: "Accelerator is prohibited over spray polyurethane foam" }
      ],
      answer: "B",
      explanation: "Standard dry time at 75°F and 50% RH is greater than 3 hours. With an accelerator package under the same conditions, dry time is less than 2 hours. The data sheet notes dry time may be shortened with an accelerator package.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-014",
      type: "mcq",
      question: "The first full coat was applied eight days ago on a two-coat SPF system. The coating foreman wants to spray the second full coat tomorrow. Does this align with the published recoat window?",
      options: [
        { id: "A", text: "No; recoat must wait a full 30 days" },
        { id: "B", text: "Yes; recoat time is 7 to 10 days between coats" },
        { id: "C", text: "No; second coats must be applied within 24 hours of the first" },
        { id: "D", text: "Yes; any time after 3 hours dry time is acceptable" }
      ],
      answer: "B",
      explanation: "Recoat time is 7 to 10 days between coats. Final cure is 30 days. Eight days after the first coat falls within the stated recoat window.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-015",
      type: "mcq",
      question: "The owner wants to schedule rooftop solar pedestal installation 22 days after the final silicone coat on an SPF restoration. The foreman must advise when the coating reaches final cure. What does the data sheet state?",
      options: [
        { id: "A", text: "The roof may be treated as fully cured after 7 to 10 days" },
        { id: "B", text: "Final cure is 30 days; heavy trade work before that point may be premature" },
        { id: "C", text: "Final cure occurs within 3 hours dry time" },
        { id: "D", text: "Cure time is unlimited; silicone remains workable for 90 days" }
      ],
      answer: "B",
      explanation: "Final cure is 30 days. Recoat time between coats is 7 to 10 days, which applies between coating passes—not the completed membrane's final cure. At 22 days the foreman should plan around the remaining cure period.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-016",
      type: "mcq",
      question: "A metal building owner wants a silicone restoration over a structurally sound R-panel roof without tear-off. Does the technical data sheet include this substrate in recommended uses?",
      options: [
        { id: "A", text: "Yes; metal is a recommended use" },
        { id: "B", text: "No; metal roofs require polyurethane foam before any silicone" },
        { id: "C", text: "Only standing-seam copper is approved" },
        { id: "D", text: "Metal is approved only for maintenance mastic, not field coating" }
      ],
      answer: "A",
      explanation: "Recommended uses include polyurethane foam, roof membranes, BUR, and metal. Restoration over prepared metal is within the stated scope when applied by professional applicators per GCMC requirements.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-017",
      type: "mcq",
      question: "An aging single-ply membrane is being restored in place rather than replaced. Under the manufacturer's recommended uses, how is this project categorized?",
      options: [
        { id: "A", text: "Not permitted; only new SPF may be coated" },
        { id: "B", text: "Permitted as a roof membrane restoration within recommended uses" },
        { id: "C", text: "Permitted only if the membrane is first coated with asphalt emulsion" },
        { id: "D", text: "Permitted only on BUR, not on single-ply membranes" }
      ],
      answer: "B",
      explanation: "Recommended uses explicitly include roof membranes, along with polyurethane foam, BUR, and metal. Silicone restoration over an existing membrane is a stated application category.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-018",
      type: "mcq",
      question: "Rooftop package units have intake louvers 25 feet from the silicone spray operation. What job-site protection step does the data sheet require?",
      options: [
        { id: "A", text: "Louvers need no protection if workers wear respirators" },
        { id: "B", text: "Cover all intake vents near the work area" },
        { id: "C", text: "Shut down the building permanently during coating" },
        { id: "D", text: "Intake protection applies only to interior spray booths" }
      ],
      answer: "B",
      explanation: "Job-site protection requires covering all intake vents near the work area because overspray can carry considerable distances. Additional controls include limiting personnel and prohibiting open flames.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-019",
      type: "mcq",
      question: "A maintenance technician plans to weld a loose sheet-metal counter flashing while the silicone crew is spraying on the opposite side of the same roof. What does job-site protection prohibit?",
      options: [
        { id: "A", text: "Welding is acceptable with a 25-foot fire watch" },
        { id: "B", text: "No welding, smoking, or open flames during coating operations" },
        { id: "C", text: "Welding is allowed after the first coat only" },
        { id: "D", text: "Open flames are acceptable when a CO2 extinguisher is on site" }
      ],
      answer: "B",
      explanation: "Job-site protection lists no welding, smoking, or open flames among required controls. A CO2 or dry chemical fire extinguisher must also be available at the jobsite.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-020",
      type: "mcq",
      question: "Mid-morning wind is carrying fine silicone overspray toward an adjacent medical office building and parked vehicles. What production decision does the data sheet require?",
      options: [
        { id: "A", text: "Continue spraying if RH is below 80%" },
        { id: "B", text: "Do not apply when wind is of sufficient velocity to cause overspray of adjacent areas, buildings, or people" },
        { id: "C", text: "Reduce tip size and continue until lunch" },
        { id: "D", text: "Wind restrictions apply only to polyurethane foam, not silicone" }
      ],
      answer: "B",
      explanation: "Ultra-Guard 5700 HS should not be applied when wind is of sufficient velocity to cause overspray of adjacent areas, buildings, or people. Overspray can carry considerable distances.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-021",
      type: "mcq",
      question: "The general contractor wants to keep laborers cleaning drains in the same bay where silicone spray is active to stay on schedule. What personnel control does the data sheet require?",
      options: [
        { id: "A", text: "All roof workers may remain if they wear dust masks" },
        { id: "B", text: "Minimize or exclude all personnel not directly involved with the spray application" },
        { id: "C", text: "Only the superintendent must leave the roof" },
        { id: "D", text: "Personnel controls apply only during night work" }
      ],
      answer: "B",
      explanation: "Job-site protection requires minimizing or excluding all personnel not directly involved with the spray application. Coatings are atomized into a very fine particle distribution during spray application.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-022",
      type: "mcq",
      question: "A worker wants to use a cutting torch to open a stuck 50-gallon drum of Ultra-Guard 5700 HS in the staging area. What flammability guidance applies?",
      options: [
        { id: "A", text: "Torch use is acceptable outdoors if the drum is empty" },
        { id: "B", text: "Flash point is 142°F; never use a welding or cutting torch on or near the drum, and avoid open flame or spark sources" },
        { id: "C", text: "Silicone drums are non-flammable and may be heated without limit" },
        { id: "D", text: "Torch use is allowed when a water fog nozzle is nearby" }
      ],
      answer: "B",
      explanation: "Flash point is 142°F (61°C). The data sheet warns to avoid open flame or spark sources, never use a welding or cutting torch on or near the drum, and notes vapors may travel along the ground and ignite at distant ignition sources.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-023",
      type: "mcq",
      question: "Solvent odor is detected at a rooftop mechanical room intake low on the wall, far from the spray gun, while coating proceeds on the upper roof. What flash-point behavior should the foreman remember?",
      options: [
        { id: "A", text: "Vapors are lighter than air and rise immediately away from the building" },
        { id: "B", text: "Vapors are heavier than air and may travel along the ground or be moved by ventilation to distant ignition sources such as pilot lights or motors" },
        { id: "C", text: "Flash point applies only inside the drum; atomized coating has no vapor hazard" },
        { id: "D", text: "Odor alone confirms the coating is fully cured" }
      ],
      answer: "B",
      explanation: "The flammability section states vapors are heavier than air and may travel along the ground or be moved by ventilation and ignited by pilot lights, flames, sparks, heaters, smoking, electric motors, or other ignition sources at locations distant from the material-handling point.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 3",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-024",
      type: "mcq",
      question: "A parapet wall detail is too tight for safe airless spray, but the field area will be sprayed. How may Ultra-Guard 5700 HS be applied in that detail per the equipment section?",
      options: [
        { id: "A", text: "Only airless spray is permitted; brush and roller are prohibited" },
        { id: "B", text: "The product may be sprayed, brushed, or rolled" },
        { id: "C", text: "Details require thinning with solvent before brush application" },
        { id: "D", text: "Parapet details must be left uncoated" }
      ],
      answer: "B",
      explanation: "Ultra-Guard 5700 HS may be sprayed, brushed, or rolled. Field production still requires high-pressure airless equipment for spray application, but details may be completed by brush or roller where appropriate.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-025",
      type: "mcq",
      question: "The spray gun setup uses a 0.017-inch orifice tip because it is the largest tip on the truck. May the crew spray Ultra-Guard 5700 HS with this tip?",
      options: [
        { id: "A", text: "Yes, any tip above 0.015 inch is acceptable" },
        { id: "B", text: "No; the spray tip must be reverse-a-clean type with a minimum orifice of 0.019 inch on a high-pressure (5,000 psi) gun" },
        { id: "C", text: "Tip size is irrelevant if pump pressure exceeds 4,500 psi" },
        { id: "D", text: "Smaller tips are required to reduce overspray in wind" }
      ],
      answer: "B",
      explanation: "The spray gun should be high pressure (5,000 psi) with a reverse-a-clean spray tip having a minimum orifice of 0.019. Undersized tips can starve production and affect proper film build.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-026",
      type: "mcq",
      question: "The rig hose run is 240 feet from pump to gun because the staging area is far from the work zone. What hose limitation does the data sheet specify?",
      options: [
        { id: "A", text: "Hoses may be any length if diameter is 3/8 inch" },
        { id: "B", text: "Hoses should have a maximum length of 200 feet with minimum 1/2 inch inside diameter" },
        { id: "C", text: "Hose length is unlimited above 4,500 psi" },
        { id: "D", text: "Maximum hose length is 100 feet on all silicone projects" }
      ],
      answer: "B",
      explanation: "Hoses should have a maximum length of 200 feet and minimum inside diameter of 1/2 inch, with a 3/8 inch whip permitted at the spray gun. Excessive hose length can affect pressure and material delivery.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-027",
      type: "mcq",
      question: "A two-coat silicone system over SPF is planned. The foreman must brief the owner on timing from first coat to fully cured membrane. Which sequence matches the data sheet?",
      options: [
        { id: "A", text: "Recoat in 24 hours; final cure in 7 days" },
        { id: "B", text: "Recoat in 7 to 10 days between coats; final cure in 30 days" },
        { id: "C", text: "Recoat immediately after 3-hour dry time; no final cure period" },
        { id: "D", text: "Single coat only; recoat is never permitted over silicone" }
      ],
      answer: "B",
      explanation: "Recoat time is 7 to 10 days between coats and final cure is 30 days. Dry time before handling a single coat is greater than 3 hours at 75°F and 50% RH without accelerator.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "UG5700HS-028",
      type: "mcq",
      question: "A waterfront cold-storage facility near salt air and chemical washdown areas needs a silicone restoration over SPF. The owner asks why Ultra-Guard 5700 HS is specified over a generic acrylic. Which published resistance profile supports the choice?",
      options: [
        { id: "A", text: "Good salt and acid resistance with fair alkali resistance, in addition to UV and ponding water performance" },
        { id: "B", text: "The coating is designed only for interior tank linings" },
        { id: "C", text: "Salt exposure requires removing silicone and applying aluminum paint" },
        { id: "D", text: "Chemical resistance is not discussed; only color retention matters" }
      ],
      answer: "A",
      explanation: "Ultra-Guard 5700 HS has good salt, acid, and solvent resistance and fair alkali resistance, along with UV protection and ponding water resistance. Coastal and washdown environments make that resistance profile a relevant foreman selection factor.",
      cite: "GCMC-TDS-Ultra-Guard-5700-HS-08172020.EA.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const ULTRA_GUARD_5700_HS_QUESTION_BANK_2026 = {
  ...ULTRA_GUARD_5700_HS_QUESTION_BANK_2026_RAW,
  questions: ULTRA_GUARD_5700_HS_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = ULTRA_GUARD_5700_HS_QUESTION_BANK_2026;
