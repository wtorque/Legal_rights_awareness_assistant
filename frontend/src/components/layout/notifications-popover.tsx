"use client";

import { Bell, BellOff, FileSearch, Info, Route } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RelativeTime } from "@/components/shared/relative-time";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notification-store";
import type { Notification } from "@/types/common";

const kindIcon: Record<Notification["kind"], typeof Info> = {
  info: Info,
  document: FileSearch,
  plan: Route,
  system: Info,
};

export function NotificationsPopover() {
  const { items, readIds, markRead, markAllRead, clear } = useNotificationStore();
  const unread = items.filter((n) => !readIds.includes(n.id)).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} className="relative">
          <Bell className="size-[1.15rem]" />
          {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-brass ring-2 ring-background" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[22rem] max-w-[calc(100vw-2rem)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-medium">Notifications</p>
          <div className="flex gap-1">
            <Button variant="link" size="sm" className="h-auto px-1 text-xs" disabled={unread === 0} onClick={markAllRead}>
              Mark all read
            </Button>
            <Button variant="link" size="sm" className="h-auto px-1 text-xs" disabled={items.length === 0} onClick={clear}>
              Clear
            </Button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <EmptyState icon={BellOff} title="You're all caught up" description="New updates will appear here." className="m-3 border-0 py-10" />
          ) : (
            <ul>
              {items.map((n) => {
                const Icon = kindIcon[n.kind];
                const isUnread = !readIds.includes(n.id);
                const body = (
                  <div className={cn("flex gap-3 px-5 py-4 transition-colors hover:bg-secondary/60", isUnread && "bg-secondary/30")}>
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {n.title}
                        {isUnread && <span className="size-1.5 rounded-full bg-brass" aria-label="Unread" />}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                      <RelativeTime iso={n.createdAt} className="block text-[0.7rem] text-muted-foreground/80" />
                    </div>
                  </div>
                );
                return (
                  <li key={n.id} className="border-b border-border last:border-0">
                    {n.href ? (
                      <Link href={n.href} onClick={() => markRead(n.id)}>
                        {body}
                      </Link>
                    ) : (
                      <button type="button" className="block w-full text-left" onClick={() => markRead(n.id)}>
                        {body}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
