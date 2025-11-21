/**
 * /api/exam
 * POST { book: string, filterField: string, count?: number }
 * Returns: { items:[...], modelDeployment, _diag }
 */

// Static question bank for IIBEC - RWC Study Guide, parsed from the study guide doc.
const RWC_QUESTION_BANK = {
  "book": "IIBEC - RWC Study Guide.docx",
  "questions": [
    {
      "number": 2,
      "question": "Which type of material only becomes waterproof when exposed to moisture?",
      "options": [
        "acrylic modified cement",
        "bentonite clay panels",
        "hot rubberized asphalt membrane",
        "thermoplastic membrane"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 3,
      "question": "A concrete structure constructed over a retail area is intended to be a pedestrian walkway to gain access to an adjacent building. Which two systems would be used to waterproof the top surface of the concrete structure? (Choose two.)",
      "options": [
        "two-ply modified-bitumen membrane with an aluminum foil-faced surfacing.",
        "polyurethane coating with embedded sand aggregate surfacing",
        "prefabricated cardboard bentonite panels with concrete pavers.",
        "PVC single-ply membrane with metal walkway planks"
      ],
      "correctIndexes": [
        1,
        3
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 4,
      "question": "Pavers will be installed on pedestals that are to be placed over a waterproofing membrane applied on a concrete plaza deck. Which two materials would be installed between the pedestals and waterproofing membrane? (Choose two.)",
      "options": [
        "high density polyisocyanurate insulation board",
        "extruded polystyrene insulation board",
        "exterior glass mat gypsum board",
        "prefabricated drainage composite panel"
      ],
      "correctIndexes": [
        1,
        3
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 7,
      "question": "A concrete contractor has submitted a Request for Substitution for replacing the specified PVC water stop with a hydrophilic rubber water stop in foundation joints. You approve this request under what condition?",
      "options": [
        "Make the replacement, but not in the keyway of the foundation wall or slab.",
        "Make the replacement, but not on the in-board side of the reinforcing bars.",
        "Make the replacement, but not within 1 inch [25 mm] of the concrete face.",
        "Make the replacement, but not at the top and side of the keyway."
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 8,
      "question": "While designing the connecting tunnel between an existing office building and a new car park garage, it was determined that a high water table exists at the site. What material should be applied to the exterior of the tunnel constructed with cast-in-place concrete floor and ceiling slab and reinforced CMU walls exposed to hydrostatic pressure?",
      "options": [
        "fiber-reinforced cement parging",
        "self-adhered modified-bitumen membrane",
        "siloxane compound",
        "clay emulsified asphalt"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 9,
      "question": "For conditions where void (carton) forms are required due to expansive soils, which two waterproofing systems would you recommend for positive side, under slab waterproofing? (Choose two.)",
      "options": [
        "adhesive-coated HDPE sheet waterproofing",
        "Bentonite sheet waterproofing",
        "thermoplastic sheet waterproofing",
        "cementitious waterproofing"
      ],
      "correctIndexes": [
        0,
        2
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 10,
      "question": "Over time, a parking deck constructed above the basement of an office building has experienced chronic water leakage through an organic felt built-up membrane and structural concrete substrate to the lower parking level below. Which two actions should be performed to rehabilitate the waterproofing? (Choose two.)",
      "options": [
        "Clean the surface of the concrete topping slab and apply crystalline waterproofing.",
        "Remove the topping slab, install hot-fluid-applied polymer-modified asphalt waterproofing, and place a new 6-inch concrete topping slab.",
        "Remove the topping slab, install bentonite panel waterproofing, and place a new 6-inch concrete topping slab.",
        "Prepare the surface of the concrete topping slab and install a new hot-fluid-applied polymer-modified asphalt waterproofing."
      ],
      "correctIndexes": [
        1,
        2
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 11,
      "question": "Which waterproofing material would be acceptable for the condition represented in Exhibit #1?",
      "options": [
        "bentonite sheets",
        "butyl rubber",
        "liquid-applied membranes",
        "PVC sheets"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 12,
      "question": "An existing cast-in-place concrete parking garage deck is bounded by structural walls on either side. What would be the most appropriate joint type in this condition?",
      "options": [
        "control joint",
        "construction joint",
        "isolation joint",
        "expansion joint"
      ],
      "correctIndexes": [
        3
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 13,
      "question": "According to ASTM C981, when using a built-up asphalt bituminous membrane for waterproofing, what slope must the concrete plaza deck have to ensure proper drainage?",
      "options": [
        "The deck can be level since these membranes can withstand ponding.",
        "The deck must be sloped 1/4 inch/foot [2%] to drain.",
        "The deck must be sloped 1/8 inch/foot [1%] to drain.",
        "The deck can be level only if you use a drainage board over the membrane."
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 14,
      "question": "Which waterproofing system would be applied to concrete that was placed seven days ago and may be subject to dynamic cracks?",
      "options": [
        "prefabricated bentonite geocomposite sheet",
        "fully adhered polymer-modified bitumen sheet",
        "crystalline cementitious waterproofing",
        "liquid-applied bitumen-extended urethane"
      ],
      "correctIndexes": [
        3
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 15,
      "question": "Joints in a concrete substrate are to be placed at 30 feet [9 m] on-center. What represents the joint movement and adequate joint width required, assuming zero construction tolerances and a design temperature range of 40°F [4°C] to 140°F [60°C], given a coefficient of linear thermal expansion of 20 × 10⁻⁶ in/(in·°F) [11.1 × 10⁻⁶ mm/(mm·°C)] and a sealant with 50% movement capability?",
      "options": [
        "movement = 0.2232 inch [5.6 mm]; joint size = 3/8 inch [9 mm]",
        "movement = 0.2232 inch [5.6 mm]; joint size = 1/2 inch [13 mm]",
        "movement = 0.3125 inch [7.8 mm]; joint size = 5/8 inch [16 mm]",
        "movement = 0.3125 inch [7.8mm]; joint size = 3/8 inch [9 mm]"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 16,
      "question": "Which sealant should be specified for a parking deck expansion joint that is 1 inch [25 mm] wide and must accommodate up to 1/2 inch [13 mm] of movement?",
      "options": [
        "Type S; Grade NS; Use T; movement up to 25%",
        "Type M; Grade NS; Use T; movement up to 50% (SIKA 2C-NS)",
        "Type S; Grade P; Use NT; movement up to 125%",
        "Type M; Grade P; Use NT; movement up to 25%"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 17,
      "question": "According to the RCI Waterproofing Manual, what are two advantages of using a 4-foot wide ballasted strip instead of a monolithic concrete traffic slab as a perimeter detail in a vegetative waterproofing assembly? (Choose two.)",
      "options": [
        "access to repair membrane flashings",
        "prevention of root growth towards membrane flashings",
        "ventilation of root systems",
        "compliance with wind uplift requirements"
      ],
      "correctIndexes": [
        0,
        1
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 18,
      "question": "What is the definition of a water table?",
      "options": [
        "An underground lake that intersects the footings.",
        "The level of water in the ground below which the soil is saturated.",
        "Water that is retained by an impermeable clay layer.",
        "Water flows across the foundation from one side to the other."
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 19,
      "question": "What describes a safe oxygen level for human occupancy in an excavation greater than four feet [1.2 m] deep?",
      "options": [
        "greater than 10.5%, but less than 12.8%",
        "greater than 16.5%, but less than 19.5%",
        "greater than 19.5%, but less than 23.5%",
        "greater than 23.5%, but less than 33.3%"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 20,
      "question": "When specifying a self-adhesive rubberized asphalt membrane for a below-grade foundation wall, which two design considerations should be included? (Choose two.)",
      "options": [
        "Treat cracks less than 1/16 inch [1.6 mm].",
        "Ensure substrate is clean, dry, and frost-free.",
        "Prime the substrate.",
        "Prepare voids and honeycombs with silicone sealant."
      ],
      "correctIndexes": [
        1,
        2
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 21,
      "question": "For a third-floor terrace (Exhibit #2) with a design rainfall intensity of 4 inches per hour [100 mm/hr] and a maximum roof leader pipe slope of 1/4 inch per foot [2%], what should be the size and slope of the last section of the horizontal roof leader?",
      "options": [
        "6-inch diameter pipe at 1/2 inch per foot slope",
        "6-inch diameter pipe at 1/4 inch per foot slope",
        "6-inch diameter pipe at 1/8 inch per foot slope",
        "8-inch diameter pipe at 1/8 inch per foot slope"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 22,
      "question": "A recently constructed below-grade parking garage with precast double-tees and an organic felt built-up membrane is experiencing water infiltration at the roof and through the walls. Which two investigative procedures would be appropriate to determine the remedial action? (Choose two.)",
      "options": [
        "Conduct a series of 25 test cores and moisture content testing.",
        "Remove landscaping at the roof/wall junction to expose the membrane level.",
        "Perform chloride ion tests and electronic leak detection tests.",
        "Dig three test openings over leaking areas to investigate the membrane condition."
      ],
      "correctIndexes": [
        0,
        3
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 23,
      "question": "In a below-grade parking garage, water is observed seeping through a single horizontal crack in a reinforced concrete wall segment, 8 feet [2.4 m] above floor level (Exhibit #3). Which repair method should be recommended?",
      "options": [
        "self-adhering tape",
        "chemical grout injection",
        "Route and seal the crack with silicone sealant",
        "Route and seal the crack with urethane sealant"
      ],
      "correctIndexes": [
        3
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 24,
      "question": "Which test should be used for quality control on an extensive garden roof with a 15-degree slope and a black, fully adhered EPDM membrane over rigid insulation?",
      "options": [
        "EFVM",
        "nuclear",
        "capacitance",
        "ASTM D5957 flood test"
      ],
      "correctIndexes": [
        0
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 25,
      "question": "If a liquid-applied membrane with 80% solids content has a measured wet-film thickness of 60 mils, what is the expected minimum dry-film thickness at that location?",
      "options": [
        "12.5",
        "44",
        "48",
        "52"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 26,
      "question": "When using crystalline waterproofing on the interior surface of below-grade walls in corrosive soils and freeze-thaw conditions, which two considerations should be reviewed when a crystalline coating is specified on the interior side? (Choose two.)",
      "options": [
        "Negative-side waterproofing will leave the concrete exposed to corrosive environment.",
        "Freeze-thaw cycling may cause damage due to trapped moisture.",
        "Crystalline coatings have high vapor transmission ratings, causing high humidity.",
        "Effectiveness may be damaged by carbon dioxide emissions."
      ],
      "correctIndexes": [
        0,
        1
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 27,
      "question": "What are two application advantages of hot-applied rubberized asphalt (HARA) membrane over solvent-based liquid-applied membrane on a concrete deck? (Choose two.)",
      "options": [
        "low odor",
        "no cure time",
        "works well at lower ambient temperatures",
        "compatible with PVC flashings"
      ],
      "correctIndexes": [
        1,
        2
      ],
      "multi": true,
      "expectedSelections": 2
    },
    {
      "number": 28,
      "question": "A suspended plaza deck supports a pool with a garden terrace, assembly area, lounging area, and water features. To reduce the noise transmission of footfall impact and rolling carts, which material would be installed under the traffic slabs connected with dowels?",
      "options": [
        "light weight insulating fill (LWIC)",
        "heavy weight insulating fill",
        "resilient pads",
        "traffic coating"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 29,
      "question": "What is a critical factor to control during the installation of traffic-bearing waterproofing coatings on plaza decks?",
      "options": [
        "temperature of the membrane only",
        "temperature of the substrate only",
        "temperature of both the membrane and substrate",
        "ambient air temperature only"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 30,
      "question": "Which detail is most critical for waterproofing integrity at deck-to-wall transitions in plaza systems?",
      "options": [
        "slab reinforcing layout",
        "surface finish of the concrete",
        "placement of control joints",
        "proper termination and flashing of the waterproofing membrane at the wall"
      ],
      "correctIndexes": [
        3
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 31,
      "question": "When designing waterproofing for elevator pits in a high water table condition, which approach is most appropriate?",
      "options": [
        "use only negative-side waterproofing on interior walls",
        "use positive-side waterproofing and provide a sump pump",
        "provide under-slab drainage only",
        "rely solely on crystalline admixtures"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 32,
      "question": "Which waterproofing approach is most appropriate for a blind-side wall condition where the exterior is inaccessible after construction?",
      "options": [
        "self-adhered membrane applied after backfilling",
        "bentonite sheet or HDPE blind-side membrane placed before placing the wall concrete",
        "cementitious waterproofing applied from inside after leaks appear",
        "traffic coating applied at grade level only"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 33,
      "question": "For a below-grade wall exposed to hydrostatic pressure, which drainage strategy is most effective?",
      "options": [
        "use an interior sump only",
        "no drainage is needed if membrane is good",
        "install a vertical drainage composite and footing drain to daylight or sump",
        "install only gravel backfill without pipe drains"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 34,
      "question": "Which condition can cause loss of bond and failure of a self-adhered waterproofing membrane on a foundation wall?",
      "options": [
        "clean, dry concrete",
        "proper priming of the substrate",
        "frost or moisture on the substrate at the time of installation",
        "properly lapped and rolled seams"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 35,
      "question": "When detailing penetrations through plaza deck waterproofing, which approach is most appropriate?",
      "options": [
        "ignore penetrations, as they are not critical",
        "apply general coating only around penetrations",
        "use pre-manufactured boots or properly detailed field-formed flashings",
        "rely on sealant alone around penetrations"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 36,
      "question": "In a vegetative roof assembly, what is the main function of the root barrier?",
      "options": [
        "provide thermal insulation",
        "protect the membrane from root penetration",
        "drain excess water from the soil",
        "provide traffic resistance"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 37,
      "question": "Which combination is most appropriate for an intensive (deep media) vegetated roof?",
      "options": [
        "thin soil, no irrigation",
        "deep soil profile, irrigation, robust root barrier",
        "no drainage layer, shallow soil",
        "only sedum plants and no root barrier"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 38,
      "question": "For buried plaza deck waterproofing beneath heavy concrete topping, which membrane type is generally preferred for its robustness and ability to bridge cracks?",
      "options": [
        "thin acrylic coating",
        "hot-applied rubberized asphalt membrane",
        "single-ply EPDM membrane",
        "asphalt shingle underlayment"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 39,
      "question": "When waterproofing a tunnel with a cast-in-place concrete roof and walls subjected to groundwater, which system provides continuous protection and accommodates joint movement?",
      "options": [
        "unreinforced cement plaster only",
        "bentonite sheet waterproofing internally",
        "PVC sheet waterproofing externally with welded seams and waterstops at joints",
        "bituminous paint only"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 40,
      "question": "Which condition is most critical to avoid when installing a bentonite sheet waterproofing system?",
      "options": [
        "installing against smooth formwork",
        "contact with standing water before backfilling",
        "placing reinforcing steel near the membrane",
        "using protection board over the bentonite panels"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 41,
      "question": "For a plaza deck over occupied space, which component is critical for maintaining drainage above the waterproofing membrane but below the wearing surface?",
      "options": [
        "air/vapor barrier layer",
        "drainage composite or drainage mat",
        "interior finish ceiling",
        "sealant joints only"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 42,
      "question": "Which construction practice minimizes cracking in concrete that will receive waterproofing?",
      "options": [
        "using uncontrolled high-slump mixes",
        "proper joint spacing and curing practices",
        "eliminating all joints",
        "pouring concrete in very hot weather without controls"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 43,
      "question": "What is the main disadvantage of negative-side waterproofing compared to positive-side waterproofing?",
      "options": [
        "more expensive materials",
        "more complex installation",
        "does not prevent water entry into the structural element, only manages it after penetration",
        "requires no surface preparation"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 44,
      "question": "In a high-rise building, which area is most prone to movement-related leakage problems that require careful expansion joint detailing?",
      "options": [
        "interior partitions",
        "roof-to-wall interface and parapets",
        "interior floor finishes",
        "non-loadbearing interior walls"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 45,
      "question": "Which is a key design consideration for plaza decks over occupied space with high-end finishes below?",
      "options": [
        "waterproofing membrane should be omitted to save cost",
        "allow occasional leaks and repair finishes as needed",
        "provide a robust, fully-welded membrane with redundant drainage and protection",
        "do not ventilate the space below"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 46,
      "question": "For a vegetated roof over a waterproofing membrane, which maintenance consideration is important for long-term performance?",
      "options": [
        "no maintenance is needed once installed",
        "periodic inspection and clearing of drains and scuppers",
        "only irrigation checks are needed",
        "membrane need not be inspected if plants are healthy"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 47,
      "question": "Which is a potential risk of having planters directly on top of a waterproofing membrane without proper detailing?",
      "options": [
        "enhanced drainage",
        "reduced membrane life due to constant moisture and root intrusion",
        "no impact on membrane performance",
        "automatic watering of the membrane"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 48,
      "question": "When detailing a transition between below-grade waterproofing and above-grade air/vapor barrier, which approach is correct?",
      "options": [
        "leave the two systems unconnected so each can move independently",
        "overlap and tie the systems together to maintain continuity of water and air barriers",
        "treat them as separate and unrelated",
        "terminate both below grade"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 49,
      "question": "For waterproofing at podium slabs with mixed-use occupancy above and below, which is a key coordination issue?",
      "options": [
        "paint color of the underside of the slab",
        "HVAC duct routing only",
        "coordination of sleeve locations, drains, and penetrations before waterproofing",
        "location of interior partitions only"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 50,
      "question": "What is a primary advantage of using a hot-applied rubberized asphalt waterproofing membrane for plaza decks?",
      "options": [
        "thin build and low robustness",
        "self-healing properties and strong adhesion to primed concrete",
        "incompatibility with protection boards",
        "only suitable for vertical surfaces"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 51,
      "question": "Which is a likely cause of leakage at window wall interfaces over plaza decks?",
      "options": [
        "over-specifying waterproofing layers",
        "improper integration of window flashings with the plaza waterproofing membrane",
        "too much slope on the plaza deck",
        "excessive use of drainage composite"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 52,
      "question": "For plaza decks over occupied space, which membrane testing method is appropriate before covering the membrane?",
      "options": [
        "visual inspection only",
        "nuclear moisture test through the slab",
        "flood testing or electronic leak detection",
        "no testing is needed if installed by certified applicator"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 53,
      "question": "Which factor can negatively impact adhesion of a self-adhered waterproofing membrane to concrete?",
      "options": [
        "proper priming",
        "dust, laitance, or form release on the surface",
        "warm, dry substrate",
        "rolling the membrane after application"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 54,
      "question": "What is the main function of a protection course over waterproofing on a plaza deck?",
      "options": [
        "provides extra insulation only",
        "protects the membrane from mechanical damage during construction and from traffic loads",
        "creates ponding intentionally",
        "serves as the wearing surface"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 55,
      "question": "For a below-grade wall waterproofed with a self-adhered rubberized asphalt membrane exposed to high hydrostatic pressure, which protection is most appropriate before backfilling?",
      "options": [
        "no protection is needed",
        "1-inch [25 mm] rigid insulation only",
        "dimpled drainage board or protection board compatible with the membrane",
        "wood sheathing only"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 56,
      "question": "When locating control joints in concrete decks that will receive waterproofing, what is the typical maximum spacing guideline?",
      "options": [
        "90 feet [27 m]",
        "60 feet [18 m]",
        "30 feet [9 m]",
        "10 feet [3 m]"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 57,
      "question": "Which practice best minimizes blistering of adhered membranes on plaza decks?",
      "options": [
        "installing over damp or green concrete",
        "allowing trapped air and moisture to vent or using vented systems where appropriate",
        "never priming the deck",
        "installing membranes in very cold conditions without heat"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 58,
      "question": "What is a key consideration when specifying waterproofing for planters integrated into a plaza deck?",
      "options": [
        "planters do not require waterproofing",
        "use only thin acrylic paint",
        "ensure continuity of waterproofing from the plaza deck into planter walls and floors",
        "rely on soil to absorb all water"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 59,
      "question": "Which factor is MOST critical for successful installation of traffic-bearing waterproofing coatings?",
      "options": [
        "ambient temperature only",
        "substrate moisture content, surface preparation, and proper mixing/application per manufacturer guidelines",
        "color of the coating",
        "thickness of the structural slab"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 60,
      "question": "For plaza decks with pavers on pedestals, what is an important detailing consideration?",
      "options": [
        "no drainage layer needed",
        "pedestals should be placed directly on unprotected membrane",
        "protect the membrane with a protection course and ensure slope to drains under the pedestal system",
        "omit perimeter upturns of waterproofing"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 61,
      "question": "Which is a typical cause of leakage at stair and elevator penthouse walls where they intersect with roofs or plaza decks?",
      "options": [
        "too much waterproofing",
        "improper flashing and termination detailing at the vertical-to-horizontal transition",
        "over-sloped membranes",
        "excessive insulation"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 62,
      "question": "For a podium deck supporting residential units above and retail below, which waterproofing design goal is most appropriate?",
      "options": [
        "occasional leakage is acceptable",
        "limit water ingress but allow some dampness below",
        "achieve a redundant, durable waterproofing system with provisions for inspection and repair where possible",
        "omit protection board to reduce cost"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 63,
      "question": "What is one advantage of fully bonded, monolithic waterproofing systems (like hot-applied rubberized asphalt) for plaza decks?",
      "options": [
        "they are easily removed and replaced",
        "they can bridge small cracks and prevent lateral water migration if punctured",
        "they have no odor or application constraints",
        "they require no surface preparation"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 64,
      "question": "Under what condition might a negative-side crystalline waterproofing system be appropriate?",
      "options": [
        "when the positive side is accessible and easy to waterproof",
        "when the positive side is inaccessible and hydrostatic pressure is moderate",
        "for traffic-bearing exposed decks only",
        "where no water is present"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 65,
      "question": "Which detail is important for waterproofing continuity at balcony-to-wall interfaces over occupied space?",
      "options": [
        "no waterproofing is needed at balconies",
        "treat balcony as completely separate from wall waterproofing",
        "integrate balcony waterproofing with wall air/vapor and water-resistive barriers to maintain continuity",
        "use only sealant at cracks"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 66,
      "question": "For a parking deck with vehicular traffic over occupied space, which waterproofing and wearing surface combination is typical?",
      "options": [
        "no waterproofing, just thick concrete",
        "waterproofing membrane with protection course and traffic-bearing wearing surface or traffic coating",
        "single-coat acrylic paint only",
        "exposed insulation board"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 67,
      "question": "Which inspection method can most effectively detect pinholes or thin spots in a conductive waterproofing membrane before it is covered?",
      "options": [
        "visual inspection only",
        "low-voltage electronic leak detection",
        "tapping with a hammer",
        "infrared scan of interior ceiling"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 68,
      "question": "Which is a potential source of leaks at plaza decks with integrated landscaping?",
      "options": [
        "properly detailed drains",
        "root intrusion where root barriers are omitted or discontinuous",
        "adequate slope to drains",
        "well-detailed flashings"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 69,
      "question": "When rehabilitating leaking plaza deck waterproofing, which step is generally necessary to properly diagnose failures?",
      "options": [
        "assume membrane is defective without inspection",
        "perform limited visual inspection only",
        "conduct exploratory openings to expose and observe membrane condition at leaks and non-leaking areas",
        "replace all finishes without touching waterproofing"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 70,
      "question": "In below-grade waterproofing, what is the main function of a footing drain?",
      "options": [
        "support the wall structurally",
        "collect and convey groundwater away from the foundation to reduce hydrostatic pressure",
        "serve as an air vent",
        "support interior finishes"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 71,
      "question": "For a new project with a plaza deck and vegetated areas over occupied space, when should waterproofing design and detailing be coordinated?",
      "options": [
        "near the end of construction",
        "only during bidding",
        "early in design with structural, landscape, and architectural coordination",
        "only if leaks appear after construction"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 72,
      "question": "What is a primary reason to slope structural decks that will receive waterproofing?",
      "options": [
        "to increase structural load",
        "to provide drainage and minimize ponding on the membrane",
        "to make construction more difficult",
        "to avoid using drains"
      ],
      "correctIndexes": [
        1
      ],
      "multi": false,
      "expectedSelections": 1
    },
    {
      "number": 73,
      "question": "In the context of waterproofing design, what is the primary purpose of a pre-installation meeting?",
      "options": [
        "determine paint colors",
        "discuss landscaping preferences",
        "coordinate substrate readiness, sequencing, and detailing among design team, contractor, and manufacturer",
        "discuss interior furniture layouts"
      ],
      "correctIndexes": [
        2
      ],
      "multi": false,
      "expectedSelections": 1
    }
  ]
};

/**
 * Convert a question object from RWC_QUESTION_BANK into the MCQ schema expected by the front-end.
 */
function mapRwcQuestionToMcq(q, idx, citeName) {
  const questionText = String(q.question || "").trim();
  const optionsArr = Array.isArray(q.options) ? q.options : [];
  const correctIdxs = Array.isArray(q.correctIndexes) ? q.correctIndexes : [];
  const hasMulti = correctIdxs.length > 1 || !!q.multi;

  const paddedOptions = [...optionsArr];
  while (paddedOptions.length < 4) {
    paddedOptions.push(`Option ${paddedOptions.length + 1}`);
  }
  const finalOptions = paddedOptions.slice(0, 4);

  const letters = ["A", "B", "C", "D"];

  const primaryCorrectIndex = correctIdxs.length ? correctIdxs[0] : 0;
  const safeIndex = Math.min(Math.max(primaryCorrectIndex, 0), 3);
  const answerLetter = letters[safeIndex];

  const options = finalOptions.map((txt, i) => ({
    id: letters[i],
    text: String(txt || "")
  }));

  return {
    id: `RWC-${idx + 1}`,
    type: "mcq",
    question: questionText || "(missing question text)",
    options,
    answer: answerLetter,
    cite: citeName || "IIBEC - RWC Study Guide.docx",
    explanation:
      (q.explanation && String(q.explanation).trim()) ||
      "Refer to the IIBEC RWC Study Guide for the supporting details.",
    multi: hasMulti,
    correctIndexes: correctIdxs,
    expectedSelections:
      typeof q.expectedSelections === "number" && q.expectedSelections > 0
        ? q.expectedSelections
        : hasMulti
        ? correctIdxs.length || 2
        : 1
  };
}

/**
 * Randomly pick up to `count` items from an array without replacement.
 */
function pickRandom(arr, count) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, count);
}

module.exports = async function (context, req) {
  const send = (status, obj) => {
    context.res = {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(obj ?? {})
    };
  };

  try {
    const body = (req && req.body) || {};
    const book = (body.book || "").trim();
    const filterField = (body.filterField || "metadata_storage_name").trim();
    const count = Math.min(Math.max(parseInt(body.count || 50, 10) || 50, 1), 50);

    // --- env
    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY  = process.env.SEARCH_API_KEY;
    const SEARCH_INDEX    = process.env.SEARCH_INDEX;

    const AOAI_ENDPOINT   = process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_ENDPOINT || process.env.AOAI_ENDPOINT;
    const AOAI_KEY        = process.env.AZURE_OPENAI_API_KEY   || process.env.OPENAI_API_KEY   || process.env.AOAI_KEY;
    const DEPLOYMENT      = process.env.AZURE_OPENAI_DEPLOYMENT
                         || process.env.OPENAI_DEPLOYMENT
                         || process.env.AOAI_DEPLOYMENT_TURBO
                         || process.env.DEFAULT_MODEL
                         || process.env.OPENAI_GPT4O_MINI;

    const envDiag = {
      searchEndpoint: (SEARCH_ENDPOINT||"").replace(/https?:\/\//,"").split("/")[0],
      searchIndex: SEARCH_INDEX,
      aoaiEndpointHost: (AOAI_ENDPOINT||"").replace(/https?:\/\//,"").split("/")[0],
      deployment: DEPLOYMENT || "(none)"
    };

    // Robust special-case: RWC study guide uses fixed bank, not AI
    const lowerBook = book.toLowerCase();
    const isRwcStudyGuide =
      lowerBook.includes("rwc") &&
      lowerBook.includes("study") &&
      lowerBook.includes("guide");

    if (isRwcStudyGuide && RWC_QUESTION_BANK && Array.isArray(RWC_QUESTION_BANK.questions) && RWC_QUESTION_BANK.questions.length) {
      const allQ = RWC_QUESTION_BANK.questions;
      const citeName = book || "IIBEC - RWC Study Guide.docx";
      const picked = pickRandom(allQ, Math.min(count, allQ.length));
      const items = picked.map((q, idx) => mapRwcQuestionToMcq(q, idx, citeName));
      return send(200, {
        items,
        modelDeployment: "RWC-STATIC-BANK",
        _diag: {
          mode: "rwc-bank-embedded",
          totalAvailable: allQ.length,
          used: items.length,
          book
        }
      });
    }

    // --- If not RWC, fall back to existing AI-based pipeline ---

    if (!SEARCH_ENDPOINT || !SEARCH_API_KEY || !SEARCH_INDEX) {
      return send(500, { error: "Missing SEARCH_* env vars", _env: envDiag });
    }
    if (!AOAI_ENDPOINT || !AOAI_KEY || !DEPLOYMENT) {
      return send(500, {
        error: "Missing OpenAI/Azure OpenAI env (endpoint/key/deployment)",
        _env: envDiag
      });
    }

    const searchUrl = `${SEARCH_ENDPOINT.replace(
      /\/+$/,
      ""
    )}/indexes/${encodeURIComponent(
      SEARCH_INDEX
    )}/docs/search?api-version=2023-11-01`;
    const filter = book
      ? `${filterField} eq '${book.replace(/'/g, "''")}'`
      : null;

    const searchPayload = {
      search: "*",
      queryType: "simple",
      select: "id,metadata_storage_name,metadata_storage_path,content",
      top: 5,
      ...(filter ? { filter } : {})
    };

    let sTxt = "";
    const sRes = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": SEARCH_API_KEY
      },
      body: JSON.stringify(searchPayload)
    }).catch((e) => {
      throw new Error("FETCH_SEARCH_FAILED: " + (e?.message || e));
    });

    sTxt = await sRes.text().catch(() => "");
    if (!sRes.ok)
      return send(500, {
        error: `Search HTTP ${sRes.status}`,
        raw: sTxt,
        _env: envDiag
      });

    let sJson;
    try {
      sJson = JSON.parse(sTxt);
    } catch {
      return send(500, {
        error: "Search returned non-JSON",
        raw: sTxt.slice(0, 2000),
        _env: envDiag
      });
    }
    const hits = Array.isArray(sJson.value) ? sJson.value : [];
    const texts = hits.map((h) => h.content || "").filter(Boolean);
    const citeName2 =
      book || hits[0]?.metadata_storage_name || "<mixed sources>";
    const combined = texts.join("\n\n").slice(0, 120000);
    const combinedLen = combined.length;

    const _diag = {
      _env: envDiag,
      searchHits: hits.length,
      firstDocKeys: hits[0] ? Object.keys(hits[0]).slice(0, 5) : [],
      combinedLen,
      combinedSample: combined.slice(0, 800)
    };

    if (combinedLen < 1000)
      return send(500, {
        error: "Not enough source text to generate questions.",
        _diag
      });

    const isAzure = /azure\.com/i.test(AOAI_ENDPOINT);
    let chatUrl;
    if (isAzure) {
      const apiVersion =
        process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
      chatUrl = `${AOAI_ENDPOINT.replace(
        /\/+$/,
        ""
      )}/openai/deployments/${encodeURIComponent(
        DEPLOYMENT
      )}/chat/completions?api-version=${apiVersion}`;
    } else {
      chatUrl = `${AOAI_ENDPOINT.replace(/\/+$/, "")}/v1/chat/completions`;
    }

    const sys =
      "You are an expert item-writer for roofing/structures exams. " +
      "Write strictly factual, unambiguous multiple-choice questions from the provided source text. " +
      "Each question must be answerable from the source; do not invent facts. " +
      "Return exactly the requested count of questions. " +
      "Output ONLY valid JSON matching the schema provided.";

    const schema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { const: "mcq" },
              question: { type: "string" },
              options: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    text: { type: "string" }
                  },
                  required: ["id", "text"],
                  additionalProperties: false
                },
                minItems: 4,
                maxItems: 4
              },
              answer: { type: "string" },
              cite: { type: "string" },
              explanation: { type: "string" }
            },
            required: ["id", "type", "question", "options", "answer", "cite", "explanation"],
            additionalProperties: false
          },
          minItems: 1
        }
      },
      required: ["items"],
      additionalProperties: false
    };

    const user = [
      `Create ${count} exam-quality MCQs strictly from the SOURCE below.`,
      `- Use clear, specific stems; do NOT use “Which option is most correct.”`,
      `- Provide exactly 4 options labeled A–D.`,
      `- The correct answer must be derivable from the source.`,
      `- Cite: use "${citeName2}" for each item.`,
      `- For EACH question, also include a concise 'explanation' (1–2 sentences) that justifies WHY the correct option is correct based on the source.`,
      `- Explanations must refer only to facts available in the source (no outside knowledge).`,
      "",
      "SOURCE (verbatim, may include OCR noise):",
      combined
    ].join("\n");

    const payload = {
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ],
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: { name: "mcq_list", schema }
      }
    };

    const headers = { "Content-Type": "application/json" };
    if (isAzure) headers["api-key"] = AOAI_KEY;
    else headers["Authorization"] = `Bearer ${AOAI_KEY}`;

    let mTxt = "";
    const mRes = await fetch(chatUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    }).catch((e) => {
      throw new Error("FETCH_OPENAI_FAILED: " + (e?.message || e));
    });
    mTxt = await mRes.text().catch(() => "");
    if (!mRes.ok)
      return send(500, {
        error: `OpenAI HTTP ${mRes.status}`,
        raw: mTxt.slice(0, 4000),
        _diag
      });

    let mJson;
    try {
      mJson = JSON.parse(mTxt);
    } catch {
      return send(500, {
        error: "Model returned non-JSON",
        raw: mTxt.slice(0, 4000),
        _diag
      });
    }
    const content = mJson?.choices?.[0]?.message?.content;
    if (!content)
      return send(500, {
        error: "No content from model",
        raw: mJson,
        _diag
      });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return send(500, {
        error: "Content not valid JSON",
        content: content.slice(0, 4000),
        _diag
      });
    }
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    if (!items.length)
      return send(500, {
        error: "Model returned no items",
        _diag
      });

    return send(200, { items, modelDeployment: DEPLOYMENT, _diag });
  } catch (e) {
    return send(500, {
      error: String(e?.message || e),
      stack: String(e?.stack || "")
    });
  }
};
