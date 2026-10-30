import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanDetail } from "@/components/action-plans/plan-detail";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { samplePlans } from "@/mocks/action-plans";

export const metadata: Metadata = { title: "Action plan" };

export function generateStaticParams() {
  return samplePlans.map((p) => ({ id: p.id }));
}

async function Plan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanDetail id={id} />;
}

export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageContainer><Skeleton className="h-72 rounded-3xl" /></PageContainer>}>
      <Plan params={params} />
    </Suspense>
  );
}
