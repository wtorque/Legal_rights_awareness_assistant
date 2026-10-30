import { ExternalLink, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { cn } from "@/lib/utils";
import type { SourceReference } from "@/types/legal";

interface SourceCardProps {
  source: SourceReference;
  className?: string;
}

/** First-class source UI: every claim in an answer links back to one of these. */
export function SourceCard({ source, className }: SourceCardProps) {
  const verified = source.origin === "verified";
  return (
    <article className={cn("rounded-2xl border border-border bg-card/70 p-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <ScrollText className="size-4 text-primary" aria-hidden />
        <p className="text-sm font-medium">{source.documentTitle}</p>
      </div>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{source.sectionLabel}</p>
      <blockquote className="mt-3 border-l-2 border-brass/60 pl-3 text-sm italic leading-relaxed text-foreground/80">
        {source.quote}
      </blockquote>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {verified ? <Badge variant="brand">Verified</Badge> : <MockDataBadge />}
        <span className="text-xs text-muted-foreground">{source.authority}</span>
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Official text <ExternalLink className="size-3" aria-hidden />
          </a>
        ) : (
          <span className="ml-auto text-xs text-muted-foreground">No official link (sample)</span>
        )}
      </div>
    </article>
  );
}
