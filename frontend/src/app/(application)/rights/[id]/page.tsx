import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { RightDetailView } from "@/components/rights/right-detail";
import { Skeleton } from "@/components/ui/skeleton";

// Rendered behind a client-side session check, so it cannot be validated for instant navigation.
export const instant = false;

export const metadata: Metadata = { title: "Right" };

// Ids come from the catalogue at runtime, so none are known at build time.
async function Right({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RightDetailView id={decodeURIComponent(id)} />;
}

export default function RightPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageContainer><Skeleton className="h-72 rounded-3xl" /></PageContainer>}>
      <Right params={params} />
    </Suspense>
  );
}
