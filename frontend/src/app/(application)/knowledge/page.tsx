import type { Metadata } from "next";
import { KnowledgeLibrary } from "@/components/knowledge/knowledge-library";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Legal Knowledge" };

export default function KnowledgePage() {
  return <KnowledgeLibrary />;
}
