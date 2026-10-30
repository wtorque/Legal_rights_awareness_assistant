import type { Metadata } from "next";
import { ConversationsView } from "@/components/assistant/conversations-view";

export const metadata: Metadata = { title: "Conversations" };

export default function ConversationsPage() {
  return <ConversationsView />;
}
