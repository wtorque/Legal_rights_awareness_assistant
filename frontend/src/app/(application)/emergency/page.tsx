import type { Metadata } from "next";
import { EmergencyHelp } from "@/components/emergency/emergency-help";

export const metadata: Metadata = { title: "Emergency contacts" };

export default function EmergencyPage() {
  return <EmergencyHelp />;
}
