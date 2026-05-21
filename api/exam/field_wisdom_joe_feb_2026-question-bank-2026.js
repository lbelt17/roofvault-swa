// CCS Influencer Joe Sorrentino - February 2026 - Field Wisdom Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source transcript:
//   sources/field-wisdom/transcripts/2026-02-ccs-influencer-joe-sorrentino.txt
// Per-question provenance lives in:
//   sources/field-wisdom/citations.json
//
// Question authoring target was 6 (the honest expert-level capacity of this
// transcript). Every question is scenario-based and grounded in an explicit
// Sorrentino claim at the cited timestamp. No filler.

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

const FIELD_WISDOM_JOE_FEB_2026_QUESTION_BANK_2026_RAW = {
  book: "CCS Influencer Joe Sorrentino - February 2026",
  questions: [
    {
      id: "FWFEB-001",
      type: "mcq",
      question: "A contractor is presenting two roof options to a building owner. One product is positioned as a 'maintenance coating' and the other as a 'fluid-applied roof system'. Following Joe Sorrentino's reasoning on the maintenance-coating-vs-fluid-applied-system debate, what most clearly elevates a liquid coating into the 'fluid-applied roof system' category?",
      options: [
        { id: "A", text: "Specifying a thicker single topcoat than the manufacturer's data sheet calls for" },
        { id: "B", text: "Incorporating a reinforcement (for example a polyester fabric) within the liquid material so the assembly performs as a membrane" },
        { id: "C", text: "Switching the chemistry from acrylic to silicone" },
        { id: "D", text: "Using the same coating on the field of the roof and on the parapets" }
      ],
      answer: "B",
      explanation: "Per Joe Sorrentino: 'Adding reinforcements to liquid materials puts it in that category of a roofing membrane.' The debate between a maintenance coating and a fluid-applied system is settled by what the assembly is engineered to do. Without reinforcement, a coating is treated as a maintenance product subject to a maintenance-side standard. With reinforcement embedded in the liquid material, the assembly meets membrane-grade performance and is evaluated like other roofing membranes - including under insurance requirements and impact/tensile/elongation testing. Film thickness, chemistry choice, and coverage areas matter to performance, but none of them by itself converts a coating into a fluid-applied roof system.",
      cite: "Field Wisdom - Joe Sorrentino, Feb 2026 (4:19-5:31)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWFEB-002",
      type: "mcq",
      question: "A roof coating product is reinforced with a polyester fabric and proposed as a fluid-applied roof SYSTEM (not as a maintenance coating). Based on Joe Sorrentino's discussion of how that classification triggers additional requirements, which performance tests should the contractor expect the system to be evaluated against?",
      options: [
        { id: "A", text: "Only initial pull-off adhesion and dry film thickness" },
        { id: "B", text: "VOC emissions and color fade only" },
        { id: "C", text: "Hail impact, tensile strength, and elongation - the same membrane-grade tests applied to single-ply and modified-bitumen systems" },
        { id: "D", text: "Only the manufacturer's accelerated weathering data for the topcoat" }
      ],
      answer: "C",
      explanation: "Once a reinforced liquid material is positioned as a membrane (not a maintenance coating), Joe says it must be evaluated like any other roofing membrane. The explicit test categories he calls out are hail impact, tensile strength, and elongation. This is why he stresses that 'most single-ply and modified bitumen systems that have endured hail impact have worked with the same materials that liquid-applied systems utilize, which is a polyester membrane or reinforcement.' Choosing a fluid-applied SYSTEM means accepting membrane-grade testing; pull-off adhesion, VOC, color fade, and weathering data alone are insufficient to qualify the assembly at that level.",
      cite: "Field Wisdom - Joe Sorrentino, Feb 2026 (4:19-5:31)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWFEB-003",
      type: "mcq",
      question: "A building owner asks for a fluid-applied roof system to be installed directly over an existing concrete plaza deck. From Joe Sorrentino's perspective on liquid-applied installation over moisture-latent substrates, what is the contractor's BEST course of action?",
      options: [
        { id: "A", text: "Decline the project and recommend single-ply only" },
        { id: "B", text: "Proceed immediately because liquid-applied systems are inherently more breathable than membranes" },
        { id: "C", text: "Treat the concrete as a moisture-latent substrate that requires careful preparation, patience, and contractor understanding before any liquid is applied; only proceed once the substrate condition supports it" },
        { id: "D", text: "Apply twice the manufacturer's recommended mil thickness to compensate for the substrate" }
      ],
      answer: "C",
      explanation: "Joe explicitly identifies concrete as 'a moisture-latent system' and warns that 'every real coin has two sides... there are disadvantages in going over a moisture-latent system, which concrete is, with liquid-applied materials. So it gets back to preparation, patience, and the understanding from the contractor base.' Refusing the project outright is unnecessary; rushing in ignores the risk; over-applying material does not fix moisture migrating up from below. The expert call is rigorous substrate evaluation and preparation first, and proceeding only when the substrate's condition supports the fluid-applied system.",
      cite: "Field Wisdom - Joe Sorrentino, Feb 2026 (2:25-4:19)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWFEB-004",
      type: "mcq",
      question: "A property owner in Florida wants to switch from frequent tear-off-and-replace cycles to a sustainability-oriented fluid-applied roof program across their portfolio. Per Joe Sorrentino, what is a key REGULATORY constraint the contractor must build into the project plan?",
      options: [
        { id: "A", text: "Florida prohibits all reinforced fluid-applied systems on commercial buildings" },
        { id: "B", text: "Florida is very stringent on the amount of TIME a material can be left exposed, which complicates owners trying to embrace longer-life sustainable approaches" },
        { id: "C", text: "Florida requires the use of only silicone chemistries on roofs above 10,000 sq ft" },
        { id: "D", text: "Florida disallows polyester reinforcement on coastal properties" }
      ],
      answer: "B",
      explanation: "Joe says directly: 'The state of Florida is very stringent on the term that you can have material down. It makes it a challenge for owners who embrace sustainability.' The practical impact is that contractors must plan installation phasing and exposure windows tightly - which affects crew sizing, weather scheduling, and even whether the sustainability program is feasible in that jurisdiction. The other options sound plausible but are not what Joe states and are not the actual Florida constraint that drives this conversation.",
      cite: "Field Wisdom - Joe Sorrentino, Feb 2026 (2:25-4:19)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWFEB-005",
      type: "mcq",
      question: "A facility's existing low-slope roof has chronic ponding water in three localized areas after every storm. The owner wants a fluid-applied solution rather than tear-off. Per Joe Sorrentino's discussion of how chemistry families are sometimes combined in real installations, which hybrid approach is consistent with how the industry actually solves this water-exposure problem?",
      options: [
        { id: "A", text: "Two coats of water-based acrylic only, applied at recommended thickness" },
        { id: "B", text: "A reinforced water-based acrylic system with a liquid-applied silicone topcoat installed over it to specifically handle water-related issues" },
        { id: "C", text: "Urethane primer followed by acrylic topcoat in all areas including the ponded zones" },
        { id: "D", text: "Single application of acrylic at 1.5x the manufacturer-specified mil thickness" }
      ],
      answer: "B",
      explanation: "Joe identifies three chemistry families - water-based acrylics, silicones, and urethanes - and notes that real installations often hybridize: 'water-based acrylic reinforced systems being installed, and then a liquid-applied silicone over the top to deal with any issues as it relates to water.' Silicone's water resistance complements an acrylic-reinforced base, which is why this exact stack shows up in practice for ponding-water scenarios. A pure-acrylic stack, a thicker-acrylic single application, or a urethane-then-acrylic order do not address ponding water the same way.",
      cite: "Field Wisdom - Joe Sorrentino, Feb 2026 (5:31-7:08)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "FWFEB-006",
      type: "mcq",
      question: "A specifier is comparing three otherwise dissimilar roofing systems - modified-bitumen, single-ply, and fluid-applied - and asks why all three can be specified to perform under hail impact. Per Joe Sorrentino's observation about what these systems actually have in common, what is the answer?",
      options: [
        { id: "A", text: "Each system uses an identical bituminous core material" },
        { id: "B", text: "Each system is mechanically attached to the deck the same way" },
        { id: "C", text: "When designed to endure hail impact, each system typically relies on the SAME underlying reinforcement material - a polyester membrane or reinforcement" },
        { id: "D", text: "Each system uses a thermosetting topcoat" }
      ],
      answer: "C",
      explanation: "Joe explicitly notes: 'most single-ply and modified bitumen systems that have endured hail impact have worked with the same materials that liquid-applied systems utilize, which is a polyester membrane or reinforcement.' The shared element is not the bituminous chemistry, not the attachment method, and not the topcoat. It is the polyester reinforcement carrying the impact-resistance load. This is also why reinforcement is what elevates a coating into membrane-grade in the first place - the same fabric is the structural backbone of impact performance across otherwise different system families.",
      cite: "Field Wisdom - Joe Sorrentino, Feb 2026 (4:19-5:31)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const FIELD_WISDOM_JOE_FEB_2026_QUESTION_BANK_2026 = {
  ...FIELD_WISDOM_JOE_FEB_2026_QUESTION_BANK_2026_RAW,
  questions: FIELD_WISDOM_JOE_FEB_2026_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = FIELD_WISDOM_JOE_FEB_2026_QUESTION_BANK_2026;
