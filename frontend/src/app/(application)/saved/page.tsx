import type { Metadata } from "next";
import { SavedView } from "@/components/shared/saved-view";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Saved Resources" };

export default function SavedPage() {
  return <SavedView />;
}
