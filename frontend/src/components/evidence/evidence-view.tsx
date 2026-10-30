"use client";

import dynamic from "next/dynamic";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState } from "@/components/ui/error-state";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { evidenceService } from "@/services/evidence.service";
import { kindMeta, kindOrder } from "./node-style";

// React Flow measures the DOM, so it only renders on the client.
const EvidenceCanvas = dynamic(() => import("./evidence-canvas").then((m) => m.EvidenceCanvas), {
  ssr: false,
  loading: () => <Skeleton className="m-6 h-[60dvh] rounded-3xl" />,
});

export function EvidenceView() {
  const graph = useAsync(() => evidenceService.getGraph());

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <h1 className="font-display text-2xl">How sources connect</h1>
        <MockDataBadge label="Sample graph · fictional nodes" />
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground lg:ml-auto" aria-label="Legend">
          {kindOrder.map((k) => {
            const Icon = kindMeta[k].icon;
            return (
              <li key={k} className="flex items-center gap-1.5">
                <span className={`grid size-5 place-items-center rounded-md ${kindMeta[k].chip}`}>
                  <Icon className="size-3" aria-hidden />
                </span>
                {kindMeta[k].label}
              </li>
            );
          })}
        </ul>
      </div>
      {graph.status === "loading" ? (
        <Skeleton className="mx-6 h-[60dvh] rounded-3xl" />
      ) : graph.status === "error" ? (
        <PageContainer>
          <ErrorState onRetry={graph.retry} />
        </PageContainer>
      ) : (
        <div className="border-t border-border">
          <EvidenceCanvas graph={graph.data} />
        </div>
      )}
    </div>
  );
}
