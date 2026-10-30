import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Coming next"
      title="Settings"
      description="Theme, language and preferences."
    />
  );
}
