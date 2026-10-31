"use client";

import { FileText, GitCompareArrows, Search, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { isLiveBackend } from "@/lib/api-config";
import { formatBytes } from "@/lib/format";
import { useDocumentsStore } from "@/stores/documents-store";
import type { DocumentCategory, DocumentRecord } from "@/types/documents";
import { categoryLabels } from "./categories";
import { UploadZone } from "./upload-zone";

export function DocumentsLibrary() {
  const { documents, status, load, remove } = useDocumentsStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DocumentCategory | "all">("all");
  const [analyzedOnly, setAnalyzedOnly] = useState(false);
  const [deleting, setDeleting] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  const filtered = useMemo(
    () =>
      documents.filter(
        (d) =>
          (category === "all" || d.category === category) &&
          (!analyzedOnly || d.analyzed) &&
          d.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [documents, query, category, analyzedOnly],
  );

  const byCategory = useMemo(() => {
    const counts = new Map<DocumentCategory, number>();
    for (const d of documents) counts.set(d.category, (counts.get(d.category) ?? 0) + 1);
    return counts;
  }, [documents]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Document intelligence"
        title="Documents"
        description="Add a notice, contract or agreement and see each clause in plain language."
        meta={isLiveBackend ? <Badge variant="neutral">Files are processed on the Aequa server</Badge> : <MockDataBadge label="Sample analysis · files stay in your browser" />}
        actions={
          <Button asChild variant="outline">
            <Link href="/documents/compare">
              <GitCompareArrows /> Compare documents
            </Link>
          </Button>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Card variant="tinted" className="p-5">
          <p className="text-sm text-muted-foreground">Total documents</p>
          <p className="mt-1 font-display text-4xl tabular-nums">{status === "ready" ? documents.length : "–"}</p>
        </Card>
        <Card variant="tinted" className="p-5">
          <p className="text-sm text-muted-foreground">Analyzed</p>
          <p className="mt-1 font-display text-4xl tabular-nums">{status === "ready" ? documents.filter((d) => d.analyzed).length : "–"}</p>
        </Card>
        <Card variant="tinted" className="p-5">
          <p className="text-sm text-muted-foreground">Categories</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {byCategory.size === 0 ? <span className="text-sm text-muted-foreground">None yet</span> : Array.from(byCategory).map(([c, n]) => (
              <Badge key={c} variant="outline">
                {categoryLabels[c]} · {n}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <UploadZone />

      <section aria-labelledby="library-heading" className="mt-12">
        <h2 id="library-heading" className="text-display-md mb-4">
          Library
        </h2>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents" aria-label="Search documents" className="rounded-full pl-11" />
          </div>
          <Select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory | "all")} className="h-11 w-44 rounded-full">
            <option value="all">All categories</option>
            {Object.entries(categoryLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={analyzedOnly} onChange={(e) => setAnalyzedOnly(e.target.checked)} className="size-4 accent-[var(--primary)]" />
            Analyzed only
          </label>
        </div>

        {status === "idle" || status === "loading" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-3xl" />
            ))}
          </div>
        ) : status === "error" ? (
          <ErrorState message="Couldn't load your documents." onRetry={() => void load()} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileText} title={documents.length === 0 ? "No documents yet" : "No documents match"} description={documents.length === 0 ? "Add a PDF above to get started." : "Try clearing a filter."} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <li key={d.id}>
                <Card interactive className="flex h-full flex-col p-5">
                  <Link href={`/documents/${d.id}`} className="flex-1 rounded-xl">
                    <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <FileText className="size-5" aria-hidden />
                    </span>
                    <p className="mt-4 break-words font-medium leading-snug">{d.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.pages > 0 ? `${d.pages} pages · ` : ""}
                      {formatBytes(d.sizeBytes)} · <RelativeTime iso={d.uploadedAt} />
                    </p>
                  </Link>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{categoryLabels[d.category]}</Badge>
                    {d.origin === "sample" ? <MockDataBadge label="Sample" /> : <Badge variant="brand">Your file</Badge>}
                    {d.analyzed && <Badge variant="neutral">Analyzed</Badge>}
                    {d.needsOcr && <Badge variant="outline">No text layer</Badge>}
                    <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label={`Delete ${d.name}`} onClick={() => setDeleting(d)} disabled={d.origin === "sample"} title={d.origin === "sample" ? "Sample documents can't be deleted" : undefined}>
                      <Trash2 />
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Remove this document?"
        description={deleting ? (isLiveBackend ? `“${deleting.name}” and its extracted text will be permanently deleted from the server.` : `“${deleting.name}” will be removed from this browser.`) : ""}
        confirmLabel="Remove"
        destructive
        onConfirm={() => deleting && void remove(deleting.id).then(() => toast.success("Document removed"), () => toast.error("Couldn't delete the document. Try again."))}
      />
    </PageContainer>
  );
}
