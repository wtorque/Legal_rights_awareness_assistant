"use client";

import { LibraryBig, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { countries } from "@/config/jurisdictions";
import { formatDate } from "@/lib/format";
import { knowledgeService } from "@/services/knowledge.service";
import type { KnowledgeQuery, KnowledgeSource, SourceCategory } from "@/types/knowledge";
import { sourceCategoryLabels } from "./category-labels";

const docTypes = ["Act", "Rules", "Guide", "Notice", "Portal"] as const;

export function KnowledgeLibrary() {
  const [text, setText] = useState("");
  const [countryCode, setCountryCode] = useState("all");
  const [category, setCategory] = useState<SourceCategory | "all">("all");
  const [docType, setDocType] = useState<NonNullable<KnowledgeQuery["docType"]>>("all");
  const [results, setResults] = useState<KnowledgeSource[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      knowledgeService.search({ text, countryCode, category, docType }).then(
        (r) => {
          if (cancelled) return;
          setResults(r);
          setError(false);
        },
        () => !cancelled && setError(true),
      );
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [text, countryCode, category, docType, attempt]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Legal knowledge"
        title="Source library"
        description="The documents behind every answer. Each entry shows who issued it, when it took effect and when it was last verified."
        meta={<MockDataBadge label="Sample sources · none verified" />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search sources and sections" aria-label="Search sources" className="rounded-full pl-11" />
        </div>
        <Select aria-label="Country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="h-11 w-44 rounded-full">
          <option value="all">All countries</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Document type" value={docType} onChange={(e) => setDocType(e.target.value as typeof docType)} className="h-11 w-40 rounded-full">
          <option value="all">All types</option>
          {docTypes.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Source category">
        {(["all", ...Object.keys(sourceCategoryLabels)] as const).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c as SourceCategory | "all")}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${category === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/70 hover:bg-secondary"}`}
          >
            {c === "all" ? "All" : sourceCategoryLabels[c as SourceCategory]}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState onRetry={() => setAttempt((n) => n + 1)} />
      ) : results === null ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={LibraryBig} title="No sources match" description="Try fewer filters or different words." />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground" role="status">
            {results.length} source{results.length === 1 ? "" : "s"}
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {results.map((s) => (
              <li key={s.id}>
                <Link href={`/knowledge/${s.id}`} className="block h-full rounded-3xl">
                  <Card interactive className="flex h-full flex-col gap-3 p-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="brass">{sourceCategoryLabels[s.category]}</Badge>
                      <Badge variant="outline">{s.docType}</Badge>
                    </div>
                    <p className="font-display text-xl leading-snug">{s.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                    <p className="mt-auto pt-2 text-xs text-muted-foreground">
                      {s.authority} · {s.lastVerified ? `Verified ${formatDate(s.lastVerified)}` : "Never verified"}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageContainer>
  );
}
