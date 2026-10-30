"use client";

import { ChevronLeft, ChevronRight, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Clause, DocumentContent } from "@/types/documents";
import { flagMeta } from "./flag-badge";

const ZOOMS = [75, 90, 100, 115, 130, 150];

interface DocumentViewerProps {
  content: DocumentContent;
  clauses: Clause[] | null;
  activeClauseId: string | null;
  onSelectClause: (id: string | null) => void;
  /** Page requested from outside (e.g. "Show on page 2"). */
  requestedPage: number | null;
}

function countMatches(text: string, query: string) {
  return query ? text.toLowerCase().split(query.toLowerCase()).length - 1 : 0;
}

function Highlighted({ text, query, start, matchRef }: { text: string; query: string; start: number; matchRef: (el: HTMLElement | null, index: number) => void }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let found = lower.indexOf(q);
  let n = 0;
  while (found !== -1) {
    nodes.push(<Fragment key={`t${found}`}>{text.slice(cursor, found)}</Fragment>);
    const idx = start + n++;
    nodes.push(
      <mark key={`m${found}`} ref={(el) => matchRef(el, idx)} className="rounded bg-brass/35 px-0.5 text-inherit">
        {text.slice(found, found + q.length)}
      </mark>,
    );
    cursor = found + q.length;
    found = lower.indexOf(q, cursor);
  }
  nodes.push(<Fragment key="end">{text.slice(cursor)}</Fragment>);
  return <>{nodes}</>;
}

export function DocumentViewer({ content, clauses, activeClauseId, onSelectClause, requestedPage }: DocumentViewerProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const matches = useRef<Map<number, HTMLElement>>(new Map());
  const total = content.pages.length;
  const page = content.pages[pageNumber - 1];

  const clauseById = useMemo(() => new Map((clauses ?? []).map((c) => [c.id, c])), [clauses]);

  // Syncing to an externally requested page is an intentional prop → state mirror.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (requestedPage) setPageNumber(Math.min(Math.max(requestedPage, 1), total));
  }, [requestedPage, total]);

  const matchCountByPage = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as number[];
    return content.pages.map((p) => p.paragraphs.reduce((sum, para) => sum + (para.text.toLowerCase().split(q).length - 1), 0));
  }, [content, query]);
  const totalMatches = matchCountByPage.reduce((a, b) => a + b, 0);

  // Jump to the page of the current match, then scroll the match into view.
  const goToMatch = (index: number) => {
    if (totalMatches === 0) return;
    const wrapped = (index + totalMatches) % totalMatches;
    setMatchIndex(wrapped);
    let remaining = wrapped;
    for (let p = 0; p < matchCountByPage.length; p++) {
      if (remaining < matchCountByPage[p]) {
        setPageNumber(p + 1);
        return;
      }
      remaining -= matchCountByPage[p];
    }
  };

  useEffect(() => {
    const before = matchCountByPage.slice(0, pageNumber - 1).reduce((a, b) => a + b, 0);
    const local = matchIndex - before;
    matches.current.get(local)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [matchIndex, pageNumber, matchCountByPage]);

  const trimmed = query.trim();
  const starts = page.paragraphs.reduce<number[]>((acc, p, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + countMatches(page.paragraphs[i - 1].text, trimmed));
    return acc;
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="flex items-center gap-1">
          <Hint label="Previous page">
            <Button variant="ghost" size="icon-sm" onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber === 1} aria-label="Previous page">
              <ChevronLeft />
            </Button>
          </Hint>
          <span className="min-w-20 text-center text-sm tabular-nums" aria-live="polite">
            Page {pageNumber} / {total}
          </span>
          <Hint label="Next page">
            <Button variant="ghost" size="icon-sm" onClick={() => setPageNumber((p) => Math.min(total, p + 1))} disabled={pageNumber === total} aria-label="Next page">
              <ChevronRight />
            </Button>
          </Hint>
        </div>

        <div className="flex items-center gap-1">
          <Hint label="Zoom out">
            <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => ZOOMS[Math.max(0, ZOOMS.indexOf(z) - 1)])} disabled={zoom === ZOOMS[0]} aria-label="Zoom out">
              <ZoomOut />
            </Button>
          </Hint>
          <button type="button" onClick={() => setZoom(100)} className="min-w-12 rounded-full px-2 py-1 text-center text-xs tabular-nums hover:bg-secondary" aria-label="Reset zoom">
            {zoom}%
          </button>
          <Hint label="Zoom in">
            <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(z) + 1)])} disabled={zoom === ZOOMS.at(-1)} aria-label="Zoom in">
              <ZoomIn />
            </Button>
          </Hint>
        </div>

        <form
          className="relative ml-auto flex min-w-48 flex-1 items-center gap-1 sm:max-w-xs"
          onSubmit={(e) => {
            e.preventDefault();
            goToMatch(matchIndex + 1);
          }}
          role="search"
        >
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setMatchIndex(0);
            }}
            placeholder="Search in document"
            aria-label="Search in document"
            className="h-9 rounded-full pl-10 pr-20 text-sm"
          />
          {query && (
            <span className="absolute right-2 flex items-center gap-0.5">
              <span className="px-1 text-xs tabular-nums text-muted-foreground">{totalMatches === 0 ? "0" : `${matchIndex + 1}/${totalMatches}`}</span>
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-6 place-items-center rounded-full hover:bg-secondary">
                <X className="size-3.5" />
              </button>
            </span>
          )}
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-secondary/40 p-4 sm:p-6">
        <article
          aria-label={`Page ${pageNumber}`}
          style={{ fontSize: `${zoom}%` }}
          className="mx-auto max-w-2xl space-y-4 rounded-xl bg-card p-6 font-serif leading-relaxed shadow-soft sm:p-10"
        >
          {page.paragraphs.map((p, index) => {
            const clause = p.clauseId ? clauseById.get(p.clauseId) : undefined;
            const active = !!p.clauseId && p.clauseId === activeClauseId;
            const start = starts[index];
            const body = (
              <Highlighted
                text={p.text}
                query={trimmed}
                start={start}
                matchRef={(el, i) => {
                  if (el) matches.current.set(i, el);
                  else matches.current.delete(i);
                }}
              />
            );
            return clause ? (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectClause(active ? null : clause.id)}
                aria-pressed={active}
                aria-label={`${clause.title}: ${clause.flag ? flagMeta[clause.flag].label : "no flag"}`}
                className={cn(
                  "block w-full rounded-lg px-3 py-2 text-left text-[0.95em] transition-[background-color,box-shadow]",
                  clause.flag ? flagMeta[clause.flag].paragraph : "hover:bg-secondary/60",
                  active && "ring-2 ring-primary",
                )}
              >
                {body}
              </button>
            ) : (
              <p key={p.id} className="px-3 text-[0.95em]">
                {body}
              </p>
            );
          })}
        </article>
      </div>
    </div>
  );
}
