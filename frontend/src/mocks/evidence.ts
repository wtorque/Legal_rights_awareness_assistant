import type { EvidenceEdge, EvidenceGraphData, EvidenceNode } from "@/types/evidence";

const n = (id: string, kind: EvidenceNode["kind"], label: string, description: string, provenance: string, href: string | null = null): EvidenceNode => ({
  id,
  kind,
  label,
  description,
  provenance,
  href,
  origin: "sample",
});
const e = (from: string, to: string, relation: string): EvidenceEdge => ({ id: `${from}->${to}`, from, to, relation });

/** Sample graph. Every node is fictional or a placeholder; none is a verified legal source. */
export const sampleGraph: EvidenceGraphData = {
  nodes: [
    n("q-deposit", "question", "Deposit not returned", "“My landlord hasn't returned my deposit after I moved out.”", "Sample user question"),
    n("q-notice", "question", "Terminated with one day's notice", "“My employer ended my job with one day's notice. Is that allowed?”", "Sample user question"),

    n("t-deposit", "topic", "Security deposits", "Rights topic explaining deposit return and deductions.", "Rights Explorer (sample)", "/rights/security-deposits"),
    n("t-notice", "topic", "Termination and notice", "Rights topic on notice periods and final pay.", "Rights Explorer (sample)", "/rights/termination-notice"),

    n("d-rental", "document", "Sample Rental Agreement", "The user's sample agreement. Clause 3 sets a three-month deposit with deductions decided by the landlord.", "Document Intelligence (sample)", "/documents/doc-rental"),
    n("d-tenancy", "document", "Sample Residential Tenancy Act", "A fictional tenancy statute.", "Legal Knowledge (sample)", "/knowledge/ks-tenancy-act"),
    n("d-offer", "document", "Sample Employment Offer", "The user's sample offer letter. Specifies ninety days' notice after probation.", "Document Intelligence (sample)", "/documents/doc-offer"),
    n("d-employment", "document", "Sample Fair Employment Act", "A fictional employment statute.", "Legal Knowledge (sample)", "/knowledge/ks-employment-act"),

    n("s-clause3", "section", "Agreement clause 3", "Security deposit clause in the sample rental agreement.", "Sample Rental Agreement"),
    n("s-4", "section", "§4 Security deposit", "Return within thirty days, less itemised lawful deductions.", "Sample Residential Tenancy Act (fictional)"),
    n("s-9", "section", "§9 Notice to vacate", "Written notice of at least sixty days for periodic tenancies.", "Sample Residential Tenancy Act (fictional)"),
    n("s-7", "section", "§7 Termination notice", "Written notice or pay in lieu.", "Sample Fair Employment Act (fictional)"),
    n("s-12", "section", "§12 Final wages", "Earned wages paid within a fixed period after separation.", "Sample Fair Employment Act (fictional)"),

    n("a-housing", "authority", "Sample Housing Department", "Fictional department that issues tenancy rules.", "Placeholder authority"),
    n("a-aid", "authority", "Sample Legal Services Authority", "Fictional authority offering free legal advice.", "Placeholder authority", "/legal-aid"),
    n("a-labour", "authority", "Sample Labour Ministry", "Fictional ministry that issues employment rules.", "Placeholder authority"),

    n("src-handbook", "source", "Sample Tenant Handbook", "Fictional plain-language government guide for tenants.", "Legal Knowledge (sample)", "/knowledge/ks-tenant-handbook"),
  ],
  edges: [
    e("q-deposit", "t-deposit", "is about"),
    e("q-deposit", "d-rental", "refers to"),
    e("t-deposit", "d-tenancy", "grounded in"),
    e("d-rental", "s-clause3", "contains"),
    e("s-clause3", "s-4", "compared with"),
    e("d-tenancy", "s-4", "contains"),
    e("d-tenancy", "s-9", "contains"),
    e("d-tenancy", "a-housing", "issued by"),
    e("t-deposit", "src-handbook", "explained in"),
    e("src-handbook", "a-housing", "published by"),
    e("q-deposit", "a-aid", "can be referred to"),

    e("q-notice", "t-notice", "is about"),
    e("q-notice", "d-offer", "refers to"),
    e("t-notice", "d-employment", "grounded in"),
    e("d-employment", "s-7", "contains"),
    e("d-employment", "s-12", "contains"),
    e("d-employment", "a-labour", "issued by"),
    e("d-offer", "s-7", "compared with"),
    e("q-notice", "a-aid", "can be referred to"),
  ],
};
