import type { Metadata } from "next";
import { AssistantWorkspace } from "@/components/assistant/assistant-workspace";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = { title: "AI Legal Assistant" };

export default function AssistantPage() {
  return (
    <PageContainer width="full">
      <AssistantWorkspace />
    </PageContainer>
  );
}
