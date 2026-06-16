// Karnak 97 Fibered Aluminum Roof Coating - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: 97-fibered-aluminum-pds.pdf
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

const KARNAK_97_FIBERED_ALUMINUM_QUESTION_BANK_2026_RAW = {
  book: "Karnak 97 Fibered Aluminum Roof Coating",
  questions: [
    {
      id: "K97-001",
      type: "mcq",
      question: "A building owner asks why 97 Fibered Aluminum Roof Coating is specified over a modified bitumen roof instead of a generic gray asphalt emulsion. What primary protective mechanism does Karnak describe?",
      options: [
        { id: "A", text: "Aluminum flakes leaf to the surface providing a reflective metallic shield; over 50% of the sun's rays are reflected, protecting asphaltic oils from being cooked out" },
        { id: "B", text: "The aluminum flakes absorb UV radiation to heat the membrane for winter flexibility" },
        { id: "C", text: "Fibered aluminum penetrates into the membrane to replace lost asphalt oils" },
        { id: "D", text: "The coating forms a rubberized membrane that eliminates all thermal movement" },
      ],
      answer: "A",
      explanation: "Aluminum flakes leaf to the surface providing a reflective metallic shield. Over 50% of the sun's rays are reflected, preventing asphaltic oils from being cooked out of the roof substrate.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-002",
      type: "mcq",
      question: "A facility manager wants to reduce summer cooling costs on a modified bitumen warehouse roof. How does Karnak describe the indoor temperature benefit of 97 Fibered Aluminum?",
      options: [
        { id: "A", text: "The coating insulates the deck to retain winter heat only" },
        { id: "B", text: "During hot summer months, the coating helps reduce indoor building temperatures by reflecting the sun's rays and reducing roof surface temperatures" },
        { id: "C", text: "Indoor temperature reduction requires a white acrylic topcoat over the aluminum" },
        { id: "D", text: "Reflectivity benefits apply only to metal corrugated decks, not modified bitumen" },
      ],
      answer: "B",
      explanation: "During hot summer months, 97 Fibered Aluminum Roof Coating helps reduce indoor building temperatures and improve inside living and working conditions by reflecting the sun's rays and reducing roof surface temperatures.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-003",
      type: "mcq",
      question: "A specifier needs confirmation of fire performance for 97 Fibered Aluminum over modified bitumen. What rating does the data sheet cite?",
      options: [
        { id: "A", text: "UL Class B rating over all substrates" },
        { id: "B", text: "FM 1-90 wind uplift only; no fire rating is published" },
        { id: "C", text: "UL Class A rated over specified modified bitumen systems, UL Listing #Rl2l99 (N)" },
        { id: "D", text: "Fire rating applies only when applied over metal corrugated decks" },
      ],
      answer: "C",
      explanation: "One coat extends modified bitumen membrane life by limiting fire spread as indicated by the UL Class A rating over specified modified bitumen systems, UL Listing #Rl2l99 (N).",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-004",
      type: "mcq",
      question: "A crew plans to apply 97 Fibered Aluminum over a new steep asphalt roof installed 60 days ago. What weathering period does Karnak require?",
      options: [
        { id: "A", text: "New asphalt roofs may be coated after 30 days" },
        { id: "B", text: "Steep asphalt may be coated immediately if swept clean" },
        { id: "C", text: "Steep asphalt requires 180 days identical to smooth BUR silicone prep" },
        { id: "D", text: "Steep asphalt roofs must weather a minimum of 90 days before coating" },
      ],
      answer: "D",
      explanation: "New asphalt roof surfaces should weather a minimum of 90 days before being coated with 97 Fibered Aluminum Roof Coating.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-005",
      type: "mcq",
      question: "A contractor applied Karnak asphalt emulsion roof coating five days ago and wants to apply 97 Fibered Aluminum today. Is this within Karnak's stated uses?",
      options: [
        { id: "A", text: "Yes; 97 may be used on any Karnak emulsion roof coating that has been allowed to cure for 3 to 5 days" },
        { id: "B", text: "No; emulsion coatings require 90 days before any aluminum may be applied" },
        { id: "C", text: "Emulsion must cure 60 days minimum before aluminum application" },
        { id: "D", text: "Aluminum may only be applied over silicone, not asphalt emulsion" },
      ],
      answer: "A",
      explanation: "97 Fibered Aluminum is ideal for modified bitumen, metal corrugated decks, steep asphalt roofs aged 90 days, or any Karnak emulsion roof coating cured 3 to 5 days.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-006",
      type: "mcq",
      question: "A roof surface shows severe alligatoring on aged asphalt. Before 97 Fibered Aluminum application, what primer does Karnak recommend?",
      options: [
        { id: "A", text: "Apply 97 directly; alligatoring improves aluminum leafing" },
        { id: "B", text: "Prime with Karnak 100 Non-Fibered Emulsion Primer or 220 Fibered Emulsion Roof Coating prior to aluminum coating" },
        { id: "C", text: "Use 180 Karna-Sil Ultra Epoxy Primer on all asphalt surfaces" },
        { id: "D", text: "Alligatored surfaces require tear-off; no primer can restore them" },
      ],
      answer: "B",
      explanation: "Badly weathered or alligatored asphalt surfaces should be primed with Karnak 100 Non-Fibered Emulsion Primer or 220 Fibered Emulsion Roof Coating prior to 97 application.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-007",
      type: "mcq",
      question: "After applying 100 Non-Fibered Emulsion Primer on an alligatored asphalt roof, how long must the primer cure before 97 Fibered Aluminum application?",
      options: [
        { id: "A", text: "24 hours minimum in warm weather" },
        { id: "B", text: "60 days minimum identical to flashing cement dry time" },
        { id: "C", text: "Allow emulsion primer or coating to cure a minimum of 3 to 5 days before aluminum application" },
        { id: "D", text: "Primer may be coated immediately if aluminum is brush-applied" },
      ],
      answer: "C",
      explanation: "Allow emulsion primer or coating to cure a minimum of 3 to 5 days before application of aluminum roof coating.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-008",
      type: "mcq",
      question: "During 97 Fibered Aluminum application, a roller crew repeatedly re-rolls the same area to improve uniformity. What does Karnak warn about application technique?",
      options: [
        { id: "A", text: "Multiple re-rolling improves aluminum leafing and reflectivity" },
        { id: "B", text: "Overworking is only a concern on vertical surfaces" },
        { id: "C", text: "Overworking is recommended to embed aluminum flakes deeper into the asphalt" },
        { id: "D", text: "Care should be taken not to overwork the coating during application because this could have a damaging effect on the leafing of the aluminum" },
      ],
      answer: "D",
      explanation: "Care should be taken not to overwork the coating during application. Overworking could have a damaging effect on the leafing of the aluminum.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-009",
      type: "mcq",
      question: "A foreman asks the correct application method for 97 Fibered Aluminum to preserve the metallic finish. What technique does Karnak specify?",
      options: [
        { id: "A", text: "Pour the correct amount to cover a given area and work it in one direction" },
        { id: "B", text: "Apply in a crisscross pattern with multiple thin passes" },
        { id: "C", text: "Spray only; brushing destroys aluminum leafing permanently" },
        { id: "D", text: "Flood coat and squeegee back in two directions" },
      ],
      answer: "A",
      explanation: "Pour the correct amount of aluminum roof coating to cover a given area and work it in one direction. Spread uniformly without overworking.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-010",
      type: "mcq",
      question: "Before opening a pail of 97 Fibered Aluminum, what mixing requirement does Karnak specify?",
      options: [
        { id: "A", text: "Do not mix; aluminum flakes must remain settled at the bottom" },
        { id: "B", text: "Mechanically mix the aluminum roof coating thoroughly before using" },
        { id: "C", text: "Stir by hand for 30 seconds only; mechanical mixing damages fibers" },
        { id: "D", text: "Thin 10% before mixing to distribute aluminum flakes" },
      ],
      answer: "B",
      explanation: "Be sure to mechanically mix the aluminum roof coating thoroughly before using.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-011",
      type: "mcq",
      question: "A crew patches blisters with Karnak 19 Ultra Rubberized Flashing Cement and reinforcement, then plans 97 Fibered Aluminum in 30 days. What discoloration risk does Karnak warn about?",
      options: [
        { id: "A", text: "No discoloration risk exists when 19 is used as patch material" },
        { id: "B", text: "Discoloration occurs only when aluminum is applied over silicone coatings" },
        { id: "C", text: "Discoloration will occur in areas where 19 Ultra Rubberized Flashing Cement is not allowed to dry a minimum of 60 days" },
        { id: "D", text: "30 days dry time for 19 is sufficient before aluminum application" },
      ],
      answer: "C",
      explanation: "Discoloration will occur in areas where 19 Ultra Rubberized Flashing Cement is not allowed to dry a minimum of 60 days.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-012",
      type: "mcq",
      question: "After 19 Ultra Rubberized Flashing Cement patches have dried 60 days, what application temperature guidance does Karnak provide for 97?",
      options: [
        { id: "A", text: "Apply at any temperature above 32°F" },
        { id: "B", text: "Apply only when temperature is between 40°F and 90°F" },
        { id: "C", text: "Temperature requirements are waived after the 60-day flashing cement cure" },
        { id: "D", text: "After 60 days, recommended application temperatures are 50°F and rising" },
      ],
      answer: "D",
      explanation: "After 60 days, recommended application temperatures are 50°F and rising. General application temperature range is 50°F to 120°F.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-013",
      type: "mcq",
      question: "An estimator calculates material for 97 Fibered Aluminum on 8,000 square feet. What coverage rate range does Karnak specify?",
      options: [
        { id: "A", text: "1 to 1.5 gallons per 100 sq. ft. (16 to 24 wet mils)" },
        { id: "B", text: "0.5 to 1 gallon per 100 sq. ft." },
        { id: "C", text: "3 gallons per 100 sq. ft. identical to acrylic two-coat systems" },
        { id: "D", text: "2 gallons per 100 sq. ft. minimum on all substrates" },
      ],
      answer: "A",
      explanation: "Apply at 1 to 1.5 gallons per 100 sq. ft. (16 to 24 wet mils).",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-014",
      type: "mcq",
      question: "A painter wants to thin 97 Fibered Aluminum for easier spray application on a hot day. What does Karnak specify?",
      options: [
        { id: "A", text: "Thin up to 5% with mineral spirits when temperature exceeds 90°F" },
        { id: "B", text: "DO NOT THIN" },
        { id: "C", text: "Thin only with Karnak 100 Non-Fibered Emulsion Primer" },
        { id: "D", text: "Thinning is permitted for metal corrugated decks only" },
      ],
      answer: "B",
      explanation: "Coverage instructions state DO NOT THIN. Caution also states do not thin.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-015",
      type: "mcq",
      question: "Rain is expected 30 hours after 97 Fibered Aluminum will be applied. What moisture restriction does Karnak specify?",
      options: [
        { id: "A", text: "Rain within 12 hours is acceptable if the coating is fibered" },
        { id: "B", text: "Moisture contact is permitted after 6 hours of dry time" },
        { id: "C", text: "Coating must not come in contact with any type of moisture within 24 to 48 hours after application" },
        { id: "D", text: "Moisture restrictions apply only to emulsion primers, not aluminum topcoats" },
      ],
      answer: "C",
      explanation: "Coating must not come in contact with any type of moisture within 24 to 48 hours after application.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-016",
      type: "mcq",
      question: "A torch-applied APP modified bitumen roof was installed today. When should Karnak recommend applying 97 Fibered Aluminum?",
      options: [
        { id: "A", text: "Wait 90 days minimum on all torch-applied membranes" },
        { id: "B", text: "Torch-applied membranes may never receive aluminum coatings" },
        { id: "C", text: "Wait 60 days to match flashing cement dry requirements" },
        { id: "D", text: "Karnak recommends coating torch-applied modified bitumen membranes as soon as possible after membrane installation" },
      ],
      answer: "D",
      explanation: "Karnak recommends coating torch-applied modified bitumen membranes as soon as possible after membrane installation to reduce UV, heat, and moisture effects that enhance exudation on APP.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-017",
      type: "mcq",
      question: "A foreman asks why prompt aluminum coating on new APP modified bitumen matters. What problem does Karnak describe on APP membranes?",
      options: [
        { id: "A", text: "UV rays, heat, and moisture especially on APP enhance exudation that can cause discoloring and delamination of any surface coating" },
        { id: "B", text: "APP membranes lose all reflectivity within 24 hours without aluminum" },
        { id: "C", text: "APP requires aluminum only for fire rating; UV damage is not a concern" },
        { id: "D", text: "APP exudation is cosmetic only and does not affect coating adhesion" },
      ],
      answer: "A",
      explanation: "Aluminum coating reduces combined effects of ultraviolet rays, heat, and moisture which especially on APP modified bitumen enhance exudation that can cause discoloring and delamination of any surface coating.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-018",
      type: "mcq",
      question: "A crew prepares a modified bitumen roof for 97 Fibered Aluminum by power washing at 2500 psi. What surface preparation does Karnak specify?",
      options: [
        { id: "A", text: "Power wash at minimum 2000 psi before all aluminum applications" },
        { id: "B", text: "Prepare all surfaces by sweeping clean of dust, dirt, loose rust, oil, and loose particles" },
        { id: "C", text: "Chemical etching with TSP is required on all modified bitumen" },
        { id: "D", text: "Surface prep requires only rinsing; sweeping is optional" },
      ],
      answer: "B",
      explanation: "Prepare all surfaces by sweeping clean of dust, dirt, loose rust, oil, and loose particles. Recommended application temperature is 50°F to 120°F.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-019",
      type: "mcq",
      question: "A blister repair on a modified bitumen roof requires patching before 97 application. What repair sequence does Karnak specify?",
      options: [
        { id: "A", text: "Cut out blisters and apply 97 directly into the cavity" },
        { id: "B", text: "Apply 100 Non-Fibered Emulsion Primer only; mastic is not used for blister repair" },
        { id: "C", text: "Spread Karnak 19 Ultra Rubberized Flashing Cement over the damaged area, embed Karnak Asphalt Cotton, Fiberglass, Poly-Mat or Resat-Mat reinforcement, then apply another coat of 19 over the entire patch" },
        { id: "D", text: "Inject polyurethane foam into blisters and coat the same day" },
      ],
      answer: "C",
      explanation: "Repair cracks and blisters by spreading 19 Ultra Rubberized Flashing Cement, embedding reinforcement (Asphalt Cotton, Fiberglass, Poly-Mat or Resat-Mat), then applying another coat of 19 over the entire patch.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-020",
      type: "mcq",
      question: "Standing water remains on a low-slope roof 40 hours after rain stopped. The owner wants 97 Fibered Aluminum applied. What drainage requirement does Karnak cite?",
      options: [
        { id: "A", text: "Ponding is acceptable for solvent-based aluminum coatings" },
        { id: "B", text: "Positive drainage is required only for acrylic emulsion systems" },
        { id: "C", text: "Drainage requirements apply only when aluminum is applied over emulsion primer" },
        { id: "D", text: "Cold-process coatings should only be installed on decks with positive drainage; no standing water 48 hours after rain stops per NRCA criteria" },
      ],
      answer: "D",
      explanation: "Cold-process systems and coatings should only be installed on decks with positive drainage. NRCA criteria require no evidence of standing water 48 hours after rain stops.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-021",
      type: "mcq",
      question: "A specifier asks which ASTM standard applies to 97 Fibered Aluminum Roof Coating classification.",
      options: [
        { id: "A", text: "ASTM D2824 Type III" },
        { id: "B", text: "ASTM D6083 Type I" },
        { id: "C", text: "ASTM D 6694" },
        { id: "D", text: "ASTM D 2370 only" },
      ],
      answer: "A",
      explanation: "97 Fibered Aluminum Roof Coating is listed with ASTM D2824 Type III, along with TT-C-498C, ASTM D3805, and ASTM D962 Type II.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-022",
      type: "mcq",
      question: "A sales rep cites reflectivity for an energy audit. What initial solar reflectance does Karnak publish for 97 Fibered Aluminum?",
      options: [
        { id: "A", text: "0.87 initial matching high-solids silicone" },
        { id: "B", text: "0.63 initial solar reflectance with 0.55 after 3-year aging" },
        { id: "C", text: "0.86 initial matching white acrylic elastomerics" },
        { id: "D", text: "Reflectance is not published for aluminum coatings" },
      ],
      answer: "B",
      explanation: "Solar reflectance is 0.63 initial and 0.55 after 3-year aging, with initial thermal emittance of 0.46.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-023",
      type: "mcq",
      question: "A metal corrugated roof deck will receive maintenance coating. Is 97 Fibered Aluminum within Karnak's stated uses?",
      options: [
        { id: "A", text: "No; metal decks require silicone or acrylic only" },
        { id: "B", text: "Metal corrugated decks require 180 epoxy primer before aluminum" },
        { id: "C", text: "Yes; metal corrugated roof decks are listed ideal uses" },
        { id: "D", text: "Only steep asphalt roofs may receive fibered aluminum" },
      ],
      answer: "C",
      explanation: "97 Fibered Aluminum is ideal for modified bitumen membranes, metal corrugated roof decks, steep asphalt roofs aged 90 days, and Karnak emulsion coatings cured 3 to 5 days.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-024",
      type: "mcq",
      question: "A safety officer asks about fire and fume hazards during 97 Fibered Aluminum application near a rooftop kitchen exhaust. What cautions does Karnak list?",
      options: [
        { id: "A", text: "No fire hazard; water-based products only near exhausts" },
        { id: "B", text: "Open flame is permitted after the coating skins over" },
        { id: "C", text: "Solvent fumes are harmless; only interior use is prohibited" },
        { id: "D", text: "Do not use near open flame; avoid breathing solvent fumes and prolonged skin contact" },
      ],
      answer: "D",
      explanation: "Caution: Do not use near open flame. Avoid breathing solvent fumes and prolonged contact with skin. Exterior use only.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "K97-025",
      type: "mcq",
      question: "A rooftop air handler intake is 10 feet from the coating work area. What building protection does Karnak require during 97 application?",
      options: [
        { id: "A", text: "Cover air intakes during application and while drying" },
        { id: "B", text: "Air intakes require protection only during interior painting" },
        { id: "C", text: "Air intakes may remain open for solvent-based coatings if wind is calm" },
        { id: "D", text: "Intake protection is the mechanical contractor's responsibility" },
      ],
      answer: "A",
      explanation: "Cover air intakes during application and while drying. Store in a heated room and keep container covered when not in use.",
      cite: "97-fibered-aluminum-pds.pdf - Page 1",
      exhibitImage: "",
      imageRef: ""
    },
  ]
};

const KARNAK_97_FIBERED_ALUMINUM_QUESTION_BANK_2026 = {
  ...KARNAK_97_FIBERED_ALUMINUM_QUESTION_BANK_2026_RAW,
  questions: KARNAK_97_FIBERED_ALUMINUM_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = KARNAK_97_FIBERED_ALUMINUM_QUESTION_BANK_2026;
