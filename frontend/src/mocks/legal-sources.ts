import type { SourceReference } from "@/types/legal";

/**
 * FICTIONAL sources used by every sample module. None of these laws exist.
 * Never replace with real citations unless verified against the official text.
 */
const base = {
  jurisdictionCode: "SAMPLE",
  url: null,
  verifiedAt: null,
  origin: "sample",
} as const;

export const sampleSources: SourceReference[] = [
  {
    ...base,
    id: "src-tenancy-4",
    documentTitle: "Sample Residential Tenancy Act (fictional)",
    sectionLabel: "§4 Security deposit",
    authority: "Sample Legislature (fictional)",
    quote: "A landlord shall return a security deposit within thirty days of the tenancy ending, less itemised lawful deductions. (Fictional text.)",
  },
  {
    ...base,
    id: "src-tenancy-9",
    documentTitle: "Sample Residential Tenancy Act (fictional)",
    sectionLabel: "§9 Notice to vacate",
    authority: "Sample Legislature (fictional)",
    quote: "A landlord shall give written notice of at least sixty days before ending a periodic tenancy. (Fictional text.)",
  },
  {
    ...base,
    id: "src-employment-7",
    documentTitle: "Sample Fair Employment Act (fictional)",
    sectionLabel: "§7 Termination notice",
    authority: "Sample Labour Ministry (fictional)",
    quote: "An employer shall give written notice, or pay in lieu, as stated in the employment contract, and in any case not less than the statutory minimum. (Fictional text.)",
  },
  {
    ...base,
    id: "src-employment-12",
    documentTitle: "Sample Fair Employment Act (fictional)",
    sectionLabel: "§12 Final wages",
    authority: "Sample Labour Ministry (fictional)",
    quote: "Wages earned up to the last working day shall be paid within a fixed period after separation. (Fictional text.)",
  },
  {
    ...base,
    id: "src-consumer-3",
    documentTitle: "Sample Consumer Protection Act (fictional)",
    sectionLabel: "§3 Defective goods",
    authority: "Sample Consumer Affairs Authority (fictional)",
    quote: "A consumer may seek repair, replacement or refund for goods that are materially defective. (Fictional text.)",
  },
  {
    ...base,
    id: "src-consumer-8",
    documentTitle: "Sample Consumer Protection Act (fictional)",
    sectionLabel: "§8 Complaint forum",
    authority: "Sample Consumer Affairs Authority (fictional)",
    quote: "A consumer may file a written complaint with the sample consumer forum within a limited period of the cause of action. (Fictional text.)",
  },
  {
    ...base,
    id: "src-privacy-5",
    documentTitle: "Sample Digital Privacy Act (fictional)",
    sectionLabel: "§5 Access and correction",
    authority: "Sample Data Authority (fictional)",
    quote: "A person may ask an organisation to confirm what personal data it holds and to correct inaccurate data. (Fictional text.)",
  },
  {
    ...base,
    id: "src-contract-2",
    documentTitle: "Sample Contract Standards Code (fictional)",
    sectionLabel: "§2 Unfair terms",
    authority: "Sample Commerce Ministry (fictional)",
    quote: "A term that creates a significant imbalance between the parties to the detriment of an individual may not be enforceable. (Fictional text.)",
  },
  {
    ...base,
    id: "src-aid-1",
    documentTitle: "Sample Legal Services Guidance (fictional)",
    sectionLabel: "§1 Eligibility",
    authority: "Sample Legal Services Authority (fictional)",
    quote: "Free legal assistance may be available to people whose income falls under a stated threshold. (Fictional text.)",
  },
];

export function getSampleSource(id: string): SourceReference {
  const found = sampleSources.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown sample source: ${id}`);
  return found;
}
