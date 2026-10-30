"use client";

import { MessageSquarePlus, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/use-now";
import { groupByDate } from "@/lib/group-by-date";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import type { Conversation } from "@/types/chat";

interface ConversationListProps {
  onSelect?: () => void;
}

export function ConversationList({ onSelect }: ConversationListProps) {
  const { conversations, status, activeId, select, startNew, rename, remove, load } = useChatStore();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [deleting, setDeleting] = useState<Conversation | null>(null);

  const now = useNow();
  const groups = useMemo(() => {
    if (!now) return [];
    const q = query.trim().toLowerCase();
    const filtered = q ? conversations.filter((c) => c.title.toLowerCase().includes(q)) : conversations;
    return groupByDate(filtered, (c) => c.updatedAt, now);
  }, [conversations, query, now]);

  const commitRename = async () => {
    if (editingId && draft.trim()) {
      await rename(editingId, draft);
      toast.success("Conversation renamed");
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 p-4">
        <Button
          className="w-full"
          onClick={async () => {
            await startNew();
            onSelect?.();
          }}
        >
          <MessageSquarePlus /> New conversation
        </Button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-10 rounded-full pl-10"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {status === "loading" || status === "idle" ? (
          <div className="space-y-2 px-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-11 rounded-2xl" />
            ))}
          </div>
        ) : status === "error" ? (
          <ErrorState message="Couldn't load conversations." onRetry={() => void load()} className="m-2 py-8" />
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Search}
            title={query ? "No matches" : "No conversations yet"}
            description={query ? "Try different words." : "Start a new conversation to ask your first question."}
            className="m-2 py-10"
          />
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mb-3">
              <h2 className="px-3 pb-1 pt-2 text-eyebrow">{group.label}</h2>
              <ul>
                {group.items.map((c) => (
                  <ContextMenu key={c.id}>
                    <ContextMenuTrigger asChild>
                      <li className="group relative">
                        {editingId === c.id ? (
                          <form
                            className="px-1 py-0.5"
                            onSubmit={(e) => {
                              e.preventDefault();
                              void commitRename();
                            }}
                          >
                            <Input
                              autoFocus
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onBlur={() => void commitRename()}
                              onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                              aria-label="Conversation name"
                              className="h-10 rounded-xl"
                            />
                          </form>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                select(c.id);
                                onSelect?.();
                              }}
                              aria-current={activeId === c.id ? "true" : undefined}
                              className={cn(
                                "block w-full truncate rounded-2xl px-3 py-2.5 pr-10 text-left text-sm transition-colors",
                                activeId === c.id ? "bg-secondary font-medium text-foreground" : "text-foreground/75 hover:bg-secondary/60",
                              )}
                            >
                              {c.title}
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label={`Options for ${c.title}`}
                                className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-card focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 max-lg:opacity-100"
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setDraft(c.title);
                                    setEditingId(c.id);
                                  }}
                                >
                                  <Pencil /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setDeleting(c)} className="text-destructive [&_svg]:text-destructive">
                                  <Trash2 /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </li>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-44">
                      <ContextMenuItem
                        onSelect={() => {
                          setDraft(c.title);
                          setEditingId(c.id);
                        }}
                      >
                        <Pencil /> Rename
                      </ContextMenuItem>
                      <ContextMenuItem onSelect={() => setDeleting(c)} className="text-destructive [&_svg]:text-destructive">
                        <Trash2 /> Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this conversation?"
        description={deleting ? `“${deleting.title}” will be removed from this device. This can't be undone.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleting) void remove(deleting.id).then(() => toast.success("Conversation deleted"));
        }}
      />
    </div>
  );
}
