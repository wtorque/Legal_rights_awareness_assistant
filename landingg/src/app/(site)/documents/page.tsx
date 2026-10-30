import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Document Intelligence" };

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Coming next"
      title="Document Intelligence"
      description="Upload a notice, contract or agreement and see it explained clause by clause."
    />
  );
}
