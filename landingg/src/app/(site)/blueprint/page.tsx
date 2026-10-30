import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Action Blueprint" };

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Coming next"
      title="Action Blueprint"
      description="A practical, step-by-step plan for what to do next in your situation."
    />
  );
}
