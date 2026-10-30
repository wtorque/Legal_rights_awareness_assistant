import type { Clause, DocumentAnalysis, DocumentContent, DocumentRecord } from "@/types/documents";

/**
 * Fixture documents with FICTIONAL text. Parties are placeholders; no real law is cited.
 */
export const sampleDocuments: DocumentRecord[] = [
  { id: "doc-rental", name: "Sample Rental Agreement.pdf", category: "housing", pages: 2, sizeBytes: 184_320, uploadedAt: "2026-10-31T08:30:00+05:30", status: "ready", origin: "sample", analyzed: true },
  { id: "doc-rental-v2", name: "Sample Rental Agreement (Renewal).pdf", category: "housing", pages: 2, sizeBytes: 190_464, uploadedAt: "2026-10-29T15:00:00+05:30", status: "ready", origin: "sample", analyzed: true },
  { id: "doc-offer", name: "Sample Employment Offer.pdf", category: "employment", pages: 2, sizeBytes: 142_336, uploadedAt: "2026-10-28T13:50:00+05:30", status: "ready", origin: "sample", analyzed: true },
];

type P = [id: string, text: string, clauseId?: string];
const page = (number: number, rows: P[]) => ({
  number,
  paragraphs: rows.map(([id, text, clauseId]) => ({ id, text, clauseId })),
});

export const sampleContent: Record<string, DocumentContent> = {
  "doc-rental": {
    documentId: "doc-rental",
    pages: [
      page(1, [
        ["r1", "SAMPLE RESIDENTIAL RENTAL AGREEMENT (fictional document for demonstration)"],
        ["r2", "This agreement is made between [Landlord] and [Tenant] for the residential premises described in Schedule A."],
        ["r3", "1. Term. The tenancy begins on 1 January 2027 and continues for eleven months, renewable by mutual written consent.", "c-term"],
        ["r4", "2. Rent. The Tenant shall pay monthly rent of the agreed amount on or before the fifth day of each month. Late payment attracts a charge of 2% per week.", "c-rent"],
        ["r5", "3. Security deposit. The Tenant shall pay a refundable security deposit equal to three months' rent. The deposit will be returned after the Tenant vacates, subject to deductions the Landlord considers appropriate.", "c-deposit"],
        ["r6", "4. Use of premises. The premises shall be used for residential purposes only. Sub-letting is not permitted.", "c-use"],
      ]),
      page(2, [
        ["r7", "5. Maintenance. The Tenant is responsible for routine maintenance and any repairs that the Landlord deems necessary.", "c-maint"],
        ["r8", "6. Termination. Either party may terminate this agreement by giving fifteen days' notice. The Landlord may terminate immediately on breach.", "c-term-notice"],
        ["r9", "7. Pets. No pets are allowed on the premises.", "c-pets"],
        ["r10", "8. Entry. The Landlord may enter the premises at any time for inspection.", "c-entry"],
        ["r11", "9. Governing law. Disputes shall be resolved in the courts of the Landlord's choosing.", "c-law"],
        ["r12", "Signed by the parties on the date stated above. [Signature blocks]"],
      ]),
    ],
  },
  "doc-rental-v2": {
    documentId: "doc-rental-v2",
    pages: [
      page(1, [
        ["s1", "SAMPLE RESIDENTIAL RENTAL AGREEMENT — RENEWAL (fictional document for demonstration)"],
        ["s2", "This agreement is made between [Landlord] and [Tenant] for the residential premises described in Schedule A."],
        ["s3", "1. Term. The tenancy begins on 1 January 2028 and continues for eleven months, renewable by mutual written consent.", "c-term"],
        ["s4", "2. Rent. The Tenant shall pay monthly rent of the revised amount on or before the fifth day of each month. Late payment attracts a charge of 2% per week.", "c-rent"],
        ["s5", "3. Security deposit. The Tenant shall pay a refundable security deposit equal to six months' rent. The deposit will be returned within sixty days after the Tenant vacates, less itemised deductions.", "c-deposit"],
        ["s6", "4. Use of premises. The premises shall be used for residential purposes only. Sub-letting is not permitted.", "c-use"],
      ]),
      page(2, [
        ["s7", "5. Maintenance. The Tenant is responsible for routine maintenance and any repairs that the Landlord deems necessary.", "c-maint"],
        ["s8", "6. Termination. Either party may terminate this agreement by giving thirty days' notice. The Landlord may terminate immediately on breach.", "c-term-notice"],
        ["s9", "7. Maintenance charge. The Tenant shall pay a fixed monthly maintenance charge in addition to rent.", "c-maint-charge"],
        ["s10", "8. Entry. The Landlord may enter the premises at any time for inspection.", "c-entry"],
        ["s11", "9. Governing law. Disputes shall be resolved in the courts of the Landlord's choosing.", "c-law"],
        ["s12", "Signed by the parties on the date stated above. [Signature blocks]"],
      ]),
    ],
  },
  "doc-offer": {
    documentId: "doc-offer",
    pages: [
      page(1, [
        ["o1", "SAMPLE EMPLOYMENT OFFER (fictional document for demonstration)"],
        ["o2", "We are pleased to offer you the position of [Role] at [Company], starting on 15 January 2027."],
        ["o3", "1. Compensation. Your gross monthly pay is the agreed amount, paid on the last working day of each month.", "o-pay"],
        ["o4", "2. Probation. You will be on probation for six months, during which employment may be ended on seven days' notice.", "o-prob"],
        ["o5", "3. Notice. After probation, either party shall give ninety days' notice, or pay in lieu.", "o-notice"],
      ]),
      page(2, [
        ["o6", "4. Non-compete. For twenty-four months after leaving, you shall not work for any business in the same industry.", "o-noncompete"],
        ["o7", "5. Intellectual property. All work created during employment, including outside working hours, belongs to the Company.", "o-ip"],
        ["o8", "6. Relocation. The Company may transfer you to any location at its discretion.", "o-reloc"],
        ["o9", "Please sign and return a copy of this letter. [Signature blocks]"],
      ]),
    ],
  },
};

