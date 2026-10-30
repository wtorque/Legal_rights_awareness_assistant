import type { Metadata } from "next";
import { EvidenceView } from "@/components/evidence/evidence-view";

export const metadata: Metadata = { title: "Evidence Graph" };

export default function EvidencePage() {
  return <EvidenceView />;
}
