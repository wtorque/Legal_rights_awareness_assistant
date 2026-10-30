import type { Metadata } from "next";
import { SavedView } from "@/components/shared/saved-view";

export const metadata: Metadata = { title: "Saved Resources" };

export default function SavedPage() {
  return <SavedView />;
}
