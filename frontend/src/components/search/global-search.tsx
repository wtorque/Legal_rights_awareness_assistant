"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { Clock, CornerDownLeft, Search, SearchX, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Kbd } from "@/components/ui/kbd";
import { allNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { searchService } from "@/services/search.service";
import { useChatStore } from "@/stores/chat-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useUiStore } from "@/stores/ui-store";
import type { SearchGroup, SearchResult } from "@/types/search";

const groupOrder: SearchGroup[] = ["Pages", "Rights", "Conversations", "Documents", "Legal sources", "Action plans"];

export function GlobalSearch() {
  const router = useRouter();
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const recent = usePreferencesStore((s) => s.recentSearches);
  const addRecent = usePreferencesStore((s) => s.addRecentSearch);
  const clearRecent = usePreferencesStore((s) => s.clearRecentSearches);
  const selectConversation = useChatStore((s) => s.select);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setPending(true);
      searchService.search(q).then(
        (r) => {
          if (cancelled) return;
          setResults(r);
          setFailed(false);
          setPending(false);
        },
        () => {
          if (cancelled) return;
          setFailed(true);
          setPending(false);
        },
      );
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const hasQuery = query.trim() !== "";
  const grouped = useMemo(
    () => groupOrder.map((g) => ({ group: g, items: results.filter((r) => r.group === g) })).filter((g) => g.items.length > 0),
    [results],
  );

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const go = (r: SearchResult) => {
    if (query.trim()) addRecent(query.trim());
    if (r.conversationId) selectConversation(r.conversationId);
    close();
    router.push(r.href);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[85] bg-background/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[12vh] z-[86] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-popover text-popover-foreground shadow-lift outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <DialogPrimitive.Title className="sr-only">Global search</DialogPrimitive.Title>
          <Command shouldFilter={false} label="Search" loop>
            <div className="flex items-center gap-3 border-b border-border px-5">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <Command.Input
                value={query}
                onValueChange={(v) => {
                  setQuery(v);
                  if (!v.trim()) {
                    setResults([]);
                    setPending(false);
                    setFailed(false);
                  }
                }}
                placeholder="Search rights, documents, sources, plans…"
                className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
              />
              <DialogPrimitive.Close aria-label="Close search" className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2" aria-busy={pending}>
              {!hasQuery && (
                <>
                  {recent.length > 0 && (
                    <Command.Group heading={<GroupHeading action={{ label: "Clear", onClick: clearRecent }}>Recent searches</GroupHeading>}>
                      {recent.map((r) => (
                        <Command.Item key={r} value={`recent:${r}`} onSelect={() => setQuery(r)} className={itemClass}>
                          <Clock className="size-4 text-muted-foreground" aria-hidden /> {r}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}
                  <Command.Group heading={<GroupHeading>Go to</GroupHeading>}>
                    {allNavItems.slice(0, 8).map((n) => (
                      <Command.Item
                        key={n.href}
                        value={`nav:${n.href}`}
                        onSelect={() => go({ id: n.href, group: "Pages", title: n.label, subtitle: n.description, href: n.href })}
                        className={itemClass}
                      >
                        <n.icon className="size-4 text-muted-foreground" aria-hidden /> {n.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </>
              )}

              {hasQuery && failed && <p role="alert" className="px-4 py-8 text-center text-sm text-destructive">Search failed. Try again.</p>}

              {hasQuery && !failed && !pending && results.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <SearchX className="size-6 text-muted-foreground" aria-hidden />
                  <p className="text-sm font-medium">No results for “{query.trim()}”</p>
                  <p className="text-sm text-muted-foreground">Try a broader word, like “deposit” or “notice”.</p>
                </div>
              )}

              {hasQuery &&
                grouped.map(({ group, items }) => (
                  <Command.Group key={group} heading={<GroupHeading>{group}</GroupHeading>}>
                    {items.map((r) => (
                      <Command.Item key={r.id} value={r.id} onSelect={() => go(r)} className={itemClass}>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{r.title}</span>
                          <span className="block truncate text-xs capitalize text-muted-foreground">{r.subtitle}</span>
                        </span>
                        <CornerDownLeft className="size-3.5 shrink-0 opacity-0 group-data-[selected=true]:opacity-60" aria-hidden />
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
            </Command.List>

            <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-2">
                <Kbd>Enter</Kbd> open
              </span>
              <span className="flex items-center gap-2">
                <Kbd>Esc</Kbd> close
              </span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const itemClass = cn(
  "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none",
  "data-[selected=true]:bg-secondary",
);

function GroupHeading({ children, action }: { children: React.ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <span className="flex items-center justify-between px-3 pb-1 pt-3 text-eyebrow">
      {children}
      {action && (
        <button type="button" onClick={action.onClick} className="normal-case tracking-normal text-muted-foreground hover:text-foreground">
          {action.label}
        </button>
      )}
    </span>
  );
}
