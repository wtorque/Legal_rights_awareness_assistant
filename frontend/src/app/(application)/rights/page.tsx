import type { Metadata } from "next";
import { RightsExplorer } from "@/components/rights/rights-explorer";

export const metadata: Metadata = { title: "Rights Explorer" };

export default function RightsPage() {
  return <RightsExplorer />;
}
