"use client";

import { Bookmark, FileSearch, History, Route } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelativeTime } from "@/components/shared/relative-time";
import { useChatStore } from "@/stores/chat-store";
import type { ActivityItem } from "@/types/dashboard";
import type { LucideIcon } from "lucide-react";

function Rows({ items, icon: Icon, empty }: { items: ActivityItem[]; icon: LucideIcon; empty: string }) {
  if (items.length === 0) return <EmptyState icon={Icon} title={empty} className="py-10" />;
  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className="group flex items-center gap-4 px-1 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-[1.1rem]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{item.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
            </span>
            <RelativeTime iso={item.at} className="shrink-0 text-xs text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

interface RecentActivityProps {
  documents: ActivityItem[];
  plans: ActivityItem[];
  saved: ActivityItem[];
}

export function RecentActivity({ documents, plans, saved }: RecentActivityProps) {
  const conversations = useChatStore((s) => s.conversations);
  const select = useChatStore((s) => s.select);
  const recent = conversations.slice(0, 5);

  return (
    <Card className="p-5 sm:p-6">
      <Tabs defaultValue="conversations">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-display-md">Recent activity</h2>
          <TabsList aria-label="Activity type">
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="conversations">
          {recent.length === 0 ? (
            <EmptyState icon={History} title="No conversations yet" className="py-10" />
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((c) => (
                <li key={c.id}>
                  <Link href="/assistant" onClick={() => select(c.id)} className="group flex items-center gap-4 px-1 py-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <History className="size-[1.1rem]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.title}</span>
                      <span className="block text-xs text-muted-foreground">{c.messages.length} messages</span>
                    </span>
                    <RelativeTime iso={c.updatedAt} className="shrink-0 text-xs text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="documents">
          <Rows items={documents} icon={FileSearch} empty="No documents analyzed yet" />
        </TabsContent>
        <TabsContent value="saved">
          <Rows items={saved} icon={Bookmark} empty="Nothing saved yet" />
        </TabsContent>
        <TabsContent value="plans">
          <Rows items={plans} icon={Route} empty="No action plans yet" />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
