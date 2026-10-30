import { CircleHelp, FileQuestion, ListChecks, TriangleAlert, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClauseFlag } from "@/types/documents";

/** Neutral wording on purpose: these are reading aids, not legal judgments. */
export const flagMeta: Record<ClauseFlag, { label: string; icon: LucideIcon; tone: string; paragraph: string }> = {
  attention: { label: "Requires attention", icon: TriangleAlert, tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300", paragraph: "bg-amber-500/12" },
  ambiguous: { label: "Ambiguous wording", icon: CircleHelp, tone: "bg-sky text-secondary-foreground", paragraph: "bg-primary/10" },
  obligation: { label: "Important obligation", icon: ListChecks, tone: "bg-primary/10 text-primary", paragraph: "bg-brass/12" },
  missing: { label: "Missing information", icon: FileQuestion, tone: "bg-secondary text-secondary-foreground", paragraph: "bg-secondary" },
};

export function FlagBadge({ flag, className }: { flag: ClauseFlag; className?: string }) {
  const meta = flagMeta[flag];
  return (
    <Badge className={cn(meta.tone, className)}>
      <meta.icon aria-hidden />
      {meta.label}
    </Badge>
  );
}
