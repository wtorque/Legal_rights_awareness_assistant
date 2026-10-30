"use client";

import { ArrowLeft, Building2, CalendarClock, CircleHelp, ExternalLink, ListChecks, Route } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SetBreadcrumb } from "@/components/layout/set-breadcrumb";
import { SaveButton } from "@/components/shared/save-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatJurisdiction } from "@/config/jurisdictions";
import { planProgress, usePlansStore } from "@/stores/plans-store";
import { PlanChecklist } from "./plan-checklist";
import { PlanTimeline } from "./plan-timeline";
import { ProgressRing } from "./progress-ring";

function Section({ icon: Icon, title, children }: { icon: typeof Route; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2.5 text-display-md">
        <Icon className="size-5 text-brass" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PlanDetail({ id }: { id: string }) {
  const { plans, status, load } = usePlansStore();
  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  const plan = plans.find((p) => p.id === id);

  if (status === "idle" || status === "loading")
    return (
      <PageContainer>
        <Skeleton className="mb-6 h-12 w-2/3" />
        <Skeleton className="h-72 rounded-3xl" />
      </PageContainer>
    );
  if (status === "error") return <PageContainer><ErrorState onRetry={() => void load()} /></PageContainer>;
  if (!plan)
    return (
      <PageContainer>
        <EmptyState icon={CircleHelp} title="Plan not found" description="It may have been deleted." action={<Button asChild><Link href="/action-plans">Back to plans</Link></Button>} />
      </PageContainer>
    );

  const p = planProgress(plan);

  return (
    <PageContainer className="max-w-4xl">
      <SetBreadcrumb label={plan.title} />
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-4">
        <Link href="/action-plans">
          <ArrowLeft /> Action plans
        </Link>
      </Button>

      <header className="mb-10 flex flex-wrap items-start gap-5">
        <ProgressRing fraction={p.fraction} size={72} label={`${p.done} of ${p.total} steps done`} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brass" className="capitalize">{plan.category.replace("-", " ")}</Badge>
            <Badge variant="outline">{formatJurisdiction(plan.countryCode, plan.regionCode)}</Badge>
            {plan.origin === "sample" && <MockDataBadge label="Sample plan" />}
          </div>
          <h1 className="text-display-lg">{plan.title}</h1>
          <p className="text-sm text-muted-foreground" role="status">
            {p.done} of {p.total} steps complete
          </p>
        </div>
        <SaveButton item={{ kind: "plan", id: plan.id, title: plan.title, subtitle: "Action plan", href: `/action-plans/${plan.id}` }} />
      </header>

      <div className="space-y-12">
        <Section icon={CircleHelp} title="Situation">
          <Card variant="tinted" className="p-6">
            <p className="leading-relaxed">{plan.situation}</p>
          </Card>
        </Section>

        <Section icon={Route} title="Suggested steps">
          <p className="-mt-2 text-sm text-muted-foreground">These are suggestions to adapt to your case, not legal requirements. Tap a step to add notes.</p>
          <PlanTimeline plan={plan} />
        </Section>

        <Section icon={ListChecks} title="Documents to gather">
          <Card className="p-5">
            <PlanChecklist plan={plan} />
          </Card>
        </Section>

        <Section icon={Building2} title="Relevant authorities">
          <ul className="grid gap-3 sm:grid-cols-2">
            {plan.authorities.map((a) => (
              <li key={a.name} className="rounded-2xl border border-border bg-card/70 p-4">
                <p className="text-sm font-medium">{a.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.role}</p>
                {a.url && (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    Official site <ExternalLink className="size-3" aria-hidden />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {plan.resources.length > 0 && (
          <Section icon={ExternalLink} title="Official resources">
            <ul className="space-y-2">
              {plan.resources.map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-4 text-sm">
                  {r.label}
                  <Badge variant="outline" className="ml-auto">No link · sample</Badge>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {plan.importantDates.length > 0 && (
          <Section icon={CalendarClock} title="Important dates">
            <ul className="space-y-2">
              {plan.importantDates.map((d) => (
                <li key={d.label} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/70 p-4 text-sm">
                  <span className="font-medium">{d.label}:</span> {d.value}
                  <Badge variant={d.verified ? "brand" : "outline"} className="ml-auto">{d.verified ? "Verified" : "Not verified — check the official deadline"}</Badge>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </PageContainer>
  );
}
