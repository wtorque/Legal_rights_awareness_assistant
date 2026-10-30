import type { Metadata } from "next";
import { PlansOverview } from "@/components/action-plans/plans-overview";

export const metadata: Metadata = { title: "Action Blueprint" };

export default function ActionPlansPage() {
  return <PlansOverview />;
}
