import type { Metadata } from "next";
import { CompareView } from "@/components/documents/compare-view";

export const metadata: Metadata = { title: "Compare documents" };

export default function ComparePage() {
  return <CompareView />;
}
