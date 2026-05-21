// CCS Influencer Joe Sorrentino - April 2026 - Field Wisdom Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source transcript:
//   sources/field-wisdom/transcripts/2026-04-ccs-influencer-joe-sorrentino.txt
// Per-question provenance lives in:
//   sources/field-wisdom/citations.json
//
// Question authoring target was 8 (the honest expert-level capacity of this
// transcript). Every question is scenario-based and grounded in an explicit
// Sorrentino claim. The episode centers on selling fluid-applied to skeptics.

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

const FIELD_WISDOM_JOE_APRIL_2026_QUESTION_BANK_2026_RAW = {
  book: "CCS Influencer Joe Sorrentino - April 2026",
  questions: [
    {
      id: "FWAPR-001",
      type: "mcq",
      question: "A consultant rejects a fluid-applied recommendation on a hospital reroof, citing the 'horror stories' he has heard about coatings. Per Joe Sorrentino's strategy for turning non-believers into clients, what is the contractor's MOST effective response?",
      options: [
        { id: "A", text: "Discount the bid to undercut competing single-ply pricing" },
        { id: "B", text: "Send the consultant a glossy brochure listing the manufacturer's entire product line" },
        { id: "C", text: "Identify the specific conditions on this exact building, explain the corrective action and the finished result, give the price, AND provide references on projects with the same conditions that are still performing or have already been renewed" },
        { id: "D", text: "Insist that the horror stories are no longer relevant because materials have improved across the industry" }
      ],
      answer: "C",
      explanation: "Joe Sorrentino's prescription for converting skeptics is to make the conversation about THIS building, not about coatings in general: identify the specific conditions on the facility, describe the corrective action and the finished project, state the cost, and - most importantly - present references on projects that had the same conditions and are still performing or have been successfully renewed. Most 'horror stories' trace back to improper design, poor system selection, unqualified installers, or missing preventive maintenance - so price cuts and generic marketing do not address the consultant's real concern. Dismissing the objection without evidence reinforces it. Concrete, condition-matched references are how non-believers become long-term clients.",
      cite: "Field Wisdom - Joe Sorrentino, April 2026 (5:35-8:07)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWAPR-002",
      type: "mcq",
      question: "A 6-year-old fluid-applied roof on a logistics warehouse is leaking at multiple field locations and at a perimeter detail. Per Joe Sorrentino's framework on premature roof failure, which underlying cause pattern is MOST consistent with what the industry typically sees?",
      options: [
        { id: "A", text: "A defect in the chemistry of the coating product itself" },
        { id: "B", text: "A single failure point in which the manufacturer alone is at fault" },
        { id: "C", text: "A convergence of multiple factors - typically some combination of improper design, poor system selection for the actual conditions, lack of installer knowledge, and inadequate proactive preventive maintenance by the building owner" },
        { id: "D", text: "Failure to register the warranty within 90 days, which voided coverage" }
      ],
      answer: "C",
      explanation: "Joe lists the four predictable contributors to premature failure together: 'improper design, poor selection of system, poor time of installer, lack of understanding by the installer, improper maintenance program. They all tend to kind of get hidden into, wow, I've heard the horror stories.' He stresses that 'any and all generic roof systems will prematurely fail and have a non-productive useful service life due to improper design, due to lack of knowledgeable installers, and then also, most importantly, due to a proactive preventive maintenance plan by building owners.' Single-cause attribution (chemistry, manufacturer, paperwork) is the trap; a forensic look almost always finds a stack of these contributors.",
      cite: "Field Wisdom - Joe Sorrentino, April 2026 (2:09-5:35)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWAPR-003",
      type: "mcq",
      question: "A contractor is evaluating a request to install a fluid-applied system on a building where the existing roof condition, deck moisture conditions, and owner maintenance habits all raise red flags. Per Joe Sorrentino's 'power of no' principle, what is the contractor's MOST appropriate move?",
      options: [
        { id: "A", text: "Take the project anyway; the warranty will protect everyone if something goes wrong" },
        { id: "B", text: "Take the project but specify a higher-margin chemistry to cover the elevated risk" },
        { id: "C", text: "Exercise the power of no - decline the fluid-applied recommendation for this building until the conditions can be made to support it; protect the system's reputation by being mindful of the initial footprint" },
        { id: "D", text: "Take the project and offload accountability to the manufacturer's representative" }
      ],
      answer: "C",
      explanation: "Joe is explicit: 'they really have to take on the power of no. You have to do the right selection and make sure that before you make that footprint of a liquid applied system because of the end result of sustainable solutions for a building owner due to its flexibility and lightweight system approach, you have to be very mindful of that initial approach, which is why I go back to I've heard of all the horror stories.' Each ill-advised installation feeds the next 'horror story' that the next skeptical owner cites. Declining the wrong project is part of how the system's reputation - and the contractor's - is preserved.",
      cite: "Field Wisdom - Joe Sorrentino, April 2026 (2:22-5:35)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWAPR-004",
      type: "mcq",
      question: "A consultant pushes back on a fluid-applied recommendation by arguing that the price 'sounds too good to be true' compared to a single-ply tear-off-and-replace. Per Joe Sorrentino's discussion of how to handle this exact objection, what is the contractor's BEST framing for the owner?",
      options: [
        { id: "A", text: "Lower the bid by 10% to remove the suspicion about price" },
        { id: "B", text: "Show that, when the right evaluation has been done and the system is a yes, the savings are real on the front end AND through the long term - Joe's framing is 'minimize your roofing budget and maximize your roofing cost' - and the owner often only fully appreciates this after they experience the assembly performing" },
        { id: "C", text: "Concede that fluid-applied prices are unsustainably low and recommend single-ply instead" },
        { id: "D", text: "Quote the manufacturer's MSRP regardless of the project's actual conditions" }
      ],
      answer: "B",
      explanation: "Joe's response to the 'too good to be true' objection: 'when you do the right evaluation and you make sure it's a yes, some of the savings to the owner on the front end and then on the long term are just at times too good to be true until they experience it.' The contractor's job is to be confident in the evaluation, frame the conversation as budget-vs-cost (not price-vs-price), and accept that owner buy-in often consolidates only after they have seen the system perform. Cutting price makes the suspicion worse. Conceding abandons the recommendation. Quoting MSRP without project context defeats the value engineering of the fluid-applied approach.",
      cite: "Field Wisdom - Joe Sorrentino, April 2026 (2:22-5:35)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWAPR-005",
      type: "mcq",
      question: "A consultant asks an experienced fluid-applied contractor what TYPE of coating chemistry should be specified for an upcoming hospital reroof. Per Joe Sorrentino's '90 slides, 3 on technology' framing, what should the contractor address BEFORE answering the chemistry question?",
      options: [
        { id: "A", text: "The manufacturer's most current product brochure" },
        { id: "B", text: "The facility's location, the timing of installation, and the service requirements of the roof - these factors should dictate the technology selection; only after they are nailed down does it make sense to choose among acrylic, silicone, or urethane" },
        { id: "C", text: "The current commodity price of polyester reinforcement" },
        { id: "D", text: "The consultant's preferred warranty length" }
      ],
      answer: "B",
      explanation: "Joe's framing: 'In a 90 slide presentation, I would have three slides on actually the technology of the coating systems because those are an important category to pick but there's so many other things that are important prior to that selection. And really the location and the timing of the facility and the service of that facility's roof should dictate the type of technology for the coating.' Most contractors lead with chemistry - Joe is explicit that this is backwards. Get the situation right; the chemistry choice falls out of it.",
      cite: "Field Wisdom - Joe Sorrentino, April 2026 (5:35-8:07)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWAPR-006",
      type: "mcq",
      question: "A building owner is evaluating fluid-applied vs single-ply for a portfolio of warehouses, with an explicit goal of being able to demonstrate roof performance to future buyers. Per Joe Sorrentino's observation about how fluid-applied systems with renewable recoats create their own evidence base, what is the key OWNER-facing advantage?",
      options: [
        { id: "A", text: "Each recoat resets the warranty clock, erasing the prior performance history of the assembly" },
        { id: "B", text: "Fluid-applied assemblies with proactive maintenance, scheduled inspections, and predictable recoats produce a LIVING DOCUMENT of the roof's service over the facility's life - a record that can be presented to a future buyer along with the (transferable) warranty" },
        { id: "C", text: "Renewable recoats are not eligible for any insurance discount and therefore create no extra value" },
        { id: "D", text: "Fluid-applied systems must be replaced wholesale every 10 years and therefore cannot establish a long-term record" }
      ],
      answer: "B",
      explanation: "Joe: 'If you think about the fluid applied assemblies with long-term sustainable performance and renewable capabilities by recoding, you actually have a living document that serves the service life for that facility within a sustainable renewable warranty program.' This is a distinct point from the warranty-transferability question: the living document is the EVIDENCE BASE - the inspection records, the recoat history - that lets the next owner see proof of how the roof has been managed. Combined with the transferable warranty, it materially supports asset valuation.",
      cite: "Field Wisdom - Joe Sorrentino, April 2026 (5:35-8:07)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWAPR-007",
      type: "mcq",
      question: "A new contractor is preparing a roof presentation for a hospital owner. Their draft opens with 15 minutes detailing performance comparisons among acrylic, silicone, and urethane coatings. Per Joe Sorrentino's framing of how the contractor-owner conversation should actually start, what is the primary issue with this approach?",
      options: [
        { id: "A", text: "The contractor should have included pricing in the opening slides" },
        { id: "B", text: "The contractor is leading with PRODUCTS instead of SOLUTIONS - Joe's framing is 'we're not really selling with any roofing systems, we're really creating solutions, a watertight system for a building owner through design'. The conversation should open with the building's needs and the watertight outcome the owner is buying" },
        { id: "C", text: "Acrylic should not have been included in the comparison at all" },
        { id: "D", text: "The presentation should have started with the manufacturer's representative speaking" }
      ],
      answer: "B",
      explanation: "Joe consistently frames the roofing conversation as solution-creation, not product-selling: 'we're not really selling with any roofing systems. We're really creating solutions, right? You know, that's the intent, to build a watertight system for a building owner through design.' Leading with product comparisons cedes the conversation to chemistry trivia and lets a skeptical owner anchor on the wrong axis. Leading with the watertight outcome anchors the discussion in what the owner is actually buying. The chemistry comparison can come later, in service of the chosen solution.",
      cite: "Field Wisdom - Joe Sorrentino, April 2026 (0:02-2:09)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWAPR-008",
      type: "mcq",
      question: "A skeptical owner has just told a contractor that he 'has heard all the horror stories about coatings.' Per Joe Sorrentino's diagnostic reframing of this exact objection, what is the SHARPEST way to redirect the conversation?",
      options: [
        { id: "A", text: "Tell the owner the horror stories are exaggerated and move on" },
        { id: "B", text: "Tell the owner industry materials have improved so much that the old stories no longer apply" },
        { id: "C", text: "Reframe the conversation: those 'horror stories' almost always trace to one or more of four root causes - improper design, poor system selection, lack of installer knowledge, or missing proactive preventive maintenance by the owner - and the right project plan addresses each of those causes directly on this specific building" },
        { id: "D", text: "Drop the fluid-applied recommendation entirely and propose single-ply" }
      ],
      answer: "C",
      explanation: "Joe's diagnostic move on 'horror stories' is to surface their root causes: 'improper design, poor selection of system, poor time of installer, lack of understanding by the installer, improper maintenance program. They all tend to kind of get hidden into, wow, I've heard the horror stories.' Dismissing the concern loses the conversation; asserting that materials have improved sounds like a sales platitude; abandoning the recommendation is exactly the failure mode the industry has cycled through for decades. The expert move is to name the four root causes and show the owner how this project plan addresses each on THIS building.",
      cite: "Field Wisdom - Joe Sorrentino, April 2026 (2:09-5:35)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const FIELD_WISDOM_JOE_APRIL_2026_QUESTION_BANK_2026 = {
  ...FIELD_WISDOM_JOE_APRIL_2026_QUESTION_BANK_2026_RAW,
  questions: FIELD_WISDOM_JOE_APRIL_2026_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FIELD_WISDOM_JOE_APRIL_2026_QUESTION_BANK_2026;
