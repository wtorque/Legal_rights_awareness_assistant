import type { Metadata } from "next";
import { KnowledgeLibrary } from "@/components/knowledge/knowledge-library";

export const metadata: Metadata = { title: "Legal Knowledge" };

export default function KnowledgePage() {
  return <KnowledgeLibrary />;
}
