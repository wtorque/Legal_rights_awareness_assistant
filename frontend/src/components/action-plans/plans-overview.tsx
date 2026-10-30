"use client";

import { ClipboardList, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { RelativeTime } from "@/components/shared/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatJurisdiction } from "@/config/jurisdictions";
import { planProgress, planStatus, usePlansStore } from "@/stores/plans-store";
import { useSavedStore } from "@/stores/saved-store";
import type { ActionPlan } from "@/types/action-plans";
import { NewPlanDialog } from "./new-plan-dialog";
import { ProgressRing } from "./progress-ring";

function PlanCard({ plan, onDelete }: { plan: ActionPlan; onDelete: (p: ActionPlan) => void }) {
  const p = planProgress(plan);
  const completed = planStatus(plan) === "completed";
  return (
    <Card interactive className="flex h-full flex-col p-5">
      <Link href={`/action-plans/${plan.id}`} className="flex flex-1 gap-4 rounded-xl">
        <ProgressRing fraction={p.fraction} label={`${p.done} of ${p.total} steps done`} />
        <span className="min-w-0">
          <span className="block font-display text-xl leading-snug">{plan.title}</span>
          <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">{plan.situation}</span>
        </span>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={completed ? "brand" : "neutral"}>{completed ? "Completed" : `${p.done}/${p.total} steps`}</Badge>
        <span>{formatJurisdiction(plan.countryCode, plan.regionCode)}</span>
        <span>· <RelativeTime iso={plan.updatedAt} /></span>
        {plan.origin === "user" ? (
          <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label={`Delete ${plan.title}`} onClick={() => onDelete(plan)}>
            <Trash2 />
          </Button>
        ) : (
          <span className="ml-auto"><MockDataBadge label="Sample" /></span>
        )}
      </div>
    </Card>
  );
}

function Grid({ plans, onDelete, empty }: { plans: ActionPlan[]; onDelete: (p: ActionPlan) => void; empty: string }) {
  if (plans.length === 0) return <EmptyState icon={ClipboardList} title={empty} />;
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((p) => (
        <li key={p.id}>
          <PlanCard plan={p} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}

export function PlansOverview() {
  const { plans, status, load, remove } = usePlansStore();
  const savedItems = useSavedStore((s) => s.items);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ActionPlan | null>(null);

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  const groups = useMemo(() => {
    const savedIds = new Set(savedItems.filter((i) => i.kind === "plan").map((i) => i.id));
    return {
      active: plans.filter((p) => planStatus(p) === "active"),
      completed: plans.filter((p) => planStatus(p) === "completed"),
      saved: plans.filter((p) => savedIds.has(p.id)),
      recent: plans.slice(0, 3),
    };
  }, [plans, savedItems]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Action blueprint"
        title="Action plans"
        description="Turn a situation into a checklist you can follow at your own pace. Steps are suggestions, not legal requirements."
        meta={<MockDataBadge label="Sample plans · dates unverified" />}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> New plan
          </Button>
        }
      />

      {status === "idle" || status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : status === "error" ? (
        <ErrorState onRetry={() => void load()} />
      ) : (
        <Tabs defaultValue="active">
          <TabsList aria-label="Plan groups">
            <TabsTrigger value="active">Active ({groups.active.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({groups.completed.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved ({groups.saved.length})</TabsTrigger>
            <TabsTrigger value="recent">Recently updated</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <Grid plans={groups.active} onDelete={setDeleting} empty="No active plans" />
          </TabsContent>
          <TabsContent value="completed">
            <Grid plans={groups.completed} onDelete={setDeleting} empty="No completed plans yet" />
          </TabsContent>
          <TabsContent value="saved">
            <Grid plans={groups.saved} onDelete={setDeleting} empty="No saved plans. Use Save on a plan page." />
          </TabsContent>
          <TabsContent value="recent">
            <Grid plans={groups.recent} onDelete={setDeleting} empty="Nothing updated yet" />
          </TabsContent>
        </Tabs>
      )}

      <NewPlanDialog open={creating} onOpenChange={setCreating} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this plan?"
        description={deleting ? `“${deleting.title}” and its notes will be removed from this browser.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleting && void remove(deleting.id).then(() => toast.success("Plan deleted"))}
      />
    </PageContainer>
  );
}
