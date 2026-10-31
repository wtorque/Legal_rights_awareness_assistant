import type { Metadata } from "next";
import { Suspense } from "react";
import { SourceDetail } from "@/components/knowledge/source-detail";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { knowledgeSources } from "@/mocks/knowledge";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Legal source" };

export function generateStaticParams() {
  return knowledgeSources.map((s) => ({ id: s.id }));
}

async function Source({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SourceDetail id={id} />;
}

export default function SourcePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageContainer><Skeleton className="h-64 rounded-3xl" /></PageContainer>}>
      <Source params={params} />
    </Suspense>
  );
}
