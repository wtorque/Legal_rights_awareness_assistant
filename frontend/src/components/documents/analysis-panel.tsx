"use client";

import { CalendarDays, HelpCircle, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { SourceCard } from "@/components/shared/source-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSampleSource } from "@/mocks/legal-sources";
import { cn } from "@/lib/utils";
import type { ClauseFlag, DocumentAnalysis } from "@/types/documents";
import { ClauseCard } from "./clause-card";
import { FlagChart } from "./flag-chart";
import { flagMeta } from "./flag-badge";

interface AnalysisPanelProps {
  analysis: DocumentAnalysis;
  activeClauseId: string | null;
  onSelectClause: (id: string) => void;
}

function List({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed marker:text-brass">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card/70 p-5">
      <h3 className="mb-3 text-eyebrow">{title}</h3>
      {children}
    </section>
  );
}

export function AnalysisPanel({ analysis, activeClauseId, onSelectClause }: AnalysisPanelProps) {
  const [filter, setFilter] = useState<ClauseFlag | "all">("all");

  const sources = useMemo(() => {
    const ids = Array.from(new Set(analysis.clauses.map((c) => c.sourceId).filter((x): x is string => !!x)));
    return ids.map(getSampleSource);
  }, [analysis]);

  const counts = useMemo(() => {
    const result: Record<ClauseFlag, number> = { attention: 0, ambiguous: 0, obligation: 0, missing: 0 };
    for (const c of analysis.clauses) if (c.flag) result[c.flag]++;
    return result;
  }, [analysis]);

  const visible = filter === "all" ? analysis.clauses : analysis.clauses.filter((c) => c.flag === filter);

  return (
    <div className="space-y-4 p-4 sm:p-5">
      {analysis.demonstrationOnly && (
        <div role="note" className="flex gap-3 rounded-2xl border border-brass/40 bg-brass/10 p-4 text-sm leading-relaxed">
          <Info className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
          <p>
            <strong className="font-medium">Demonstration analysis.</strong> Your file stays in this browser and was not read. The results below are a fixed example showing what the analysis will look like.
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {analysis.generatedBy === "rules" ? (
          <Badge variant="neutral">Keyword analysis of your file{analysis.documentType ? ` · ${analysis.documentType}` : ""}</Badge>
        ) : (
          <MockDataBadge label={analysis.demonstrationOnly ? "Example analysis" : "Sample analysis · not verified"} />
        )}
        <p className="text-xs text-muted-foreground">Indicators are reading aids, not legal judgments.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList aria-label="Analysis sections" className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clauses">Clauses ({analysis.clauses.length})</TabsTrigger>
          <TabsTrigger value="gaps">Gaps</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
          <TabsTrigger value="questions">Ask a lawyer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Block title="Summary">
            <p className="text-sm leading-relaxed">{analysis.summary}</p>
          </Block>
          <Block title="Clauses by label">
            <FlagChart clauses={analysis.clauses} />
          </Block>
          <Block title="Key dates">
            {analysis.keyDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dates found.</p>
            ) : (
              <dl className="grid gap-3 sm:grid-cols-2">
                {analysis.keyDates.map((d) => (
                  <div key={d.label} className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 size-4 text-primary" aria-hidden />
                    <div>
                      <dt className="text-xs text-muted-foreground">{d.label}</dt>
                      <dd className="text-sm font-medium">{d.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </Block>
          <Block title="Important obligations">
            <List items={analysis.obligations} empty="No obligations extracted." />
          </Block>
        </TabsContent>

        <TabsContent value="clauses" className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter clauses">
            {(["all", "attention", "ambiguous", "obligation", "missing"] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary",
                )}
              >
                {f === "all" ? `All (${analysis.clauses.length})` : `${flagMeta[f].label} (${counts[f]})`}
              </button>
            ))}
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={HelpCircle} title="No clauses with this label" className="py-10" />
          ) : (
            <div className="space-y-3">
              {visible.map((c) => (
                <ClauseCard key={c.id} clause={c} active={activeClauseId === c.id} onSelect={() => onSelectClause(c.id)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Block title="Missing or unclear information">
            <List items={analysis.missingInformation} empty="Nothing flagged as missing." />
          </Block>
          <Block title="Clauses with ambiguous wording">
            <List
              items={analysis.clauses.filter((c) => c.flag === "ambiguous").map((c) => `${c.title}: ${c.simplified ?? c.originalText}`)}
              empty="No ambiguous wording flagged."
            />
          </Block>
        </TabsContent>

        <TabsContent value="references" className="space-y-3">
          {analysis.legalReferences && analysis.legalReferences.length > 0 && (
            <Block title="Legal references written in this document">
              <ul className="space-y-2 text-sm">
                {analysis.legalReferences.map((r) => (
                  <li key={`${r.page}-${r.text}`} className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium">{r.text}</span>
                    <span className="text-xs text-muted-foreground">page {r.page}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">Quoted as written. Aequa has not checked that these provisions exist, apply or are still in force.</p>
            </Block>
          )}
          {sources.length === 0 && !analysis.legalReferences?.length ? (
            <EmptyState icon={HelpCircle} title="No references found" description="No section or article references were found in this document." className="py-10" />
          ) : (
            sources.map((s) => <SourceCard key={s.id} source={s} />)
          )}
        </TabsContent>

        <TabsContent value="questions">
          <Block title="Suggested questions for a lawyer">
            <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed marker:font-mono marker:text-brass">
              {analysis.lawyerQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </Block>
        </TabsContent>
      </Tabs>
    </div>
  );
}
