"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { catalogueService } from "@/services/catalogue.service";
import type { FacetName, RightSummary, RightsPage, RightsQuery } from "@/types/catalogue";
import { CoveragePanel } from "./coverage-panel";
import { facetLabel, facetTitles } from "./labels";
import { RightCard } from "./right-card";

const PAGE_SIZE = 24;
const FACET_ORDER: FacetName[] = ["categories", "kinds", "jurisdictions", "verification", "status"];
const FACET_PARAM: Record<FacetName, keyof RightsQuery> = {
  domains: "domain", categories: "category", kinds: "kind", jurisdictions: "jurisdiction", verification: "verification", status: "status",
};

export function RightsExplorer() {
  const [text, setText] = useState("");
  const [filters, setFilters] = useState<Partial<Record<keyof RightsQuery, string>>>({});
  const [page, setPage] = useState<RightsPage | null>(null);
  const [items, setItems] = useState<RightSummary[]>([]);
  const [error, setError] = useState(false);
  const [more, setMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const query = (offset = 0): RightsQuery => ({ text, ...filters, limit: PAGE_SIZE, offset }) as RightsQuery;

  // First page whenever the search or a filter changes (debounced).
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      catalogueService.searchRights({ text, ...filters, limit: PAGE_SIZE, offset: 0 } as RightsQuery).then(
        (r) => {
          if (cancelled) return;
          setPage(r);
          setItems(r.items);
          setError(false);
        },
        () => !cancelled && setError(true),
      );
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [text, filters, attempt]);

  const loadMore = async () => {
    if (!page || page.nextOffset === null || more) return;
    setMore(true);
    try {
      const next = await catalogueService.searchRights(query(page.nextOffset));
      setPage(next);
      setItems((prev) => [...prev, ...next.items]);
    } catch {
      setError(true);
    } finally {
      setMore(false);
    }
  };

  const setFilter = (facet: FacetName, id: string) =>
    setFilters((f) => {
      const key = FACET_PARAM[facet];
      const next = { ...f };
      if (next[key] === id) delete next[key];
      else next[key] = id;
      return next;
    });
  const activeCount = Object.keys(filters).length;

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Rights explorer"
        title="Rights catalogue"
        description="Individual rights, each with its own page, its exact official wording, where it comes from and how it can be enforced."
      />
      <CoveragePanel />

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside aria-label="Filters" className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search rights and wording" aria-label="Search rights" className="rounded-full pl-11" />
          </div>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
              <X /> Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
            </Button>
          )}
          {page &&
            FACET_ORDER.filter((f) => page.facets[f].length > 0).map((facet) => (
              <fieldset key={facet} className="space-y-1.5">
                <legend className="mb-2 text-eyebrow">{facetTitles[facet]}</legend>
                {page.facets[facet].map((o) => {
                  const active = filters[FACET_PARAM[facet]] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(facet, o.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        active ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                      )}
                    >
                      <span>{facetLabel(facet, o.id, o.label)}</span>
                      <span className={cn("text-xs tabular-nums", active ? "text-primary-foreground/80" : "text-muted-foreground")}>{o.count}</span>
                    </button>
                  );
                })}
              </fieldset>
            ))}
        </aside>

        <section aria-labelledby="results">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="results" className="text-display-md">
              {text || activeCount ? "Results" : "All rights"}
            </h2>
            <p className="text-sm text-muted-foreground" role="status">
              {page ? `Showing ${items.length} of ${page.total}` : "Loading…"}
            </p>
          </div>

          {error ? (
            <ErrorState message="Couldn't load the catalogue." onRetry={() => { setError(false); setAttempt((n) => n + 1); }} />
          ) : page === null ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-52 rounded-3xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={Search} title="No rights match" description="Try fewer filters or different words. Absence here does not mean no such right exists: coverage is incomplete." />
          ) : (
            <>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((r) => (
                  <li key={r.id}>
                    <RightCard right={r} />
                  </li>
                ))}
              </ul>
              {page.nextOffset !== null && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => void loadMore()} disabled={more}>
                    {more ? "Loading…" : `Load more (${page.total - items.length} left)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
