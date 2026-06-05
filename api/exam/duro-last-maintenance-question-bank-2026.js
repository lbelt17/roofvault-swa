// Duro-Last Care and Maintenance Guide - Question Bank
// BANK-ONLY (exam generation only, NOT listed in /api/books)
//
// Source PDF: maintenance_checklist.pdf
// Authoring target: 30 maintenance/care questions grounded in source text.


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

const DURO_LAST_MAINTENANCE_QUESTION_BANK_2026_RAW = {
  book: "Duro-Last Care and Maintenance Guide",
  questions: [
    {
      id: "DLMAINT-001",
      type: "mcq",
      question: "A facility manager is establishing a preventive maintenance schedule for a Duro-Last single-ply roof. According to the Care and Maintenance Guide, how frequently should routine inspections be conducted, and during which seasons?",
      options: [
        { id: "A", text: "Once per year during summer only" },
        { id: "B", text: "At least twice per year, in the spring and fall" },
        { id: "C", text: "Monthly throughout the year" },
        { id: "D", text: "Only when interior leaks are reported" }
      ],
      answer: "B",
      explanation: "The guide requires routine inspections at least twice per year using the Inspection Maintenance Checklist—once in spring to identify maintenance items that can be scheduled, and once in fall to confirm the roof is ready for winter conditions.",
      cite: "maintenance_checklist.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-002",
      type: "mcq",
      question: "During a spring inspection of a Duro-Last roof, the owner representative's primary objective per the maintenance guide is to:",
      options: [
        { id: "A", text: "Verify the roof is ready to withstand winter weather" },
        { id: "B", text: "Identify maintenance items that can be scheduled for the roofing system" },
        { id: "C", text: "Schedule the mandatory Duro-Last QA inspection for year 10" },
        { id: "D", text: "Power-wash the membrane to restore solar reflectivity" }
      ],
      answer: "B",
      explanation: "Spring inspections focus on finding maintenance needs that can be planned and scheduled. Fall inspections, by contrast, confirm the roof is prepared for winter. Both use the same checklist but serve different seasonal purposes.",
      cite: "maintenance_checklist.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-003",
      type: "mcq",
      question: "After a hailstorm, the building owner reports no interior water intrusion. Based on Duro-Last maintenance guidance, what should the owner do next?",
      options: [
        { id: "A", text: "Defer inspection until the next scheduled spring evaluation" },
        { id: "B", text: "Inspect the roof for damage because absence of interior leaks does not rule out roof damage" },
        { id: "C", text: "Assume the membrane is undamaged and take no action" },
        { id: "D", text: "Apply a solvent-based cleaner to remove hail residue" }
      ],
      answer: "B",
      explanation: "The guide states that water not coming in does not mean the roof has not been damaged. Post-severe-weather inspections should always be performed after events such as hailstorms, heavy rains, or high winds so that repairs can be made while they are still small and less costly.",
      cite: "maintenance_checklist.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-004",
      type: "mcq",
      question: "A maintenance technician discovers a small puncture in the Duro-Last membrane and plans to patch it using generic roofing materials from a local supplier. Per the Care and Maintenance Guide, who must perform roofing repairs and what materials must be used?",
      options: [
        { id: "A", text: "Any licensed roofer using ASTM-compliant generic TPO patch materials" },
        { id: "B", text: "The building's in-house maintenance staff using whatever materials are on hand" },
        { id: "C", text: "A Duro-Last authorized dealer/contractor or QA Technical Representative using Duro-Last materials" },
        { id: "D", text: "The original installing contractor only, regardless of authorization status" }
      ],
      answer: "C",
      explanation: "All roofing repairs must be performed by a Duro-Last authorized dealer/contractor or a Duro-Last Quality Assurance Technical Representative, and must be made with Duro-Last materials. Improper repairs by unauthorized personnel with non-Duro-Last materials are a common cause of roof problems and are typically not covered by warranty.",
      cite: "maintenance_checklist.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-005",
      type: "mcq",
      question: "Leaves, branches, and trade debris have accumulated around roof drains on a Duro-Last system. What tools does the guide recommend for removing debris from the membrane?",
      options: [
        { id: "A", text: "Metal shovels and wire brushes" },
        { id: "B", text: "A push broom or plastic shovel" },
        { id: "C", text: "A pressure washer set above 2,000 PSI" },
        { id: "D", text: "Solvent-based degreasers applied directly to the membrane" }
      ],
      answer: "B",
      explanation: "Debris should always be removed with a push broom or plastic shovel. Trash and debris can puncture the roofing system and create safety hazards, and can also overload the structure when drainage is blocked. Gutters, downspouts, drains, scuppers, and surrounding roof areas must also be kept clean.",
      cite: "maintenance_checklist.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-006",
      type: "mcq",
      question: "During a fall inspection, the owner finds standing water near a drain because the strainer is clogged with sediment. Why is keeping drains clear a critical maintenance duty on a Duro-Last roof?",
      options: [
        { id: "A", text: "Clogged drains only affect aesthetic appearance of white membranes" },
        { id: "B", text: "Inadequate or insufficient drainage can cause damage not covered by the manufacturer's warranty" },
        { id: "C", text: "Drain maintenance is optional if scuppers are present" },
        { id: "D", text: "Standing water automatically voids only the color-change warranty provision" }
      ],
      answer: "B",
      explanation: "Drains that are clogged, broken, or not functioning properly leading to inadequate drainage are explicitly listed as items typically not covered by warranty. The owner must maintain and keep all drains in working order and clear of debris. Ponding from blocked drainage can also cause structural loading concerns.",
      cite: "maintenance_checklist.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-007",
      type: "mcq",
      question: "While inspecting metal flashings on a Duro-Last roof, the technician notes rust on counterflashing, deteriorated sealant at an expansion joint, and a loose pitch pocket cover. What corrective actions does the guide recommend?",
      options: [
        { id: "A", text: "Cover rust with duct tape and defer sealant replacement until reroofing" },
        { id: "B", text: "Reattach loose metalwork, replace sealant as necessary, repair metal as necessary, and prepare and paint rusted metal" },
        { id: "C", text: "Remove all metal flashings and rely on membrane-only terminations" },
        { id: "D", text: "Apply solvent-based paint remover before re-caulking" }
      ],
      answer: "B",
      explanation: "Metal components are a common point of water entry. The guide directs owners to examine flashings, counterflashings, expansion joints, and pitch pockets for rust, detachment, damage, and deteriorated sealant, then reattach loose metalwork, replace sealant, repair metal, and prepare and paint rusted metal as needed.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-008",
      type: "mcq",
      question: "Interior ceiling stains appear near a parapet wall on a building with a Duro-Last roof. The membrane field appears intact. What non-roofing condition should the maintenance checklist prompt the inspector to evaluate?",
      options: [
        { id: "A", text: "HVAC filter size in rooftop units" },
        { id: "B", text: "Masonry walls and copings for cracks at mortar joints, deteriorated sealants, and loose coping stones" },
        { id: "C", text: "Walkway pad color matching the membrane" },
        { id: "D", text: "Solar panel inverter settings" }
      ],
      answer: "B",
      explanation: "Water leaks from masonry are often incorrectly attributed to the roofing system. The guide requires examining masonry walls and copings for cracks at mortar joints, deteriorated sealants, loose coping stones, and indications of water, then repairing those conditions to prevent infiltration.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-009",
      type: "mcq",
      question: "An HVAC contractor completes coil cleaning on a rooftop unit over a Duro-Last membrane. What must the building owner verify after the service call to protect the roofing system?",
      options: [
        { id: "A", text: "That the contractor used the lowest-bid generic coil cleaner available" },
        { id: "B", text: "That only approved coil cleaners were used and that the roof was checked afterward for accidental damage" },
        { id: "C", text: "That the HVAC doors were left open for ventilation" },
        { id: "D", text: "That the membrane was power-washed at 1,500 PSI to remove cleaner residue" }
      ],
      answer: "B",
      explanation: "Rooftop equipment requires ongoing maintenance per manufacturer recommendations. After any HVAC service, the roof should be checked for accidental damage. Only approved coil cleaners should be used during routine HVAC maintenance to prevent potential membrane damage; a complete list is available on the Duro-Last website.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-010",
      type: "mcq",
      question: "Multiple trades access a Duro-Last roof weekly for equipment servicing. Which traffic-control practice does the maintenance guide recommend?",
      options: [
        { id: "A", text: "Allow unrestricted access to reduce scheduling delays" },
        { id: "B", text: "Minimize rooftop traffic, maintain a roof access log, and install walkway pads in high-traffic areas" },
        { id: "C", text: "Require all personnel to walk only on metal flashings" },
        { id: "D", text: "Remove walkway pads to expose the membrane to direct foot traffic" }
      ],
      answer: "B",
      explanation: "Most roofs are not designed for repeated long-term traffic. The guide recommends minimizing access to necessary personnel only, maintaining a roof access log to identify who was on the roof if trade damage occurs, and ensuring walkway pads are installed in areas of high traffic.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-011",
      type: "mcq",
      question: "A contractor proposes cleaning a heavily soiled Duro-Last white membrane with a power washer. What maximum pressure does the Care and Maintenance Guide permit?",
      options: [
        { id: "A", text: "500 PSI" },
        { id: "B", text: "750 PSI" },
        { id: "C", text: "1,000 PSI" },
        { id: "D", text: "2,500 PSI" }
      ],
      answer: "C",
      explanation: "When using a power washer on a Duro-Last roof, pressure must not exceed a maximum of 1,000 PSI. A wide-tip nozzle is required, and a minimum distance of 12 inches must be maintained between the nozzle and the roof surface. Damage caused by power washing is not covered under the Duro-Last Warranty.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-012",
      type: "mcq",
      question: "During membrane cleaning, a technician asks how close the power-washer nozzle may be held to the Duro-Last surface. What minimum distance does the guide require?",
      options: [
        { id: "A", text: "6 inches" },
        { id: "B", text: "12 inches" },
        { id: "C", text: "18 inches" },
        { id: "D", text: "Direct contact is acceptable with a wide-tip nozzle" }
      ],
      answer: "B",
      explanation: "Power washing requires a wide-tip nozzle with a maintained minimum distance of 12 inches between the nozzle and the roof. Exceeding 1,000 PSI or holding the nozzle too close can damage the membrane, and such damage is explicitly excluded from warranty coverage.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-013",
      type: "mcq",
      question: "A building engineer wants to use a solvent-based degreaser to remove oil stains from a Duro-Last membrane. What does the Care and Maintenance Guide state about solvent-based cleaners?",
      options: [
        { id: "A", text: "They are acceptable if rinsed within 24 hours" },
        { id: "B", text: "They are recommended for heavy industrial contamination" },
        { id: "C", text: "They cannot be used on the rooftop" },
        { id: "D", text: "They are required before applying Wash Safe Roof Wash" }
      ],
      answer: "C",
      explanation: "The guide permits non-sudsing, non-abrasive powdered cleansers such as Spic and Span or Simple Green for dirt and environmental debris, and Wash Safe Roof Wash from Duro-Last for biological growth. Solvent-based cleaners cannot be used. Membrane contamination by harmful chemicals such as oil and solvents is also listed as typically not covered by warranty.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-014",
      type: "mcq",
      question: "Biological growth is visible on a white Duro-Last membrane in a shaded area. Which cleaning approach aligns with the maintenance guide?",
      options: [
        { id: "A", text: "Apply turpentine or mineral spirits across the entire field" },
        { id: "B", text: "Use Wash Safe Roof Wash from Duro-Last to address biological growth" },
        { id: "C", text: "Scrub with a wire brush and petroleum solvent" },
        { id: "D", text: "Leave growth in place because it does not affect performance" }
      ],
      answer: "B",
      explanation: "Wash Safe Roof Wash from Duro-Last can keep the rooftop free of biological growth. Incorporating roof washing into routine maintenance helps maintain appearance and solar reflectivity on white membranes. Wire brushes and abrasive tools should not be used on finished surfaces.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-015",
      type: "mcq",
      question: "A new facilities director asks what roof-related records should be maintained in the building file. Per the guide, which records are recommended?",
      options: [
        { id: "A", text: "Only the original warranty document" },
        { id: "B", text: "Warranty document, inspection reports, repair and maintenance bills, and original construction drawings, specifications, and invoices" },
        { id: "C", text: "Employee time sheets for roof access only" },
        { id: "D", text: "HVAC manufacturer manuals exclusively" }
      ],
      answer: "B",
      explanation: "Owners should keep a file of all records relating to the roof, including the warranty document, inspection reports, repair and maintenance bills, and original construction drawings, specifications, and invoices. These records help with future repairs, equipment additions, and reroofing decisions.",
      cite: "maintenance_checklist.pdf - Page 4",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-016",
      type: "mcq",
      question: "Who may complete the annual spring and fall evaluations and fill out the Owner's Maintenance Checklist for a Duro-Last roof?",
      options: [
        { id: "A", text: "Only a Duro-Last Quality Assurance Technical Representative" },
        { id: "B", text: "Building owners or owner representatives, or authorized Duro-Last contractors if preferred" },
        { id: "C", text: "Any roofing contractor regardless of Duro-Last authorization" },
        { id: "D", text: "Only the installing authorized contractor in perpetuity" }
      ],
      answer: "B",
      explanation: "Building owners and owner representatives may complete the annual spring and fall evaluations. Authorized Duro-Last contractors may also be hired for these evaluations; the guide recommends using the authorized contractor that installed the system when possible. Separate QA Tech Rep inspections are required only during certain warranty years.",
      cite: "maintenance_checklist.pdf - Page 7",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-017",
      type: "mcq",
      question: "Under the Duro-Last warranty terms, what maintenance obligation must the Owner fulfill to remain eligible for coverage?",
      options: [
        { id: "A", text: "Exercise reasonable and diligent care in maintaining the system per the Care and Maintenance Guide" },
        { id: "B", text: "Perform daily membrane inspections regardless of weather" },
        { id: "C", text: "Power-wash the roof quarterly at maximum pressure" },
        { id: "D", text: "Restrict all maintenance to Duro-Last QA Tech Reps only" }
      ],
      answer: "A",
      explanation: "Warranty conditions require the Owner to exercise reasonable and diligent care in maintaining the Duro-Last System in accordance with the attached Care and Maintenance Guide. This includes regular inspections, post-storm assessments, debris removal, and keeping drains clear. Lack of routine maintenance is explicitly not covered by warranty.",
      cite: "maintenance_checklist.pdf - Page 2",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-018",
      type: "mcq",
      question: "A building owner delayed routine maintenance for three years and now has multiple membrane punctures from accumulated debris. How does the guide classify this situation relative to warranty coverage?",
      options: [
        { id: "A", text: "Covered because punctures are manufacturing defects" },
        { id: "B", text: "Lack of routine maintenance is typically not covered by the manufacturer's warranty" },
        { id: "C", text: "Covered if the owner schedules maintenance going forward" },
        { id: "D", text: "Covered only if the punctures are less than one inch in diameter" }
      ],
      answer: "B",
      explanation: "Items typically not covered by warranty include lack of routine maintenance, damage caused by other trades, excessive traffic, and improper repairs by unauthorized contractors. Forgetting about maintenance is identified as perhaps the single biggest cause of roof failure in the guide.",
      cite: "maintenance_checklist.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-019",
      type: "mcq",
      question: "An unauthorized contractor installed a new rooftop screen using non-Duro-Last flashing details, and a leak developed at the curb. Which warranty exclusion most directly applies?",
      options: [
        { id: "A", text: "Color change and pattern change" },
        { id: "B", text: "Improper repairs and/or materials by unauthorized contractors" },
        { id: "C", text: "Standing seam metal roof tie-in watertightness" },
        { id: "D", text: "Asbestos and mold liability" }
      ],
      answer: "B",
      explanation: "Improper repairs and/or materials by unauthorized contractors are listed as typically not covered. Warranty terms also exclude damage from unauthorized modifications, including additional equipment or structures added to the roof and damage caused by other trades such as improperly installed new equipment.",
      cite: "maintenance_checklist.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-020",
      type: "mcq",
      question: "Foot traffic from window washers and signage installers has worn pathways on a Duro-Last roof without walkway protection. Which warranty exclusion is most relevant?",
      options: [
        { id: "A", text: "Hail and wind storms" },
        { id: "B", text: "Excessive traffic on the roof" },
        { id: "C", text: "Color change on white membranes" },
        { id: "D", text: "Condensation in the roof assembly" }
      ],
      answer: "B",
      explanation: "Excessive traffic on the roof is explicitly listed among items typically not covered by warranty. Warranty exclusions also include damage from unauthorized modifications such as rooftop traffic and failure to use reasonable care. Walkway pads should be installed and kept securely welded in high-traffic areas.",
      cite: "maintenance_checklist.pdf - Page 6",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-021",
      type: "mcq",
      question: "During a routine inspection per the checklist on pages 10–11, the inspector walks the field of the roof and feels a spongy area underfoot. What does this finding indicate should be investigated?",
      options: [
        { id: "A", text: "Only cosmetic surface contamination" },
        { id: "B", text: "Soft areas that may signal damage or deficiencies requiring further evaluation" },
        { id: "C", text: "Normal membrane flexibility that requires no action" },
        { id: "D", text: "A need to immediately apply a solvent cleaner" }
      ],
      answer: "B",
      explanation: "The inspection checklist directs inspectors to check the field of the roof for soft areas, damage, or deficiencies, and to check attachment. Soft areas can indicate wet insulation or substrate problems and should be investigated promptly before minor issues become major repairs.",
      cite: "maintenance_checklist.pdf - Page 10",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-022",
      type: "mcq",
      question: "While completing the penetration section of the Owner's Maintenance Checklist, what actions does the guide specify for pipe boots and pitch pans?",
      options: [
        { id: "A", text: "Check all pitch pans, inspect all penetrations, re-caulk as necessary, and check terminations" },
        { id: "B", text: "Remove all pitch pans and replace with generic sealant only" },
        { id: "C", text: "Inspect penetrations only during QA Tech Rep visits" },
        { id: "D", text: "Re-caulk only if interior leaks are active" }
      ],
      answer: "A",
      explanation: "The checklist penetration items include checking all pitch pans, inspecting all penetrations, re-caulking as necessary, and checking terminations. Page 10 also directs checking penetrations for watertight seals and re-caulking as necessary during routine rooftop inspections.",
      cite: "maintenance_checklist.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-023",
      type: "mcq",
      question: "A spring checklist review finds curb flashings that have shifted and counterflashings with visible gaps. What inspection focus does the guide require for curb flashings?",
      options: [
        { id: "A", text: "Check attachment, check counter-flashings, and inspect for signs of movement" },
        { id: "B", text: "Remove counterflashings and rely on membrane overlap only" },
        { id: "C", text: "Defer curb flashing review until year 10 QA inspection" },
        { id: "D", text: "Paint curb flashings only if rust is visible on edge metal" }
      ],
      answer: "A",
      explanation: "The Owner's Maintenance Checklist curb flashing items require checking attachment, checking counter-flashings, and inspecting for signs of movement. Page 10 also directs inspecting curb flashings for movement and verifying curb and counter flashings for watertight integrity.",
      cite: "maintenance_checklist.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-024",
      type: "mcq",
      question: "Walkway pads on a Duro-Last roof appear loose at several HVAC service paths. According to the inspection checklist, what is required?",
      options: [
        { id: "A", text: "Remove walkway pads to reduce trip hazards" },
        { id: "B", text: "Ensure walkway pads remain securely welded to the rooftop" },
        { id: "C", text: "Replace walkway pads with metal grating without membrane attachment" },
        { id: "D", text: "Walkway pad condition is not part of the maintenance checklist" }
      ],
      answer: "B",
      explanation: "The checklist includes walkway pads under the 'Other' category and page 10 specifically directs ensuring walkway pads remain securely welded to the rooftop. Walkway pads protect the membrane in areas of high traffic and should be maintained as part of routine inspections.",
      cite: "maintenance_checklist.pdf - Page 10",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-025",
      type: "mcq",
      question: "An expansion joint on a large Duro-Last roof shows sealant failure and evidence of excessive movement. What should the inspection checklist prompt the owner to evaluate?",
      options: [
        { id: "A", text: "Signs of leaks, excessive movement, and deterioration at expansion joints" },
        { id: "B", text: "Interior ceiling paint color only" },
        { id: "C", text: "Satellite dish signal strength" },
        { id: "D", text: "Whether the joint can be sealed permanently with rigid mortar" }
      ],
      answer: "A",
      explanation: "Expansion joint checklist items include signs of leaks, excessive movement, and deterioration. Page 10 also directs checking expansion joints for signs of excessive movement and leaks. Structural movement not accommodated by the roofing system is identified as a factor that can shorten roof life.",
      cite: "maintenance_checklist.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-026",
      type: "mcq",
      question: "During an interior walkthrough tied to the Owner's Maintenance Checklist, what conditions should be evaluated at the interior roof deck?",
      options: [
        { id: "A", text: "Signs of leaks, deterioration, and biological growth" },
        { id: "B", text: "Only exterior wall staining" },
        { id: "C", text: "HVAC thermostat programming" },
        { id: "D", text: "Parking lot drainage only" }
      ],
      answer: "A",
      explanation: "The checklist directs inspection of the interior roof deck for signs of leaks, deterioration, and biological growth. Page 10 also includes checking the underside of the roof deck for signs of leaks, along with interior walls, ceilings, and exterior walls for leak evidence.",
      cite: "maintenance_checklist.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-027",
      type: "mcq",
      question: "The drainage system section of the Owner's Maintenance Checklist requires the inspector to verify which of the following?",
      options: [
        { id: "A", text: "Clean out scuppers, clean gutters and downspouts, confirm drains and strainers are attached, and make sure drains are working" },
        { id: "B", text: "Replace all drains with larger diameter units annually" },
        { id: "C", text: "Seal drains permanently to prevent debris entry" },
        { id: "D", text: "Drainage review is required only after hurricanes" }
      ],
      answer: "A",
      explanation: "The drainage system checklist items include cleaning scuppers, cleaning gutters and downspouts, verifying drains and strainers are attached, and making sure drains are working. Multiple checklist year pages repeat the reminder to inspect drains and remove debris for maximum flow.",
      cite: "maintenance_checklist.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-028",
      type: "mcq",
      question: "A maintenance crew plans to pressure-wash a Duro-Last roof at 1,200 PSI with a narrow-tip nozzle held 6 inches from the membrane to remove stubborn stains. What is the compliance and warranty implication?",
      options: [
        { id: "A", text: "Acceptable if the membrane is white and reflects heat" },
        { id: "B", text: "Non-compliant with pressure, nozzle, and distance requirements; damage from power washing is not covered by warranty" },
        { id: "C", text: "Acceptable because the guide only limits PSI, not nozzle type or distance" },
        { id: "D", text: "Covered by warranty if an authorized contractor performs the work" }
      ],
      answer: "B",
      explanation: "The guide limits power washing to 1,000 PSI maximum, requires a wide-tip nozzle, and mandates a minimum 12-inch nozzle-to-roof distance. The guide explicitly notes that damage caused by power washing is not covered under the terms of the Duro-Last Warranty, regardless of who performs the work.",
      cite: "maintenance_checklist.pdf - Page 5",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-029",
      type: "mcq",
      question: "Edge metal along the perimeter shows rust and missing mortar at the coping. Per the edging section of the Owner's Maintenance Checklist, what actions are appropriate?",
      options: [
        { id: "A", text: "Check attachment, paint rusted metal, re-caulk as necessary, and address missing mortar" },
        { id: "B", text: "Ignore edge metal if the field membrane appears clean" },
        { id: "C", text: "Remove all edge metal and terminate the membrane open to weather" },
        { id: "D", text: "Apply solvent-based stripper before painting" }
      ],
      answer: "A",
      explanation: "Edging checklist items include signs of leaks, staining, missing mortar, checking attachment, painting rusted metal, and re-caulking as necessary. Page 10 also directs checking edge metal for rust and painting as needed, and checking roof edging for signs of leaks and missing mortar.",
      cite: "maintenance_checklist.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    },
    {
      id: "DLMAINT-030",
      type: "mcq",
      question: "The HVAC section of the Owner's Maintenance Checklist requires inspection of rooftop units for which conditions?",
      options: [
        { id: "A", text: "Check ductwork, verify doors are secure, and inspect pipes, sheet metal, stands, and bases" },
        { id: "B", text: "Verify refrigerant charge only" },
        { id: "C", text: "Inspect HVAC units only when the manufacturer warranty expires" },
        { id: "D", text: "Remove equipment stands to reduce roof loading" }
      ],
      answer: "A",
      explanation: "HVAC checklist items include checking ductwork, verifying doors are secure, and inspecting pipes, sheet metal, stands, and bases. Page 10 adds checking stands and bases for proper support and verifying pipes and connections are secure. Equipment additions and alterations are identified as common causes of roof problems.",
      cite: "maintenance_checklist.pdf - Page 11",
      exhibitImage: "",
      imageRef: ""
    }
  ]
};

const DURO_LAST_MAINTENANCE_QUESTION_BANK_2026 = {
  ...DURO_LAST_MAINTENANCE_QUESTION_BANK_2026_RAW,
  questions: DURO_LAST_MAINTENANCE_QUESTION_BANK_2026_RAW.questions.map(sanitizeQuestion)
};

module.exports = DURO_LAST_MAINTENANCE_QUESTION_BANK_2026;
