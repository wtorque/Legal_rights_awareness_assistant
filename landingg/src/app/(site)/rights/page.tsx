import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Rights Explorer" };

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Coming next"
      title="Rights Explorer"
      description="Browse everyday rights by situation — tenants, workers, citizens and small shop owners."
    />
  );
}
