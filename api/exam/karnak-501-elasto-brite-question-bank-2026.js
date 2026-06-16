// Karnak 501 Elasto-Brite - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: 501-elasto-brite-pds.pdf
// Authoring target: 25 technical data sheet questions grounded in source text.

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

const KARNAK_501_ELASTO_BRITE_QUESTION_BANK_2026_RAW = {
  book: "Karnak 501 Elasto-Brite",
  questions: [
    {
      id: "K501-001",
      type: "mcq",
      question: "A property manager wants Karnak 501 Elasto-Brite applied over a newly installed four-ply built-up roof that was completed 45 days ago. What does the data sheet require before coating can proceed?",
      options: [
        { id: "A", text: "The BUR surface must age a minimum of 90 days before 501 Elasto-Brite application" },
        { id: "B", text: "Coating may begin once the roof has dried for 48 hours after the final flood coat" },
        { id: "C", text: "Only 30 days of weathering is required for all asphalt-based membranes" },
        { id: "D", text: "New BUR may be coated immediately if a Karnak 400-series base coat is used first" },
      ],
      answer: "A",
      explanation: "New BUR roof surfaces must age a minimum of 90 days before coating. Modified bitumen membranes require 30 days, but BUR has a longer aging requirement.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-002",
      type: "mcq",
      question: "A foreman schedules 501 Elasto-Brite over a torched SBS modified bitumen membrane installed 20 days ago. According to Karnak surface preparation requirements, what is the problem?",
      options: [
        { id: "A", text: "SBS membranes never qualify for acrylic elastomeric coatings" },
        { id: "B", text: "Newly installed cold-process, hot-applied, and torched-applied modified bitumen membranes should age 30 days before coating" },
        { id: "C", text: "Torched membranes require 90 days regardless of reinforcement type" },
        { id: "D", text: "Modified bitumen must be torn off before any Karnak acrylic may be applied" },
      ],
      answer: "B",
      explanation: "Newly installed cold-process, hot-applied, and torched-applied modified bitumen membranes should age 30 days before coating. At 20 days the membrane has not met the minimum weathering period.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-003",
      type: "mcq",
      question: "An estimator is pricing restoration over a five-year-old TPO single-ply roof in sound condition. Is 501 Elasto-Brite within the manufacturer's stated approved substrates?",
      options: [
        { id: "A", text: "No; TPO requires silicone only and cannot accept acrylic coatings" },
        { id: "B", text: "Only if the TPO is less than two years old and still factory-white" },
        { id: "C", text: "Yes; aged TPO and PVC (minimum four years old) are listed approved substrates" },
        { id: "D", text: "TPO is approved only when coated over 180 Karna-Sil Ultra Epoxy Primer" },
      ],
      answer: "C",
      explanation: "501 Elasto-Brite is designed for aged TPO and PVC that are a minimum of four years old, along with aged BUR, modified bitumen, and metal roofs.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-004",
      type: "mcq",
      question: "During a pre-job walk, the crew finds wet insulation under a blistered BUR field area. Before 501 Elasto-Brite work begins, what does Karnak require?",
      options: [
        { id: "A", text: "Seal the blister with mastic and coat over the wet area the same day" },
        { id: "B", text: "Power wash only; wet insulation may remain if the surface dries in 24 hours" },
        { id: "C", text: "Apply 501 Elasto-Brite in a heavy flood coat to encapsulate the moisture" },
        { id: "D", text: "All wet insulation should be removed and replaced with like materials" },
      ],
      answer: "D",
      explanation: "Surface preparation requires patching and repair of cracks or holes, and all wet insulation should be removed and replaced with like materials before coating.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-005",
      type: "mcq",
      question: "A contractor power-washes a roof at 1,500 psi before applying 501 Elasto-Brite. What does the data sheet specify for roof surface washing?",
      options: [
        { id: "A", text: "Wash roof surfaces with a minimum of 2000 psi while taking precautions to avoid roof system damage" },
        { id: "B", text: "1,500 psi is the maximum allowed to protect modified membranes" },
        { id: "C", text: "Power washing is optional when TSP substitute is used on metal only" },
        { id: "D", text: "Only brush cleaning is permitted; pressure washing voids the coating warranty" },
      ],
      answer: "A",
      explanation: "Surfaces should be power washed with TSP substitute and water, and roof surfaces should be washed with a minimum of 2000 psi with precautions to avoid damage to the roof system.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-006",
      type: "mcq",
      question: "The coating crew arrives at 6:00 a.m. when the roof thermometer reads 38°F and is forecast to reach 55°F by mid-morning. Should 501 Elasto-Brite application begin?",
      options: [
        { id: "A", text: "Yes; any temperature above freezing is acceptable at dawn" },
        { id: "B", text: "No; recommended application temperature is 40°F to 120°F and coating should be applied when 40°F and rising" },
        { id: "C", text: "Yes; acrylic coatings may be applied down to 32°F if the second coat follows within 4 hours" },
        { id: "D", text: "No; acrylic application requires a minimum of 50°F per Karnak" },
      ],
      answer: "B",
      explanation: "Recommended application temperature is 40°F to 120°F. Application should occur when temperatures are 40°F and rising but not over 120°F.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-007",
      type: "mcq",
      question: "Rain is forecast to begin 18 hours after the crew plans to finish the first coat of 501 Elasto-Brite. What does Karnak caution regarding weather?",
      options: [
        { id: "A", text: "Rain within 12 hours is acceptable if the first coat is brush-applied" },
        { id: "B", text: "Only the second coat requires a 48-hour dry window before rain" },
        { id: "C", text: "Do not apply when rain is expected during or within 24 hours after application" },
        { id: "D", text: "Rain restrictions apply only to spray application, not roller work" },
      ],
      answer: "C",
      explanation: "501 Elasto-Brite should not be applied when rain is expected during or within 24 hours after application. With rain at 18 hours, coating should not proceed.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-008",
      type: "mcq",
      question: "A crew applies the first direct-to-substrate coat of 501 Elasto-Brite at 3:00 p.m. and wants to apply the second coat at 8:00 p.m. the same evening. What dry time does the data sheet require between coats?",
      options: [
        { id: "A", text: "2 to 4 hours minimum regardless of humidity" },
        { id: "B", text: "Second coat may follow immediately if applied perpendicular to the first" },
        { id: "C", text: "24 hours minimum between all acrylic coats on every substrate" },
        { id: "D", text: "Allow the first coat to dry 8 to 12 hours before application of the second coat" },
      ],
      answer: "D",
      explanation: "501 Elasto-Brite requires allowing the first coat to dry 8 to 12 hours before application of the second coat.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-009",
      type: "mcq",
      question: "On a 95°F summer day, a foreman plans one heavy flood coat of 501 Elasto-Brite to speed production. What does Karnak recommend for high-temperature application?",
      options: [
        { id: "A", text: "For applications above 90°F, Karnak recommends application in multiple thin coats to prevent trapped moisture problems" },
        { id: "B", text: "Single heavy coats are preferred above 90°F to maximize dry mil thickness" },
        { id: "C", text: "Above 90°F, only spray application is permitted; rollers trap heat" },
        { id: "D", text: "High temperatures require thinning the coating 10% with water" },
      ],
      answer: "A",
      explanation: "For applications in higher temperatures above 90°F, Karnak recommends application in multiple thin coats to prevent trapped moisture problems.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-010",
      type: "mcq",
      question: "An estimator calculates material for a two-coat direct-to-substrate 501 Elasto-Brite application over 10,000 square feet. What total coverage rate does the data sheet specify?",
      options: [
        { id: "A", text: "1.5 gallons per 100 sq. ft. total for both coats combined" },
        { id: "B", text: "3 gallons per 100 sq. ft. total (1.5 gallons per 100 sq. ft. per coat) to achieve 20 to 24 dry mils" },
        { id: "C", text: "1 gallon per 100 sq. ft. per coat for acrylic direct application" },
        { id: "D", text: "5 gallons per 100 sq. ft. when applied without a Karnak base coat" },
      ],
      answer: "B",
      explanation: "Direct-to-substrate two-coat application is at 1.5 gallons per 100 sq. ft. per coat for a total of 3 gallons per 100 sq. ft., achieving 20 to 24 dry mils.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-011",
      type: "mcq",
      question: "A specifier wants one coat of 501 Elasto-Brite over Karnak 406 Tru-Grip base coat. What coverage rate and wet mil thickness does Karnak specify?",
      options: [
        { id: "A", text: "1 gallon per 100 sq. ft. at 12 wet mils" },
        { id: "B", text: "2 gallons per 100 sq. ft. with no mil thickness guidance" },
        { id: "C", text: "1.5 gallons per 100 sq. ft. at 24 wet mils in a single coat over the applicable 400-series base coat" },
        { id: "D", text: "3 gallons per 100 sq. ft. because base coats count as the first finish coat" },
      ],
      answer: "C",
      explanation: "Over applicable 400-series base coats, apply 501 Elasto-Brite in a single coat at 1.5 gallons per 100 sq. ft. (24 wet mils).",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-012",
      type: "mcq",
      question: "A roller crew finishes the first coat of 501 Elasto-Brite running parallel to the base coat direction. What does Karnak specify for roller and brush application orientation?",
      options: [
        { id: "A", text: "All coats must run parallel to the roof slope for drainage" },
        { id: "B", text: "Roller direction is unrestricted when using a 1-1/4\" nap roller" },
        { id: "C", text: "Only spray application requires cross-direction coverage" },
        { id: "D", text: "Apply with a 3/4\" to 1-1/4\" nap roller or soft roof brush perpendicular to the first coat or base coat" },
      ],
      answer: "D",
      explanation: "Roller and brush application should use a 3/4\" to 1-1/4\" nap roller or soft roof brush perpendicular to the first coat or base coat for proper protection.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-013",
      type: "mcq",
      question: "A spray applicator sets up for 501 Elasto-Brite field coating. What overspray pattern does the data sheet require?",
      options: [
        { id: "A", text: "50% overspray pattern" },
        { id: "B", text: "25% overlap with a single-pass wet-on-wet technique" },
        { id: "C", text: "No overlap; each pass must dry before the next pass" },
        { id: "D", text: "75% overlap only when applying over metal substrates" },
      ],
      answer: "A",
      explanation: "Spray application should be done with a 50% overspray pattern using a heavy-duty professional airless spray pump.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-014",
      type: "mcq",
      question: "Standing water remains in a low corner of a retail roof 36 hours after the last rainfall ended. The owner wants 501 Elasto-Brite applied next week. What does Karnak and the cited NRCA drainage criteria indicate?",
      options: [
        { id: "A", text: "Standing water under 48 hours is acceptable if the coating is silicone-based" },
        { id: "B", text: "Cold-process coatings should only be installed on decks with positive drainage; NRCA criteria require no standing water 48 hours after rain stops" },
        { id: "C", text: "Ponding areas require only double coverage rate, not slope correction" },
        { id: "D", text: "Positive drainage is required only on vertical wall surfaces, not horizontal roofs" },
      ],
      answer: "B",
      explanation: "Cold-process systems and coatings should only be installed on decks with positive drainage. NRCA criteria judge proper slope as no evidence of standing water 48 hours after rain stops.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-015",
      type: "mcq",
      question: "A building owner asks why Karnak recommends 501 Elasto-Brite over a Karnak 400-series base coat rather than direct application. What does the data sheet state about recommended use?",
      options: [
        { id: "A", text: "Direct application is always prohibited on every substrate" },
        { id: "B", text: "400-series base coats are decorative only and do not affect adhesion" },
        { id: "C", text: "Recommended use is for application over one of Karnak's 400-series substrate-specific base coats" },
        { id: "D", text: "Base coats are required only on vertical concrete block surfaces" },
      ],
      answer: "C",
      explanation: "Recommended use is for application over one of Karnak's 400-series substrate-specific base coats, though direct two-coat application is also specified at higher total coverage.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-016",
      type: "mcq",
      question: "A crew applies 501 Elasto-Brite over a wet 406 Tru-Grip base coat that has not fully dried. What preparation requirement applies?",
      options: [
        { id: "A", text: "Wet base coats improve acrylic flow and may be coated immediately" },
        { id: "B", text: "Only the second finish coat requires the base coat to be dry" },
        { id: "C", text: "Base coat dryness matters only when temperatures exceed 100°F" },
        { id: "D", text: "501 Elasto-Brite or subsequent base coats should be dry prior to application of 501 Elasto-Brite" },
      ],
      answer: "D",
      explanation: "501 Elasto-Brite or subsequent base coats should be dry prior to application of 501 Elasto-Brite.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-017",
      type: "mcq",
      question: "Fresh masonry parapet walls will be coated with 501 Elasto-Brite on a vertical above-grade application. The walls were poured 15 days ago. What curing period does Karnak require?",
      options: [
        { id: "A", text: "Allow fresh masonry to cure a minimum of 30 days before application" },
        { id: "B", text: "Masonry may be coated immediately if power washed at 2000 psi" },
        { id: "C", text: "Masonry requires 90 days cure, identical to new BUR roofs" },
        { id: "D", text: "Vertical masonry is not an approved substrate for 501 Elasto-Brite" },
      ],
      answer: "A",
      explanation: "Allow fresh masonry to cure a minimum of 30 days before application. 501 Elasto-Brite is approved on above-grade vertical surfaces including concrete and concrete block.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-018",
      type: "mcq",
      question: "An HVAC contractor asks whether rooftop air intakes need protection during 501 Elasto-Brite application. What does Karnak caution?",
      options: [
        { id: "A", text: "Air intakes require protection only during spray application of silicone products" },
        { id: "B", text: "Cover air intakes during application and while drying" },
        { id: "C", text: "Air intakes may remain open if the coating is water-based acrylic" },
        { id: "D", text: "Intake protection is the building owner's responsibility, not the roofer's" },
      ],
      answer: "B",
      explanation: "Karnak cautions to cover air intakes during application and while drying. This applies to exterior acrylic coating work.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-019",
      type: "mcq",
      question: "A warehouse stores 501 Elasto-Brite pails in an unheated outdoor trailer during winter. What storage caution does the data sheet provide?",
      options: [
        { id: "A", text: "Freezing has no effect on acrylic emulsion coatings" },
        { id: "B", text: "Coatings may freeze once but must be stirred for 30 minutes before use" },
        { id: "C", text: "Protect from freezing; store in a heated room and keep the container covered when not in use" },
        { id: "D", text: "Outdoor storage is preferred to maintain application viscosity" },
      ],
      answer: "C",
      explanation: "Karnak cautions to protect from freezing, store in a heated room, and keep the container covered when not in use.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-020",
      type: "mcq",
      question: "A sales rep pitches white 501 Elasto-Brite for a cool-roof rebate program. What initial solar reflectance does the data sheet list for white?",
      options: [
        { id: "A", text: "0.77 initial solar reflectance" },
        { id: "B", text: "0.63 initial solar reflectance matching aluminum coatings" },
        { id: "C", text: "Solar reflectance is not published for acrylic elastomeric coatings" },
        { id: "D", text: "0.86 initial solar reflectance with 0.77 after 3-year aging" },
      ],
      answer: "D",
      explanation: "White 501 Elasto-Brite has 0.86 initial solar reflectance and 0.77 after 3-year aging, with initial thermal emittance of 0.91.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-021",
      type: "mcq",
      question: "A foreman begins 501 Elasto-Brite work without a formal owner sign-off on deck conditions, assuming the existing membrane is sound. What does Karnak state about commencement of work?",
      options: [
        { id: "A", text: "Commencement of work by the contractor implies his approval of the deck surface" },
        { id: "B", text: "Commencement requires written owner approval on every project" },
        { id: "C", text: "Deck approval must be certified by a third-party inspector before coating" },
        { id: "D", text: "Commencement implies approval only when a Karnak representative is on site" },
      ],
      answer: "A",
      explanation: "Commencement of work by the contractor implies his approval of the deck surface.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-022",
      type: "mcq",
      question: "A specifier needs confirmation that 501 Elasto-Brite meets an ASTM acrylic coating specification. Which standard does the data sheet cite?",
      options: [
        { id: "A", text: "ASTM D 6694 for silicone roof coatings" },
        { id: "B", text: "ASTM D6083 Type I" },
        { id: "C", text: "ASTM D2824 Type III for fibered aluminum" },
        { id: "D", text: "ASTM D 2370 for tensile testing only, not product classification" },
      ],
      answer: "B",
      explanation: "501 Elasto-Brite meets ASTM D6083 Type I.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-023",
      type: "mcq",
      question: "At 77°F and 50% relative humidity, how long does Karnak list for cure time of 501 Elasto-Brite?",
      options: [
        { id: "A", text: "2 hours at 95°F and 90% RH" },
        { id: "B", text: "7 to 10 days between coats with 30-day final cure" },
        { id: "C", text: "24 to 48 hours at 77°F and 50% relative humidity" },
        { id: "D", text: "8 to 12 hours, identical to the intercoat dry time" },
      ],
      answer: "C",
      explanation: "Cure time is listed as 24 to 48 hours at 77°F and 50% relative humidity. Intercoat dry time between first and second coats is 8 to 12 hours.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-024",
      type: "mcq",
      question: "A painter asks whether 501 Elasto-Brite may be thinned for easier roller application on a hot day. What does Karnak specify?",
      options: [
        { id: "A", text: "Thin up to 5% water when ambient temperature exceeds 90°F" },
        { id: "B", text: "Thin only with Karnak 799 Wash-N-Prep for spray work" },
        { id: "C", text: "Thinning is permitted for vertical applications only" },
        { id: "D", text: "Do not thin" },
      ],
      answer: "D",
      explanation: "Karnak cautions: Do not thin. This applies to 501 Elasto-Brite application.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K501-025",
      type: "mcq",
      question: "An owner wants Patina Green on a 200-square-foot accent parapet. The data sheet lists specialty colors. What minimum order quantity applies to non-standard colors?",
      options: [
        { id: "A", text: "Specialty colors are available in minimum order quantities of 350 gallons" },
        { id: "B", text: "50 gallons minimum for any specialty color" },
        { id: "C", text: "Only White and Portland Gray are manufactured; no other colors exist" },
        { id: "D", text: "Specialty colors require a silicone topcoat and cannot be acrylic" },
      ],
      answer: "A",
      explanation: "White and Portland Gray are standard colors. Specialty colors including Patina Green are available in minimum order quantities of 350 gallons.",
      cite: "501-elasto-brite-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
  ]
};

const KARNAK_501_ELASTO_BRITE_QUESTION_BANK_2026 = {
  ...KARNAK_501_ELASTO_BRITE_QUESTION_BANK_2026_RAW,
  questions: KARNAK_501_ELASTO_BRITE_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = KARNAK_501_ELASTO_BRITE_QUESTION_BANK_2026;
