"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { ErrorState } from "@/components/ui/error-state";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { dashboardService } from "@/services/dashboard.service";
import { useChatStore } from "@/stores/chat-store";
import { AskAiPanel } from "./ask-ai-panel";
import { KnowledgeDiscovery } from "./knowledge-discovery";
import { QuickAccess } from "./quick-access";
import { RecentActivity } from "./recent-activity";
import { StatCard } from "./stat-card";
import { WelcomeHeader } from "./welcome-header";

function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading overview">
      <Skeleton className="h-64 rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-3xl" />
    </div>
  );
}

export function DashboardView() {
  const overview = useAsync(() => dashboardService.getOverview());
  const { conversations, status, load } = useChatStore();

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  return (
    <PageContainer>
      <WelcomeHeader />
      {overview.status === "loading" ? (
        <Loading />
      ) : overview.status === "error" ? (
        <ErrorState onRetry={overview.retry} />
      ) : (
        <div className="space-y-12">
          <Reveal>
            <AskAiPanel />
          </Reveal>
          <QuickAccess />
          <section aria-labelledby="stats-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="stats-heading" className="text-display-md">
                At a glance
              </h2>
              <MockDataBadge label="Sample figures" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Conversations" value={conversations.length} hint="Stored on this device" />
              <StatCard label="Documents analyzed" value={overview.data.stats.documentsAnalyzed} hint="Sample documents" />
              <StatCard label="Saved resources" value={overview.data.stats.savedResources} hint="Sample bookmarks" />
              <StatCard label="Completed plans" value={overview.data.stats.completedPlans} hint="Sample plans" />
            </div>
          </section>
          <RecentActivity documents={overview.data.recentDocuments} plans={overview.data.recentPlans} saved={overview.data.savedResources} />
          <KnowledgeDiscovery topics={overview.data.featuredTopics} learning={overview.data.learning} />
        </div>
      )}
    </PageContainer>
  );
}
