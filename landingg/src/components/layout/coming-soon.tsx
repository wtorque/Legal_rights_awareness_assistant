import { Hammer } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Card, CardContent } from "@/components/ui/card";
import { MockDataBadge } from "@/components/ui/mock-data-badge";

/** Placeholder body for routes whose page is built in a later phase. */
export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Section flush className="pb-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card variant="tinted" className="max-w-2xl">
        <CardContent className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card text-primary">
            <Hammer className="size-5" />
          </span>
          <div className="space-y-2">
            <p className="font-medium">Page not built yet</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The shared shell, theme and navigation are in place. This page ships in a later frontend phase.
            </p>
            <MockDataBadge label="Placeholder" />
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
