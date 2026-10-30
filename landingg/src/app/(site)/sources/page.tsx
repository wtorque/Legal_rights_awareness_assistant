import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Legal Sources" };

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Coming next"
      title="Legal Sources"
      description="Every answer links back to the statute, rule or official document it came from."
    />
  );
}
