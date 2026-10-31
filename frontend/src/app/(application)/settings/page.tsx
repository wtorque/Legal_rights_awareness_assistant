import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsView />;
}
