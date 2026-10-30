"use client";

import { Bookmark, X } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { RelativeTime } from "@/components/shared/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useSavedStore } from "@/stores/saved-store";

export function SavedView() {
  const items = useSavedStore((s) => s.items);
  const remove = useSavedStore((s) => s.remove);

  return (
    <PageContainer>
      <PageHeader title="Saved resources" description="Topics, sources, plans and services you bookmarked. Stored in this browser only." />
      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Use Save on a rights topic, source, action plan or legal aid listing."
          action={
            <Button asChild>
              <Link href="/rights">Explore rights</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <li key={i.key}>
              <Card interactive className="flex h-full flex-col p-5">
                <Link href={i.href} className="flex-1 rounded-xl">
                  <Badge variant="brass" className="capitalize">
                    {i.kind.replace("-", " ")}
                  </Badge>
                  <p className="mt-3 font-display text-xl leading-snug">{i.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{i.subtitle}</p>
                </Link>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Saved <RelativeTime iso={i.savedAt} />
                  </span>
                  <Button variant="ghost" size="icon-sm" aria-label={`Remove ${i.title} from saved`} onClick={() => remove(i.key)}>
                    <X />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
