import type { Metadata } from "next";
import { CompareView } from "@/components/documents/compare-view";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Compare documents" };

export default function ComparePage() {
  return <CompareView />;
}
