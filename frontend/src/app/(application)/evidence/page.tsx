import type { Metadata } from "next";
import { EvidenceView } from "@/components/evidence/evidence-view";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Evidence Graph" };

export default function EvidencePage() {
  return <EvidenceView />;
}