const c = (x: Clause): Clause => x;

export const sampleAnalyses: Record<string, DocumentAnalysis> = {
  "doc-rental": {
    documentId: "doc-rental",
    origin: "sample",
    demonstrationOnly: false,
    summary:
      "An 11-month residential rental agreement with a three-month deposit, short notice period and broad landlord powers. Several terms are open-ended and may be worth clarifying in writing before signing.",
    clauses: [
      c({ id: "c-term", title: "Term", originalText: "The tenancy begins on 1 January 2027 and continues for eleven months, renewable by mutual written consent.", simplified: "The rental lasts 11 months from 1 January 2027. Renewal needs both sides to agree in writing.", category: "Term", importance: "medium", flag: null, page: 1, sourceId: null }),
      c({ id: "c-rent", title: "Rent and late charge", originalText: "The Tenant shall pay monthly rent … on or before the fifth day of each month. Late payment attracts a charge of 2% per week.", simplified: "Rent is due by the 5th. Paying late adds 2% for each week.", category: "Payment", importance: "high", flag: "obligation", page: 1, sourceId: null }),
      c({ id: "c-deposit", title: "Security deposit", originalText: "The Tenant shall pay a refundable security deposit equal to three months' rent. The deposit will be returned after the Tenant vacates, subject to deductions the Landlord considers appropriate.", simplified: "You pay a deposit worth three months' rent. It is returned after you leave, but the landlord decides the deductions. No return date or itemised list is stated.", category: "Deposit", importance: "high", flag: "attention", page: 1, sourceId: "src-tenancy-4" }),
      c({ id: "c-use", title: "Use of premises", originalText: "The premises shall be used for residential purposes only. Sub-letting is not permitted.", simplified: "Live there only; do not sub-let.", category: "Use", importance: "low", flag: "obligation", page: 1, sourceId: null }),
      c({ id: "c-maint", title: "Maintenance and repairs", originalText: "The Tenant is responsible for routine maintenance and any repairs that the Landlord deems necessary.", simplified: "You handle routine upkeep and any repairs the landlord decides are needed. 'Deems necessary' is broad and doesn't say who pays for major repairs.", category: "Maintenance", importance: "medium", flag: "ambiguous", page: 2, sourceId: null }),
      c({ id: "c-term-notice", title: "Termination notice", originalText: "Either party may terminate this agreement by giving fifteen days' notice. The Landlord may terminate immediately on breach.", simplified: "Either side can end the rental with 15 days' notice. The landlord can end it at once if you breach the agreement; 'breach' is not defined.", category: "Termination", importance: "high", flag: "attention", page: 2, sourceId: "src-tenancy-9" }),
      c({ id: "c-pets", title: "Pets", originalText: "No pets are allowed on the premises.", simplified: "You cannot keep pets.", category: "Use", importance: "low", flag: "obligation", page: 2, sourceId: null }),
      c({ id: "c-entry", title: "Landlord entry", originalText: "The Landlord may enter the premises at any time for inspection.", simplified: "The landlord can enter whenever they like. No advance notice is mentioned.", category: "Privacy", importance: "medium", flag: "attention", page: 2, sourceId: null }),
      c({ id: "c-law", title: "Governing law and disputes", originalText: "Disputes shall be resolved in the courts of the Landlord's choosing.", simplified: "The landlord picks which courts handle disputes, which could be inconvenient for you.", category: "Disputes", importance: "medium", flag: "ambiguous", page: 2, sourceId: "src-contract-2" }),
    ],
    obligations: ["Pay rent by the fifth of each month", "Use the premises for residence only", "Handle routine maintenance", "Do not sub-let or keep pets"],
    missingInformation: ["Deposit return deadline", "Rent amount and any yearly increase", "Notice period before landlord entry", "Who pays for major repairs"],
    keyDates: [
      { label: "Tenancy start", value: "1 January 2027" },
      { label: "Term length", value: "11 months" },
      { label: "Rent due", value: "5th of each month" },
    ],
    lawyerQuestions: [
      "Can the deposit return date and an itemised list be added to the agreement?",
      "What does 'breach' include, and is there a chance to fix it before termination?",
      "Can landlord entry require reasonable advance notice?",
      "Which court would hear a dispute, and can it be local to me?",
    ],
  },
  "doc-rental-v2": {
    documentId: "doc-rental-v2",
    origin: "sample",
    demonstrationOnly: false,
    summary: "A renewal of the sample rental agreement with a larger deposit, longer notice period and a new maintenance charge.",
    clauses: [
      c({ id: "c-deposit", title: "Security deposit", originalText: "…a refundable security deposit equal to six months' rent … returned within sixty days after the Tenant vacates, less itemised deductions.", simplified: "Deposit rises to six months' rent, but now has a 60-day return window and itemised deductions.", category: "Deposit", importance: "high", flag: "attention", page: 1, sourceId: "src-tenancy-4" }),
      c({ id: "c-maint-charge", title: "Maintenance charge", originalText: "The Tenant shall pay a fixed monthly maintenance charge in addition to rent.", simplified: "A new fixed monthly charge is added. The amount is not stated.", category: "Payment", importance: "medium", flag: "missing", page: 2, sourceId: null }),
    ],
    obligations: ["Pay rent and the new maintenance charge"],
    missingInformation: ["Maintenance charge amount"],
    keyDates: [{ label: "Tenancy start", value: "1 January 2028" }],
    lawyerQuestions: ["What does the maintenance charge cover, and how much is it?"],
  },
  "doc-offer": {
    documentId: "doc-offer",
    origin: "sample",
    demonstrationOnly: false,
    summary: "An offer letter with a six-month probation, a long post-employment restriction and broad ownership of work. Some terms are wide and worth clarifying.",
    clauses: [
      c({ id: "o-pay", title: "Compensation", originalText: "Your gross monthly pay is the agreed amount, paid on the last working day of each month.", simplified: "You're paid monthly on the last working day. The amount isn't written in this text.", category: "Pay", importance: "high", flag: "missing", page: 1, sourceId: null }),
      c({ id: "o-prob", title: "Probation", originalText: "…probation for six months, during which employment may be ended on seven days' notice.", simplified: "For six months, either side can end the job with a week's notice.", category: "Term", importance: "medium", flag: "obligation", page: 1, sourceId: "src-employment-7" }),
      c({ id: "o-notice", title: "Notice after probation", originalText: "…either party shall give ninety days' notice, or pay in lieu.", simplified: "After probation, 90 days' notice (or pay instead) applies to both sides.", category: "Termination", importance: "medium", flag: "obligation", page: 1, sourceId: "src-employment-7" }),
      c({ id: "o-noncompete", title: "Non-compete", originalText: "For twenty-four months after leaving, you shall not work for any business in the same industry.", simplified: "For two years after leaving, you couldn't work anywhere in your industry. This is broad.", category: "Restriction", importance: "high", flag: "attention", page: 2, sourceId: "src-contract-2" }),
      c({ id: "o-ip", title: "Ownership of work", originalText: "All work created during employment, including outside working hours, belongs to the Company.", simplified: "Anything you create while employed, even in your own time, goes to the company. Unclear if this covers unrelated hobbies.", category: "Intellectual property", importance: "medium", flag: "ambiguous", page: 2, sourceId: null }),
      c({ id: "o-reloc", title: "Relocation", originalText: "The Company may transfer you to any location at its discretion.", simplified: "The company can move you to any place. No notice or support is described.", category: "Work location", importance: "medium", flag: "attention", page: 2, sourceId: null }),
    ],
    obligations: ["Serve notice as stated", "Observe the non-compete", "Assign work to the Company"],
    missingInformation: ["Salary amount", "Relocation notice and support", "Scope of the non-compete (location, role)"],
    keyDates: [{ label: "Start date", value: "15 January 2027" }, { label: "Probation", value: "6 months" }],
    lawyerQuestions: [
      "Can the non-compete be narrowed by location, role or time?",
      "Does the ownership clause cover work done on my own time?",
      "Can relocation include reasonable notice and support?",
    ],
  },
};
