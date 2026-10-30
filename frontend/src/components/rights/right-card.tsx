import { ScrollText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import type { RightSummary } from "@/types/catalogue";
import { OfficialText } from "./official-text";
import { kindLabels, statusLabels, verificationShort } from "./labels";

/** One individual right. Rendered for every record the catalogue returns; there is no fixed card count. */
export function RightCard({ right }: { right: RightSummary }) {
  return (
    <Link href={`/rights/${encodeURIComponent(right.id)}`} className="block h-full rounded-3xl">
      <Card interactive className="flex h-full flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="brass">{kindLabels[right.kind]}</Badge>
          {right.status !== "in_force" && <Badge variant="warning">{statusLabels[right.status]}</Badge>}
        </div>
        <p className="font-display text-xl leading-snug">{right.title}</p>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground"><OfficialText text={right.excerpt} />
        </p>
        <div className="mt-auto space-y-2 pt-2">
          <p className="flex items-start gap-1.5 font-mono text-xs text-primary">
            <ScrollText className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {right.locators.join(", ")} · {right.documentTitle}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{right.category.name}</span>
            <span aria-hidden>·</span>
            <span>{right.jurisdiction.name}</span>
          </div>
          {right.sample ? <MockDataBadge label="Fictional sample" /> : <Badge variant="outline">{verificationShort[right.verification.status]}</Badge>}
        </div>
      </Card>
    </Link>
  );
}
