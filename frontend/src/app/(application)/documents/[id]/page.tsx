import type { Metadata } from "next";
import { Suspense } from "react";
import { DocumentWorkspace } from "@/components/documents/document-workspace";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { sampleDocuments } from "@/mocks/documents";

export const metadata: Metadata = { title: "Document" };

export function generateStaticParams() {
  return sampleDocuments.map((d) => ({ id: d.id }));
}

async function Workspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocumentWorkspace id={id} />;
}

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <Skeleton className="h-[70dvh] rounded-3xl" />
        </PageContainer>
      }
    >
      <Workspace params={params} />
    </Suspense>
  );
}
