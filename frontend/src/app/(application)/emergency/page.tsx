import type { Metadata } from "next";
import { EmergencyHelp } from "@/components/emergency/emergency-help";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Emergency contacts" };

export default function EmergencyPage() {
  return <EmergencyHelp />;
}
