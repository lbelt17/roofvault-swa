// RoofVault Field Wisdom (2026) - Pilot Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source: distilled scenario-based judgment questions derived from Joe
// Sorrentino podcast transcripts (Coatings Coffee Shop Influencer Response,
// Feb/March/April 2026). Raw transcripts live in:
//   sources/field-wisdom/transcripts/
// Per-question provenance (source file, timestamp, optional short quote,
// tags) lives in:
//   sources/field-wisdom/citations.json
//
// STATUS: PILOT SCAFFOLD. Five (5) starter questions only. Not yet wired
// into /api/exam/index.js, books.js, or gen-exam.js. Do not expose to users
// until the routing and dropdown steps land.

// Sanitize affects only human-readable text display fields.
// IDs, paths (exhibitImage, imageRef), answer logic are never touched.
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

const FIELD_WISDOM_QUESTION_BANK_2026_RAW = {
  book: "RoofVault Field Wisdom - Joe Sorrentino (2026)",
  questions: [
  {
    id: "FW-001",
    type: "mcq",
    question: "A contractor is presenting two roof options to a building owner. One product is positioned as a 'maintenance coating' and the other as a 'fluid-applied roof system'. Following Joe Sorrentino's reasoning on the maintenance-coating-vs-fluid-applied-system debate, what most clearly elevates a liquid coating into the 'fluid-applied roof system' category?",
    options: [
      { id: "A", text: "Specifying a thicker single topcoat than the manufacturer's data sheet calls for" },
      { id: "B", text: "Incorporating a reinforcement (for example a polyester fabric) within the liquid material so the assembly performs as a membrane" },
      { id: "C", text: "Switching the chemistry from acrylic to silicone" },
      { id: "D", text: "Using the same coating on the field of the roof and on the parapets" }
    ],
    answer: "B",
    explanation: "Per Joe Sorrentino: 'Adding reinforcements to liquid materials puts it in that category of a roofing membrane.' The debate between a maintenance coating and a fluid-applied system is settled by what the assembly is engineered to do. Without reinforcement, a coating is treated as a maintenance product subject to a maintenance-side standard. With reinforcement embedded in the liquid material, the assembly meets membrane-grade performance and is evaluated like other roofing membranes - including under insurance requirements and impact/tensile/elongation testing. Film thickness, chemistry choice (acrylic, silicone, urethane), and coverage areas matter to performance, but none of them by itself converts a coating into a fluid-applied roof system.",
    cite: "Field Wisdom - Joe Sorrentino, Feb 2026 (4:19-5:31)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FW-002",
    type: "mcq",
    question: "An owner asks a contractor when a single-ply system is likely to be more cost-effective than a fluid-applied coating system. Using Joe Sorrentino's 'personality of the roof' framework, which roof profile most often favors single-ply on cost?",
    options: [
      { id: "A", text: "A small, heavily-penetrated roof with one existing roof in place that can be coated" },
      { id: "B", text: "A large, open, low-penetration roof where large sheets can be installed efficiently and an insulation upgrade is needed" },
      { id: "C", text: "A roof in a jurisdiction with strict wind/water insurance rules that exclude every single-ply product" },
      { id: "D", text: "A small roof where the owner is unwilling to discuss life-cycle cost" }
    ],
    answer: "B",
    explanation: "Joe Sorrentino frames roof-system selection through the 'personality of the roof'. Coatings tend to win on labor and crew size, but those advantages erode on a large open field where large single-ply sheets install quickly with fewer crew members. He also notes that single-ply usually carries an insulation system in the assembly while coatings typically do not - so when local energy code or owner needs require significant insulation, the all-in cost picture tilts toward single-ply. Penetrations, restrictive insurance jurisdictions, and owner reluctance to engage on life-cycle are real factors, but they argue against any system - they don't make single-ply the cost-effective answer.",
    cite: "Field Wisdom - Joe Sorrentino, March 2026 (0:39-2:56)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FW-003",
    type: "mcq",
    question: "A contractor has just finished what feels like a thorough technical scoping conversation with a commercial owner who manages a portfolio of properties. Following Joe Sorrentino's guidance, what is the most appropriate next step BEFORE submitting a proposal?",
    options: [
      { id: "A", text: "Lock the pricing and submit the proposal the same day to beat competitors to the inbox" },
      { id: "B", text: "Ask the owner more questions - specifically about their goals, sustainability program, and any existing roof asset management plan" },
      { id: "C", text: "Specify the highest-performance system on the market regardless of budget, because life-cycle savings will dominate" },
      { id: "D", text: "Hand off the conversation to the manufacturer's representative so the contractor stays out of business strategy" }
    ],
    answer: "B",
    explanation: "Joe Sorrentino's rule: 'When you think you've asked enough questions, what should be the next thing that you do? Ask some more questions.' Roof systems are not commodities - the right answer depends on whether the owner has a dedicated sustainability lead, an existing roof asset management program, life-cycle expectations, plans to sell the building, and so on. The contractor who proposes before understanding the owner's goals tends to either mis-spec the system or lose to a competitor who built that relationship. Speed and product worship are not substitutes for asking the next question.",
    cite: "Field Wisdom - Joe Sorrentino, March 2026 (4:38-5:14)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FW-004",
    type: "mcq",
    question: "A building owner has just received a brand-new single-ply roof and resists committing to a proactive preventive maintenance program because 'the roof is new and under warranty.' Based on Joe Sorrentino's life-cycle reasoning, what is the BEST recommendation to give the owner?",
    options: [
      { id: "A", text: "Skip maintenance during the warranty period and only inspect after warranty expiration" },
      { id: "B", text: "Replace the membrane every 10 years regardless of condition to stay ahead of failures" },
      { id: "C", text: "Adopt a proactive preventive maintenance program from day one - it materially extends useful service life and preserves the option to renew the assembly later with a fluid-applied recoat" },
      { id: "D", text: "Defer any maintenance spending until visible leaks appear inside the building" }
    ],
    answer: "C",
    explanation: "Joe Sorrentino: 'Taking care of your roof and more importantly, having a proactive look at life cycle costs will allow you to look at performances of 20 to 30 to 40 years... if you do everything right the first time and maintain it over 36 months, the good chance is you're going to get long service life.' A warranty is not maintenance; it's a contractual remedy for specific failures. Proactive PM lets the owner ride one membrane to the twilight of its service life and then renew with a fluid-applied recoat, stretching the asset to 50+ years and protecting any future renewable sustainable warranty. Skipping PM, waiting for leaks, or replacing on a fixed clock all destroy life-cycle value.",
    cite: "Field Wisdom - Joe Sorrentino, March 2026 (5:55-6:36)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "FW-005",
    type: "mcq",
    question: "A consultant rejects a fluid-applied recommendation on a hospital reroof, citing the 'horror stories' he has heard about coatings. Per Joe Sorrentino's strategy for turning non-believers into clients, what is the contractor's MOST effective response?",
    options: [
      { id: "A", text: "Discount the bid to undercut competing single-ply pricing" },
      { id: "B", text: "Send the consultant a glossy brochure listing the manufacturer's entire product line" },
      { id: "C", text: "Identify the specific conditions on this exact building, explain the corrective action and the finished result, give the price, AND provide references on projects with the same conditions that are still performing or have already been renewed" },
      { id: "D", text: "Insist that the horror stories are no longer relevant because materials have improved across the industry" }
    ],
    answer: "C",
    explanation: "Joe Sorrentino's prescription for converting skeptics is to make the conversation about THIS building, not about coatings in general: identify the specific conditions on the facility, describe the corrective action and the finished project, state the cost, and - most importantly - present references on projects that had the same conditions and are still performing or have been successfully renewed. Most 'horror stories' trace back to improper design, poor system selection, unqualified installers, or missing preventive maintenance - so price cuts and generic marketing don't address the consultant's real concern. Dismissing the objection without evidence reinforces it. Concrete, condition-matched references are how non-believers become long-term clients.",
    cite: "Field Wisdom - Joe Sorrentino, April 2026 (5:35-8:07)",
    exhibitImage: "",
    imageRef: ""
  }
]};

const FIELD_WISDOM_QUESTION_BANK_2026 = {
  ...FIELD_WISDOM_QUESTION_BANK_2026_RAW,
  questions: FIELD_WISDOM_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FIELD_WISDOM_QUESTION_BANK_2026;
