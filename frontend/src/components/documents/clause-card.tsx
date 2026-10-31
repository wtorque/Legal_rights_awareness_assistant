"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SourceCard } from "@/components/shared/source-card";
import { Badge } from "@/components/ui/badge";
import { getSampleSource } from "@/mocks/legal-sources";
import { cn } from "@/lib/utils";
import type { Clause } from "@/types/documents";
import { FlagBadge } from "./flag-badge";

function excerpt(text: string) {
  return text.length > 240 ? `${text.slice(0, 240).trimEnd()}…` : text;
}

const importanceDots = { high: 3, medium: 2, low: 1 } as const;

function Importance({ level }: { level: Clause["importance"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" title={`${level} importance`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn("size-1.5 rounded-full", i <= importanceDots[level] ? "bg-brass" : "bg-border")} />
        ))}
      </span>
      <span className="capitalize">{level}</span>
    </span>
  );
}

interface ClauseCardProps {
  clause: Clause;
  active: boolean;
  onSelect: () => void;
}

export function ClauseCard({ clause, active, onSelect }: ClauseCardProps) {
  const [open, setOpen] = useState(false);
  const source = clause.sourceId ? getSampleSource(clause.sourceId) : null;

  return (
    <article
      id={`clause-${clause.id}`}
      className={cn(
        "rounded-2xl border bg-card/70 p-4 transition-colors",
        active ? "border-primary/50 ring-2 ring-primary/15" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-medium">{clause.title}</h4>
        <Badge variant="outline">{clause.category}</Badge>
        {clause.flag && <FlagBadge flag={clause.flag} />}
        <span className="ml-auto">
          <Importance level={clause.importance} />
        </span>
      </div>
      {clause.simplified ? (
        <p className="mt-3 text-sm leading-relaxed">{clause.simplified}</p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed">{excerpt(clause.originalText)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Original wording. No plain-language explanation has been generated for this clause.</p>
        </>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Original text
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        <button type="button" onClick={onSelect} className="text-xs font-medium text-primary hover:underline">
          Show on page {clause.page}
        </button>
      </div>

      {open && (
        <blockquote className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm italic leading-relaxed text-foreground/80">
          {clause.originalText}
        </blockquote>
      )}
      {source && open && <SourceCard source={source} className="mt-3" />}
      {!source && open && <p className="mt-3 text-xs text-muted-foreground">No official source is linked to this clause.</p>}
    </article>
  );
}
