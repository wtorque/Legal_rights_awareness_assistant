import type { ActionPlan, NewPlanInput, PlanStep, ChecklistItem } from "@/types/action-plans";

const step = (id: string, title: string, detail: string, done = false, note = ""): PlanStep => ({ id, title, detail, done, note });
const item = (id: string, text: string, done = false): ChecklistItem => ({ id, text, done, custom: false });

/** Sample plans. Steps are suggestions, not legal requirements; dates are unverified placeholders. */
export const samplePlans: ActionPlan[] = [
  {
    id: "plan-deposit",
    title: "Recover a security deposit",
    category: "housing",
    situation: "I moved out two weeks ago and the landlord hasn't returned my deposit or sent a list of deductions.",
    countryCode: "IN",
    regionCode: "telangana",
    createdAt: "2026-10-24T10:00:00+05:30",
    updatedAt: "2026-10-30T17:10:00+05:30",
    origin: "sample",
    steps: [
      step("s1", "Collect your paperwork", "Rental agreement, deposit receipt, move-out photos and any messages about the deposit.", true),
      step("s2", "Note the key dates", "Write down your move-out date and the date you asked for the deposit.", true, "Moved out 17 Oct. First message sent 20 Oct."),
      step("s3", "Send a written request", "Politely ask for the deposit and an itemised list of deductions by a clear date. Keep a copy or screenshot."),
      step("s4", "Ask a legal aid service", "If there's no reply, a legal aid service can explain which forum may apply to you."),
      step("s5", "Decide on next steps", "Based on advice, decide whether to send a formal notice or approach a forum."),
    ],
    checklist: [item("d1", "Signed rental agreement", true), item("d2", "Deposit payment receipt", true), item("d3", "Photos of the home at move-out"), item("d4", "Chat or email history with the landlord"), item("d5", "Identity proof")],
    authorities: [
      { name: "Local rent or housing authority", role: "May handle tenancy disputes (varies by area)", url: null },
      { name: "District legal services authority", role: "Free legal advice for eligible people", url: null },
    ],
    resources: [{ label: "Sample Residential Tenancy Act §4 (fictional)", url: null }],
    importantDates: [{ label: "Suggested reply date", value: "7 days after your written request", verified: false }],
  },
  {
    id: "plan-refund",
    title: "Claim a product refund",
    category: "consumer",
    situation: "A phone stopped working after three weeks and the seller says there are no refunds.",
    countryCode: "IN",
    regionCode: "telangana",
    createdAt: "2026-10-10T10:00:00+05:30",
    updatedAt: "2026-10-22T11:00:00+05:30",
    origin: "sample",
    steps: [
      step("s1", "Keep the evidence", "Invoice, photos or video of the fault, warranty card and chats.", true),
      step("s2", "Write to the seller", "Describe the problem and the remedy you want (repair, replacement or refund).", true),
      step("s3", "Contact the manufacturer", "Ask for a service report in writing.", true),
      step("s4", "Use the complaint route", "File a complaint with the relevant forum if unresolved.", true),
    ],
    checklist: [item("d1", "Invoice", true), item("d2", "Warranty card", true), item("d3", "Fault photos", true)],
    authorities: [{ name: "Consumer complaint forum", role: "Hears consumer complaints (check your area)", url: null }],
    resources: [{ label: "Sample Consumer Protection Act §3 (fictional)", url: null }],
    importantDates: [],
  },
  {
    id: "plan-notice",
    title: "Respond to a termination notice",
    category: "employment",
    situation: "My employer ended my job with one day's notice. My contract says ninety days.",
    countryCode: "IN",
    regionCode: "telangana",
    createdAt: "2026-10-30T09:00:00+05:30",
    updatedAt: "2026-10-30T16:20:00+05:30",
    origin: "sample",
    steps: [
      step("s1", "Read your contract", "Find the notice period, probation terms and any pay-in-lieu clause."),
      step("s2", "Ask for the decision in writing", "A written termination letter states the reason and the date."),
      step("s3", "Request final dues", "Ask HR for your notice pay (if due) and earned wages in writing."),
      step("s4", "Seek advice", "A legal aid clinic can explain which authority handles disputes where you live."),
    ],
    checklist: [item("d1", "Offer letter / contract"), item("d2", "Last three payslips"), item("d3", "Termination message or letter"), item("d4", "Relevant email history")],
    authorities: [{ name: "Labour authority", role: "May handle wage and notice disputes (check your area)", url: null }],
    resources: [{ label: "Sample Fair Employment Act §7, §12 (fictional)", url: null }],
    importantDates: [{ label: "Contract notice period", value: "As written in your contract", verified: false }],
  },
];

const templates: Record<string, { steps: [string, string][]; docs: string[] }> = {
  default: {
    steps: [
      ["Write down what happened", "Dates, names, amounts and what was said or promised."],
      ["Gather documents", "Contracts, receipts, notices, messages and photos."],
      ["Ask for clarity in writing", "Politely ask the other side to confirm their position in writing."],
      ["Get free advice", "A legal aid service can explain your options for your area."],
    ],
    docs: ["Identity proof", "Any contract or agreement", "Messages or emails", "Receipts or payment proof"],
  },
};

export function buildPlanFromTemplate(input: NewPlanInput, id: string, now: string): ActionPlan {
  const t = templates.default;
  return {
    id,
    title: input.title,
    category: input.category,
    situation: input.situation,
    countryCode: input.countryCode,
    regionCode: input.regionCode,
    createdAt: now,
    updatedAt: now,
    origin: "user",
    steps: t.steps.map(([title, detail], i) => step(`s${i + 1}`, title, detail)),
    checklist: t.docs.map((text, i) => item(`d${i + 1}`, text)),
    authorities: [{ name: "Legal services authority", role: "Free legal advice for eligible people (check your area)", url: null }],
    resources: [],
    importantDates: [],
  };
}
