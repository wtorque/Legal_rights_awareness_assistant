import type { RepealStatus, RightKind, VerificationStatus } from "@/types/catalogue";

export const kindLabels: Record<RightKind, string> = {
  enforceable_right: "Enforceable right",
  constitutional_protection: "Constitutional protection",
  procedural_right: "Procedural right",
  scheme_benefit: "Scheme benefit",
};

export const verificationLabels: Record<VerificationStatus, string> = {
  unverified: "Unverified",
  machine_extracted: "Extracted from official source · not yet human-verified",
  human_verified: "Human-verified",
};

export const verificationShort: Record<VerificationStatus, string> = {
  unverified: "Unverified",
  machine_extracted: "Machine-extracted",
  human_verified: "Human-verified",
};

export const statusLabels: Record<RepealStatus, string> = {
  in_force: "In force",
  partially_repealed: "Partially repealed",
  repealed: "Repealed",
  unknown: "Status unknown",
};

export const facetTitles = {
  categories: "Category",
  kinds: "Type of entitlement",
  jurisdictions: "Jurisdiction",
  verification: "Verification",
  domains: "Legal domain",
  status: "Status",
} as const;

/** Display text for a facet option id (the API returns ids; labels for enums are ours). */
export function facetLabel(facet: keyof typeof facetTitles, id: string, fallback: string): string {
  if (facet === "kinds") return kindLabels[id as RightKind] ?? fallback;
  if (facet === "verification") return verificationShort[id as VerificationStatus] ?? fallback;
  if (facet === "status") return statusLabels[id as RepealStatus] ?? fallback;
  return fallback;
}
