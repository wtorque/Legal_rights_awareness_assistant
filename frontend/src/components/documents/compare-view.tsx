"use client";

import { ArrowLeft, GitCompareArrows, Minus, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Label } from "@/components/ui/input";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isLiveBackend } from "@/lib/api-config";
import { diffWords } from "@/lib/text-diff";
import { cn } from "@/lib/utils";
import { documentsService } from "@/services/documents.service";
import { useDocumentsStore } from "@/stores/documents-store";
import type { ClauseChange, DocumentComparison } from "@/types/documents";

const typeMeta = {
  added: { label: "Added", icon: Plus, tone: "bg-primary/10 text-primary" },
  removed: { label: "Removed", icon: Minus, tone: "bg-destructive/10 text-destructive" },
  modified: { label: "Modified", icon: Pencil, tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300" },
} as const;

function ChangeCard({ change }: { change: ClauseChange }) {
  const meta = typeMeta[change.type];
  const parts = useMemo(
    () => (change.before && change.after ? diffWords(change.before, change.after) : null),
    [change],
  );
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Badge className={meta.tone}>
          <meta.icon aria-hidden /> {meta.label}
        </Badge>
        <h3 className="font-medium">{change.title}</h3>
      </div>
      {parts ? (
        <p className="text-sm leading-relaxed">
          {parts.map((p, i) =>
            p.kind === "same" ? (
              <span key={i}>{p.text}</span>
            ) : p.kind === "added" ? (
              <ins key={i} className="rounded bg-primary/15 px-0.5 no-underline">{p.text}</ins>
            ) : (
              <del key={i} className="rounded bg-destructive/15 px-0.5">{p.text}</del>
            ),
          )}
        </p>
      ) : (
        <p className={cn("text-sm leading-relaxed", change.type === "removed" && "line-through decoration-destructive/60")}>{change.before ?? change.after}</p>
      )}
    </Card>
  );
}

export function CompareView() {
  const { documents, status, load } = useDocumentsStore();
  const comparable = documents.filter((d) => (isLiveBackend ? d.origin === "upload" && !d.needsOcr : d.origin === "sample"));
  const [left, setLeft] = useState(isLiveBackend ? "" : "doc-rental");
  const [right, setRight] = useState(isLiveBackend ? "" : "doc-rental-v2");
  const [request, setRequest] = useState<{ left: string; right: string } | null>(isLiveBackend ? null : { left: "doc-rental", right: "doc-rental-v2" });
  const [result, setResult] = useState<DocumentComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Live mode has no fixed ids: until the user chooses, default to the two newest comparable documents.
  const leftId = left || (isLiveBackend ? comparable[1]?.id ?? "" : "");
  const rightId = right || (isLiveBackend ? comparable[0]?.id ?? "" : "");
  const [filter, setFilter] = useState<"all" | ClauseChange["type"]>("all");

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  useEffect(() => {
    if (!request) return;
    let cancelled = false;
    documentsService.compare(request.left, request.right).then(
      (r) => !cancelled && setResult(r),
      (e: unknown) => !cancelled && setError(e instanceof Error ? e.message : "Comparison failed"),
    );
    return () => {
      cancelled = true;
    };
  }, [request]);

  const run = () => {
    setResult(null);
    setError(null);
    setRequest({ left: leftId, right: rightId });
  };
  const loading = !!request && !result && !error;

  const counts = { added: 0, removed: 0, modified: 0 };
  result?.changes.forEach((c) => counts[c.type]++);
  const visible = result?.changes.filter((c) => filter === "all" || c.type === filter) ?? [];

  return (
    <PageContainer>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
        <Link href="/documents">
          <ArrowLeft /> Documents
        </Link>
      </Button>
      <PageHeader
        title="Compare documents"
        description={isLiveBackend ? "Pick two of your documents to see which clauses were added, removed or changed." : "Pick two sample documents to see which clauses were added, removed or changed."}
        meta={isLiveBackend ? undefined : <MockDataBadge label="Sample documents · fictional text" />}
      />

      <Card variant="tinted" className="mb-8 grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        {([
          ["Original", leftId, setLeft],
          ["Revised", rightId, setRight],
        ] as const).map(([label, value, setter]) => (
          <div key={label} className="space-y-1.5">
            <Label htmlFor={`cmp-${label}`}>{label}</Label>
            <Select id={`cmp-${label}`} value={value} onChange={(e) => setter(e.target.value)}>
              {comparable.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        ))}
        <Button onClick={run} disabled={!leftId || leftId === rightId || loading}>
          <GitCompareArrows /> Compare
        </Button>
      </Card>

      {left === right && <p className="mb-4 text-sm text-muted-foreground" role="status">Choose two different documents.</p>}

      {loading || status !== "ready" ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={run} />
      ) : result ? (
        result.changes.length === 0 ? (
          <EmptyState icon={GitCompareArrows} title="No differences found" description="These documents have the same clause text." />
        ) : (
          <div className="space-y-5">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList aria-label="Filter changes">
                <TabsTrigger value="all">All ({result.changes.length})</TabsTrigger>
                <TabsTrigger value="added">Added ({counts.added})</TabsTrigger>
                <TabsTrigger value="removed">Removed ({counts.removed})</TabsTrigger>
                <TabsTrigger value="modified">Modified ({counts.modified})</TabsTrigger>
              </TabsList>
            </Tabs>
            <ul className="grid gap-4">
              {visible.map((c) => (
                <li key={`${c.type}-${c.title}`}>
                  <ChangeCard change={c} />
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}
    </PageContainer>
  );
}
