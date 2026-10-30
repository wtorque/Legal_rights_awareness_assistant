import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Legal Assistant" };

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Coming next"
      title="AI Legal Assistant"
      description="Ask a rights question in plain language and get an answer you can trace back to a source."
    />
  );
}
