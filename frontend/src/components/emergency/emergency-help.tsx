import { ExternalLink, Phone, ShieldAlert } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { emergencyService } from "@/services/emergency.service";
import type { EmergencyCategory } from "@/types/emergency";

const groups: { category: EmergencyCategory; title: string }[] = [
  { category: "emergency", title: "In danger now" },
  { category: "women", title: "Women" },
  { category: "child", title: "Children" },
  { category: "cyber", title: "Cyber crime" },
  { category: "legal-aid", title: "Free legal aid" },
];

export function EmergencyHelp() {
  const contacts = emergencyService.list();
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Emergency help"
        title="Emergency contacts"
        description="Official helplines in India. If someone is in immediate danger, call 112 first."
        meta={<Badge variant="neutral">Checked against official pages on 2026-10-31</Badge>}
      />
      <div role="note" className="mb-8 flex gap-3 rounded-2xl border border-brass/40 bg-brass/10 p-4 text-sm leading-relaxed">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
        <p>
          Numbers can change and some work differently by State. Each card says where it was checked. On a phone, the call button opens your dialler; nothing is sent to Aequa.
        </p>
      </div>
      <div className="space-y-10">
        {groups.map(({ category, title }) => {
          const items = contacts.filter((c) => c.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} aria-labelledby={`emg-${category}`}>
              <h2 id={`emg-${category}`} className="text-display-md mb-4">
                {title}
              </h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {items.map((c) => (
                  <li key={c.id}>
                    <Card className="flex h-full flex-col p-5">
                      <h3 className="font-medium">{c.name}</h3>
                      <p className="mt-1 font-display text-4xl tabular-nums">{c.number}</p>
                      <p className="mt-3 text-sm leading-relaxed">{c.description}</p>
                      {c.note && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.note}</p>}
                      <p className="mt-3 text-xs text-muted-foreground">
                        Checked {formatDate(c.verification.checkedOn)}: {c.verification.source}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        <Button asChild>
                          <a href={`tel:${c.number}`} aria-label={`Call ${c.name} on ${c.number}`}>
                            <Phone /> Call {c.number}
                          </a>
                        </Button>
                        <Button asChild variant="outline">
                          <a href={c.officialUrl} target="_blank" rel="noopener noreferrer">
                            Official site <ExternalLink />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PageContainer>
  );
}
