import type { Metadata } from "next";
import { LegalAidFinder } from "@/components/legal-aid/legal-aid-finder";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Legal Aid Finder" };

export default function LegalAidPage() {
  return <LegalAidFinder />;
}
