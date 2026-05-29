// NRCA - Roofing Equipment Cost Fundamentals - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books, NOT in Chat)
//
// Source PDF (internal only, never served via /api/book or /api/books):
//   sources/nrca/pdfs/2026-04-nrca-roofing-contractors-equipment-cost-schedule.pdf
// Per-question provenance lives in:
//   sources/nrca/citations.json
//
// Exam-only bank. Display title (verbatim, no "(Bank)" suffix per product owner):
//   "Roofing Equipment Cost Fundamentals"
//
// IMPORTANT - antitrust / pricing discipline:
//   The source schedule's foreword states it is NOT a benchmark for any
//   contractor's pricing, bids, rental rates or markups. Accordingly, these
//   questions teach the METHODOLOGY (how equipment ownership cost rates are
//   built and derived) and deliberately avoid copying or implying specific
//   dollar prices. Only the document's own worked-example methodology
//   percentages are used.
//
// Honest capacity: the teachable methodology (Explanation of Equipment Cost
// Tables + The Schedule to Arrive at Expense per Month, pp. 1-3 plus foreword)
// supports 10 strong, non-overlapping, beginner-friendly questions. No filler.

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

const NRCA_ROOFING_EQUIPMENT_COST_FUNDAMENTALS_QUESTION_BANK_2026_RAW = {
  book: "Roofing Equipment Cost Fundamentals",
  questions: [
    {
      id: "RECF-001",
      type: "mcq",
      question: "A new estimator sees an equipment 'COST' figure in the schedule and assumes it is the delivered, ready-to-run price at the contractor's yard. Per the schedule's stated basis, what does that listed cost actually represent?",
      options: [
        { id: "A", text: "The final retail price a contractor pays after sales tax, fuel, and delivery to the jobsite" },
        { id: "B", text: "The used/resale value of the equipment after several years of service" },
        { id: "C", text: "An average of known suppliers' list prices, f.o.b. (free on board) the point of manufacture, plus 10% added for freight - so it does NOT yet include taxes, fuel, crew, or jobsite mobilization" },
        { id: "D", text: "A contractor's confidential negotiated price that should be used as the bid number" }
      ],
      answer: "C",
      explanation: "The schedule states equipment costs are based on the average list prices of known suppliers, f.o.b. their points of manufacture, plus 10% for freight. 'F.o.b. point of manufacture' means the price is set at the factory before shipping; the schedule adds 10% to approximate freight. Option A is wrong because the listed cost explicitly does NOT include sales/use taxes, fuel, or jobsite delivery beyond the 10% freight allowance. Option B is wrong - this is a new-equipment cost basis, not resale/salvage value (salvage is not even used in the depreciation math). Option D misreads the document, which states it must not be used as a pricing or bid benchmark.",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - p. 1 (Explanation of Equipment Cost Tables)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-002",
      type: "mcq",
      question: "A contractor wants to know the TRUE cost of running a piece of equipment on a job and plans to use the schedule's monthly rate as-is. Per the schedule, which costs are NOT included in those figures and therefore must be added separately to reach an actual cost?",
      options: [
        { id: "A", text: "Nothing additional - the monthly rate already includes fuel, operator wages, and taxes" },
        { id: "B", text: "Only depreciation needs to be added; everything else is included" },
        { id: "C", text: "Only the 10% freight needs to be removed; all other operating costs are already built in" },
        { id: "D", text: "Loading, erecting, operating and dismantling; fuel; lubricants; expendable items; operator wages and crew transportation; general business expenses; and sales/use taxes - all of these are excluded and must be accounted for separately" }
      ],
      answer: "D",
      explanation: "The schedule explicitly states the equipment costs do NOT take into account loading, erecting, operating or dismantling; fuel; lubricants; expendable items; wages or transportation of operating crews; or any of a contractor's general business expenses, and that sales and use taxes are not included - all of which should be taken into account when calculating actual costs. The schedule's rates represent equipment OWNERSHIP cost only, not the cost of operating it. Option A is the opposite of the stated basis. Option B ignores the long list of excluded operating costs. Option C misunderstands the 10% freight (which is part of the cost basis, not an operating cost to strip out).",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - p. 1 (Explanation of Equipment Cost Tables)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-003",
      type: "mcq",
      question: "An estimator knows the monthly ownership rate for a piece of equipment but needs the weekly, daily, and hourly rates. Per the schedule's method, how are those shorter-term rates obtained?",
      options: [
        { id: "A", text: "They are derived from the monthly rate using industry-average multipliers: weekly = monthly x 0.35, daily = monthly x 0.13, and hourly = monthly x 0.016" },
        { id: "B", text: "Weekly = monthly divided by 4, daily = monthly divided by 30, hourly = monthly divided by 720 (calendar time)" },
        { id: "C", text: "Each shorter-term rate is looked up from a completely separate survey, unrelated to the monthly rate" },
        { id: "D", text: "Weekly, daily, and hourly rates all equal the monthly rate; the equipment costs the same regardless of how long it is used" }
      ],
      answer: "A",
      explanation: "The schedule states the monthly rate is calculated first, and all other rates are derived from it using percentages based on industry averages: weekly rate = monthly x 0.35, daily rate = monthly x 0.13, hourly rate = monthly x 0.016 (rounded to the nearest dollar). Option B is wrong because the rates are NOT simple calendar fractions - a week is not 0.25 of a month in this model, because short-term use carries proportionally higher cost. Option C is wrong - the shorter rates are derived FROM the monthly rate, not independently surveyed. Option D ignores that shorter durations are billed at higher effective rates per unit time.",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - p. 1 (The Schedule to Arrive at Expense per Month)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-004",
      type: "mcq",
      question: "In the Schedule to Arrive at Expense per Month, the trucks example adds depreciation (33%), maintenance and repairs (12%), and interest/taxes/storage/insurance (12.5%) for a total of 57.5% (Column 4), with an estimated average use of 8 months per year (Column 5). What is the resulting monthly percentage of equipment cost (Column 6), and how is it calculated?",
      options: [
        { id: "A", text: "57.5% - Column 6 simply repeats the total annual percentage from Column 4" },
        { id: "B", text: "About 7.2% - Column 6 is the total annual percentage (57.5%) divided by the average number of months of use per year (8), spreading the yearly ownership cost across only the months the equipment actually earns" },
        { id: "C", text: "About 4.8% - Column 6 is the total annual percentage divided by 12 calendar months" },
        { id: "D", text: "About 0.72% - Column 6 is the total divided by 8 and then by 10 for freight" }
      ],
      answer: "B",
      explanation: "Column 6 (percentage of cost of equipment per month) is Column 4 (the total of depreciation; maintenance and repairs; and interest, taxes, storage and insurance) divided by Column 5 (average use in months per year). For trucks: 57.5 / 8 = about 7.2%. The monthly rate is then the equipment cost multiplied by that 7.2%. Option A confuses the annual total (Column 4) with the monthly figure (Column 6). Option C uses 12 calendar months instead of the 8 months the equipment is actually in use - which would understate the rate, because idle months still must be paid for during the working months. Option D invents an extra freight division that is not part of the method.",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - p. 1 (The Schedule to Arrive at Expense per Month - trucks example)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-005",
      type: "mcq",
      question: "A contractor questions why the schedule's depreciation does not credit the equipment's eventual resale value. Per the schedule, what depreciation method is used and how is salvage value treated?",
      options: [
        { id: "A", text: "Accelerated (double-declining-balance) depreciation, with salvage value subtracted up front" },
        { id: "B", text: "Depreciation is based on actual market resale value each year, tracked from auction data" },
        { id: "C", text: "The straight-line method - a uniform amount charged for each year of useful life - and salvage or scrap value is NOT taken into account; rates assume one-shift-per-day operation and may need adjustment for individual conditions" },
        { id: "D", text: "No depreciation is applied because equipment is assumed to last indefinitely" }
      ],
      answer: "C",
      explanation: "The schedule states depreciation is calculated by the straight-line method, by which a uniform amount is charged for each year of useful life, and that salvage or scrap value is not taken into account. The rates are based on one-shift-per-day operations and represent average experience, so adjustments may be needed for individual conditions. Option A is wrong - it is straight-line, not accelerated, and salvage is ignored rather than subtracted. Option B is wrong - depreciation is a fixed straight-line estimate of wear and tear, not a year-by-year market valuation. Option D is wrong - equipment has a finite estimated useful life (which is exactly what sets the depreciation percentage).",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - p. 2 (Depreciation)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-006",
      type: "mcq",
      question: "On the schedule's chart, consumable hand tools, mopping carts, and single-ply tools all show a depreciation percentage of 100%, while trucks show 33%. Using the straight-line logic behind the schedule, what does a 100% depreciation rate tell you about that equipment's estimated useful life?",
      options: [
        { id: "A", text: "A 100% rate means an estimated useful life of about one year (the full value is written off in a single year), whereas 33% corresponds to roughly a three-year life and 20% to about a five-year life" },
        { id: "B", text: "A 100% rate means the equipment never wears out and lasts forever" },
        { id: "C", text: "A 100% rate means the tool is twice as durable as a truck and should be depreciated over ten years" },
        { id: "D", text: "Depreciation percentage has no relationship to useful life; the numbers are assigned at random" }
      ],
      answer: "A",
      explanation: "With straight-line depreciation, the annual percentage is the inverse of the estimated useful life in years. The schedule's trucks example states a three-year useful life produces a 33% annual depreciation rate; by the same logic a 100% rate writes off the entire value in one year (a roughly one-year life, typical of consumable or hard-used tools), and a 20% rate corresponds to about a five-year life. Option B inverts the meaning - 100% indicates the SHORTEST life, not an indefinite one. Option C contradicts the inverse relationship. Option D is wrong - the percentage is directly tied to the estimated useful life.",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - pp. 1-3 (trucks example; Schedule chart, Column 1 Depreciation)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-007",
      type: "mcq",
      question: "Across nearly every equipment category in the schedule chart, Column 3 (interest, taxes, storage and insurance) shows the same value: 12.5%. Per the schedule's explanations, which set of component rates adds up to that 12.5%?",
      options: [
        { id: "A", text: "Interest 10% + taxes 2% + storage 0.5% = 12.5%, with insurance billed separately" },
        { id: "B", text: "It is a flat franchise fee unrelated to interest, taxes, storage, or insurance" },
        { id: "C", text: "Interest 8% + insurance 4.5% = 12.5%, with taxes and storage excluded" },
        { id: "D", text: "Interest 5.5% + taxes 1.5% + storage 3.5% + insurance 2.0% = 12.5%" }
      ],
      answer: "D",
      explanation: "The schedule explains each component of Column 3: interest is 5.5% (the contractor's average cost of obtaining money to buy equipment), taxes are 1.5% (personal property and corporate taxes on the equipment's capital value; sales taxes excluded), storage is 3.5% (warehouse/yard costs while equipment sits between jobs), and insurance is 2.0% (premiums covering risks such as fire and theft). Together: 5.5 + 1.5 + 3.5 + 2.0 = 12.5%, which is why Column 3 is essentially constant across categories. Options A and C use figures that do not match the stated component rates, and Option B ignores the documented breakdown.",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - pp. 2-3 (Interest, Taxes, Storage and Insurance; Schedule chart Column 3)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-008",
      type: "mcq",
      question: "A contractor argues that storage should not be part of an equipment's ownership cost because 'it isn't even being used' when stored. Per the schedule, why is a storage allowance (3.5%) included, and what does it cover?",
      options: [
        { id: "A", text: "Storage is a fuel surcharge applied only while the equipment is running on a job" },
        { id: "B", text: "Storage costs are incurred precisely BECAUSE equipment sits idle between jobs; the 3.5% covers rental and maintenance of warehouses/yards, related wages, and the direct costs of storage facilities and equipment handling" },
        { id: "C", text: "Storage is the cost of the operator's hotel and per-diem while traveling to jobs" },
        { id: "D", text: "Storage is double-counted depreciation and should be removed from any honest estimate" }
      ],
      answer: "B",
      explanation: "The schedule states storage costs are incurred when equipment is not used between jobs and are composed of rental costs and maintenance of warehouses and yards, wages, and the direct costs associated with storage facilities and equipment handling - estimated at 3.5%. Idle time is exactly when storage cost accrues, so it is a legitimate ownership cost even though no work is being performed. Option A confuses storage with fuel. Option C confuses storage with crew travel/lodging (which is part of the excluded operating costs, not storage). Option D is wrong - storage is a distinct ownership cost, not duplicated depreciation.",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - p. 2 (Interest, Taxes, Storage and Insurance - Storage)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-009",
      type: "mcq",
      question: "In the schedule, Column 5 (average use, number of months per year) is 8 for essentially all equipment, even though a year has 12 months. Why does the method spread the annual ownership cost over 8 months rather than 12, and what is the practical effect on the monthly rate?",
      options: [
        { id: "A", text: "Because equipment is only owned for 8 months and then returned; spreading over 8 has no effect on the rate" },
        { id: "B", text: "It is an arithmetic error in the schedule; it should always be 12 months" },
        { id: "C", text: "Because roofing equipment, on industry average, is actively used only about 8 months per year; dividing the annual ownership percentage by 8 (rather than 12) raises the monthly rate so the equipment recovers its full yearly cost during the months it actually earns" },
        { id: "D", text: "Because there are only 8 billable months in a calendar year by law" }
      ],
      answer: "C",
      explanation: "Column 6 is the annual ownership percentage (Column 4) divided by Column 5, the estimated average number of months the equipment is in use per year. The schedule uses 8 months as an industry-average figure, reflecting that roofing equipment typically does not earn revenue all 12 months (weather, seasonality, idle time between jobs). Dividing by 8 instead of 12 yields a HIGHER monthly rate, allowing the owner to recover the full annual cost of ownership during the months the equipment is actually working. Option A misstates ownership duration. Option B wrongly calls the deliberate 8-month assumption an error. Option D invents a nonexistent legal limit.",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - p. 1 (The Schedule to Arrive at Expense per Month - Column 5)",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "RECF-010",
      type: "mcq",
      question: "A sales manager proposes printing the schedule's monthly rates directly into customer bids and rental contracts as 'the NRCA standard rate.' Per the schedule's foreword, why is this improper, and how is the document intended to be used?",
      options: [
        { id: "A", text: "It is improper because the foreword states the publication is NOT intended to establish, recommend, or serve as a benchmark for any contractor's pricing, bids, rental rates or markups; it must be used in compliance with antitrust/competition laws, and each contractor must independently determine its own prices. It is meant as a general direct-cost reference used alongside the company's own estimating system and business judgement" },
        { id: "B", text: "It is fine - the schedule is an official NRCA-mandated price list that all members must charge" },
        { id: "C", text: "It is improper only because the rates are too low; doubling them first makes it acceptable to publish as the NRCA standard" },
        { id: "D", text: "It is improper because NRCA charges a per-bid royalty for using its rates" }
      ],
      answer: "A",
      explanation: "The foreword states the publication is not intended to establish, recommend, influence or serve as a benchmark for any contractor's pricing, bids, rental rates, markups or other competitive business decisions; that NRCA does not collect, publish or endorse specific pricing; and that each contractor and market participant must independently determine its own prices, rates, terms and conditions, using the document only in compliance with applicable antitrust and competition laws. It is intended as a general reference for determining DIRECT costs, used in conjunction with the company's own estimating system, pricing models, and best business judgement. Option B contradicts the antitrust guidance (there is no mandated price list). Option C still treats it as a publishable benchmark, which is the core problem. Option D invents a royalty that does not exist.",
      cite: "NRCA Roofing Contractors Equipment Cost Schedule - Foreword",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const NRCA_ROOFING_EQUIPMENT_COST_FUNDAMENTALS_QUESTION_BANK_2026 = {
  ...NRCA_ROOFING_EQUIPMENT_COST_FUNDAMENTALS_QUESTION_BANK_2026_RAW,
  questions: NRCA_ROOFING_EQUIPMENT_COST_FUNDAMENTALS_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = NRCA_ROOFING_EQUIPMENT_COST_FUNDAMENTALS_QUESTION_BANK_2026;
