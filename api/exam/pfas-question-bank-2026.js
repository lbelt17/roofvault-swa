// Personal Fall Arrest Systems (PFAS) - OSHA 29 CFR 1926 Subpart M (2026) - Deterministic Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)

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

const PFAS_QUESTION_BANK_2026_RAW = {
  book: "Personal Fall Arrest Systems (PFAS) \u2013 OSHA 29 CFR 1926 Subpart M (2026)",
  questions: [
  {
    id: "PFAS-001",
    type: "mcq",
    question: "In construction, at what height above a lower level does OSHA generally require fall protection for employees working on a walking/working surface with an unprotected edge?",
    options: [
      { id: "A", text: "4 feet" },
      { id: "B", text: "6 feet" },
      { id: "C", text: "10 feet" },
      { id: "D", text: "15 feet" }
    ],
    answer: "B",
    explanation: "Subpart M sets the general construction trigger height at 6 feet. Above this height an employer must protect workers by guardrails, safety nets, or a personal fall arrest system.",
    cite: "OSHA 29 CFR 1926.501(b)(1)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-002",
    type: "mcq",
    question: "Which three primary components make up a compliant personal fall arrest system?",
    options: [
      { id: "A", text: "Guardrail, toeboard, and warning line" },
      { id: "B", text: "Anchorage, body support (full body harness), and connectors" },
      { id: "C", text: "Hard hat, safety glasses, and gloves" },
      { id: "D", text: "Ladder, scaffold, and hoist" }
    ],
    answer: "B",
    explanation: "A PFAS arrests a fall using an anchorage, a full body harness that distributes forces, and connectors such as a lanyard or self-retracting lifeline that link the two.",
    cite: "OSHA 29 CFR 1926.500(b) definitions; 1926.502(d)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-003",
    type: "mcq",
    question: "The commonly taught fall protection 'ABCs' stand for which of the following?",
    options: [
      { id: "A", text: "Access, Barrier, Cover" },
      { id: "B", text: "Anchorage, Body support, Connecting device" },
      { id: "C", text: "Alarm, Boots, Cable" },
      { id: "D", text: "Awareness, Balance, Caution" }
    ],
    answer: "B",
    explanation: "The ABC memory aid identifies the core PFAS elements: the Anchorage point, the Body support harness worn by the worker, and the Connecting device that ties them together.",
    cite: "3M Protecta Full Line Catalog, p.4, The ABC\u2019s of fall protection",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-004",
    type: "mcq",
    question: "As of January 1, 1998, which body support device is NO longer acceptable as part of a personal fall arrest system?",
    options: [
      { id: "A", text: "Full body harness" },
      { id: "B", text: "Body belt" },
      { id: "C", text: "Chest D-ring" },
      { id: "D", text: "Suspension trauma strap" }
    ],
    answer: "B",
    explanation: "Body belts were prohibited for fall arrest because they concentrate arresting forces on the abdomen. A full body harness spreads the load across the thighs, pelvis, chest, and shoulders.",
    cite: "OSHA 29 CFR 1926.500(b), Personal fall arrest system; 1926.502(d) introductory note",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-005",
    type: "mcq",
    question: "When an anchorage is used for a single employee's personal fall arrest system and is NOT engineered by a qualified person, what minimum load must it be capable of supporting?",
    options: [
      { id: "A", text: "1,800 pounds" },
      { id: "B", text: "3,600 pounds" },
      { id: "C", text: "5,000 pounds" },
      { id: "D", text: "10,000 pounds" }
    ],
    answer: "C",
    explanation: "The default rule requires anchorages to support at least 5,000 pounds per attached worker. The alternative is a system designed and used under a qualified person with a safety factor of at least two.",
    cite: "OSHA 29 CFR 1926.502(d)(15)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-006",
    type: "mcq",
    question: "What is the maximum arresting force a personal fall arrest system may impose on a worker who is wearing a full body harness?",
    options: [
      { id: "A", text: "900 pounds" },
      { id: "B", text: "1,800 pounds" },
      { id: "C", text: "3,600 pounds" },
      { id: "D", text: "5,000 pounds" }
    ],
    answer: "B",
    explanation: "The system must limit maximum arresting force on the body to 1,800 pounds when a full body harness is used, which is why energy absorbers are required with most lanyards.",
    cite: "OSHA 29 CFR 1926.502(d)(16)(ii)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-007",
    type: "mcq",
    question: "Under Subpart M, a personal fall arrest system must be rigged so that an employee can free fall no more than which distance?",
    options: [
      { id: "A", text: "2 feet" },
      { id: "B", text: "4 feet" },
      { id: "C", text: "6 feet" },
      { id: "D", text: "8 feet" }
    ],
    answer: "C",
    explanation: "The system must limit free fall to 6 feet and must not allow contact with any lower level. Shorter free fall reduces the energy the system and body must absorb.",
    cite: "OSHA 29 CFR 1926.502(d)(16)(iii)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-008",
    type: "mcq",
    question: "What is the maximum deceleration distance a personal fall arrest system is permitted to allow during arrest?",
    options: [
      { id: "A", text: "1.5 feet" },
      { id: "B", text: "3.5 feet" },
      { id: "C", text: "6 feet" },
      { id: "D", text: "8 feet" }
    ],
    answer: "B",
    explanation: "The system must bring the worker to a complete stop within 3.5 feet of deceleration distance. This value is used with free fall and other clearances when calculating required fall clearance.",
    cite: "OSHA 29 CFR 1926.502(d)(16)(iii)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-009",
    type: "mcq",
    question: "On a low-slope roof, a walking/working surface is defined by OSHA as having a slope of what value or less?",
    options: [
      { id: "A", text: "2 in 12" },
      { id: "B", text: "3 in 12" },
      { id: "C", text: "4 in 12" },
      { id: "D", text: "6 in 12" }
    ],
    answer: "C",
    explanation: "A low-slope roof has a slope less than or equal to 4 in 12 (vertical to horizontal). Anything steeper is treated as a steep roof, which changes the allowable fall protection methods.",
    cite: "OSHA 29 CFR 1926.500(b) definition of low-slope roof",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-010",
    type: "mcq",
    question: "Which connector hardware requirement applies to D-rings and snaphooks used in a personal fall arrest system?",
    options: [
      { id: "A", text: "Minimum tensile strength of 1,800 pounds" },
      { id: "B", text: "Minimum tensile strength of 5,000 pounds and proof tested to 3,600 pounds" },
      { id: "C", text: "Minimum tensile strength of 3,600 pounds only" },
      { id: "D", text: "No strength requirement if locking type" }
    ],
    answer: "B",
    explanation: "D-rings and snaphooks must have a minimum tensile strength of 5,000 pounds and be proof tested to a minimum of 3,600 pounds without cracking, breaking, or deforming.",
    cite: "OSHA 29 CFR 1926.502(d)(3) and (d)(4)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-011",
    type: "mcq",
    question: "Since 1998, snaphooks used in personal fall arrest systems must be of which type unless designed for the specific connection made?",
    options: [
      { id: "A", text: "Non-locking snaphooks" },
      { id: "B", text: "Locking-type snaphooks" },
      { id: "C", text: "Open-gate hooks" },
      { id: "D", text: "Spring clips" }
    ],
    answer: "B",
    explanation: "Only locking-type snaphooks are permitted, to prevent roll-out where the connector accidentally disengages. Non-locking snaphooks were phased out because of roll-out failures.",
    cite: "OSHA 29 CFR 1926.502(d)(5), locking-type snaphooks required",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-012",
    type: "mcq",
    question: "The dangerous condition where a snaphook unintentionally disengages from the connected component is commonly called what?",
    options: [
      { id: "A", text: "Free fall" },
      { id: "B", text: "Roll-out" },
      { id: "C", text: "Swing fall" },
      { id: "D", text: "Deceleration" }
    ],
    answer: "B",
    explanation: "Roll-out occurs when the keeper of a snaphook is pushed open and the hook releases from the attachment. Locking snaphooks and correct connections prevent this failure mode.",
    cite: "OSHA 29 CFR 1926.502(d)(6); Honeywell Miller Fall Protection Catalog, Glossary, Roll-out",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-013",
    type: "mcq",
    question: "Which practice does OSHA prohibit unless the snaphook is designed and certified for that specific connection?",
    options: [
      { id: "A", text: "Connecting a snaphook to a fixed D-ring" },
      { id: "B", text: "Connecting two snaphooks to one D-ring" },
      { id: "C", text: "Connecting a snaphook to an anchorage connector" },
      { id: "D", text: "Connecting a lanyard to the dorsal D-ring" }
    ],
    answer: "B",
    explanation: "OSHA prohibits connecting two or more snaphooks to a single D-ring, hooking directly to webbing/rope, or hooking back to the lanyard, unless the hook is specifically designed for it, because these create roll-out risk.",
    cite: "OSHA 29 CFR 1926.502(d)(6)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-014",
    type: "mcq",
    question: "What minimum breaking strength is required for lanyards and vertical lifelines used in a personal fall arrest system?",
    options: [
      { id: "A", text: "1,800 pounds" },
      { id: "B", text: "3,000 pounds" },
      { id: "C", text: "5,000 pounds" },
      { id: "D", text: "8,000 pounds" }
    ],
    answer: "C",
    explanation: "Lanyards and vertical lifelines must have a minimum breaking strength of 5,000 pounds. This ensures the connecting device does not fail under arresting loads.",
    cite: "OSHA 29 CFR 1926.502(d)(9) and (d)(10)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-015",
    type: "mcq",
    question: "How many workers may be attached to a single vertical lifeline under a personal fall arrest system?",
    options: [
      { id: "A", text: "One employee" },
      { id: "B", text: "Two employees" },
      { id: "C", text: "Three employees" },
      { id: "D", text: "Any number if the anchor is rated" }
    ],
    answer: "A",
    explanation: "Each employee must be attached to a separate vertical lifeline. Sharing a lifeline could cause one worker's fall to affect another and could overload the anchorage.",
    cite: "OSHA 29 CFR 1926.502(d)(10)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-016",
    type: "mcq",
    question: "Anchorages used to attach personal fall arrest systems must be independent of any anchorage used for what purpose?",
    options: [
      { id: "A", text: "Grounding electrical tools" },
      { id: "B", text: "Supporting or suspending platforms" },
      { id: "C", text: "Securing material hoists" },
      { id: "D", text: "Anchoring warning lines" }
    ],
    answer: "B",
    explanation: "PFAS anchorages must be independent of any anchorage used to support or suspend platforms, so a failure of the work platform system does not compromise fall arrest.",
    cite: "OSHA 29 CFR 1926.502(d)(15)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-017",
    type: "mcq",
    question: "On a full body harness, which attachment point is the primary connection for fall arrest?",
    options: [
      { id: "A", text: "Side (hip) D-rings" },
      { id: "B", text: "Front (sternal/chest) D-ring only" },
      { id: "C", text: "Back (dorsal) D-ring" },
      { id: "D", text: "Shoulder D-rings" }
    ],
    answer: "C",
    explanation: "The dorsal (back) D-ring located between the shoulder blades is the primary fall arrest attachment. It keeps the worker upright after arrest and directs forces along the spine.",
    cite: "DBI-SALA Delta III Harness IFU (5903124C), Section 2, Use of Fall Arrest D-ring",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-018",
    type: "mcq",
    question: "The side (hip) D-rings on a full body harness are intended primarily for what use?",
    options: [
      { id: "A", text: "Fall arrest" },
      { id: "B", text: "Work positioning, used in pairs" },
      { id: "C", text: "Rescue hoisting" },
      { id: "D", text: "Ladder climbing" }
    ],
    answer: "B",
    explanation: "Hip D-rings are for work positioning and must be used together with a positioning lanyard, never for fall arrest. Positioning holds a worker in place so both hands are free.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, application of D-rings",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-019",
    type: "mcq",
    question: "A frontal (sternal) D-ring on a harness is generally approved for which application?",
    options: [
      { id: "A", text: "Free-fall arrest from any height" },
      { id: "B", text: "Ladder climbing systems and controlled descent/positioning where limited" },
      { id: "C", text: "Suspension of heavy tools" },
      { id: "D", text: "Anchoring warning lines" }
    ],
    answer: "B",
    explanation: "The sternal D-ring is typically used for ladder climbing systems, work positioning, and controlled/limited fall arrest applications specified by the manufacturer, not general free-fall arrest.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, attachment applications",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-020",
    type: "mcq",
    question: "How should a full body harness fit to perform correctly during a fall?",
    options: [
      { id: "A", text: "Loose so the worker can move freely" },
      { id: "B", text: "Snug, with shoulder, leg, and chest straps adjusted and the back D-ring centered between the shoulder blades" },
      { id: "C", text: "Tight enough to restrict breathing" },
      { id: "D", text: "Fit does not matter with an SRL" }
    ],
    answer: "B",
    explanation: "The Delta III IFU requires a snug fit on all straps, the back D-ring centered between the shoulder blades, and at least three inches of webbing past each leg buckle. A loose harness can slip and increase injury risk during arrest.",
    cite: "DBI-SALA Delta III Harness IFU (5903124C), Section 3.0, Donning and Fitting",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-021",
    type: "mcq",
    question: "What is the purpose of the leg straps on a full body harness?",
    options: [
      { id: "A", text: "Purely decorative" },
      { id: "B", text: "To carry the majority of arrest forces onto the strong thigh and pelvic area" },
      { id: "C", text: "To hold tools" },
      { id: "D", text: "To connect to the anchor" }
    ],
    answer: "B",
    explanation: "Leg straps route arresting forces to the thighs and pelvis, which are strong load-bearing areas. Properly adjusted leg straps also help keep the worker upright and reduce suspension trauma.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, load distribution",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-022",
    type: "mcq",
    question: "What does a deployed stitched impact indicator on a harness, or a deployed load indicator on a lanyard energy absorber, indicate?",
    options: [
      { id: "A", text: "The equipment is ready for continued use" },
      { id: "B", text: "The equipment has been subjected to fall arrest forces and must be removed from service" },
      { id: "C", text: "The harness needs to be washed" },
      { id: "D", text: "The worker is properly connected" }
    ],
    answer: "B",
    explanation: "A torn stitched impact indicator on harness webbing, or a deployed load indicator on an energy absorber, shows the component absorbed arrest forces. Remove it from service immediately and destroy or return it per manufacturer instructions.",
    cite: "DBI-SALA Delta III Harness IFU (5903124C), Section 4, Figure 21 Stitched Impact Indicator; MSA Lanyards IFU, Section 11, load indicator",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-023",
    type: "mcq",
    question: "What is the main function of a shock-absorbing (energy-absorbing) lanyard?",
    options: [
      { id: "A", text: "To increase the free fall distance" },
      { id: "B", text: "To reduce the arresting forces transmitted to the worker's body" },
      { id: "C", text: "To act as a work positioning device only" },
      { id: "D", text: "To eliminate the need for an anchor" }
    ],
    answer: "B",
    explanation: "The energy absorber pack extends and tears in a controlled way to dissipate energy, keeping the maximum arresting force at or below the 1,800-pound limit imposed on the body.",
    cite: "MSA Lanyards User Instructions, energy-absorbing lanyard function",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-024",
    type: "mcq",
    question: "When calculating fall clearance, what is the OSHA maximum deceleration distance a personal fall arrest system may allow?",
    options: [
      { id: "A", text: "No additional distance" },
      { id: "B", text: "Up to 3.5 feet (the regulatory maximum deceleration distance)" },
      { id: "C", text: "Up to about 10 feet" },
      { id: "D", text: "Exactly 6 feet" }
    ],
    answer: "B",
    explanation: "OSHA caps deceleration distance at 3.5 feet. MSA clearance worksheets include this value as a variable when calculating total fall distance; actual energy-absorber deployment varies by worker weight and product model.",
    cite: "OSHA 29 CFR 1926.502(d)(16)(iv); MSA Lanyards IFU, Section 7, Figure 2 Permissible free fall distance",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-025",
    type: "mcq",
    question: "What is the primary advantage of a twin-leg (Y-style) shock-absorbing lanyard?",
    options: [
      { id: "A", text: "It doubles the free fall distance allowed" },
      { id: "B", text: "It enables 100% tie-off while moving between anchor points" },
      { id: "C", text: "It eliminates the need for a harness" },
      { id: "D", text: "It is only for work positioning" }
    ],
    answer: "B",
    explanation: "A twin-leg lanyard lets a worker keep one leg connected to an anchor while relocating the other, maintaining continuous (100%) fall protection during movement.",
    cite: "Honeywell Miller Fall Protection Catalog, Twin-leg/Y-lanyard features, 100% tie-off",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-026",
    type: "mcq",
    question: "When using a twin-leg lanyard, where should the unused leg be connected while the worker is stationary and tied off?",
    options: [
      { id: "A", text: "Stowed on a harness lanyard keeper or designated stow point so it does not drag or create an unsafe connection" },
      { id: "B", text: "Left hanging with the snaphook dragging on the ground" },
      { id: "C", text: "Clipped to a coworker's harness" },
      { id: "D", text: "Wrapped around the anchor point twice" }
    ],
    answer: "A",
    explanation: "The idle leg should be stowed on a lanyard keeper or similar stow point on the harness so it does not trip the worker or connect in a way that could compromise the active tie-off.",
    cite: "Honeywell Miller Fall Protection Catalog, User-friendly resettable lanyard keepers",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-027",
    type: "mcq",
    question: "Why must a standard 6-foot shock-absorbing lanyard NOT be used at foot-level tie-off (below the dorsal D-ring) unless it is specifically rated for it?",
    options: [
      { id: "A", text: "It voids the harness warranty only" },
      { id: "B", text: "It increases free fall distance and arresting forces beyond design limits" },
      { id: "C", text: "It makes the lanyard too short" },
      { id: "D", text: "It is only a cosmetic concern" }
    ],
    answer: "B",
    explanation: "Anchoring below the D-ring increases free fall, which raises arresting forces above the values a standard lanyard is designed for. Only lanyards rated for leading-edge/foot-level use should be tied off low.",
    cite: "MSA Lanyards User Instructions, free-fall and anchorage position warnings",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-028",
    type: "mcq",
    question: "What is the purpose of the warning flag or label often sewn onto the energy absorber pack of a lanyard?",
    options: [
      { id: "A", text: "To identify the manufacturer's color scheme" },
      { id: "B", text: "To provide a quick visual cue that the absorber has deployed when the flag/label is exposed" },
      { id: "C", text: "To increase strength of the webbing" },
      { id: "D", text: "To mark the correct end to connect to the anchor" }
    ],
    answer: "B",
    explanation: "Many energy absorbers reveal a warning indicator when they deploy, giving inspectors a fast, unmistakable sign that the lanyard absorbed a fall and must be retired.",
    cite: "MSA Lanyards User Instructions, load indicator description",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-029",
    type: "mcq",
    question: "What is a self-retracting lifeline (SRL)?",
    options: [
      { id: "A", text: "A fixed-length rope with no moving parts" },
      { id: "B", text: "A device with a retractable line that pays out and retracts under light tension and locks quickly during a fall" },
      { id: "C", text: "A rigid pole used for positioning" },
      { id: "D", text: "A type of guardrail" }
    ],
    answer: "B",
    explanation: "An SRL automatically takes up slack as the worker moves and locks rapidly under sudden loading, arresting a fall over a much shorter distance than a standard lanyard.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, product description",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-030",
    type: "mcq",
    question: "Compared to a 6-foot shock-absorbing lanyard, a standard overhead SRL generally offers what advantage?",
    options: [
      { id: "A", text: "Greater free fall distance" },
      { id: "B", text: "Shorter fall distance and reduced clearance requirements" },
      { id: "C", text: "No need for a harness" },
      { id: "D", text: "Unlimited working radius" }
    ],
    answer: "B",
    explanation: "Because an SRL keeps the line taut and locks almost immediately, it minimizes free fall and total fall distance, which is critical when overhead clearance is limited.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, fall clearance benefits",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-031",
    type: "mcq",
    question: "Before each use, how should a worker verify that an SRL's braking mechanism is functioning?",
    options: [
      { id: "A", text: "Drop the device on the ground" },
      { id: "B", text: "Sharply pull the lifeline to confirm it locks, then let it retract" },
      { id: "C", text: "Shake the housing and listen for rattles only" },
      { id: "D", text: "Leave it fully extended overnight" }
    ],
    answer: "B",
    explanation: "A brisk pull on the line should engage the brake and lock the SRL. The line should also retract smoothly under light tension without hesitation or sticking.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, pre-use function check",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-032",
    type: "mcq",
    question: "A leading-edge rated SRL (often labeled SRL-LE) is specifically designed to address which hazard?",
    options: [
      { id: "A", text: "Chemical exposure" },
      { id: "B", text: "Sharp-edge contact and increased free fall from foot-level or edge tie-off" },
      { id: "C", text: "Excessive UV degradation" },
      { id: "D", text: "Electrical arc flash" }
    ],
    answer: "B",
    explanation: "Leading-edge SRLs incorporate an energy absorber and abrasion-resistant lifeline to survive contact with a sharp edge and to control the higher forces that occur when tied off at foot level.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, Section 3.4, Leading Edge Installation and Use",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-033",
    type: "mcq",
    question: "The MSA V-TEC EDGE SRL differs from a standard V-TEC SRL primarily because it is rated to allow what?",
    options: [
      { id: "A", text: "Use without a harness" },
      { id: "B", text: "Foot-level (edge) tie-off and contact with a sharp leading edge" },
      { id: "C", text: "Attachment of two workers at once" },
      { id: "D", text: "Unlimited horizontal travel" }
    ],
    answer: "B",
    explanation: "The EDGE version adds an energy absorber and edge-tested lifeline so it can be anchored at foot level and withstand loading over a sharp edge, unlike a standard overhead-only SRL.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, Section 3, Leading Edge-Specific Product Use",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-034",
    type: "mcq",
    question: "Why should the lifeline of an SRL never be allowed to retract freely and uncontrolled back into the housing?",
    options: [
      { id: "A", text: "It voids the color warranty" },
      { id: "B", text: "The rapid recoil can damage the internal mechanism or cause injury from the snaphook" },
      { id: "C", text: "It uses battery power" },
      { id: "D", text: "It makes the device heavier" }
    ],
    answer: "B",
    explanation: "Letting the line snap back can damage the retraction spring and brake and can whip the connector into a person. The line should be guided back under control.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, handling precautions",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-035",
    type: "mcq",
    question: "What is a swing fall (pendulum) hazard?",
    options: [
      { id: "A", text: "A fall straight down with no lateral motion" },
      { id: "B", text: "Swinging sideways after a fall because the worker moved horizontally away from the anchor point" },
      { id: "C", text: "The SRL retracting too quickly" },
      { id: "D", text: "A harness slipping off" }
    ],
    answer: "B",
    explanation: "Working far to the side of an anchor causes the worker to swing like a pendulum during a fall, risking impact with nearby structures and increasing total fall distance. Keep anchors as directly overhead as possible.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, swing fall warnings",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-036",
    type: "mcq",
    question: "Which term describes the total vertical distance needed below the work surface to safely arrest a fall without hitting a lower level?",
    options: [
      { id: "A", text: "Setback distance" },
      { id: "B", text: "Required fall clearance" },
      { id: "C", text: "Anchor radius" },
      { id: "D", text: "Deployment margin only" }
    ],
    answer: "B",
    explanation: "Required fall clearance accounts for free fall, deceleration/absorber deployment, harness stretch, worker height, and a safety margin. If clearance is inadequate, a longer lanyard or SRL will not prevent striking the ground.",
    cite: "3M Protecta Full Line Catalog, p.22, Example fall clearance requirements (SRL vs. lanyard)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-037",
    type: "mcq",
    question: "When calculating fall clearance for a 6-foot shock-absorbing lanyard with the anchor at the dorsal D-ring height, which factors should be included?",
    options: [
      { id: "A", text: "Only the lanyard length" },
      { id: "B", text: "Lanyard length, energy absorber deployment, worker height below D-ring, and a safety factor" },
      { id: "C", text: "Only the worker's height" },
      { id: "D", text: "Only the deceleration distance" }
    ],
    answer: "B",
    explanation: "Total clearance combines free fall (lanyard length), absorber deployment (about 3.5 feet), the distance from the D-ring to the worker's feet, and an added safety margin. Ignoring any factor risks a ground strike.",
    cite: "MSA Lanyards User Instructions, fall clearance worksheet",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-038",
    type: "mcq",
    question: "What must be done with any fall protection component that has been subjected to a fall or impact loading?",
    options: [
      { id: "A", text: "Continue using it if it looks intact" },
      { id: "B", text: "Immediately remove it from service" },
      { id: "C", text: "Wash it and return it to use" },
      { id: "D", text: "Use it only for training" }
    ],
    answer: "B",
    explanation: "Any PFAS component subjected to impact/arrest forces must be immediately removed from service and not used again for fall protection, even if damage is not visible.",
    cite: "OSHA 29 CFR 1926.502(d)(19)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-039",
    type: "mcq",
    question: "How often must personal fall arrest system components be inspected for wear, damage, and deterioration?",
    options: [
      { id: "A", text: "Once per year" },
      { id: "B", text: "Prior to each use" },
      { id: "C", text: "Only after a fall" },
      { id: "D", text: "Only when new" }
    ],
    answer: "B",
    explanation: "PFAS components must be inspected prior to each use for wear, damage, and other deterioration. Defective components must be removed from service.",
    cite: "OSHA 29 CFR 1926.502(d)(21)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-040",
    type: "mcq",
    question: "During a harness webbing inspection, which of the following is a reason to remove the harness from service?",
    options: [
      { id: "A", text: "Slight surface dust" },
      { id: "B", text: "Cuts, frays, broken fibers, burns, or chemical damage to the webbing" },
      { id: "C", text: "A legible manufacturer label" },
      { id: "D", text: "A properly functioning buckle" }
    ],
    answer: "B",
    explanation: "Cuts, frays, pulled or broken stitches, burns, and chemical/heat damage all compromise webbing strength. Any such damage requires removing the harness from service.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, inspection checklist",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-041",
    type: "mcq",
    question: "When inspecting harness hardware (D-rings and buckles), which condition is acceptable for continued use?",
    options: [
      { id: "A", text: "Cracks or sharp edges" },
      { id: "B", text: "Corrosion pitting" },
      { id: "C", text: "Smooth operation with no distortion, cracks, or corrosion" },
      { id: "D", text: "A bent D-ring that still holds" }
    ],
    answer: "C",
    explanation: "Hardware must be free of cracks, distortion, corrosion, and sharp edges, and buckles must operate smoothly and lock properly. Any deformation or damage is cause for removal from service.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, hardware inspection",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-042",
    type: "mcq",
    question: "What documents and records best support proper fall protection inspection on a jobsite?",
    options: [
      { id: "A", text: "The bill of sale only" },
      { id: "B", text: "Manufacturer instructions and a documented inspection program with records per employer/manufacturer guidance" },
      { id: "C", text: "A blank sheet of paper" },
      { id: "D", text: "The company holiday schedule" }
    ],
    answer: "B",
    explanation: "OSHA requires pre-use inspection by the user. Manufacturer instructions define formal periodic exam intervals, and employers should maintain inspection records as part of a documented program.",
    cite: "OSHA 29 CFR 1926.502(d)(21); MSA V-TEC / V-TEC EDGE SRL IFU, Section 6, Periodic Examination Interval",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-043",
    type: "mcq",
    question: "If a harness label is missing or illegible so the equipment cannot be identified, what should be done?",
    options: [
      { id: "A", text: "Keep using it until it fails" },
      { id: "B", text: "Remove it from service because it cannot be properly identified and inspected" },
      { id: "C", text: "Write a new label by hand" },
      { id: "D", text: "Only use it for light work" }
    ],
    answer: "B",
    explanation: "Legible labels identify the model, standards, capacity, and inspection information. Without them the equipment cannot be verified as compliant or traced, so it must be removed from service.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, labels and markings",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-044",
    type: "mcq",
    question: "What is the recommended way to store fall protection harnesses and lanyards when not in use?",
    options: [
      { id: "A", text: "In direct sunlight on the roof" },
      { id: "B", text: "In a cool, dry, clean place away from sunlight, chemicals, and heat" },
      { id: "C", text: "Buried in a bucket of solvent" },
      { id: "D", text: "In the truck bed exposed to weather" }
    ],
    answer: "B",
    explanation: "UV light, heat, moisture, and chemicals degrade synthetic webbing. Storing equipment hung in a cool, dry, clean location away from these hazards preserves strength and lifespan.",
    cite: "MSA Lanyards User Instructions, storage recommendations",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-045",
    type: "mcq",
    question: "Which environmental exposure is a leading cause of hidden strength loss in synthetic harness and lanyard webbing?",
    options: [
      { id: "A", text: "Ultraviolet (UV) sunlight exposure" },
      { id: "B", text: "Brief contact with clean water" },
      { id: "C", text: "Storage in a dark cabinet" },
      { id: "D", text: "Being folded neatly" }
    ],
    answer: "A",
    explanation: "Prolonged UV exposure breaks down synthetic fibers, weakening webbing even when no cut or fray is visible. Faded, stiff, or discolored webbing may indicate UV damage requiring removal from service.",
    cite: "3M Protecta Full Line Catalog, p.641, Nylon rope UV resistance",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-046",
    type: "mcq",
    question: "How should a soiled fabric harness generally be cleaned according to manufacturer guidance?",
    options: [
      { id: "A", text: "Pressure wash with degreaser" },
      { id: "B", text: "Wipe/wash with mild soap and water, rinse, and air dry away from direct heat" },
      { id: "C", text: "Soak in bleach overnight" },
      { id: "D", text: "Never clean it under any circumstances" }
    ],
    answer: "B",
    explanation: "Manufacturers typically specify cleaning with mild soap and water, then air drying away from direct heat or flame. Harsh chemicals, bleach, and high heat damage webbing and hardware.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, cleaning and maintenance",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-047",
    type: "mcq",
    question: "Under Subpart M, before workers use personal fall arrest systems, the employer must provide what regarding rescue?",
    options: [
      { id: "A", text: "Nothing; workers self-rescue" },
      { id: "B", text: "Provisions for prompt rescue or assurance that employees can rescue themselves" },
      { id: "C", text: "Only a first aid kit" },
      { id: "D", text: "A written waiver" }
    ],
    answer: "B",
    explanation: "The employer must provide for prompt rescue of employees in the event of a fall, or ensure that workers are able to rescue themselves, planned before work begins.",
    cite: "OSHA 29 CFR 1926.502(d)(20)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-048",
    type: "mcq",
    question: "What medical condition can develop when a worker hangs motionless in a harness after a fall, making prompt rescue critical?",
    options: [
      { id: "A", text: "Frostbite" },
      { id: "B", text: "Suspension trauma (orthostatic intolerance)" },
      { id: "C", text: "Heat rash" },
      { id: "D", text: "Carpal tunnel syndrome" }
    ],
    answer: "B",
    explanation: "Suspension trauma (orthostatic intolerance) occurs when blood pools in the legs during motionless suspension. OSHA requires prompt rescue after a fall; delayed rescue increases this life-threatening risk.",
    cite: "Honeywell Miller Fall Protection Catalog, Glossary, Suspension Trauma (Orthostatic Intolerance); OSHA 29 CFR 1926.502(d)(20), prompt rescue",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-049",
    type: "mcq",
    question: "What is the purpose of suspension trauma relief straps attached to a harness?",
    options: [
      { id: "A", text: "To connect the lanyard" },
      { id: "B", text: "To let a suspended worker stand in loops and relieve leg-strap pressure while awaiting rescue" },
      { id: "C", text: "To carry tools" },
      { id: "D", text: "To anchor the worker to the roof" }
    ],
    answer: "B",
    explanation: "Trauma relief straps deploy into stirrups the worker steps into, restoring leg circulation and delaying the onset of suspension trauma until rescue arrives.",
    cite: "Honeywell Miller Fall Protection Catalog, suspension trauma relief accessory",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-050",
    type: "mcq",
    question: "A written fall rescue plan should be developed and understood by the crew at what point?",
    options: [
      { id: "A", text: "After the first fall occurs" },
      { id: "B", text: "Before work at height begins" },
      { id: "C", text: "At the end of the project" },
      { id: "D", text: "Only if OSHA requests it" }
    ],
    answer: "B",
    explanation: "Rescue must be planned before exposure to a fall hazard so that, if a fall occurs, the crew can act immediately rather than improvising during an emergency when minutes matter.",
    cite: "OSHA 29 CFR 1926.502(d)(20), prompt rescue requirement",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-051",
    type: "mcq",
    question: "A roofing crew is installing membrane on a low-slope commercial roof with a 30-foot drop at the edge and no guardrails. Which fall protection option is acceptable?",
    options: [
      { id: "A", text: "No protection because they stay near the middle" },
      { id: "B", text: "A conventional system such as guardrails, safety nets, or a personal fall arrest system (or other permitted low-slope method)" },
      { id: "C", text: "A body belt with a rope" },
      { id: "D", text: "Only spotters watching each other informally" }
    ],
    answer: "B",
    explanation: "At heights of 6 feet or more on a low-slope roof, workers must be protected by a conventional system (guardrail, net, or PFAS) or another OSHA-permitted low-slope method combination, not by unprotected proximity.",
    cite: "OSHA 29 CFR 1926.501(b)(10) and 1926.502",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-052",
    type: "mcq",
    question: "A worker will tie off to a standing-seam metal roof edge at foot level while installing near a sharp parapet. Which connecting device is most appropriate?",
    options: [
      { id: "A", text: "A standard overhead-only SRL not rated for edges" },
      { id: "B", text: "A leading-edge rated SRL or edge-rated energy-absorbing lanyard designed for foot-level tie-off" },
      { id: "C", text: "A non-shock-absorbing positioning lanyard" },
      { id: "D", text: "A body belt lanyard" }
    ],
    answer: "B",
    explanation: "Foot-level tie-off near a sharp edge requires equipment engineered for those forces and abrasion, such as a leading-edge SRL or edge-rated shock-absorbing lanyard. Standard devices can fail against a sharp edge.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, leading-edge and foot-level use",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-053",
    type: "mcq",
    question: "A crew must move across a large low-slope roof repeatedly to stage materials. Which system best maintains continuous fall protection over a long horizontal path?",
    options: [
      { id: "A", text: "A single fixed-length lanyard clipped once" },
      { id: "B", text: "A properly engineered horizontal lifeline system with compatible connectors" },
      { id: "C", text: "A warning line alone at the edge" },
      { id: "D", text: "Removing all fall protection to move faster" }
    ],
    answer: "B",
    explanation: "A horizontal lifeline designed by a qualified person lets workers travel along the roof while staying continuously connected, provided anchor forces and sag are accounted for in the design.",
    cite: "OSHA 29 CFR 1926.502(d)(8); 3M Protecta Full Line Catalog, horizontal lifeline systems",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-054",
    type: "mcq",
    question: "On a steep roof (slope greater than 4 in 12) more than 6 feet above a lower level, what protection is required?",
    options: [
      { id: "A", text: "No protection is required on steep roofs" },
      { id: "B", text: "Guardrails with toeboards, safety nets, or personal fall arrest systems" },
      { id: "C", text: "A warning line only" },
      { id: "D", text: "A safety monitor only" }
    ],
    answer: "B",
    explanation: "Steep roof work above 6 feet requires conventional fall protection: guardrail systems with toeboards, safety net systems, or personal fall arrest systems. Warning lines/monitors alone are not sufficient on steep roofs.",
    cite: "OSHA 29 CFR 1926.501(b)(11)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-055",
    type: "mcq",
    question: "A roofer notices the stitched impact indicator on a coworker's harness webbing is torn or stretched. What is the correct action?",
    options: [
      { id: "A", text: "Ignore it; indicators are unreliable" },
      { id: "B", text: "Remove the harness from service immediately and tag it as unusable" },
      { id: "C", text: "Push the indicator back and keep working" },
      { id: "D", text: "Use the harness only for the rest of the day" }
    ],
    answer: "B",
    explanation: "A torn or stretched stitched impact indicator means the harness webbing experienced arrest or shock loading. Remove it from service at once and destroy it per manufacturer instructions.",
    cite: "DBI-SALA Delta III Harness IFU (5903124C), Section 4, Figure 21 Stitched Impact Indicator",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-056",
    type: "mcq",
    question: "A worker wants to anchor a PFAS to a small vent pipe on a roof. Why is this generally unacceptable?",
    options: [
      { id: "A", text: "Vent pipes are too tall" },
      { id: "B", text: "A vent pipe cannot reliably support the required anchorage loads and is not a certified anchor" },
      { id: "C", text: "Vent pipes are always painted" },
      { id: "D", text: "It would look unprofessional" }
    ],
    answer: "B",
    explanation: "Anchorages must support 5,000 pounds per worker (or a qualified-person-engineered system). A small vent pipe or similar incidental structure cannot be assumed to meet this and must not be used as an anchor.",
    cite: "OSHA 29 CFR 1926.502(d)(15), anchorage strength",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-057",
    type: "mcq",
    question: "A reusable roof anchor is being installed for tie-off. Who is best qualified to confirm the anchorage and its attachment to the structure meet load requirements?",
    options: [
      { id: "A", text: "Any worker on the crew" },
      { id: "B", text: "A qualified person, based on manufacturer instructions and structural capacity" },
      { id: "C", text: "The material supplier by phone" },
      { id: "D", text: "The newest apprentice" }
    ],
    answer: "B",
    explanation: "A qualified person evaluates whether the anchor and the structure it attaches to meet the 5,000-pound or engineered safety-factor requirement, following the manufacturer's installation instructions.",
    cite: "OSHA 29 CFR 1926.502(d)(15); 3M Protecta Full Line Catalog, roof anchor installation",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-058",
    type: "mcq",
    question: "A worker's 6-foot shock-absorbing lanyard is tied off to an anchor at foot level, and the work platform is only 12 feet above concrete. What is the primary concern?",
    options: [
      { id: "A", text: "The lanyard is too short to reach" },
      { id: "B", text: "There is likely insufficient fall clearance, risking a ground strike before arrest completes" },
      { id: "C", text: "The color of the lanyard" },
      { id: "D", text: "The anchor is too strong" }
    ],
    answer: "B",
    explanation: "Foot-level tie-off increases free fall, and with a 6-foot lanyard plus absorber deployment and worker height, total fall distance can exceed 12 feet. The worker could hit the ground; a shorter/SRL solution and overhead anchor are needed.",
    cite: "MSA Lanyards User Instructions, fall clearance and anchorage position",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-059",
    type: "mcq",
    question: "During pre-use inspection, an SRL's lifeline does not retract fully and hesitates when pulled out. What should the worker do?",
    options: [
      { id: "A", text: "Use it anyway since it partially works" },
      { id: "B", text: "Remove the SRL from service and report it; do not use it" },
      { id: "C", text: "Oil the housing with any lubricant on hand" },
      { id: "D", text: "Bang it against the roof to free it" }
    ],
    answer: "B",
    explanation: "Improper retraction indicates an internal fault. A malfunctioning SRL may not lock or arrest correctly, so it must be removed from service and inspected/repaired by an authorized party.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, pre-use inspection and defects",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-060",
    type: "mcq",
    question: "Two roofers want to save an anchor by clipping both of their lanyard snaphooks onto the same single D-ring. Why is this not allowed?",
    options: [
      { id: "A", text: "It is allowed if the D-ring is large" },
      { id: "B", text: "Multiple snaphooks on one D-ring can cause roll-out and is prohibited unless designed for it" },
      { id: "C", text: "It makes the D-ring rust faster" },
      { id: "D", text: "Only because it looks crowded" }
    ],
    answer: "B",
    explanation: "Connecting two snaphooks to one D-ring can force a keeper open (roll-out) and cause disconnection under load. OSHA prohibits this unless the connector is specifically designed for such use.",
    cite: "OSHA 29 CFR 1926.502(d)(6), incompatible connections",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-061",
    type: "mcq",
    question: "Which of the following best describes the role of the anchorage connector in a PFAS?",
    options: [
      { id: "A", text: "It replaces the harness" },
      { id: "B", text: "It provides a compatible, secure coupling between the anchorage and the connecting device" },
      { id: "C", text: "It absorbs all fall energy" },
      { id: "D", text: "It is optional decoration" }
    ],
    answer: "B",
    explanation: "An anchorage connector (such as a tie-off adapter, beam clamp, or D-ring plate) creates a proper connection point on the anchorage that is compatible with the lanyard or SRL snaphook/carabiner.",
    cite: "3M Protecta Full Line Catalog, p.365, Mobile anchorage connector",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-062",
    type: "mcq",
    question: "What does connector 'compatibility' mean when joining a snaphook or carabiner to a D-ring or anchor?",
    options: [
      { id: "A", text: "They are the same color" },
      { id: "B", text: "Their sizes and shapes work together so the gate cannot be forced open (no roll-out)" },
      { id: "C", text: "They come from the same catalog page" },
      { id: "D", text: "They weigh the same" }
    ],
    answer: "B",
    explanation: "Compatible connectors are matched so the connected part cannot depress or pry open the keeper/gate under load. Incompatible pairings are a leading cause of roll-out disconnection.",
    cite: "Honeywell Miller Fall Protection Catalog, Glossary, Roll-out; OSHA 29 CFR 1926.502(d)(5)-(6)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-063",
    type: "mcq",
    question: "A carabiner used as a fall arrest connector should have which feature to be acceptable?",
    options: [
      { id: "A", text: "A simple non-locking gate" },
      { id: "B", text: "A self-closing, self-locking gate that stays closed and locked under load" },
      { id: "C", text: "No gate at all for speed" },
      { id: "D", text: "A plastic gate" }
    ],
    answer: "B",
    explanation: "Fall arrest connectors must be self-closing and self-locking per industry standards and manufacturer requirements, matching the intent of OSHA locking-type snaphook rules. This prevents accidental gate opening under load.",
    cite: "Honeywell Miller Fall Protection Catalog, Connector inspection (keeper/gate); OSHA 29 CFR 1926.500(b), Snaphook definition",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-064",
    type: "mcq",
    question: "Why must fall protection connectors be made from drop-forged, pressed, or formed steel (or equivalent materials)?",
    options: [
      { id: "A", text: "To reduce cost only" },
      { id: "B", text: "To achieve the required strength and resist cracking or deformation under arrest loads" },
      { id: "C", text: "To make them lighter than aluminum always" },
      { id: "D", text: "For appearance" }
    ],
    answer: "B",
    explanation: "Connectors must meet strength and proof-test requirements without cracking, breaking, or deforming, which requires suitably strong materials and manufacturing methods.",
    cite: "OSHA 29 CFR 1926.502(d)(1), connector materials",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-065",
    type: "mcq",
    question: "A cross-arm strap (tie-off adapter) is wrapped around a steel beam as an anchor connector. What must be verified?",
    options: [
      { id: "A", text: "That it is brightly colored" },
      { id: "B", text: "That it is rated for the load, used per instructions, and protected from sharp beam edges" },
      { id: "C", text: "That it is the longest available" },
      { id: "D", text: "Nothing; any strap works" }
    ],
    answer: "B",
    explanation: "The adapter must be rated for fall arrest, installed according to instructions, and shielded from sharp edges or corners that could cut it. Edge protection may be required where it wraps the beam.",
    cite: "3M Protecta Full Line Catalog, tie-off adapters and edge protection",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-066",
    type: "mcq",
    question: "What is the correct orientation for a snaphook connection to avoid side-loading?",
    options: [
      { id: "A", text: "Loaded across the gate (side-loaded)" },
      { id: "B", text: "Loaded along its major (long) axis with the gate fully closed and locked" },
      { id: "C", text: "Loaded at the hook tip" },
      { id: "D", text: "Orientation does not matter" }
    ],
    answer: "B",
    explanation: "Connectors are strongest when loaded along the spine (major axis). Side-loading or gate-loading dramatically reduces strength and can cause failure, so connections must be oriented for axial loading.",
    cite: "Honeywell Miller Fall Protection Catalog, proper connector loading",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-067",
    type: "mcq",
    question: "In a personal fall arrest system, what is the purpose of a full body harness compared with a body belt?",
    options: [
      { id: "A", text: "It is only more comfortable" },
      { id: "B", text: "It distributes arrest forces across the shoulders, chest, pelvis, and thighs and keeps the worker upright" },
      { id: "C", text: "It allows longer free falls" },
      { id: "D", text: "It eliminates the need for an anchor" }
    ],
    answer: "B",
    explanation: "A full body harness spreads the arresting load over major body structures and holds the worker in a head-up, spine-aligned position, greatly reducing injury compared to a belt that loads the abdomen.",
    cite: "OSHA 29 CFR 1926.502(d)(16); DBI-SALA Delta Full Body Harness User Manual",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-068",
    type: "mcq",
    question: "A worker feels the chest strap of the harness is riding up near the throat. What is the correct adjustment?",
    options: [
      { id: "A", text: "Leave it; position is unimportant" },
      { id: "B", text: "Position the chest strap in the mid-chest area and adjust so the harness fits snugly" },
      { id: "C", text: "Remove the chest strap entirely" },
      { id: "D", text: "Loosen all straps completely" }
    ],
    answer: "B",
    explanation: "The chest (sternal) strap should sit in the mid-chest region to keep the shoulder straps positioned correctly and hold the dorsal D-ring between the shoulder blades. A strap near the throat is a choking and positioning hazard.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, donning and adjustment",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-069",
    type: "mcq",
    question: "Which of the following is the correct sequence concept when donning a full body harness?",
    options: [
      { id: "A", text: "Clip the lanyard first, then find the harness" },
      { id: "B", text: "Untangle the harness, slip on shoulder straps, connect and adjust leg and chest straps, then verify the dorsal D-ring is centered on the back" },
      { id: "C", text: "Put both legs through the shoulder straps" },
      { id: "D", text: "Only tighten the waist and ignore the rest" }
    ],
    answer: "B",
    explanation: "Proper donning starts with untangling straps, placing shoulder straps, buckling and adjusting leg and chest straps snugly, and confirming the dorsal D-ring sits centered between the shoulder blades.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, how to don the harness",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-070",
    type: "mcq",
    question: "What is a quick-connect (parachute-style) buckle designed to provide on a harness?",
    options: [
      { id: "A", text: "A weaker connection for comfort" },
      { id: "B", text: "A secure, audible/positive-locking, fast connection that resists accidental release" },
      { id: "C", text: "A decorative feature" },
      { id: "D", text: "A tool holder" }
    ],
    answer: "B",
    explanation: "Quick-connect buckles snap together with a positive lock and release only when both sides are pressed, giving a fast, secure closure that will not open under normal loads.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, buckle types",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-071",
    type: "mcq",
    question: "Which statement about mixing components from different manufacturers in a PFAS is most accurate?",
    options: [
      { id: "A", text: "Any parts can be freely combined" },
      { id: "B", text: "Components must be compatible and used per manufacturer instructions; incompatible substitutions can impair function" },
      { id: "C", text: "Only colors must match" },
      { id: "D", text: "Mixing is always prohibited by OSHA" }
    ],
    answer: "B",
    explanation: "PFAS components must be compatible in size, shape, and rated function. Substituting parts not evaluated for compatibility can cause roll-out or reduced performance, so follow manufacturer instructions.",
    cite: "OSHA 29 CFR 1926.502(d)(6); 3M Protecta Full Line Catalog, component compatibility",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-072",
    type: "mcq",
    question: "Why is it important to keep the anchorage point as directly overhead as practical when using an SRL?",
    options: [
      { id: "A", text: "To make the SRL retract faster" },
      { id: "B", text: "To minimize swing fall and edge-loading and reduce total fall distance" },
      { id: "C", text: "To keep the device cooler" },
      { id: "D", text: "It has no effect" }
    ],
    answer: "B",
    explanation: "An overhead anchor reduces the horizontal offset that causes swing falls and edge contact, and it minimizes free fall so the SRL arrests the worker in the shortest distance.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, anchor placement",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-073",
    type: "mcq",
    question: "A shock-absorbing lanyard is rated for a certain capacity range including tools and worker weight. Why must total attached weight stay within the rated capacity?",
    options: [
      { id: "A", text: "Heavier loads make the lanyard cleaner" },
      { id: "B", text: "Exceeding capacity can raise arrest forces above design limits and cause injury or failure" },
      { id: "C", text: "It only affects comfort" },
      { id: "D", text: "Capacity ratings are suggestions" }
    ],
    answer: "B",
    explanation: "Energy absorbers are engineered for a specified weight range. Overloading can produce arrest forces exceeding the 1,800-pound limit and defeat the absorber's protective function.",
    cite: "MSA Lanyards User Instructions, capacity and weight range",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-074",
    type: "mcq",
    question: "When is a positioning device system (not a fall arrest system) appropriate?",
    options: [
      { id: "A", text: "For general fall arrest from any height" },
      { id: "B", text: "To hold a worker in place on a vertical surface with both hands free, limiting free fall to about 2 feet" },
      { id: "C", text: "To replace guardrails" },
      { id: "D", text: "As the only protection over a 30-foot drop" }
    ],
    answer: "B",
    explanation: "Positioning devices support a worker leaning against a surface so both hands are free, and must be rigged to limit free fall to 2 feet or less. They are not a substitute for fall arrest where larger falls are possible.",
    cite: "OSHA 29 CFR 1926.502(e), positioning device systems",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-075",
    type: "mcq",
    question: "A worker plans to attach a positioning lanyard to the dorsal (back) D-ring. Why is this incorrect?",
    options: [
      { id: "A", text: "The dorsal D-ring is for fall arrest, not side/positioning connection" },
      { id: "B", text: "The dorsal D-ring is too small" },
      { id: "C", text: "Positioning lanyards cannot be used at all" },
      { id: "D", text: "It is actually correct" }
    ],
    answer: "A",
    explanation: "Positioning lanyards connect to the hip (side) D-rings used as a pair. The dorsal D-ring is reserved for fall arrest, and using it for positioning defeats each attachment's intended function.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, D-ring applications",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-076",
    type: "mcq",
    question: "What is the recommended action if webbing shows a chemical stain of unknown origin during inspection?",
    options: [
      { id: "A", text: "Ignore it if the color is only slightly changed" },
      { id: "B", text: "Remove from service, since chemical damage can severely weaken fibers without obvious cuts" },
      { id: "C", text: "Cut out the stained section" },
      { id: "D", text: "Paint over the stain" }
    ],
    answer: "B",
    explanation: "Chemicals such as acids, bases, and solvents can drastically weaken webbing while leaving it visually near-normal. Suspected chemical contamination is cause for removal from service.",
    cite: "MSA Lanyards User Instructions, chemical exposure and inspection",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-077",
    type: "mcq",
    question: "Who should perform and document periodic (competent-person) inspections of fall protection equipment in addition to the user's pre-use check?",
    options: [
      { id: "A", text: "Any random bystander" },
      { id: "B", text: "A competent person, at intervals defined by the manufacturer and regulations" },
      { id: "C", text: "Only the equipment purchaser once" },
      { id: "D", text: "Nobody; pre-use checks are enough" }
    ],
    answer: "B",
    explanation: "OSHA requires pre-use inspection by the user. Beyond that, manufacturers specify formal periodic examinations at intervals based on use severity (for example, quarterly to annually on SRLs).",
    cite: "OSHA 29 CFR 1926.502(d)(21); MSA V-TEC / V-TEC EDGE SRL IFU, Section 6, Table 4 Periodic Examination Interval",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-078",
    type: "mcq",
    question: "A roofer will work near a skylight opening on a low-slope roof. Besides PFAS, which additional hazard control is appropriate for the skylight itself?",
    options: [
      { id: "A", text: "Leave it open for ventilation" },
      { id: "B", text: "Cover or guard the skylight/hole with a compliant cover or guardrail" },
      { id: "C", text: "Place a warning cone only" },
      { id: "D", text: "Ignore it if workers are careful" }
    ],
    answer: "B",
    explanation: "Skylights and holes are fall hazards that must be protected by covers capable of supporting loads or by guardrails, in addition to any PFAS used for edge work.",
    cite: "OSHA 29 CFR 1926.501(b)(4) and 1926.502(i), covers",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-079",
    type: "mcq",
    question: "A hole cover placed on a roof must meet which requirement?",
    options: [
      { id: "A", text: "Be any loose material laid over the hole" },
      { id: "B", text: "Support at least twice the weight of employees, equipment, and materials that may be imposed on it, and be secured against displacement" },
      { id: "C", text: "Be painted white only" },
      { id: "D", text: "Be smaller than the hole" }
    ],
    answer: "B",
    explanation: "OSHA requires covers to support at least twice the weight of employees, equipment, and materials that may be imposed at any one time, be secured against displacement, and be marked to warn of the hazard.",
    cite: "OSHA 29 CFR 1926.502(i)(2) and (i)(3)",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-080",
    type: "mcq",
    question: "During roofing near a leading edge, which factor most increases the risk that an SRL lifeline could be cut during a fall?",
    options: [
      { id: "A", text: "A rounded, padded edge" },
      { id: "B", text: "A sharp, unprotected metal or concrete edge the line drags across" },
      { id: "C", text: "An overhead anchor" },
      { id: "D", text: "Using a leading-edge rated device" }
    ],
    answer: "B",
    explanation: "A sharp, unprotected edge can sever a standard lifeline as it loads over the edge during a fall. Use edge-rated equipment and/or edge protection where the line may contact a sharp edge.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, sharp edge hazards",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-081",
    type: "mcq",
    question: "What is the best practice for the working line angle of an edge-rated SRL used horizontally at foot level?",
    options: [
      { id: "A", text: "Any angle is fine without limits" },
      { id: "B", text: "Stay within the manufacturer's specified working angle/setback to control swing fall and edge loading" },
      { id: "C", text: "Work at the maximum possible sideways distance" },
      { id: "D", text: "Keep the anchor below the feet" }
    ],
    answer: "B",
    explanation: "Edge-rated SRLs specify allowable working angles and setback distances from the edge to limit swing fall and ensure the tested edge performance. Exceeding these limits can cause a swing-fall or edge failure.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, working angle and setback",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-082",
    type: "mcq",
    question: "A warning line system on a low-slope roof is used with roofing work. What is the function of the warning line?",
    options: [
      { id: "A", text: "It physically arrests a fall" },
      { id: "B", text: "It marks off an area and warns workers they are approaching an unprotected edge" },
      { id: "C", text: "It serves as an anchor point" },
      { id: "D", text: "It replaces the need for any other protection everywhere" }
    ],
    answer: "B",
    explanation: "A warning line is a barrier that alerts workers they are nearing the edge, used to define a controlled area. It is a warning device, not a fall arrest system, and has specific placement and strength requirements.",
    cite: "OSHA 29 CFR 1926.502(f), warning line systems",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-083",
    type: "mcq",
    question: "In a fall arrest scenario, why is minimizing free fall distance a primary design goal?",
    options: [
      { id: "A", text: "It reduces equipment cost" },
      { id: "B", text: "Less free fall means lower arresting forces and less required clearance" },
      { id: "C", text: "It makes the harness lighter" },
      { id: "D", text: "It has no safety benefit" }
    ],
    answer: "B",
    explanation: "Shorter free fall reduces the kinetic energy the system must absorb, lowering peak arresting force on the body and shrinking the fall clearance needed below the work surface.",
    cite: "OSHA 29 CFR 1926.502(d)(16); 3M Protecta Full Line Catalog, minimizing free fall",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-084",
    type: "mcq",
    question: "A worker's harness has one leg strap buckle that will not fully latch. What is the correct decision?",
    options: [
      { id: "A", text: "Wear it with the buckle partly latched" },
      { id: "B", text: "Remove the harness from service; a non-functioning buckle is a critical defect" },
      { id: "C", text: "Tie the strap in a knot instead" },
      { id: "D", text: "Use only the other leg strap" }
    ],
    answer: "B",
    explanation: "A buckle that cannot fully latch and lock is a critical failure point. In a fall, a leg strap could release, so the harness must be removed from service until repaired or replaced.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, buckle inspection",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-085",
    type: "mcq",
    question: "What is the correct way to attach a snaphook to a fixed anchorage D-ring?",
    options: [
      { id: "A", text: "Force the gate open with the D-ring" },
      { id: "B", text: "Seat the connector so the gate closes and locks fully, with the D-ring resting in the hook's throat" },
      { id: "C", text: "Hook only the tip over the D-ring" },
      { id: "D", text: "Wrap the lanyard webbing directly through the D-ring and hook to itself" }
    ],
    answer: "B",
    explanation: "The connector must fully capture the D-ring with the gate closed and locked, seated in the hook's throat for axial loading. Tip-loading or webbing choke connections are unsafe and often prohibited.",
    cite: "Honeywell Miller Fall Protection Catalog, correct connection practices",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-086",
    type: "mcq",
    question: "Why must a lanyard not be tied in a knot to shorten it?",
    options: [
      { id: "A", text: "Knots look unprofessional" },
      { id: "B", text: "Knots can reduce webbing/rope strength by a significant amount and create failure points" },
      { id: "C", text: "Knots make it heavier" },
      { id: "D", text: "It is actually acceptable to knot lanyards" }
    ],
    answer: "B",
    explanation: "Knots concentrate stress and can cut the strength of webbing or rope substantially, potentially below rated loads. Use an adjustable or correctly sized lanyard instead of knotting.",
    cite: "MSA Lanyards User Instructions, prohibited modifications",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-087",
    type: "mcq",
    question: "A crew member wants to repair a small cut in harness webbing with tape and keep using it. What is correct?",
    options: [
      { id: "A", text: "Tape is an acceptable field repair" },
      { id: "B", text: "Field repairs are not allowed; damaged webbing means removal from service" },
      { id: "C", text: "Sew it with any thread" },
      { id: "D", text: "Glue the cut closed" }
    ],
    answer: "B",
    explanation: "Users may not repair structural fall protection components. Damaged webbing must be removed from service; only the manufacturer or an authorized party may service equipment where permitted.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, repairs and servicing",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-088",
    type: "mcq",
    question: "During roof tear-off on a low-slope roof, debris and materials accumulate near the edge. How does this affect PFAS use?",
    options: [
      { id: "A", text: "It has no effect on tie-off" },
      { id: "B", text: "Trip and slip hazards increase, so tie-off, clear paths, and edge awareness are more important" },
      { id: "C", text: "It allows removing the harness" },
      { id: "D", text: "It reduces required anchor strength" }
    ],
    answer: "B",
    explanation: "Debris increases trip and slip risk near the edge, raising fall likelihood. Continuous tie-off, good housekeeping, and clear travel paths reduce the chance of a fall during tear-off work.",
    cite: "OSHA 29 CFR 1926.501(b)(10); 3M Protecta Full Line Catalog, jobsite hazard awareness",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-089",
    type: "mcq",
    question: "What is the primary reason to select an SRL over a 6-foot lanyard when a worker will be tied off overhead but has limited clearance below?",
    options: [
      { id: "A", text: "SRLs are always cheaper" },
      { id: "B", text: "The SRL locks quickly and arrests in a shorter distance, fitting the limited clearance" },
      { id: "C", text: "SRLs need no inspection" },
      { id: "D", text: "SRLs allow removing the harness" }
    ],
    answer: "B",
    explanation: "With limited clearance, the SRL's near-immediate lockup and short arrest distance keep the worker from reaching a lower level, whereas a 6-foot lanyard plus absorber deployment may need more clearance than exists.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, clearance advantages",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-090",
    type: "mcq",
    question: "Which of the following is NOT a permitted anchorage evaluation approach under Subpart M?",
    options: [
      { id: "A", text: "An anchorage capable of supporting 5,000 pounds per worker" },
      { id: "B", text: "A system designed by a qualified person with a safety factor of at least two" },
      { id: "C", text: "Guessing the strength based on appearance" },
      { id: "D", text: "Using a manufactured, rated anchorage connector installed per instructions" }
    ],
    answer: "C",
    explanation: "Anchorage adequacy must be established by the 5,000-pound rule, a qualified-person-engineered safety factor of two, or use of a rated, properly installed anchor, never by guessing based on appearance.",
    cite: "OSHA 29 CFR 1926.502(d)(15), anchorage requirements",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-091",
    type: "mcq",
    question: "Which best describes 'competent person' as it relates to fall protection?",
    options: [
      { id: "A", text: "Anyone who has worn a harness once" },
      { id: "B", text: "One capable of identifying hazards and authorized to take prompt corrective action" },
      { id: "C", text: "Only an outside consultant" },
      { id: "D", text: "The equipment manufacturer only" }
    ],
    answer: "B",
    explanation: "A competent person can recognize existing and predictable fall hazards and has authorization to take prompt corrective measures to eliminate them, a key role in program oversight and inspection.",
    cite: "OSHA 29 CFR 1926.32(f), competent person definition",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-092",
    type: "mcq",
    question: "How does a 'qualified person' differ from a 'competent person' in fall protection design?",
    options: [
      { id: "A", text: "They are identical terms" },
      { id: "B", text: "A qualified person has recognized degree/credentials or extensive knowledge to design systems and solve related problems" },
      { id: "C", text: "A qualified person only cleans equipment" },
      { id: "D", text: "A qualified person cannot inspect anything" }
    ],
    answer: "B",
    explanation: "A qualified person, by education, training, or experience, can design fall protection systems (such as horizontal lifelines) and analyze structural/anchorage adequacy, beyond the hazard-recognition role of a competent person.",
    cite: "OSHA 29 CFR 1926.32(m), qualified person definition",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-093",
    type: "mcq",
    question: "A roofer connects an SRL directly overhead but the device housing is mounted so the line rubs a structural corner. What should be done?",
    options: [
      { id: "A", text: "Ignore it since the SRL is overhead" },
      { id: "B", text: "Reposition the anchor or add edge protection so the line does not abrade against the corner" },
      { id: "C", text: "Speed up the work to reduce exposure" },
      { id: "D", text: "Loosen the line to reduce contact" }
    ],
    answer: "B",
    explanation: "Even overhead, a lifeline rubbing a corner can be abraded or cut in a fall. Relocate the anchor or install edge protection so the line runs cleanly without contacting sharp or rough surfaces.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, line routing and edges",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-094",
    type: "mcq",
    question: "What information does a harness capacity label typically communicate that must be respected?",
    options: [
      { id: "A", text: "Only the manufacturer's phone number" },
      { id: "B", text: "The maximum user weight range (including tools) the harness is rated to protect" },
      { id: "C", text: "The recommended paint color" },
      { id: "D", text: "The truck it should be stored in" }
    ],
    answer: "B",
    explanation: "The label lists the rated capacity range (worker plus tools and equipment). Exceeding this range can cause arrest forces beyond design limits, so total weight must stay within the stated capacity.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, capacity labeling",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-095",
    type: "mcq",
    question: "A crew is setting up on a roof with an air conditioning unit rated by an engineer as a certified anchor. What still must be verified before tie-off?",
    options: [
      { id: "A", text: "Only that the unit is powered off" },
      { id: "B", text: "That the certified attachment point is used correctly per the documentation and rated for the number of workers" },
      { id: "C", text: "That the unit is a specific brand" },
      { id: "D", text: "Nothing further is needed ever" }
    ],
    answer: "B",
    explanation: "Even a certified anchor must be used exactly as documented, at the designated attachment point, and within its rated number of attached workers. Misuse can exceed the certified capacity.",
    cite: "OSHA 29 CFR 1926.502(d)(15); 3M Protecta Full Line Catalog, certified anchorage use",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-096",
    type: "mcq",
    question: "Which is a correct statement about using an SRL in a horizontal or leading-edge application if it is NOT edge-rated?",
    options: [
      { id: "A", text: "It is fine as long as it is short" },
      { id: "B", text: "It should not be used; only edge-rated (LE) devices are suitable for leading-edge/foot-level use" },
      { id: "C", text: "It becomes edge-rated by adding tape" },
      { id: "D", text: "Any SRL works over any edge" }
    ],
    answer: "B",
    explanation: "Standard overhead SRLs are not tested for sharp-edge contact or the higher forces of foot-level tie-off. Only edge-rated (LE) devices should be used in those applications.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, application limits",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-097",
    type: "mcq",
    question: "Why should fall protection equipment follow manufacturer inspection and retirement criteria even when no visible damage is present?",
    options: [
      { id: "A", text: "Fashion trends change" },
      { id: "B", text: "Cumulative aging, UV, and wear can degrade materials over time; continued use depends on passing inspections per manufacturer guidance" },
      { id: "C", text: "The color fades" },
      { id: "D", text: "There is no service life limit" }
    ],
    answer: "B",
    explanation: "Synthetic materials degrade with age, UV, and use even when damage is not obvious. Manufacturers tie continued service to pre-use checks and periodic examinations rather than indefinite use.",
    cite: "MSA V-TEC / V-TEC EDGE SRL IFU, Section 6, Maximum product life; 3M Protecta Full Line Catalog, p.641, nylon UV resistance",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-098",
    type: "mcq",
    question: "A worker will perform hot work (welding/torch) while wearing fall protection on a roof. What precaution applies to the PFAS?",
    options: [
      { id: "A", text: "Standard nylon webbing is always fine near flame" },
      { id: "B", text: "Protect webbing from sparks/heat or use equipment rated for hot-work environments" },
      { id: "C", text: "Remove the harness during hot work" },
      { id: "D", text: "Wet the harness with solvent first" }
    ],
    answer: "B",
    explanation: "Sparks, slag, and heat can burn and weaken synthetic webbing. Shield the equipment or use materials/products rated for heat and hot work; never expose standard webbing to flame or hot slag.",
    cite: "MSA Lanyards User Instructions, heat and hot-work warnings",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-099",
    type: "mcq",
    question: "Which post-fall step is required before any part of a used PFAS could ever be considered again?",
    options: [
      { id: "A", text: "Just visually glance at it" },
      { id: "B", text: "Remove it from service immediately; do not return to use until inspected per OSHA and manufacturer requirements" },
      { id: "C", text: "Wash and reissue immediately" },
      { id: "D", text: "Swap the labels" }
    ],
    answer: "B",
    explanation: "OSHA requires immediate removal from service after impact loading. Deployed energy absorbers are typically retired per manufacturer instructions; other components may be cleared for reuse only after competent-person inspection finds no damage.",
    cite: "OSHA 29 CFR 1926.502(d)(19), post-impact removal and inspection",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-100",
    type: "mcq",
    question: "A rescue plan for a suspended worker should prioritize which of the following?",
    options: [
      { id: "A", text: "Waiting until the end of shift" },
      { id: "B", text: "Rapid, safe retrieval to limit suspension time and prevent suspension trauma" },
      { id: "C", text: "Cutting the lifeline immediately" },
      { id: "D", text: "Leaving the worker until authorities arrive with no interim action" }
    ],
    answer: "B",
    explanation: "Because suspension trauma can develop quickly, the plan must enable prompt, safe retrieval, and interim measures (like trauma relief straps) while trained rescuers execute the plan.",
    cite: "OSHA 29 CFR 1926.502(d)(20); Honeywell Miller Fall Protection Catalog, rescue planning",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-101",
    type: "mcq",
    question: "What is a key limitation of relying solely on self-rescue after a fall?",
    options: [
      { id: "A", text: "It is always the fastest method" },
      { id: "B", text: "An injured or unconscious worker may be unable to self-rescue, so a backup rescue capability is needed" },
      { id: "C", text: "Self-rescue never works" },
      { id: "D", text: "It requires no planning" }
    ],
    answer: "B",
    explanation: "Self-rescue assumes the worker is conscious and capable. Since injury or unconsciousness can prevent it, the plan must include assisted/technical rescue so no one is left suspended.",
    cite: "OSHA 29 CFR 1926.502(d)(20), prompt rescue provision",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-102",
    type: "mcq",
    question: "A roofer must transition from a ladder onto a roof at the eave. What is a good practice to maintain protection during the transition?",
    options: [
      { id: "A", text: "Disconnect entirely while transitioning" },
      { id: "B", text: "Use a properly anchored system (e.g., SRL/ladder system) so the worker is connected before, during, and after the transition" },
      { id: "C", text: "Jump onto the roof quickly" },
      { id: "D", text: "Rely on a coworker holding the ladder as the only protection" }
    ],
    answer: "B",
    explanation: "The transition point at the eave is high risk. Plan anchorage and connection so the worker stays continuously protected through the transition rather than disconnecting at the most dangerous moment.",
    cite: "3M Protecta Full Line Catalog, ladder and transition tie-off; OSHA 1926.501",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-103",
    type: "mcq",
    question: "When a worker weighs near the upper end of a lanyard's rated capacity and carries heavy tools, what is the safest choice?",
    options: [
      { id: "A", text: "Ignore the tools in the calculation" },
      { id: "B", text: "Confirm total weight (worker plus tools) is within the device's rated capacity and select equipment accordingly" },
      { id: "C", text: "Use two lanyards on one anchor" },
      { id: "D", text: "Remove the energy absorber" }
    ],
    answer: "B",
    explanation: "Rated capacity includes the worker plus everything carried. If combined weight approaches or exceeds the limit, choose equipment rated for the higher load to keep arrest forces within design values.",
    cite: "MSA Lanyards User Instructions, total weight capacity",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-104",
    type: "mcq",
    question: "Why should snaphooks and carabiners be visually confirmed as fully closed and locked after each connection?",
    options: [
      { id: "A", text: "For appearance only" },
      { id: "B", text: "An unlocked or partially open gate can allow roll-out or disengagement under load" },
      { id: "C", text: "To reduce the weight" },
      { id: "D", text: "It is not necessary to check" }
    ],
    answer: "B",
    explanation: "A gate that is not fully closed and locked can open under load, releasing the connection. A quick visual and tactile check after connecting confirms the keeper is secured.",
    cite: "Honeywell Miller Fall Protection Catalog, connection verification",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-105",
    type: "mcq",
    question: "A low-slope roofing crew uses a warning line combined with a safety monitoring system in permitted circumstances. What is the safety monitor's role?",
    options: [
      { id: "A", text: "To perform other work while occasionally glancing over" },
      { id: "B", text: "To be a competent person who continuously watches and warns workers of fall hazards, with no other duties that distract" },
      { id: "C", text: "To hold the warning line by hand" },
      { id: "D", text: "To operate equipment simultaneously" }
    ],
    answer: "B",
    explanation: "A safety monitor must be a competent person, positioned to see the workers, warning them of hazards, and free of other duties that would distract from monitoring. This method has strict conditions of use.",
    cite: "OSHA 29 CFR 1926.502(h), safety monitoring systems",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-106",
    type: "mcq",
    question: "Which of the following would make an anchorage connector installation on a roof deck non-compliant?",
    options: [
      { id: "A", text: "Installing per the manufacturer's instructions" },
      { id: "B", text: "Attaching to structure verified for the required load" },
      { id: "C", text: "Fastening only into thin sheathing that cannot hold the required load" },
      { id: "D", text: "Using the specified fasteners and locations" }
    ],
    answer: "C",
    explanation: "An anchor is only as strong as what it attaches to. Fastening into thin sheathing or material that cannot carry the required load makes the anchorage inadequate regardless of the connector's own rating.",
    cite: "OSHA 29 CFR 1926.502(d)(15); 3M Protecta Full Line Catalog, structural attachment",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-107",
    type: "mcq",
    question: "A worker will use a twin-leg lanyard to achieve 100% tie-off while moving along roof trusses. What is essential during each move?",
    options: [
      { id: "A", text: "Disconnect both legs to move faster" },
      { id: "B", text: "Always have at least one leg connected to a suitable anchor before disconnecting and relocating the other" },
      { id: "C", text: "Connect both legs to the same weak point" },
      { id: "D", text: "Let both legs hang while walking" }
    ],
    answer: "B",
    explanation: "The purpose of a twin-leg lanyard is continuous protection: one leg stays anchored while the other is moved to the next anchor, so the worker is never unprotected during transitions.",
    cite: "Honeywell Miller Fall Protection Catalog, 100% tie-off procedure",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-108",
    type: "mcq",
    question: "Which factor should be checked to prevent the connected worker from contacting a lower level even when the PFAS functions correctly?",
    options: [
      { id: "A", text: "The color of the anchor" },
      { id: "B", text: "Adequate fall clearance below the work surface" },
      { id: "C", text: "The brand of gloves worn" },
      { id: "D", text: "The time of day" }
    ],
    answer: "B",
    explanation: "Even a correctly functioning system can allow a ground strike if clearance is insufficient. Total fall distance must be less than the available clearance to a lower level.",
    cite: "OSHA 29 CFR 1926.502(d)(16)(iii); MSA Lanyards User Instructions, clearance",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-109",
    type: "mcq",
    question: "When storing an SRL between uses, which practice best preserves its function?",
    options: [
      { id: "A", text: "Leave the lifeline fully extended under tension long-term" },
      { id: "B", text: "Store it clean and dry with the lifeline retracted, protected from moisture and contaminants" },
      { id: "C", text: "Submerge it in water" },
      { id: "D", text: "Store it in direct sun on the roof" }
    ],
    answer: "B",
    explanation: "SRLs should be stored clean, dry, with the line retracted, away from moisture, chemicals, and heat. Leaving the line extended under tension or exposing it to the elements can harm the mechanism.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, storage",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-110",
    type: "mcq",
    question: "A roofing foreman is choosing fall protection for repetitive short moves near a fixed overhead beam. Which combination minimizes fall distance and swing?",
    options: [
      { id: "A", text: "A long lanyard anchored far to the side" },
      { id: "B", text: "An overhead SRL anchored as directly above the work as practical" },
      { id: "C", text: "A body belt with rope" },
      { id: "D", text: "No tie-off since moves are short" }
    ],
    answer: "B",
    explanation: "An SRL anchored directly overhead minimizes both free fall and swing fall, arresting quickly in the shortest distance, which is ideal for repetitive short moves under a fixed beam.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, overhead anchor best practice",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-111",
    type: "mcq",
    question: "During inspection, a lanyard's snaphook keeper spring is weak and the gate does not snap fully shut. What action is required?",
    options: [
      { id: "A", text: "Continue using with careful handling" },
      { id: "B", text: "Remove the lanyard from service; a faulty keeper allows roll-out" },
      { id: "C", text: "Tape the gate closed" },
      { id: "D", text: "Bend the gate by hand to fit" }
    ],
    answer: "B",
    explanation: "A keeper that does not close and lock reliably can allow roll-out and disconnection. This is a critical defect requiring removal from service until repaired or replaced.",
    cite: "Honeywell Miller Fall Protection Catalog, snaphook inspection",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-112",
    type: "mcq",
    question: "What is the best description of 'total fall distance' in a PFAS calculation?",
    options: [
      { id: "A", text: "Only the free fall portion" },
      { id: "B", text: "The sum of free fall, deceleration/absorber deployment, harness stretch, and the distance from D-ring to feet, plus a safety margin" },
      { id: "C", text: "The length of the anchor strap only" },
      { id: "D", text: "The height of the building" }
    ],
    answer: "B",
    explanation: "Total fall distance is the full vertical travel from start of fall until the worker fully stops, combining free fall, deceleration, harness stretch, and body position, with a safety margin added.",
    cite: "3M Protecta Full Line Catalog, total fall distance components",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-113",
    type: "mcq",
    question: "A newly hired roofer has never worn a harness. Before working at height, what must the employer ensure?",
    options: [
      { id: "A", text: "Nothing; on-the-job trial is enough" },
      { id: "B", text: "The worker is trained to recognize fall hazards and to correctly use the fall protection systems provided" },
      { id: "C", text: "The worker signs a waiver only" },
      { id: "D", text: "The worker buys their own equipment" }
    ],
    answer: "B",
    explanation: "OSHA requires a training program so each exposed worker can recognize fall hazards and knows the procedures to minimize them, including correct use, inspection, and limitations of the systems used.",
    cite: "OSHA 29 CFR 1926.503, training requirements",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-114",
    type: "mcq",
    question: "When must fall protection training be retrained (refreshed) under Subpart M?",
    options: [
      { id: "A", text: "Never once completed" },
      { id: "B", text: "When there are changes in the workplace, equipment, or the worker shows inadequate understanding" },
      { id: "C", text: "Only every ten years" },
      { id: "D", text: "Only if OSHA visits" }
    ],
    answer: "B",
    explanation: "Retraining is required when workplace or equipment changes render prior training obsolete, or when a worker's actions show they do not have the required understanding and skill.",
    cite: "OSHA 29 CFR 1926.503(c), retraining",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-115",
    type: "mcq",
    question: "A crew finds an SRL that was dropped from height onto concrete. Even if it looks fine, what is the prudent action?",
    options: [
      { id: "A", text: "Use it immediately" },
      { id: "B", text: "Perform a thorough inspection/function check and follow manufacturer guidance, removing it from service if any doubt exists" },
      { id: "C", text: "Shake it and keep working" },
      { id: "D", text: "Repaint the housing and use it" }
    ],
    answer: "B",
    explanation: "A hard impact can damage internal braking components invisibly. Inspect and function-test per the manual, and when in doubt about integrity, remove it from service for authorized evaluation.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions, after impact/drop inspection",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-116",
    type: "mcq",
    question: "Why is it important that the dorsal D-ring stays centered between the shoulder blades during work?",
    options: [
      { id: "A", text: "For appearance" },
      { id: "B", text: "Correct D-ring position keeps the worker upright after arrest and directs forces along the spine" },
      { id: "C", text: "It reduces harness weight" },
      { id: "D", text: "It only matters for positioning" }
    ],
    answer: "B",
    explanation: "A centered dorsal D-ring ensures the worker is arrested in a head-up, spine-aligned orientation, reducing injury and helping keep the airway clear while awaiting rescue.",
    cite: "DBI-SALA Delta Full Body Harness User Manual, D-ring positioning",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-117",
    type: "mcq",
    question: "A worker plans to anchor an SRL to a guardrail rail for convenience. Why is this generally not acceptable?",
    options: [
      { id: "A", text: "Guardrails are too high" },
      { id: "B", text: "A standard guardrail is not designed or rated as a PFAS anchorage and could fail under arrest loads" },
      { id: "C", text: "The color clashes" },
      { id: "D", text: "It is actually always acceptable" }
    ],
    answer: "B",
    explanation: "OSHA prohibits attaching PFAS to guardrail systems. Guardrails are designed to resist a 200-pound outward force, not dynamic fall-arrest loads. Use a rated anchorage instead.",
    cite: "OSHA 29 CFR 1926.502(d)(23); 1926.502(b)(3), guardrail load capacity",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-118",
    type: "mcq",
    question: "Which practice best reduces swing-fall injury potential when an anchor cannot be placed directly overhead?",
    options: [
      { id: "A", text: "Work as far to the side of the anchor as possible" },
      { id: "B", text: "Limit horizontal movement from the anchor and clear the swing path of obstructions" },
      { id: "C", text: "Use the longest lanyard available" },
      { id: "D", text: "Remove the energy absorber" }
    ],
    answer: "B",
    explanation: "Keeping horizontal offset small reduces pendulum severity, and clearing the swing path prevents striking obstructions. Where offset is unavoidable, use equipment and rigging designed to manage swing fall.",
    cite: "MSA V-TEC / V-TEC EDGE SRL User Instructions; 3M Protecta Full Line Catalog, swing fall mitigation",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-119",
    type: "mcq",
    question: "A supervisor is documenting the site fall protection program for a re-roof. Which combination reflects a complete PFAS program element set?",
    options: [
      { id: "A", text: "Only buying harnesses" },
      { id: "B", text: "Hazard assessment, compliant equipment selection, anchorage evaluation, training, inspection, and a rescue plan" },
      { id: "C", text: "Just posting a warning sign" },
      { id: "D", text: "Only an annual inspection" }
    ],
    answer: "B",
    explanation: "A robust program covers assessing hazards, selecting compliant equipment, verifying anchorages, training workers, inspecting equipment, and planning prompt rescue, integrating the requirements of Subpart M and manufacturer guidance.",
    cite: "OSHA 29 CFR 1926.501-.503; 3M Protecta Full Line Catalog, managed fall protection program",
    exhibitImage: "",
    imageRef: ""
  },
  {
    id: "PFAS-120",
    type: "mcq",
    question: "A roofer completes a re-roof and stows equipment in the company trailer. Which storage condition best protects the harnesses and SRLs for the next job?",
    options: [
      { id: "A", text: "Piled on the trailer floor with solvents and fuel" },
      { id: "B", text: "Hung clean and dry in a ventilated, shaded area away from chemicals, sharp objects, and heat sources" },
      { id: "C", text: "Left outside exposed to sun and rain" },
      { id: "D", text: "Wrapped tightly in a sealed plastic bag while wet" }
    ],
    answer: "B",
    explanation: "Proper storage hangs equipment clean and dry in a cool, shaded, ventilated space away from chemicals, sharp objects, and heat, preserving material strength and extending service life for the next use.",
    cite: "MSA Lanyards IFU, Section 9 Care, Maintenance and Storage; MSA V-TEC / V-TEC EDGE SRL IFU, Section 7, Cleaning and Storage",
    exhibitImage: "",
    imageRef: ""
  }
]};

const PFAS_QUESTION_BANK_2026 = {
  ...PFAS_QUESTION_BANK_2026_RAW,
  questions: PFAS_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = PFAS_QUESTION_BANK_2026;
