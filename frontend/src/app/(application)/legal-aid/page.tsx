import type { Metadata } from "next";
import { LegalAidFinder } from "@/components/legal-aid/legal-aid-finder";

export const metadata: Metadata = { title: "Legal Aid Finder" };

export default function LegalAidPage() {
  return <LegalAidFinder />;
}
