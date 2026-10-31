"use client";

import { ArrowLeft, ExternalLink, FileWarning, ScanSearch, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SetBreadcrumb } from "@/components/layout/set-breadcrumb";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { isLiveBackend } from "@/lib/api-config";
import { documentsService } from "@/services/documents.service";
import { useDocumentsStore } from "@/stores/documents-store";
import type { DocumentAnalysis, DocumentContent } from "@/types/documents";
import { AnalysisPanel } from "./analysis-panel";
import { DocumentViewer } from "./document-viewer";
import { ScanOverlay } from "./scan-overlay";

type Load =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; content: DocumentContent | null; fileUrl: string | null };

export function DocumentWorkspace({ id }: { id: string }) {
  const { documents, status, load, markAnalyzed } = useDocumentsStore();
  const [doc, setDoc] = useState<Load>({ state: "loading" });
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const [activeClause, setActiveClause] = useState<string | null>(null);
  const [requestedPage, setRequestedPage] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  const record = documents.find((d) => d.id === id);
  const missing = status === "ready" && !record;

  useEffect(() => {
    if (status !== "ready") return;
    if (!record) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    Promise.all([documentsService.getContent(id), documentsService.getFileUrl(id)]).then(
      ([content, fileUrl]) => {
        objectUrl = fileUrl;
        if (cancelled) return;
        setDoc({ state: "ready", content, fileUrl });
      },
      () => !cancelled && setDoc({ state: "error" }),
    );
    return () => {
      cancelled = true;
      // Only live-backend URLs are ours to revoke; mock URLs belong to the mock store.
      if (objectUrl && isLiveBackend) URL.revokeObjectURL(objectUrl);
    };
  }, [id, status, record]);

  const runAnalysis = () => {
    setAnalyzing(true);
    setAnalysisError(false);
    documentsService.analyze(id).then(
      (result) => {
        setAnalysis(result);
        markAnalyzed(id);
      },
      () => setAnalysisError(true),
    ).finally(() => setAnalyzing(false));
  };

  // Samples, and real uploads that have readable text, are analyzed on open. Mock-mode uploads wait for a click.
  const autoAnalyze = record?.origin === "sample" || (isLiveBackend && record?.needsOcr === false);
  useEffect(() => {
    if (doc.state === "ready" && autoAnalyze && !started.current) {
      started.current = true;
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.state, autoAnalyze]);

  const selectClause = (clauseId: string | null) => {
    setActiveClause(clauseId);
    const clause = analysis?.clauses.find((c) => c.id === clauseId);
    if (clause) setRequestedPage(clause.page);
    if (clauseId) document.getElementById(`clause-${clauseId}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  if (status === "error") return <PageContainer><ErrorState onRetry={() => void load()} /></PageContainer>;
  if (missing)
    return (
      <PageContainer>
        <EmptyState
          icon={FileWarning}
          title="Document not found"
          description={isLiveBackend ? "It may have been deleted or may have passed its retention period." : "Uploaded files live in this browser tab and may be gone after a reload."}
          action={<Button asChild><Link href="/documents">Back to documents</Link></Button>}
        />
      </PageContainer>
    );
  if (doc.state === "error") return <PageContainer><ErrorState onRetry={() => setDoc({ state: "loading" })} /></PageContainer>;

  return (
    <PageContainer width="wide" className="space-y-5">
      {record && <SetBreadcrumb label={record.name.replace(/\.pdf$/i, "")} />}
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/documents">
            <ArrowLeft /> Documents
          </Link>
        </Button>
        <h1 className="min-w-0 flex-1 truncate font-display text-2xl">{record?.name ?? "Document"}</h1>
        {record?.origin === "sample" && <MockDataBadge label="Sample document · fictional text" />}
      </div>

      {record?.warnings && record.warnings.length > 0 && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-brass/40 bg-brass/10 p-4 text-sm leading-relaxed">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
          <ul className="space-y-1">
            {record.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid min-h-[70dvh] gap-5 lg:grid-cols-2 lg:h-[calc(100dvh-11rem)]">
        <section aria-label="Document preview" className="relative flex min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-border bg-card">
          {doc.state === "loading" ? (
            <Skeleton className="m-4 flex-1 rounded-2xl" />
          ) : doc.content && doc.content.pages.some((p) => p.paragraphs.length > 0) ? (
            <DocumentViewer content={doc.content} clauses={analysis?.clauses ?? null} activeClauseId={activeClause} onSelectClause={selectClause} requestedPage={requestedPage} />
          ) : doc.fileUrl ? (
            <iframe src={doc.fileUrl} title={`Preview of ${record?.name}`} className="h-full w-full flex-1" />
          ) : (
            <EmptyState icon={FileWarning} title="Preview unavailable" description="Uploaded files are only kept for the current tab. Upload it again to preview." className="m-4 flex-1" />
          )}
          {analyzing && <ScanOverlay />}
        </section>

        <section aria-label="Analysis" className="flex min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-border bg-card/60">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {analysis ? (
              <AnalysisPanel analysis={analysis} activeClauseId={activeClause} onSelectClause={selectClause} />
            ) : analysisError ? (
              <ErrorState title="Analysis failed" message="The analysis couldn't run. Try again." onRetry={runAnalysis} className="m-4" />
            ) : analyzing || doc.state === "loading" ? (
              <div className="space-y-3 p-5" aria-busy="true">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            ) : record?.needsOcr ? (
              <EmptyState
                icon={FileWarning}
                title="No readable text"
                description="This PDF looks like a scan. Analysis needs OCR, which is not available yet. You can still preview and delete it."
                className="m-4"
              />
            ) : (
              <EmptyState
                icon={ScanSearch}
                title="Ready to analyze"
                description={isLiveBackend ? "Reads the text of your file on the Aequa server and labels each clause." : "This starts a demonstration analysis. Your file is not read or sent anywhere."}
                action={<Button onClick={runAnalysis}>Analyze document</Button>}
                className="m-4"
              />
            )}
          </div>
          {doc.state === "ready" && doc.fileUrl && (
            <div className="border-t border-border p-3 text-right">
              <Button asChild variant="ghost" size="sm">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                  Open file in new tab <ExternalLink />
                </a>
              </Button>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
