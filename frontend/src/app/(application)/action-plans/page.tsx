import type { Metadata } from "next";
import { PlansOverview } from "@/components/action-plans/plans-overview";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Action Blueprint" };

export default function ActionPlansPage() {
  return <PlansOverview />;
}
