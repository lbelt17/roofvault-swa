// Joe Sorrentino on Cost Effectiveness Coatings vs Single-Ply
// Field Wisdom Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source transcript:
//   sources/field-wisdom/transcripts/2026-03-cost-effectiveness-coatings-vs-single-ply.txt
// Per-question provenance lives in:
//   sources/field-wisdom/citations.json
//
// Question authoring target was 10 (the honest expert-level capacity of this
// transcript, which is the densest of the three Sorrentino episodes). Every
// question is scenario-based and grounded in an explicit Sorrentino claim.

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

const FIELD_WISDOM_COST_EFFECTIVENESS_COATINGS_VS_SINGLE_PLY_QUESTION_BANK_2026_RAW = {
  book: "Joe Sorrentino on Cost Effectiveness Coatings vs Single-Ply",
  questions: [
    {
      id: "FWMAR-001",
      type: "mcq",
      question: "An owner asks a contractor when a single-ply system is likely to be more cost-effective than a fluid-applied coating system. Using Joe Sorrentino's 'personality of the roof' framework, which roof profile most often favors single-ply on cost?",
      options: [
        { id: "A", text: "A small, heavily-penetrated roof with one existing roof in place that can be coated" },
        { id: "B", text: "A large, open, low-penetration roof where large sheets can be installed efficiently and an insulation upgrade is needed" },
        { id: "C", text: "A roof in a jurisdiction with strict wind/water insurance rules that exclude every single-ply product" },
        { id: "D", text: "A small roof where the owner is unwilling to discuss life-cycle cost" }
      ],
      answer: "B",
      explanation: "Joe Sorrentino frames roof-system selection through the 'personality of the roof'. Coatings tend to win on labor and crew size, but those advantages erode on a large open field where large single-ply sheets install quickly with fewer crew members. He also notes that single-ply usually carries an insulation system in the assembly while coatings typically do not - so when local energy code or owner needs require significant insulation, the all-in cost picture tilts toward single-ply. Penetrations, restrictive insurance jurisdictions, and owner reluctance to engage on life-cycle are real factors, but they argue against any system - they do not make single-ply the cost-effective answer.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (0:39-2:56)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWMAR-002",
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
      id: "FWMAR-003",
      type: "mcq",
      question: "A building owner has just received a brand-new single-ply roof and resists committing to a proactive preventive maintenance program because 'the roof is new and under warranty.' Based on Joe Sorrentino's life-cycle reasoning, what is the BEST recommendation to give the owner?",
      options: [
        { id: "A", text: "Skip maintenance during the warranty period and only inspect after warranty expiration" },
        { id: "B", text: "Replace the membrane every 10 years regardless of condition to stay ahead of failures" },
        { id: "C", text: "Adopt a proactive preventive maintenance program from day one - it materially extends useful service life and preserves the option to renew the assembly later with a fluid-applied recoat" },
        { id: "D", text: "Defer any maintenance spending until visible leaks appear inside the building" }
      ],
      answer: "C",
      explanation: "Joe Sorrentino: 'Taking care of your roof and more importantly, having a proactive look at life cycle costs will allow you to look at performances of 20 to 30 to 40 years... if you do everything right the first time and maintain it over 36 months, the good chance is you're going to get long service life.' A warranty is not maintenance; it is a contractual remedy for specific failures. Proactive PM lets the owner ride one membrane to the twilight of its service life and then renew with a fluid-applied recoat, stretching the asset to 50+ years and protecting any future renewable sustainable warranty. Skipping PM, waiting for leaks, or replacing on a fixed clock all destroy life-cycle value.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (5:55-6:36)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWMAR-004",
      type: "mcq",
      question: "A contractor is comparing all-in costs for two roof options on the same building: (1) a new single-ply assembly with insulation and (2) a fluid-applied coating system installed over the existing roof. From Joe Sorrentino's discussion of why cost comparisons can mislead owners, what is the structural difference the contractor MUST surface in the conversation?",
      options: [
        { id: "A", text: "Single-ply systems carry higher warranty deductibles than coatings" },
        { id: "B", text: "Single-ply assemblies typically INCLUDE an insulation system in the scope, whereas coatings typically do NOT - so the two line-item totals are not comparing equivalent scope" },
        { id: "C", text: "Coatings always include a vapor retarder layer that single-ply does not" },
        { id: "D", text: "Single-ply requires a primer that coatings do not" }
      ],
      answer: "B",
      explanation: "Joe's specific framing of cost comparisons: 'single ply assemblies, which typically will have some type of an insulation system included in it, whereas codings will not. The cost savings will definitely override all of the material costs.' If the contractor lets the owner compare the two prices without surfacing the insulation-scope difference, the owner is shown a misleading picture and may pick on a number that does not reflect equivalent scope. The right move is to make the apples-to-apples comparison explicit and let the owner see what each total actually buys.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (0:39-1:08)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWMAR-005",
      type: "mcq",
      question: "A jurisdiction has updated its energy code to require a substantially higher insulation R-value on all commercial roofs. A building owner had been leaning toward a fluid-applied coating system. Based on Joe Sorrentino's framework, how should the new code requirement change the contractor's recommendation?",
      options: [
        { id: "A", text: "Recommend the same coating system; energy code does not apply to maintenance coatings" },
        { id: "B", text: "Recommend single-ply with insulation; the code-driven insulation scope is something a coating-only approach typically does not deliver, and that requirement can shift the cost-effectiveness math toward single-ply" },
        { id: "C", text: "Recommend a hybrid in which the coating is sprayed at 5x manufacturer thickness to act as insulation" },
        { id: "D", text: "Recommend nothing; energy code is the owner's problem to navigate, not the contractor's" }
      ],
      answer: "B",
      explanation: "Joe specifically flags 'the regulations and the national energy code requirements that at times require a tremendous amount of insulation, which then change everything as far as the formula goes.' A coating typically does not deliver the same insulation scope as a single-ply assembly, so when code REQUIRES that insulation, the formula tilts. A contractor who ignores this exposes the owner to a code-failure or value-engineering surprise later. The expert move is to surface the math and let the code-driven scope drive the recommendation.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (1:31-2:00)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWMAR-006",
      type: "mcq",
      question: "An owner is excited about a roof option promising an R-30 insulation value. Their HVAC equipment is aging and is estimated to be running at about 40% of rated capacity. Following Joe Sorrentino's distinction between theoretical and practical R-value, what is the contractor's MOST useful framing for this owner?",
      options: [
        { id: "A", text: "R-30 is R-30; equipment condition is irrelevant to insulation performance" },
        { id: "B", text: "The R-30 figure is the theoretical performance; the practical thermal benefit is significantly compromised because HVAC equipment running at 40% capacity cannot fully translate that insulation gain into interior comfort or energy savings - the owner should weigh HVAC condition before paying a premium for a higher R-value" },
        { id: "C", text: "Recommend doubling the insulation thickness to R-60 to compensate for HVAC capacity loss" },
        { id: "D", text: "Recommend coating only; coatings do not depend on HVAC condition" }
      ],
      answer: "B",
      explanation: "Joe's framing: 'There's a practical and a theoretical. The theoretical is that you can take an insulation and a thermal value and you'll have a pretty good feel for what that's going to do for the environment inside the building. Asterisk, the efficiency of the heating, venting, air conditioning system. Because if it's running at 40% capacity, it doesn't matter how well your insulation values are. You're not getting full capacity out of your actual HVAC system.' The expert call is to tie the insulation investment to whether the equipment can actually use it. Owner conversations that skip this end up over-spending on insulation that the building cannot fully realize as energy savings.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (2:57-3:43)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWMAR-007",
      type: "mcq",
      question: "An owner with a tight production schedule has a roof in a region with frequent wind and intermittent rain during the only window when crews can safely be on the roof. The owner asks for a fluid-applied system. Per Joe Sorrentino's 'perfect storm' framing, what should the contractor evaluate FIRST?",
      options: [
        { id: "A", text: "The exact chemistry of the coating to be specified" },
        { id: "B", text: "Whether the combination of location, schedule, and prevailing weather conditions actually allows a fluid-applied assembly to be installed at all - some scenarios prohibit fluid-applied installation regardless of how good the chemistry is" },
        { id: "C", text: "The current cost per square foot of the coating" },
        { id: "D", text: "Whether the owner has a sustainability department" }
      ],
      answer: "B",
      explanation: "Joe describes the 'perfect storm' explicitly: 'You have an owner that has a specific location, they have a specific need and a specific production schedule for the roofing crew, which then means you're dealing with certain weather conditions that once again can prohibit some of the fluid applied assemblies to be installed.' Selecting the chemistry, the price, or assessing the owner's sophistication does not matter if the install conditions do not support the system. Feasibility comes first; everything else is downstream of that.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (3:20-4:06)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWMAR-008",
      type: "mcq",
      question: "A 90,000 sq ft commercial building already has two existing roofs in place and is due for a major roofing project. The contractor is debating fluid-applied vs new single-ply. Per Joe Sorrentino's observation about how the 'number of roofs in place' interacts with system selection, which factor most clearly tilts the decision toward single-ply?",
      options: [
        { id: "A", text: "The two existing roofs in place typically force a tear-off path, after which a single-ply assembly (with its insulation) installs efficiently on the clean deck - coatings have less of a play in that situation" },
        { id: "B", text: "The two existing roofs in place make a single-ply impossible to permit" },
        { id: "C", text: "The owner is required to coat both existing roofs before any tear-off can occur" },
        { id: "D", text: "Two roofs in place means the new system must be silicone-based" }
      ],
      answer: "A",
      explanation: "Joe ties single-ply's advantages directly to 'the number of roofs, like one roof in place versus two roofs in place, a single ply system can have its advantages.' In practice, two existing roofs typically force a tear-off (code generally limits the number of existing roof systems that can remain in place), and once the deck is clean a single-ply with insulation is the efficient installation. Coatings - which rely on the existing surface remaining in place - have less of a play in that scenario. The other options are not stated by Joe and are not how the industry handles this.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (2:25-2:56)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWMAR-009",
      type: "mcq",
      question: "A 22-year-old TPO roof is approaching the end of its useful service life. The owner asks the contractor for a long-term, life-cycle-favorable next move. Following Joe Sorrentino's observation about how single-ply systems behave at the end of their useful life, what is the BEST recommendation?",
      options: [
        { id: "A", text: "Tear off and install a new TPO immediately, regardless of remaining service life in the existing roof" },
        { id: "B", text: "Coat with a maintenance-grade product and revisit in two years" },
        { id: "C", text: "Evaluate the existing TPO for suitability as the substrate for a fluid-applied recoat - when the twilight of a single-ply system (KEE, PVC, TPO, EPDM) is approached on a well-maintained roof, a fluid-applied solution typically extends total service life and supports a renewable warranty path" },
        { id: "D", text: "Replace with built-up roofing for the long-term durability" }
      ],
      answer: "C",
      explanation: "Joe: 'when you look at single ply systems versus coating systems and look at long-term performance in single ply roofing systems, be it KEE, be it PVC, be it TPO, be it EPDM, my point is they all tend to then move towards a fluid applied solution as it gets to the twilight of that membrane being able to have a useful service life.' This is the life-cycle play: ride the single-ply to the end of its useful service, then transition to a fluid-applied recoat - that combination unlocks the long horizon Joe describes elsewhere (a single membrane life plus another 40-50 years of recoat-supported service). Premature tear-off wastes remaining life; a maintenance-grade coating does not move the needle; built-up roofing is a step backward for life-cycle.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (5:14-6:36)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWMAR-010",
      type: "mcq",
      question: "An owner is preparing to sell a 22-story commercial building. The contractor is in the middle of installing a fluid-applied roof system covered by a Renewable Sustainable Warranty. The owner asks how the warranty interacts with the building sale. Per Joe Sorrentino's personal experience with this exact situation, what is the BEST insight to give the seller?",
      options: [
        { id: "A", text: "The warranty automatically terminates upon transfer of title" },
        { id: "B", text: "The Renewable Sustainable Warranty can, when the right steps are followed, be transferred to the new owner - and has been used as significant negotiating leverage on building sales (in one case eliminating the buyer's demand for a new roof entirely)" },
        { id: "C", text: "The owner must purchase a separate transfer policy to maintain coverage" },
        { id: "D", text: "Renewable warranties only apply to single-ply, not to fluid-applied" }
      ],
      answer: "B",
      explanation: "Joe shares the direct experience: 'when you can look at someone negotiating on a 22-story building the price of a new roof and say, we don't need one because we're offering you a warranty in place that's sustainable, it's very valuable. It's very valuable.' He explicitly notes that 'there is the ability for a building owner to actually take that Renewable Sustainable Warranty and move it forward in the sale and transaction of a building.' Steps must be followed correctly, but the warranty is a real asset on the balance sheet at sale, not a forfeit.",
      cite: "Field Wisdom - Joe Sorrentino, March 2026 (6:38-8:33)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const FIELD_WISDOM_COST_EFFECTIVENESS_COATINGS_VS_SINGLE_PLY_QUESTION_BANK_2026 = {
  ...FIELD_WISDOM_COST_EFFECTIVENESS_COATINGS_VS_SINGLE_PLY_QUESTION_BANK_2026_RAW,
  questions: FIELD_WISDOM_COST_EFFECTIVENESS_COATINGS_VS_SINGLE_PLY_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FIELD_WISDOM_COST_EFFECTIVENESS_COATINGS_VS_SINGLE_PLY_QUESTION_BANK_2026;
