// Polyglass Technical Guide - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: 2023-Technical-Guide_web.pdf
// Authoring target: 50 technical guide questions grounded in source text.


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

const POLYGLASS_TECHNICAL_GUIDE_QUESTION_BANK_2026_RAW = {
  book: "Polyglass Technical Guide",
  questions: [
    {
      id: "PGTECH-001",
      type: "mcq",
      question: "A contractor must install Polyglass modified bitumen on a commercial roof when the ambient temperature is 38°F with moderate wind. Per the Technical Guide, what is Polyglass's general position on cold-weather installation and what minimum roll temperature must be maintained at application?",
      options: [
        { id: "A", text: "Installation is unrestricted below 32°F; rolls may be applied directly from an unheated trailer" },
        { id: "B", text: "Polyglass advises against installing below 40°F–45°F where practicable; membrane rolls must be at least 40°F at application" },
        { id: "C", text: "Cold weather work is prohibited unless ambient exceeds 55°F; rolls must be pre-heated to 100°F" },
        { id: "D", text: "Only self-adhered membranes may be used below 45°F; torch-applied rolls need no minimum temperature" }
      ],
      answer: "B",
      explanation: "The guide advises against installing modified bitumen at temperatures lower than 40°F–45°F wherever practicable. When work is unavoidable, extra care is required for bonding, and rolls must be at least 40°F at application. Stiff or difficult-to-install rolls should be replaced with material from a temperature-controlled storage area.",
      cite: "2023-Technical-Guide_web.pdf - Page 27",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-002",
      type: "mcq",
      question: "During a winter project, a foreman unrolls SA membrane directly from an outdoor pallet at 35°F ambient. The center of the roll near the core remains colder longer. What does the Polyglass Technical Guide recommend regarding unrolling cold materials?",
      options: [
        { id: "A", text: "Unroll immediately to acclimate; core temperature differences are negligible" },
        { id: "B", text: "Avoid unrolling under very low ambient conditions to prevent stress cracking; store rolls at 55°F–60°F until immediately prior to installation" },
        { id: "C", text: "Heat the entire roll with an open flame before unrolling to equalize core temperature" },
        { id: "D", text: "Unroll only the outer two wraps and discard the core material regardless of condition" }
      ],
      answer: "B",
      explanation: "Unrolling cold materials under very low ambient conditions must be avoided to prevent stress cracking. The center of the roll near the core stays colder longer below 40°F, increasing crack risk. Membrane should be stored at 55°F–60°F and installed before material temperature drops below 40°F–45°F after removal from controlled storage.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-003",
      type: "mcq",
      question: "A project in Minnesota requires self-adhered modified bitumen installation with ambient temperatures ranging from 28°F to 55°F. Which Polyglass products does the guide specify for cold-weather self-adhered application between 25°F and 60°F?",
      options: [
        { id: "A", text: "Any standard SA cap sheet with generic primer" },
        { id: "B", text: "Elastoflex SA V Polar Base and Elastoflex SA P Polar Cap ADESO self-adhered membranes" },
        { id: "C", text: "Polyflex G heat-welded cap only, without a base sheet" },
        { id: "D", text: "Cold-applied cement over organic saturated felts" }
      ],
      answer: "B",
      explanation: "For self-adhered application between 25°F and 60°F, the guide directs use of Elastoflex SA V Polar Base and Elastoflex SA P Polar Cap ADESO self-adhered membranes designed for cold weather. Standard SA products without Polar designation are not the specified cold-weather solution.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-004",
      type: "mcq",
      question: "A heat-welding crew works on a windy rooftop at 42°F. Welding quality is inconsistent at laps. What cold-weather practice does the Technical Guide recommend for heat-welded application?",
      options: [
        { id: "A", text: "Increase torch flame length to compensate for wind chill without shields" },
        { id: "B", text: "Use shielded dragon-wagons or movable flame-resistant wind shields to keep surfaces and materials suitably warm" },
        { id: "C", text: "Switch to cold process adhesive without surface temperature controls" },
        { id: "D", text: "Discontinue all welding and mechanically attach cap sheets only" }
      ],
      answer: "B",
      explanation: "For heat-welded application in unfavorable conditions, shielded dragon-wagons or movable flame-resistant wind shields help maintain suitably warm temperatures on all surfaces and materials during welding. Wind chill affects effective application temperature and must be accounted for.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-005",
      type: "mcq",
      question: "Cold process adhesive application is planned at 45°F ambient with high humidity. The adhesive is becoming viscous and difficult to spread. What does the guide require before proceeding?",
      options: [
        { id: "A", text: "Thin the adhesive with reclaimed solvents to improve flow" },
        { id: "B", text: "Take extra care to apply at the proper rate, avoid condensation at the adhesive-membrane interface, and do not proceed if inclement weather threatens" },
        { id: "C", text: "Heat the adhesive container with an open flame until it reaches 200°F" },
        { id: "D", text: "Apply over damp substrates to improve adhesion in cold weather" }
      ],
      answer: "B",
      explanation: "Below 50°F, cold process adhesives may become increasingly viscous. Extra care is needed to ensure proper application rate and to avoid humidity conditions conducive to condensation at the adhesive-membrane interface. Product-specific bulletins should be consulted, and application must not proceed if inclement weather threatens.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-006",
      type: "mcq",
      question: "A hot-mop crew is mopping base sheet in 40°F ambient weather. Asphalt in the mop bucket is reading 390°F at the point of application. What action does the Polyglass Technical Guide require?",
      options: [
        { id: "A", text: "Continue mopping but reduce the lead distance to 15 feet in front of the roll" },
        { id: "B", text: "Overheat the kettle to 500°F to compensate for cold weather heat loss" },
        { id: "C", text: "Discontinue work because minimum asphalt temperature of 400°F cannot be maintained at the point of application" },
        { id: "D", text: "Add cold process adhesive to the asphalt to lower viscosity" }
      ],
      answer: "C",
      explanation: "For mop-applied membranes, asphalt must be at least 400°F (target 425°F) or 20°F above EVT, whichever is higher, at the point of application. If 400°F cannot be maintained at the point of application, work should be discontinued. The guide explicitly states never to overheat asphalt to compensate for cold weather.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-007",
      type: "mcq",
      question: "During a cold-weather hot mop project, the kettle operator proposes raising asphalt temperature above normal operating limits because asphalt cools quickly once removed from the heat source. What does the guide state about this practice?",
      options: [
        { id: "A", text: "Overheating is acceptable when ambient is below 45°F" },
        { id: "B", text: "Never overheat asphalt to compensate for cold weather conditions" },
        { id: "C", text: "Overheating is required to achieve EVT plus 40°F in winter" },
        { id: "D", text: "Overheating is permitted only for cap sheets, not base sheets" }
      ],
      answer: "B",
      explanation: "Asphalt cools and thickens quickly once removed from the heat source and will not flow well in cold weather. While insulated equipment and minimum 400°F at the point of application are required, the guide explicitly prohibits overheating asphalt to compensate for cold weather conditions.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-008",
      type: "mcq",
      question: "A mop applicator is advancing 12 feet ahead of the roll being set in cold weather. What maximum mop lead distance does the Technical Guide allow for hot mop application in cold conditions?",
      options: [
        { id: "A", text: "3 feet maximum" },
        { id: "B", text: "5 feet–7 feet maximum" },
        { id: "C", text: "15 feet maximum" },
        { id: "D", text: "No limit if asphalt is above 400°F at the kettle" }
      ],
      answer: "B",
      explanation: "In cold weather hot mop application, mopping should not progress more than 5'–7' in front of the roll at any time. This limits asphalt cooling before the membrane is embedded, helping maintain adequate bond when ambient temperatures accelerate heat loss.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-009",
      type: "mcq",
      question: "Prior to applying a new Polyglass roof, the GC schedules masonry and HVAC curb work to occur after the membrane is complete. The roofing contractor objects based on Technical Guide substrate preparation requirements. Who is responsible for substrate preparation, and what protection is required?",
      options: [
        { id: "A", text: "Polyglass Technical Services prepares all substrates; no trade protection is needed" },
        { id: "B", text: "The installing contractor and/or building owner are responsible; finished roofs require protection such as plywood or tarps when other trades will access the roof" },
        { id: "C", text: "The architect alone is responsible; membrane manufacturers provide daily trade supervision" },
        { id: "D", text: "Other trades may work on the finished membrane without protection if they use walkway pads only at access points" }
      ],
      answer: "B",
      explanation: "Proper substrate preparation relies on the installing contractor and/or building owner. When possible, other trades should complete work before the finished roof. When traffic from others is expected on a completed roof, protection with plywood, tarps, insulation, or other sheathing is required.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-010",
      type: "mcq",
      question: "A tear-off project reveals an existing deck contaminated with asphalt and adhesive residue. The contractor plans to adhere new rigid insulation directly without testing. What does the guide require for re-roof substrate conditions?",
      options: [
        { id: "A", text: "Contaminated decks always require complete deck replacement" },
        { id: "B", text: "Adhesion testing must be conducted to ensure proper bond when adhering insulation or cover boards to contaminated surfaces" },
        { id: "C", text: "Mechanical attachment is prohibited on any contaminated deck" },
        { id: "D", text: "A single-ply TPO overlay is acceptable preparation for modified bitumen" }
      ],
      answer: "B",
      explanation: "Existing decks may be contaminated with asphalt or adhesives from prior systems. When adhering rigid insulation boards or cover boards to such surfaces, adhesion testing must be conducted to ensure a proper and efficient bond of new materials. Surfaces must also be clean and primed when necessary.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-011",
      type: "mcq",
      question: "Before starting roof construction, the estimator notes several rooftop units that will be abandoned. What substrate preparation step does the Technical Guide require regarding rooftop units and penetrations?",
      options: [
        { id: "A", text: "Abandoned units may remain and be flashed in place with PolyFlash 1C only" },
        { id: "B", text: "All rooftop units, supports, and penetrations to be removed should be removed prior to roof construction" },
        { id: "C", text: "Units may remain if they are more than 24 inches from new flashings" },
        { id: "D", text: "Only curbed equipment must be removed; pipe penetrations may be left sealed with tape" }
      ],
      answer: "B",
      explanation: "All rooftop units, supports, and penetrations that are to be removed should be removed prior to roof construction. Attention to termination heights, penetration heights, and membrane flashing heights should also be given before construction to ensure proper clearance for the new roofing assembly.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-012",
      type: "mcq",
      question: "A re-roof crew finishes work at 4:00 PM with an open membrane edge at a temporary tie-in. The next workday begins with full installation. What does the guide require for daily tie-ins during roofing assembly construction?",
      options: [
        { id: "A", text: "Temporary tie-ins may remain indefinitely if sealed with duct tape" },
        { id: "B", text: "Temporary water cut-offs and tie-ins must be provided at each workday end, then removed and properly prepared at the start of the next workday" },
        { id: "C", text: "Tie-ins are only required on warranted projects" },
        { id: "D", text: "Open edges are acceptable overnight if ambient stays above 50°F" }
      ],
      answer: "B",
      explanation: "During construction, temporary water cut-offs and tie-ins must be provided at the conclusion of each workday. Those temporary materials must be removed and the area properly prepared at the beginning of roof construction the following workday. This applies to new, re-roof, and re-cover applications.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-013",
      type: "mcq",
      question: "A structural steel deck building has a dead-level roof with interior drains. Water remains in several low areas 72 hours after a rain event. How does the Polyglass Technical Guide define ponding and what warranty implication applies?",
      options: [
        { id: "A", text: "Ponding is water present for more than 24 hours; it is covered if drains are cleaned annually" },
        { id: "B", text: "Ponding is water not dissipated within 48 hours per NRCA; ponding negatively affects the membrane and is not covered by Polyglass warranties" },
        { id: "C", text: "Ponding applies only to slopes less than 1/8 inch per foot and is always a deck designer's warranty item" },
        { id: "D", text: "Ponding is excluded only when water exceeds 2 inches deep regardless of duration" }
      ],
      answer: "B",
      explanation: "The guide adopts the NRCA definition of ponding as water that has not dissipated from the roof within 48 hours. Ponding water negatively affects the membrane, can cause premature deterioration, and is not covered by Polyglass warranties. Adequate drainage with minimum 1/4 inch per foot slope is required.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-014",
      type: "mcq",
      question: "An architect specifies a new low-slope roof over a structural deck built without adequate slope to drain. What corrective measure does the Technical Guide require?",
      options: [
        { id: "A", text: "Install a crickets-only layout without changing insulation thickness" },
        { id: "B", text: "Use tapered insulation to provide adequate slope and drainage when the deck lacks proper slope" },
        { id: "C", text: "Accept zero slope if primary drains are oversized" },
        { id: "D", text: "Add a flood coat of asphalt to create positive drainage" }
      ],
      answer: "B",
      explanation: "The ideal structural deck provides adequate slope and drainage. When the deck has not been constructed to provide proper slope and drainage, tapered insulation is required. Tapered insulation should also be installed around drains and penetrations to promote drainage.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-015",
      type: "mcq",
      question: "A roof design includes one primary drain for a 40,000 SF warehouse roof with a single slope. Who is responsible for verifying that drain number, diameter, and placement provide adequate drainage per the Technical Guide?",
      options: [
        { id: "A", text: "The Polyglass membrane manufacturer during warranty registration" },
        { id: "B", text: "The design professional; drainage must meet codes and industry recommendations" },
        { id: "C", text: "The installing contractor exclusively, without design professional involvement" },
        { id: "D", text: "FM Global during the roof observation visit only" }
      ],
      answer: "B",
      explanation: "Primary and secondary drains must be of sufficient number and diameter and located to drain the entire roof surface. The adequacy of drainage provisions, placement, sizing, and number of drains is the responsibility of the design professional, and drainage conditions should meet code and industry requirements.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-016",
      type: "mcq",
      question: "An expansion joint curb is located directly upslope of a primary drain, potentially blocking flow. What does the guide require regarding expansion joint placement relative to drainage?",
      options: [
        { id: "A", text: "Expansion joints may block drainage if secondary scuppers are present" },
        { id: "B", text: "Expansion joints must be located so typical drainage flow is not blocked" },
        { id: "C", text: "Expansion joints must terminate 10 feet short of the roof edge to allow drainage bypass" },
        { id: "D", text: "Drainage concerns apply only to area dividers, not expansion joints" }
      ],
      answer: "B",
      explanation: "Expansion joints are part of the building and must be extended a minimum of 8 inches above the roof surface on curbs, but they must also be located so that typical drainage flow is not blocked. Expansion joints are continuous along the structural break and shall not terminate short of the roof deck end.",
      cite: "2023-Technical-Guide_web.pdf - Page 30",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-017",
      type: "mcq",
      question: "A new cold-storage warehouse with high interior relative humidity is being designed. The contractor asks Polyglass whether a vapor retarder is required. What does the Technical Guide state about vapor retarder decisions?",
      options: [
        { id: "A", text: "Polyglass requires a vapor retarder on all modified bitumen systems" },
        { id: "B", text: "The necessity, type, location, and method of application are the responsibility of the design professional and should be reviewed with the building owner" },
        { id: "C", text: "Vapor retarders are prohibited over polyisocyanurate insulation" },
        { id: "D", text: "Vapor retarders are only required on re-cover projects, never new construction" }
      ],
      answer: "B",
      explanation: "Vapor retarders may be required when high interior relative humidity is present, such as in food processing, pools, paper mills, or laundry facilities. However, the necessity for use, along with type, location, and method of application, is the responsibility of the design professional and should be reviewed and approved by the building owner.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-018",
      type: "mcq",
      question: "A re-cover project over an occupied swimming pool building may alter existing vapor flow paths. What design analysis does the Polyglass Technical Guide recommend during initial project design and re-roof/re-cover evaluation?",
      options: [
        { id: "A", text: "No vapor analysis is needed if the existing roof is dry to the touch" },
        { id: "B", text: "An analysis of dew point and vapor flow should be assessed for the building and for re-roofing/re-cover applications" },
        { id: "C", text: "Only ASHRAE may perform vapor analysis; contractors may not reference it" },
        { id: "D", text: "Vapor retarders automatically become unnecessary when adding insulation in a re-cover" }
      ],
      answer: "B",
      explanation: "Adequate moisture vapor control is recommended because lack thereof may allow moisture accumulation in the roofing assembly. Dew point and vapor flow should be assessed during initial project design and for re-roofing and re-cover applications because they can alter existing vapor flow. NRCA and ASHRAE may be referenced for recommendations.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-019",
      type: "mcq",
      question: "A project team refers to the vapor retarder as a 'temporary roof' during phased construction discussions. How does the Technical Guide characterize vapor retarders in that context?",
      options: [
        { id: "A", text: "Vapor retarders may never serve any temporary waterproofing function" },
        { id: "B", text: "Vapor retarders are sometimes referred to as temporary or secondary roofs" },
        { id: "C", text: "Temporary roofs must always be single-ply TPO regardless of vapor control needs" },
        { id: "D", text: "Temporary roofs and vapor retarders are interchangeable terms for SA base sheets" }
      ],
      answer: "B",
      explanation: "The guide notes that vapor retarders are sometimes referred to as temporary or secondary roofs. This is distinct from phased construction temporary roofing recommendations, but the terminology appears in vapor retarder discussions and should be understood in design conversations.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-020",
      type: "mcq",
      question: "A structural engineer questions whether wood nailers at the parapet are part of the roofing assembly or the structure. How does the Polyglass Technical Guide classify wood nailers?",
      options: [
        { id: "A", text: "Wood nailers are a membrane flashing component supplied by Polyglass" },
        { id: "B", text: "Wood nailers and blocking are deemed components of the structure, though critical to roof performance" },
        { id: "C", text: "Wood nailers are optional on all FM-approved assemblies" },
        { id: "D", text: "Wood nailers are only required on wood deck buildings" }
      ],
      answer: "B",
      explanation: "Wood nailers and blocking materials are deemed components of the structure, not the roofing assembly. However, wood nailers are critical to the success of a well-performing roof. Proper lumber selection is important for corrosion resistance compatibility with fasteners.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-021",
      type: "mcq",
      question: "A contractor installs parapet nailers without referencing edge metal standards. Which documents does the Technical Guide direct installers to reference for nailer installation and wind resistance at perimeter conditions?",
      options: [
        { id: "A", text: "Only Polyglass product labels" },
        { id: "B", text: "FM LPDS 1-49 Perimeter Flashing and ANSI/SPRI ES-1 for edge metal and parapet top conditions" },
        { id: "C", text: "ASTM D4263 only" },
        { id: "D", text: "NRCA HARK manual exclusively, without FM or SPRI references" }
      ],
      answer: "B",
      explanation: "All nailers should be installed per FM LPDS 1-49 Perimeter Flashing. ANSI/SPRI ES-1 should also be referenced for edge metal and parapet wall top conditions to ensure nailer materials and attachment resist calculated wind loads.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-022",
      type: "mcq",
      question: "During a re-cover project, existing parapet flashings are too low for new insulation thickness. What re-cover preparation step does the guide address for nailers?",
      options: [
        { id: "A", text: "Existing nailers may never be modified during re-cover" },
        { id: "B", text: "Install new wood nailers as necessary to accommodate insulation/recovery board or new nailing patterns" },
        { id: "C", text: "Nailers are eliminated when using self-adhered cap sheets" },
        { id: "D", text: "Only steel edge angles may replace wood nailers on re-cover" }
      ],
      answer: "B",
      explanation: "Re-cover preparation includes installing new wood nailers as necessary to accommodate insulation or recovery board thickness and new nailing patterns. Adequate clearance for new or existing curbs, counterflashing, and walls must also be established before re-cover proceeds.",
      cite: "2023-Technical-Guide_web.pdf - Page 37",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-023",
      type: "mcq",
      question: "A heat-welded flashing assembly is being detailed at a parapet wall intersection. Which cant strip material does the Polyglass Technical Guide require for heat-welded flashing assemblies?",
      options: [
        { id: "A", text: "Wood cant strip primed for all applications" },
        { id: "B", text: "Perlite conforming to ASTM C728 only" },
        { id: "C", text: "Wood fiber conforming to ASTM C208 only" },
        { id: "D", text: "Expanded polystyrene cant strips" }
      ],
      answer: "B",
      explanation: "Cant strips are required at all horizontal/vertical intersections. For heat-welded flashing assemblies, perlite conforming to ASTM C728 is required. Hot asphalt systems may use perlite or wood fiber per ASTM C208, while self-adhered flashing applications are recommended to include primed wood cant strip.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-024",
      type: "mcq",
      question: "A self-adhered modified bitumen system is being installed at a curb transition. What cant strip material does the guide recommend for self-adhered flashing applications?",
      options: [
        { id: "A", text: "Perlite only, never wood" },
        { id: "B", text: "Wood cant strip, primed" },
        { id: "C", text: "No cant strip; use membrane only with 12-inch height" },
        { id: "D", text: "Cellular glass cant strips" }
      ],
      answer: "B",
      explanation: "Cant strip material depends on application method. Self-adhered flashing applications are recommended to include wood cant strip that is primed. Heat-welded assemblies require perlite only, while hot asphalt systems may use perlite or wood fiber.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-025",
      type: "mcq",
      question: "A project designer proposes eliminating cant strips and relying on membrane folding alone at a wall intersection. What alternative does the Technical Guide allow for assemblies without cant strips?",
      options: [
        { id: "A", text: "No alternative; cant strips are optional on all systems" },
        { id: "B", text: "Use PolyFlash 1C One Part Flashing Compound with reinforcement at the horizontal/vertical transition, contacting Technical Services for details" },
        { id: "C", text: "Use generic silicone sealant without reinforcement" },
        { id: "D", text: "Extend field membrane vertically without reinforcement to 36 inches" }
      ],
      answer: "B",
      explanation: "Roofing assemblies that do not include a cant must incorporate PolyFlash 1C One Part Flashing Compound with reinforcement at the horizontal and vertical transition. Polyglass Technical Services should be contacted for application details when this approach is used.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-026",
      type: "mcq",
      question: "A field inspector asks how many plies of membrane are required at flashing locations on a typical Polyglass modified bitumen assembly. What does the guide specify?",
      options: [
        { id: "A", text: "One ply only, matching the field sheet" },
        { id: "B", text: "Two plies of membrane at flashing locations, which may use the same products as the overall assembly" },
        { id: "C", text: "Three plies minimum at every penetration regardless of system type" },
        { id: "D", text: "Flashing plies are optional when using SA cap sheets" }
      ],
      answer: "B",
      explanation: "Membrane flashings entail installation of two plies of membrane at flashing locations. The products used for flashings may be the same plies used for the overall roofing assembly. Proper installation at these volatile locations is critical to assembly integrity.",
      cite: "2023-Technical-Guide_web.pdf - Page 30",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-027",
      type: "mcq",
      question: "A curb flashing is being installed 6 inches above the roof deck surface on a new building. Does this meet Polyglass membrane flashing height requirements?",
      options: [
        { id: "A", text: "Yes; 6 inches exceeds typical code minimums" },
        { id: "B", text: "No; minimum flashing height is 8 inches above the deck" },
        { id: "C", text: "Yes, if counterflashing extends 24 inches above the deck" },
        { id: "D", text: "No; minimum flashing height is 12 inches above the deck" }
      ],
      answer: "B",
      explanation: "Minimum flashing height is 8 inches above the deck. Maximum flashing height is 24 inches unless terminated every 24 inches when taller flashings are required. Base flashings must be mechanically fastened at the top edge and terminated with a proper termination bar and counterflashing.",
      cite: "2023-Technical-Guide_web.pdf - Page 30",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-028",
      type: "mcq",
      question: "A designer needs 30 inches of continuous membrane flashing up a parapet wall without intermediate terminations. What does the Technical Guide allow?",
      options: [
        { id: "A", text: "30-inch continuous membrane flashing is standard practice" },
        { id: "B", text: "Membrane flashing may be taller than 24 inches only when terminated at every 24 inches" },
        { id: "C", text: "Membrane flashings may never exceed 8 inches in height" },
        { id: "D", text: "Height limits apply only to liquid flashing, not membrane flashings" }
      ],
      answer: "B",
      explanation: "Maximum flashing height is 24 inches above the deck. Membrane flashing can be taller than 24 inches only when terminated at every 24 inches. This controls stress and termination detailing at vertical transitions.",
      cite: "2023-Technical-Guide_web.pdf - Page 30",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-029",
      type: "mcq",
      question: "A re-roof project leaves existing base flashings in place to save labor. What does the guide require regarding existing membrane flashings during re-cover preparation?",
      options: [
        { id: "A", text: "Existing membrane flashings may remain if they are less than 5 years old" },
        { id: "B", text: "All membrane flashings of the existing system must be removed and replaced" },
        { id: "C", text: "Only drain flashings must be replaced; parapet flashings may remain" },
        { id: "D", text: "Existing flashings may remain when an IR moisture scan is clean" }
      ],
      answer: "B",
      explanation: "For re-cover applications, all membrane flashings of the existing system must be removed and replaced. Re-cover preparation also requires removing existing flashings from curbs and parapets down to the roof surface and removing flashings at drains and penetrations.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-030",
      type: "mcq",
      question: "An irregular-shaped penetration sits too close to a wall for standard membrane flashing. What alternative treatment does the Technical Guide identify?",
      options: [
        { id: "A", text: "Omit flashing and rely on pitch pans only" },
        { id: "B", text: "PolyFlash 1C and PolyBrite Polyester Fabric in three-course fashion, with Technical Services consultation" },
        { id: "C", text: "Extend single-ply TPO boot over the modified bitumen" },
        { id: "D", text: "Use uncured EPDM tape without primer" }
      ],
      answer: "B",
      explanation: "Flashing locations with irregular penetrations, low clearance heights, or items too close for proper membrane flashing may be treated with PolyFlash 1C and PolyBrite Polyester Fabric in three-course fashion. Technical Services should be contacted for more information on these applications.",
      cite: "2023-Technical-Guide_web.pdf - Page 30",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-031",
      type: "mcq",
      question: "An owner wants to re-cover an existing built-up roof without tear-off. A moisture survey indicates 22% moisture content in multiple insulation areas. What does the Polyglass Technical Guide state about re-cover suitability?",
      options: [
        { id: "A", text: "Re-cover is acceptable if wet areas are isolated with one-way vents only" },
        { id: "B", text: "Existing systems with 20%–25% moisture content are not suitable for re-cover and should be torn off" },
        { id: "C", text: "Moisture content is irrelevant if a new cap sheet is self-adhered" },
        { id: "D", text: "Re-cover is acceptable when moisture is below 40%" }
      ],
      answer: "B",
      explanation: "The substrate must be free of excessive moisture for re-cover. Existing roofing systems containing 20%–25% moisture content are not suitable candidates for re-cover and should be torn off. Moisture surveys are highly recommended, and Polyglass may require moisture scans on longer-term warranted projects.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-032",
      type: "mcq",
      question: "A building owner asks Polyglass to determine whether an existing roof is structurally suitable for re-cover. Who does the Technical Guide assign responsibility for re-cover suitability determination?",
      options: [
        { id: "A", text: "Polyglass Technical Services performs all structural re-cover evaluations" },
        { id: "B", text: "The architect, engineer, contractor, or building owner; Polyglass does not practice engineering" },
        { id: "C", text: "The membrane manufacturer automatically approves re-cover when existing membrane is smooth" },
        { id: "D", text: "Only FM Global may approve re-cover applications" }
      ],
      answer: "B",
      explanation: "Re-cover suitability is the responsibility of the architect, engineer, contractor, or building owner. A design professional or licensed engineer is highly recommended to evaluate added weight impacts. Polyglass explicitly states it does not practice engineering and does not perform design or engineering.",
      cite: "2023-Technical-Guide_web.pdf - Page 28",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-033",
      type: "mcq",
      question: "A re-cover project involves an existing ventilated system requiring moisture relief. What venting provision does the guide specify for systems requiring one-way moisture relief vents?",
      options: [
        { id: "A", text: "One vent per 5,000 SF of roof area" },
        { id: "B", text: "One vent per 1,000 SF or 10 squares" },
        { id: "C", text: "Vents are prohibited on re-cover assemblies" },
        { id: "D", text: "Vents only at perimeter, one per 100 linear feet" }
      ],
      answer: "B",
      explanation: "Systems requiring one-way moisture relief vents must have vents installed at one per 1,000 square feet or 10 squares. If existing membranes require ventilation, the existing system may need to be cut in 10' x 10' areas as part of preparation.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-034",
      type: "mcq",
      question: "Before re-covering, the contractor finds a coal tar pitch existing roof. What special consideration does the Polyglass Technical Guide identify?",
      options: [
        { id: "A", text: "Coal tar pitch roofs are ideal re-cover candidates without preparation" },
        { id: "B", text: "Coal tar pitch systems typically require extensive re-cover attention; contact Technical Services" },
        { id: "C", text: "Coal tar pitch must always be covered with self-adhered TPO first" },
        { id: "D", text: "Coal tar pitch roofs require no recovery board" }
      ],
      answer: "B",
      explanation: "Coal tar pitch roof systems are typically an extensive re-cover and require particular attention. Re-roofing over coal tar pitch generally requires a mechanically attached recovery board or insulation and a base sheet prior to Polyglass system application. Technical Services should be contacted when considering re-cover over coal tar.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-035",
      type: "mcq",
      question: "A re-cover assessment finds two existing roof coverings over the deck. What limitation does the guide state before proceeding with re-cover?",
      options: [
        { id: "A", text: "Two existing roofs are acceptable if total thickness is under 4 inches" },
        { id: "B", text: "Ensure there is no more than one existing roof covering" },
        { id: "C", text: "Multiple roofs are acceptable with additional mechanical fasteners only" },
        { id: "D", text: "The number of existing roofs is irrelevant on steel deck buildings" }
      ],
      answer: "B",
      explanation: "Re-cover evaluation must ensure there is no more than one existing roof covering. Analysis of drainage, moisture, deck and structural integrity, and attachment methods must be completed by the building owner or design professional before re-cover proceeds.",
      cite: "2023-Technical-Guide_web.pdf - Page 36",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-036",
      type: "mcq",
      question: "A specifier writes a roof section with zero slope, relying on perfectly level deck and scuppers. What minimum slope does the Polyglass Technical Guide recommend for low-slope roofs?",
      options: [
        { id: "A", text: "1/8 inch per foot minimum" },
        { id: "B", text: "1/4 inch per foot (1/4:12) minimum" },
        { id: "C", text: "1/2 inch per foot minimum on all buildings" },
        { id: "D", text: "Slope is optional if primary drains are interior" }
      ],
      answer: "B",
      explanation: "Adequate drainage requires a minimum recommended slope of 1/4 inch per foot. Part 5 reiterates that roofs should be provided with a minimum slope of 1/4:12 and that all ponding water shall dissipate after 48 hours. Positive slope to drain criteria should follow NRCA and ARMA recommendations.",
      cite: "2023-Technical-Guide_web.pdf - Page 29",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-037",
      type: "mcq",
      question: "A self-adhered cap sheet is being installed on a roof with 1.5 inches per foot slope. What additional fastening does the Technical Guide require at seams on slopes equal to or greater than 1.5 inches per foot?",
      options: [
        { id: "A", text: "No back-nailing is ever required for SA membranes" },
        { id: "B", text: "Back-nail at seams with 11-gauge ring shank simplex-type nails at 8 inches O.C." },
        { id: "C", text: "Mechanically attach entire cap sheet at 12-inch grid" },
        { id: "D", text: "Use only adhesive roller pressure without mechanical fasteners" }
      ],
      answer: "B",
      explanation: "Applications equal to or greater than 1.5 inches per foot slope require back-nailing at seams with 11-gauge ring shank simplex-type nails at 8 inches on center. Applicators on sloped roofs must also secure rollers and personnel with appropriate safety equipment.",
      cite: "2023-Technical-Guide_web.pdf - Page 34",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-038",
      type: "mcq",
      question: "On a non-nailable concrete deck with steep membrane slopes, the designer must provide a method for back-nailing base sheets. What solution does the slope and fastening section describe?",
      options: [
        { id: "A", text: "Back-nailing is prohibited on concrete decks" },
        { id: "B", text: "Adequately secured nailers at specific spacing may be required so membranes can be fastened into nailers with suitable fasteners" },
        { id: "C", text: "Use only fully adhered systems without any nailers on all concrete decks" },
        { id: "D", text: "Attach membranes with carpet tape at seams instead of nailers" }
      ],
      answer: "B",
      explanation: "On non-nailable decks, nailers adequately secured to the deck may be required at specific spacing to allow back-nailing of membranes. Membranes are then fastened into the nailers with suitable fasteners. Membrane back-nailing requirements are also provided in the guide's fastening table.",
      cite: "2023-Technical-Guide_web.pdf - Page 35",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-039",
      type: "mcq",
      question: "A steel deck project specifies 24-gauge decking with primer on one side only. Does this meet Polyglass individual deck requirements for steel decks?",
      options: [
        { id: "A", text: "Yes; 24-gauge exceeds the minimum 22-gauge requirement" },
        { id: "B", text: "No; minimum 22-gauge with G-90 galvanized or minimum primer on both sides is required" },
        { id: "C", text: "Yes, if the deck is mechanically attached only" },
        { id: "D", text: "No; steel decks are not approved substrates for Polyglass" }
      ],
      answer: "B",
      explanation: "Steel decks require minimum 22-gauge cold-formed steel decking with G-90 galvanized or minimum finish coat of primer paint on both sides. Decks must be clean, free of moisture and debris, and free of corrosion. FM LPDS 1-28 and 1-29 compliance applies for gauge and span.",
      cite: "2023-Technical-Guide_web.pdf - Page 31",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-040",
      type: "mcq",
      question: "A new structural concrete deck is scheduled for roofing 14 days after pour. The contractor plans to fully adhere membrane immediately. What curing and moisture evaluation guidance does the guide provide for concrete decks?",
      options: [
        { id: "A", text: "Concrete may be roofed immediately if the surface is broom-clean" },
        { id: "B", text: "Concrete decks typically require minimum 28 days cure time; moisture content evaluation per ASTM D4263 is recommended" },
        { id: "C", text: "Seven days cure is sufficient if a fast-drying primer is used" },
        { id: "D", text: "Cure time is irrelevant when using heat-welded membranes" }
      ],
      answer: "B",
      explanation: "Concrete decks require minimum 2,500 psi compressive strength and 4-inch minimum thickness with smooth surfaces. Concrete decks typically require minimum 28 days cure time, and moisture content evaluation should be in accordance with ASTM D4263 plastic sheet method. Primers must be dry before adhesives are applied.",
      cite: "2023-Technical-Guide_web.pdf - Page 31",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-041",
      type: "mcq",
      question: "A lightweight insulating concrete deck section is frozen in one bay after an overnight freeze. The GC asks whether roofing may proceed after surface thaw. What does the guide require?",
      options: [
        { id: "A", text: "Proceed if the surface is dry to the touch" },
        { id: "B", text: "Any frozen deck sections shall be completely removed and replaced; installation shall not proceed during freezing temperatures" },
        { id: "C", text: "Torch-heat the deck surface until thawed, then install immediately" },
        { id: "D", text: "Frozen sections may remain if covered with SA base sheet" }
      ],
      answer: "B",
      explanation: "Cellular lightweight insulating concrete deck installation shall not proceed during inclement weather including precipitation and freezing temperatures. Any frozen deck sections shall be completely removed and replaced. Measures must ensure no moisture is entrapped in the deck before roofing.",
      cite: "2023-Technical-Guide_web.pdf - Page 31",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-042",
      type: "mcq",
      question: "A plywood deck specification lists 1/2-inch 3-ply sheathing with 32-inch joist spacing. Which plywood deck requirement in the Polyglass Technical Guide is NOT met?",
      options: [
        { id: "A", text: "Thickness below minimum 15/32-inch requirement only" },
        { id: "B", text: "Joist spacing exceeds maximum 24 inches O.C.; plywood must be minimum 15/32-inch 4-ply C-D Exposure 1" },
        { id: "C", text: "Plywood decks are prohibited for modified bitumen" },
        { id: "D", text: "Only OSB may be used, not plywood" }
      ],
      answer: "B",
      explanation: "Plywood decks require minimum 15/32-inch thickness with minimum 4-ply conforming to C-D Exposure 1 grade. Maximum joist spacing is 24 inches on center or less, with minimum 1/8-inch to 1/4-inch spacing between panels. Thirty-two-inch joist spacing exceeds the allowable limit.",
      cite: "2023-Technical-Guide_web.pdf - Page 31",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-043",
      type: "mcq",
      question: "A project designer selects EPS insulation and plans to mop it in place with hot asphalt. What does the Polyglass insulation section state about this attachment method?",
      options: [
        { id: "A", text: "EPS may be mopped with Type I asphalt on slopes up to 1/4:12" },
        { id: "B", text: "Expanded polystyrene (EPS) shall not be installed with hot bitumen products" },
        { id: "C", text: "EPS requires only a cover board when heat-welding, not when mopping" },
        { id: "D", text: "EPS is the preferred insulation for all hot mop assemblies" }
      ],
      answer: "B",
      explanation: "When asphalt attachment is selected, proposed insulation must be compatible with substrate, bitumen, and the specific Polyglass membrane. EPS materials shall not be installed with hot bitumen products. Maximum 4' x 4' boards may be attached with hot asphalt only for compatible insulation types.",
      cite: "2023-Technical-Guide_web.pdf - Page 33",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-044",
      type: "mcq",
      question: "An insulation installer leaves 1/2-inch gaps between polyiso boards and plans to roof over them without correction. What does the guide require for insulation edge joints?",
      options: [
        { id: "A", text: "Gaps up to 1 inch are acceptable without filling" },
        { id: "B", text: "Edges shall butt tightly; gaps greater than 1/4 inch shall be filled with insulation" },
        { id: "C", text: "Gaps may be filled with spray foam only on warranted projects" },
        { id: "D", text: "Gaps are acceptable if cover board is mechanically attached" }
      ],
      answer: "B",
      explanation: "Insulation edges shall butt tightly and cuts must fit neatly against adjoining surfaces for a smooth overall surface. Gaps greater than 1/4 inch width shall be filled with insulation. Joints between multiple layers should be staggered.",
      cite: "2023-Technical-Guide_web.pdf - Page 33",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-045",
      type: "mcq",
      question: "Rain is forecast at 3:00 PM. The crew has installed half the insulation boards with no membrane yet. What daily weather practice does the insulation installation section require?",
      options: [
        { id: "A", text: "Insulation may remain exposed indefinitely if boards are polyiso" },
        { id: "B", text: "Install only as much insulation as can be covered with completed roofing membrane before end of day or onset of inclement weather; keep insulation dry at all times" },
        { id: "C", text: "Cover insulation with polyethylene permanently under the membrane" },
        { id: "D", text: "Wet insulation may be dried with torches before membrane installation" }
      ],
      answer: "B",
      explanation: "Insulation shall be kept dry at all times. Install only as much insulation as can be covered with completed roofing membrane before the end of the workday or prior to inclement weather. Incorrectly installed or wet insulation can contribute to system failure, and Polyglass does not warrant improperly attached insulation.",
      cite: "2023-Technical-Guide_web.pdf - Page 33",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-046",
      type: "mcq",
      question: "A heat-welded 2-ply system is designed over Polytherm ISO insulation without a coverboard. What overlay preparation does the guide require before heat welding membrane over polyiso?",
      options: [
        { id: "A", text: "Heat weld directly to ISO without any overlay" },
        { id: "B", text: "Provide suitable overlay board prior to mopping and suitable base sheet prior to heat welding of membrane" },
        { id: "C", text: "Use EPS/perlite composite only; polyiso is prohibited" },
        { id: "D", text: "Apply cold adhesive to ISO and torch cap directly" }
      ],
      answer: "B",
      explanation: "Polytherm or suitable polyisocyanurate boards require a suitable overlay board prior to mopping and a suitable base sheet prior to heat welding of membrane. Most insulation manufacturers require a base sheet or coverboard mechanically attached or adhered when direct bonding is not acceptable.",
      cite: "2023-Technical-Guide_web.pdf - Page 33",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-047",
      type: "mcq",
      question: "A new construction schedule requires leaving membrane edges open overnight for multiple trades across phased building sections. What is Polyglass's position on phased construction and overnight tie-ins?",
      options: [
        { id: "A", text: "Phased construction is recommended whenever schedules are tight" },
        { id: "B", text: "Phased construction is not recommended by NRCA; Polyglass membranes shall not be left open for phased or overnight tie-ins without preventing water intrusion" },
        { id: "C", text: "Open tie-ins are acceptable if ambient remains above 40°F" },
        { id: "D", text: "Phased construction requires only one ply until final completion" }
      ],
      answer: "B",
      explanation: "Phased construction is not recommended by NRCA, though scheduling may require flexibility. Polyglass recommends a temporary roof per NRCA HARK when needed. Polyglass membranes shall not be left open regarding phased or overnight tie-ins, to ensure no water intrudes into the system during phasing.",
      cite: "2023-Technical-Guide_web.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-048",
      type: "mcq",
      question: "A building owner on a non-warranted project experiences roof failure and claims Polyglass is responsible for installation performance. What warranty-related position does the introductory warranty section state for non-warranted roofs?",
      options: [
        { id: "A", text: "Polyglass guarantees performance on all roofs installed by Registered Contractors" },
        { id: "B", text: "On non-warranted roofs Polyglass acts only as material seller and assumes no responsibility for roof performance beyond manufacturing quality products" },
        { id: "C", text: "Polyglass provides 10-year leak coverage on all membranes regardless of warranty registration" },
        { id: "D", text: "Non-warranted roofs receive the same NDL coverage without fees" }
      ],
      answer: "B",
      explanation: "On non-warranted roofs, Polyglass acts only as seller of materials and has no control over application conditions. Polyglass assumes no responsibility for roof performance beyond manufacturing and shipping quality products complying with published standards, and no responsibility for damage from improper product use.",
      cite: "2023-Technical-Guide_web.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-049",
      type: "mcq",
      question: "An owner requests an NDL Full System Warranty but plans to use a non-Preferred contractor and skip pre-installation registration formalities. What does Part 9 of the guide state about NDL warranties and registration?",
      options: [
        { id: "A", text: "NDL warranties are automatic on all Polyglass membranes" },
        { id: "B", text: "NDL Full System Warranties require correct installation by a Preferred or Quantum Applicator, with requirements and formalities completed prior to installation; Polyglass may refuse warranty if guidelines are not followed" },
        { id: "C", text: "NDL warranties cover only cap sheet defects, not workmanship" },
        { id: "D", text: "Registration may occur any time within five years after installation" }
      ],
      answer: "B",
      explanation: "NDL Full System Warranties protect against leaks from defective material and workmanship when correctly installed by a Polyglass Preferred or Quantum Applicator. Full system warranties cover all Polyglass products in the assembly but require formalities and acceptance prior to installation. Polyglass reserves the right not to issue warranty if registration guidelines are not followed.",
      cite: "2023-Technical-Guide_web.pdf - Page 37",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "PGTECH-050",
      type: "mcq",
      question: "A specifier must choose between guide specification assemblies for a steel deck building with Polytherm ISO insulation. The design calls for three membrane layers with heat-welded APP cap. Which 3-ply guide specification assembly matches these components?",
      options: [
        { id: "A", text: "3-Ply Self-Adhered: SA cap, SA interply, SA base over plywood only" },
        { id: "B", text: "3-Ply Heat Welded APP: Polyflex G or Polyfresko G cap, Polyglass Base or Polyflex interply and base, coverboard by others, Polytherm ISO, heavy gauge steel or structural concrete deck" },
        { id: "C", text: "2-Ply Hot Mop: Elastoflex S6 G cap and single base over concrete only" },
        { id: "D", text: "3-Ply Lightweight Heat Welded: mechanically attached Elastovent base over LWIC only, without insulation" }
      ],
      answer: "B",
      explanation: "The 3-Ply Heat Welded APP guide specification lists Polyflex G or Polyfresko G cap sheet, Polyglass Base or Polyflex interply and base sheets, coverboard by others, Polyglass Polytherm ISO insulation, and heavy gauge steel or structural concrete roof deck. This differs from 3-ply SA systems and lightweight LWIC-specific assemblies.",
      cite: "2023-Technical-Guide_web.pdf - Page 43",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const POLYGLASS_TECHNICAL_GUIDE_QUESTION_BANK_2026 = {
  ...POLYGLASS_TECHNICAL_GUIDE_QUESTION_BANK_2026_RAW,
  questions: POLYGLASS_TECHNICAL_GUIDE_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = POLYGLASS_TECHNICAL_GUIDE_QUESTION_BANK_2026;
