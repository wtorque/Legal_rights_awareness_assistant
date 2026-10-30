"use client";

import { ArrowLeft, CircleHelp, ExternalLink } from "lucide-react";
import Link from "next/link";
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
import { useAsync } from "@/hooks/use-async";
import { formatDate } from "@/lib/format";
import { knowledgeService } from "@/services/knowledge.service";
import { sourceCategoryLabels } from "./category-labels";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

export function SourceDetail({ id }: { id: string }) {
  const source = useAsync(() => knowledgeService.get(id));

  if (source.status === "loading")
    return (
      <PageContainer>
        <Skeleton className="mb-6 h-12 w-2/3" />
        <Skeleton className="h-64 rounded-3xl" />
      </PageContainer>
    );
  if (source.status === "error") return <PageContainer><ErrorState onRetry={source.retry} /></PageContainer>;
  if (!source.data)
    return (
      <PageContainer>
        <EmptyState icon={CircleHelp} title="Source not found" action={<Button asChild><Link href="/knowledge">Back to library</Link></Button>} />
      </PageContainer>
    );

  const s = source.data;
  return (
    <PageContainer className="max-w-4xl">
      <SetBreadcrumb label={s.title} />
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-4">
        <Link href="/knowledge">
          <ArrowLeft /> Legal Knowledge
        </Link>
      </Button>

      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brass">{sourceCategoryLabels[s.category]}</Badge>
          <Badge variant="outline">{s.docType}</Badge>
          {s.origin === "sample" && <MockDataBadge label="Sample source · fictional" />}
        </div>
        <h1 className="text-display-lg">{s.title}</h1>
        <p className="text-lead max-w-2xl">{s.description}</p>
        <SaveButton item={{ kind: "source", id: s.id, title: s.title, subtitle: sourceCategoryLabels[s.category], href: `/knowledge/${s.id}` }} />
      </header>

      <Card className="mb-10 p-6">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Issuing authority">{s.authority}</Field>
          <Field label="Jurisdiction">{s.jurisdiction}</Field>
          <Field label="Publication date">{s.publicationDate ? formatDate(s.publicationDate) : "Not applicable"}</Field>
          <Field label="Effective date">{s.effectiveDate ? formatDate(s.effectiveDate) : "Not applicable"}</Field>
          <Field label="Last verified">{s.lastVerified ? formatDate(s.lastVerified) : <span className="text-destructive">Never verified</span>}</Field>
          <Field label="Official URL">
            {s.officialUrl ? (
              <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                Open official text <ExternalLink className="size-3.5" aria-hidden />
              </a>
            ) : (
              <span className="text-muted-foreground">None (fictional document)</span>
            )}
          </Field>
        </dl>
      </Card>

      <section className="space-y-4">
        <h2 className="text-display-md">Relevant sections</h2>
        <ul className="space-y-3">
          {s.sections.map((sec) => (
            <li key={sec.label} className="rounded-2xl border border-border bg-card/70 p-4">
              <p className="font-mono text-xs text-primary">{sec.label}</p>
              <p className="mt-1 text-sm leading-relaxed">{sec.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}
