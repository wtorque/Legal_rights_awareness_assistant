import type { DashboardOverview, TopicSummary } from "@/types/dashboard";

export const suggestedQuestions = [
  "My landlord hasn't returned my deposit",
  "Can my employer terminate me without notice?",
  "A shop refuses to refund a defective product",
  "What documents should I keep for a dispute?",
];

export const featuredTopics: TopicSummary[] = [
  { slug: "security-deposits", title: "Security deposits", category: "housing", summary: "When a deposit is due back and what can lawfully be deducted." },
  { slug: "termination-notice", title: "Termination and notice", category: "employment", summary: "Notice periods, final pay and what to ask for in writing." },
  { slug: "defective-goods", title: "Defective goods and refunds", category: "consumer", summary: "Repair, replacement or refund, and how to complain." },
  { slug: "data-access", title: "Access to your personal data", category: "privacy", summary: "Asking an organisation what data it holds about you." },
];

export const popularCategories = [
  "Employment",
  "Housing",
  "Consumer",
  "Privacy",
  "Financial",
  "Healthcare",
];

/** Sample overview. Ids match the documents / action-plan fixtures so links resolve. */
export const sampleOverview: DashboardOverview = {
  origin: "sample",
  stats: { documentsAnalyzed: 3, savedResources: 4, completedPlans: 1 },
  recentDocuments: [
    { id: "doc-rental", title: "Sample Rental Agreement", subtitle: "12 clauses · 3 need attention", at: "2026-10-31T08:40:00+05:30", href: "/documents" },
    { id: "doc-offer", title: "Sample Employment Offer", subtitle: "9 clauses · 2 need attention", at: "2026-10-28T14:00:00+05:30", href: "/documents" },
  ],
  recentPlans: [
    { id: "plan-deposit", title: "Recover a security deposit", subtitle: "2 of 5 steps done", at: "2026-10-30T17:10:00+05:30", href: "/action-plans" },
    { id: "plan-refund", title: "Claim a product refund", subtitle: "Completed", at: "2026-10-22T11:00:00+05:30", href: "/action-plans" },
  ],
  savedResources: [
    { id: "res-1", title: "Sample Residential Tenancy Act", subtitle: "Legislation (fictional)", at: "2026-10-29T09:00:00+05:30", href: "/knowledge" },
    { id: "res-2", title: "Sample Legal Services Guidance", subtitle: "Legal aid (fictional)", at: "2026-10-25T09:00:00+05:30", href: "/knowledge" },
  ],
  featuredTopics,
  learning: [
    {
      id: "l1",
      title: "Reading a rental agreement: what to check first",
      kind: "Guide",
      minutes: 6,
      description:
        "Use this sample guide to review the parties, dates, amounts and responsibilities described in an agreement. Note unclear wording and confirm it with an appropriate official or qualified source before acting.",
    },
    {
      id: "l2",
      title: "How a complaint forum works, step by step",
      kind: "Explainer",
      minutes: 8,
      description:
        "A general process is to record the issue, gather relevant correspondence, contact the organisation and consult the official body's own instructions. Procedures and deadlines vary.",
    },
    {
      id: "l3",
      title: "Documents to keep for any dispute",
      kind: "Checklist",
      minutes: 3,
      description:
        "A general record-keeping checklist: dated agreements, receipts, messages, notices, photos and complaint references. Store copies securely and share only what is needed.",
    },
  ],
};
