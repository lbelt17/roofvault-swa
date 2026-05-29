// NRCA - Roof Coating Applicator Fundamentals - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books, NOT in Chat)
//
// Source PDF (internal only, never served via /api/book or /api/books):
//   sources/nrca/pdfs/2026-03-nrca-guidelines-for-roof-coating-applicators.pdf
// Per-question provenance lives in:
//   sources/nrca/citations.json
//
// Exam-only bank. Display title (verbatim, no "(Bank)" suffix per product owner):
//   "Roof Coating Applicator Fundamentals"
//
// Question authoring target is 12 (honest premium capacity of the 84-page,
// 8-chapter NRCA guideline; no filler). Every question is scenario-based,
// derived from the guideline's technical content, and paraphrased - no
// marketing prose, tables, or figures copied verbatim. Standard test
// references (ASTM/UL) and numeric specifications are cited as facts.

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

const NRCA_ROOF_COATING_APPLICATOR_FUNDAMENTALS_QUESTION_BANK_2026_RAW = {
  book: "Roof Coating Applicator Fundamentals",
  questions: [
    {
      id: "RCAF-001",
      type: "mcq",
      question: "A crew is applying a bituminous-based aluminum roof coating on a cool, damp morning at about 40 F. The owner expects the finished roof to have a bright silver appearance. The foreman is worried about the conditions. Per the NRCA guidelines, what is the MOST likely outcome and why?",
      options: [
        { id: "A", text: "No issue - aluminum coatings are solvent-based and are therefore insensitive to temperature and moisture during application" },
        { id: "B", text: "Below roughly 40-45 F (product-dependent), the leafing of the aluminum flake to the coating surface can be impeded, leaving a bronze finish instead of bright silver; early exposure to moisture (rain, dew, frost) can cause a comparable blotchy appearance" },
        { id: "C", text: "The coating will cure faster in cool, damp conditions and will appear brighter silver than if applied in hot weather" },
        { id: "D", text: "The aluminum flakes will sink to the bottom of the film, producing a darker but more durable finish that exceeds the owner's expectation" }
      ],
      answer: "B",
      explanation: "The NRCA guidelines note aluminum roof coatings are more sensitive to application conditions than most other solvent-based coatings because of their chemistry. Applied below about 40-45 F (depending on product), leafing of the aluminum flake to the surface can be impeded, leaving a bronze finish instead of a bright silver finish; early exposure to moisture (rain, dew, frost) can have comparable negative effects, sometimes producing a blotchy appearance. Option A is wrong - being solvent-based does NOT make aluminum coatings insensitive; they are specifically called out as more sensitive. Option C inverts the relationship. Option D mis-describes the failure mode (it is a surface-leafing problem, not flakes sinking).",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 12, Chapter 1 (Aluminum roof coatings)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-002",
      type: "mcq",
      question: "A contractor is bidding an acrylic (water-based) roof coating on a low-slope membrane in a climate with chilly nights and occasional ponding at a few low spots. Which combination of acrylic-coating limitations from the NRCA guidelines should drive the install plan?",
      options: [
        { id: "A", text: "Acrylics are unaffected by cold and by standing water once applied, so neither night temperatures nor ponding matter" },
        { id: "B", text: "Acrylics must be applied below 38 F and perform best under continuous ponding" },
        { id: "C", text: "Acrylics are water-based: products should be stored and applied above 38 F and the wet film kept above that temperature during initial cure; they are sensitive to moisture until cured; and most absorb enough water to blister/lose adhesion if water stands on the cured film for extended periods - so ponding areas are a real concern" },
        { id: "D", text: "Acrylics have a perm rating near 0.001 (essentially a vapor barrier), so they should be used specifically to stop vapor drive in this building" }
      ],
      answer: "C",
      explanation: "The NRCA guidelines state acrylic coatings are water-based and therefore sensitive to moisture (rain, dew, frost) until cured; they must be stored and applied above 38 F, with the wet film kept above that temperature during the initial cure period. Most acrylics absorb enough water to create blistering and adhesion issues if water stands on the cured film for extended periods, and they typically have a breathable perm rating of about 5.0 to 10.0. Option A ignores both documented sensitivities. Option B inverts the temperature rule and the ponding behavior. Option D describes a butyl coating's perm rating (0.001), not an acrylic's - acrylics are breathable, not vapor barriers.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 12, Chapter 1 (Acrylic coatings)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-003",
      type: "mcq",
      question: "A maintenance crew is asked to recoat an existing roof that was previously coated with a silicone coating. They have acrylic, polyurethane, and silicone products on the truck. Per the NRCA guidelines, which product can be expected to bond to the existing silicone-coated surface?",
      options: [
        { id: "A", text: "Acrylic - it can be applied in multiple coats over many other coating types, so it will bond to silicone too" },
        { id: "B", text: "Polyurethane - its excellent adhesion to most roof substrates includes existing silicone surfaces" },
        { id: "C", text: "Any of the three, as long as the silicone surface is pressure-washed first" },
        { id: "D", text: "Only a silicone coating - the guidelines note that only silicone coatings and sealants successfully bond to existing silicone-coated surfaces" }
      ],
      answer: "D",
      explanation: "The NRCA guidelines explicitly state that only silicone coatings and sealants successfully bond to existing silicone-coated surfaces. This is a critical recoat-compatibility trap: silicone leaves a low-surface-energy residue that most other chemistries cannot wet out or adhere to. Option A is a documented strength of acrylics over MANY coating types - but the guidelines specifically except silicone ('except silicone'). Option B overstates polyurethane adhesion; 'most roof substrates' does not include a cured silicone surface. Option C is wrong - washing does not remove the fundamental incompatibility of non-silicone chemistry over silicone; only silicone bonds to silicone.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 15, Chapter 1 (Silicone coatings)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-004",
      type: "mcq",
      question: "A cold-storage facility with high interior humidity needs a coating chosen specifically to stop vapor drive through the roof assembly. An applicator proposes a butyl coating. Per the NRCA guidelines, what makes butyl appropriate here, and what installation caveat must be planned for?",
      options: [
        { id: "A", text: "Butyl cures by solvent evaporation to a film with a very low perm rating (about 0.001 or lower), making it suited to stopping vapor drive in cold-storage/high-humidity applications; however, butyl is typically UV-sensitive and must be top-coated with another coating or otherwise covered to limit sunlight exposure" },
        { id: "B", text: "Butyl is chosen because it is highly breathable (perm rating 50), letting the assembly dry to the exterior; no UV protection is needed" },
        { id: "C", text: "Butyl is a two-component reactive coating that needs no top coat and is fully UV-stable on its own" },
        { id: "D", text: "Butyl is a water-based coating that must be applied above 38 F and is unsuitable for any humidity-control role" }
      ],
      answer: "A",
      explanation: "The NRCA guidelines describe butyl as a rubber polymer with a solvent base that cures by solvent evaporation, leaving a film with a perm rating of 0.001 or lower - very low permeability, which is why butyl coatings are typically used to stop vapor drive in cold-storage or high-humidity applications. The guidelines also note butyl is typically UV-sensitive and is either top-coated with another coating or covered in some way to minimize sunlight exposure. Option B inverts the perm rating (0.001 is essentially a vapor barrier, not breathable) and omits the UV caveat. Option C mis-describes butyl's cure (evaporation, not two-component) and its UV behavior. Option D mis-classifies butyl as water-based.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 15, Chapter 1 (Butyl coatings)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-005",
      type: "mcq",
      question: "An estimator is comparing two coatings and needs to calculate theoretical coverage. The NRCA guidelines give a reference figure for a coating that is 100% solids by volume. Which statement correctly reflects the guideline's coverage math and the solids distinction the estimator must respect?",
      options: [
        { id: "A", text: "Coverage should be compared using solids by weight, because weight is what gets billed; solids by volume is irrelevant to coverage" },
        { id: "B", text: "One gallon of a coating that is 100% solids by volume covers about 1,604 square feet at 1 dry mil; coverage comparisons between products should use solids by VOLUME (not weight), since solids by weight and solids by volume can differ significantly for the same coating" },
        { id: "C", text: "One gallon of any coating covers exactly 1,604 square feet at 1 dry mil regardless of its solids content" },
        { id: "D", text: "Coverage cannot be estimated at all without a manufacturer-supplied field coverage report; no theoretical figure exists" }
      ],
      answer: "B",
      explanation: "The NRCA guidelines define the theoretical coverage rate: one gallon of a coating with 100% solids content by volume covers a 1,604-square-foot area at 1 dry mil thickness, and that definition can be scaled to calculate theoretical coverage for coatings with less than 100% solids. The guidelines also stress that solids by weight (SBW) and solids by volume (SBV) can vary significantly, and that solids by volume is the property used to compare coverage between products. Option A reverses the correct basis - coverage compares by volume, not weight. Option C drops the '100% solids' condition, which is exactly what changes the result. Option D ignores the documented theoretical figure (ASTM D2697 measures solids by volume for this purpose).",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 20-21, Chapter 2 (Coating solids by volume)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-006",
      type: "mcq",
      question: "On a two-coat job, an applicator wants to put the top coat down as soon as the base coat is 'dry.' The inspector cautions that 'dry' and 'cured' are not the same. Per the NRCA guidelines' drying terminology, which condition specifically indicates the base coat is ready to receive the top coat?",
      options: [
        { id: "A", text: "Tack free - dust will not stick to the coating - which means the coating is fully cured and ready for the top coat" },
        { id: "B", text: "Dry to touch - touching with the weight of the hand only leaves no fingerprint - which is the point at which the next coat can always be applied" },
        { id: "C", text: "Dry to recoat - the base coat can be walked on and the top coat can be applied without volatiles being trapped between the coats; note a coating may be dry to the touch yet not fully cured, and some coatings take 30 days or longer to fully cure" },
        { id: "D", text: "Cured - the applicator must wait the full cure period (up to 30 days or longer) before applying any top coat" }
      ],
      answer: "C",
      explanation: "The NRCA guidelines distinguish three drying states: tack free (dust will not stick), dry to touch (hand-weight touch leaves no fingerprint), and dry to recoat (the base coat can be walked on and the top coat applied without volatiles being trapped between the coats). The recoat-readiness condition is specifically 'dry to recoat.' Option A confuses tack free with full cure - a coating can be tack free and far from cured. Option B mis-states 'dry to touch' as the recoat point; trapping volatiles is the risk if you recoat too early. Option D over-waits - you do not need full cure (which can be 30+ days) to recoat; you need 'dry to recoat.'",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 19, Chapter 2 (Roof Coating Drying and Curing Mechanisms)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-007",
      type: "mcq",
      question: "An applicator is planning a single-component polyurethane (or single-component silicone) coating job in a hot, very DRY desert climate. Per the NRCA guidelines' description of curing mechanisms, what should the applicator anticipate about cure in that environment?",
      options: [
        { id: "A", text: "These coatings cure purely by solvent evaporation, so dry desert air will cure them fastest of all environments with no special considerations" },
        { id: "B", text: "These coatings cure only by a two-component chemical reaction, so ambient humidity is irrelevant" },
        { id: "C", text: "Cure is unaffected by environment; only film thickness matters" },
        { id: "D", text: "Single-component urethane and silicone coatings cure by reaction with moisture from the air, so cure highly depends on ambient moisture and temperature; in dry climates, curing may require a specific catalyst or may not be recommended" }
      ],
      answer: "D",
      explanation: "The NRCA guidelines describe curing by oxidation or reaction with moisture as a mechanism in which binders react with oxygen or moisture from the air; single-component urethane and silicone roof coatings are cited examples. Because they are moisture-curing, they highly depend on ambient moisture and temperature, and in dry climates curing may require a specific catalyst or may not be recommended. Option A wrongly assigns evaporation-only curing (that is the mechanism for acrylics and aluminum/asphalt coatings, not single-component urethane/silicone). Option B describes two-component (plural) coatings, not single-component. Option C contradicts the guideline's emphasis that ambient temperature, humidity, wind and solar radiation all affect cure.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 20, Chapter 2 (Curing by oxidation or reaction with moisture)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-008",
      type: "mcq",
      question: "A building owner wants a reflective coating applied to a TPO thermoplastic single-ply roof that was installed about 18 months ago. Per the NRCA guidelines on substrate suitability, what is the correct professional response?",
      options: [
        { id: "A", text: "A recently installed thermoplastic single-ply membrane (typically less than three to five years old, depending on environment) usually needs more weathering time before it will accept a coating; a field dirt pickup test such as the masking tape test can be used to confirm whether the membrane has weathered enough - so the 18-month roof is likely not ready yet" },
        { id: "B", text: "Coat it immediately - newer thermoplastic membranes are the ideal substrate because they are cleanest" },
        { id: "C", text: "Thermoplastic membranes can never be coated regardless of age" },
        { id: "D", text: "Apply the coating only if the membrane is less than two years old; older membranes are too oxidized to coat" }
      ],
      answer: "A",
      explanation: "The NRCA guidelines list recently installed thermoplastic single-ply roof systems among surfaces generally NOT adequate as coating substrates: thermoplastic membranes less than about three to five years old (depending on environment) typically need more weathering time to present a surface that allows coatings to adhere, and UV exposure plays a critical part in that weathering. A field dirt pickup test (the masking tape test) can determine whether the membrane has weathered sufficiently. An 18-month-old TPO is below that window, so the correct answer is to test/wait. Option B is the opposite of the guidance. Option C overstates - aged thermoplastics (typically 3-5 years) CAN be coated. Option D inverts the age relationship entirely.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 26, Chapter 3 (Substrate and Surface Evaluation)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-009",
      type: "mcq",
      question: "During a coating-candidacy assessment, an inspector finds that a roof still holds standing water in several areas more than 48 hours after rain, and an infrared survey suggests roughly 30% of the roof area is moisture-laden. Per the NRCA guidelines, how should these two findings affect the coating decision?",
      options: [
        { id: "A", text: "Neither finding matters; a coating will seal over standing water and trapped moisture" },
        { id: "B", text: "Both findings are disqualifying under NRCA guidance: NRCA's positive-drainage criterion is no standing water 48 hours after a rain event under drying conditions (so this roof fails drainage), and as a rule of thumb a roof is not a coating candidate if more than 25% of the roof area is moisture-laden (so ~30% also fails) - drainage and wet insulation must be addressed before any coating is considered" },
        { id: "C", text: "Only the moisture reading matters; ponding water is acceptable for all coatings" },
        { id: "D", text: "Only the ponding matters; moisture-laden insulation has no bearing on coating candidacy" }
      ],
      answer: "B",
      explanation: "The NRCA guidelines give two relevant criteria. First, NRCA's criterion for positive drainage is that there be no standing water on a roof 48 hours after a rain event during conditions conducive to drying; a roof that still ponds fails this and generally will not perform satisfactorily under ponded water unless the coating is specifically designed/tested for submersion. Second, as a rule of thumb a roof system is not a candidate for coating if more than 25% of the roof area is moisture-laden; ~30% exceeds that. All moisture-laden insulation must be located (infrared/nuclear/core cuts) and removed/replaced, and positive slope provided, BEFORE coating. Options A, C, and D each ignore one or both disqualifying criteria.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 27, Chapter 3 (criteria to rule out a roof; Repairs Required Before Coating)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-010",
      type: "mcq",
      question: "After pressure-washing a roof, an applicator performs a masking tape test in a previously dirty low spot. The tape comes off easily and its adhesive side is covered with dirt and a soapy film. Per the NRCA guidelines, what does this result mean and what is the next step?",
      options: [
        { id: "A", text: "The surface is ready to coat - tape lifting off easily proves the surface is smooth and clean" },
        { id: "B", text: "The result is inconclusive; the masking tape test only works on metal panel roofs" },
        { id: "C", text: "The surface is NOT suitable for coating: tape that comes off easily with its adhesive side covered in dirt, soap film, or degraded roofing material indicates inadequate cleaning, and the roof surface should be cleaned again before coating" },
        { id: "D", text: "The surface is suitable; soap film on the tape is expected and improves coating adhesion" }
      ],
      answer: "C",
      explanation: "The NRCA guidelines describe the masking tape field dirt pickup test: place masking tape firmly on the roof surface in a previously dirty area or low spot, then slowly peel it off. If the tape comes off easily and the adhesive side is covered with dirt, soap film, or degraded roofing material, the roof surface is NOT suitable for coating and should be cleaned again. If the tape adheres well, offers some resistance when peeled, and the adhesive side is generally dirt-free, the surface is suitable. The described result (easy release, dirty/soapy adhesive) is the failing case. Option A inverts the pass/fail interpretation. Option B is wrong - the test is a general surface-cleanliness check, not metal-only. Option D wrongly treats soap film as acceptable; residual soap film interferes with adhesion.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 31, Chapter 3 (Field dirt pickup tests - masking tape test)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-011",
      type: "mcq",
      question: "An applicator is preparing a through-fastened metal panel roof for coating and plans to pressure-wash the entire roof a week ahead of time, then use a hydrocarbon solvent wipe to 'really get it clean.' Per the NRCA guidelines on cleaning and timing, what should be corrected in this plan?",
      options: [
        { id: "A", text: "Nothing - washing a week ahead and using hydrocarbon solvent are both best practice" },
        { id: "B", text: "Only the timing is wrong; hydrocarbon solvent is the preferred cleaner for all roof surfaces" },
        { id: "C", text: "Only the solvent is wrong; washing timing has no effect on coating adhesion" },
        { id: "D", text: "Both items need correction: power washing should be performed no more than about 24 to 36 hours before coating to limit the window for re-contamination, and hydrocarbon solvents should NOT be used on roof surfaces except when recommended by the roof system manufacturer (preferred cleaning agents are water-soluble products that leave no residue). On through-fastened metal roofs, excessive water pressure can also dislodge otherwise-functional fastener seals" }
      ],
      answer: "D",
      explanation: "The NRCA guidelines state power washing should be performed no more than 24 to 36 hours before coating application to minimize the window when inadvertent contamination can occur; washing a full week ahead is too early. They also state hydrocarbon solvents should not be used on roof system surfaces except when recommended by the roof system manufacturer, and that preferred cleaning agents/degreasers are water-soluble products that do not leave a residue after rinsing. Additionally, on through-fastened metal roofs, high-pressure spray can dislodge otherwise-functional fastener seals and damage foam baffle seals. Option A endorses both errors. Options B and C each correct only one of the two problems.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 30, Chapter 3 (Cleaning roof substrates; power washing timing)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RCAF-012",
      type: "mcq",
      question: "Before coating a large roof, an inspector runs a field peel test to confirm adhesion. They prepare a 1-square-foot area exactly as the full roof will be prepared, embed a fabric strip in two thin coats, let it cure, then peel the fabric tail back 180 degrees with a fish scale. Per the NRCA guidelines, what cure time and what measured force indicate sufficient adhesion?",
      options: [
        { id: "A", text: "Allow a minimum of about three to seven days of cure under ordinary conditions; a pull of about 3 to 5 pounds of force per inch of specimen width (peeled 180 degrees parallel to the substrate) indicates sufficient adhesion for excellent performance in most coating applications" },
        { id: "B", text: "Allow 30 minutes of cure; any force above 1 pound per inch passes" },
        { id: "C", text: "Allow 30 days of full cure; the test passes only above 20 pounds per inch of width" },
        { id: "D", text: "No cure time is needed; peel immediately after application and any resistance at all indicates a passing bond" }
      ],
      answer: "A",
      explanation: "The NRCA guidelines describe the field peel test: prepare a representative area (as small as 1 square foot) using the SAME cleaning/preparation methods and materials that will be used on the roof, embed a fabric strip in two thin coats, and allow it to cure. For most coatings under ordinary curing conditions, a minimum of three to seven days of cure should be allowed. To test, the fabric tail is pulled back in a smooth peeling motion 180 degrees parallel to the substrate with consistent force; 3 to 5 pounds of force per inch width of test specimen indicates sufficient adhesion strength for excellent performance in most coating applications (a fish scale gives an accurate reading). Option B under-cures and uses the wrong threshold. Option C over-states both cure time and force (20 lb/in is far beyond the general-field criterion; mastics at seams need higher force, not field coatings). Option D skips cure entirely, which would measure nothing meaningful.",
      cite: "NRCA Guidelines for Roof Coating Applicators - p. 36, Chapter 4 (Peel Tests)",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const NRCA_ROOF_COATING_APPLICATOR_FUNDAMENTALS_QUESTION_BANK_2026 = {
  ...NRCA_ROOF_COATING_APPLICATOR_FUNDAMENTALS_QUESTION_BANK_2026_RAW,
  questions: NRCA_ROOF_COATING_APPLICATOR_FUNDAMENTALS_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = NRCA_ROOF_COATING_APPLICATOR_FUNDAMENTALS_QUESTION_BANK_2026;
