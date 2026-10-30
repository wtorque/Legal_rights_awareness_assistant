"use client";

import { MessageSquarePlus, MessagesSquare, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatJurisdiction } from "@/config/jurisdictions";
import { RelativeTime } from "@/components/shared/relative-time";
import { useNow } from "@/hooks/use-now";
import { groupByDate } from "@/lib/group-by-date";
import { useChatStore } from "@/stores/chat-store";
import type { Conversation } from "@/types/chat";

export function ConversationsView() {
  const router = useRouter();
  const { conversations, status, load, select, startNew, rename, remove } = useChatStore();
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");
  const [deleting, setDeleting] = useState<Conversation | null>(null);

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  const now = useNow();
  const groups = useMemo(() => {
    if (!now) return [];
    const q = query.trim().toLowerCase();
    const list = q
      ? conversations.filter((c) => c.title.toLowerCase().includes(q) || c.messages.some((m) => m.role === "user" && m.content.toLowerCase().includes(q)))
      : conversations;
    return groupByDate(list, (c) => c.updatedAt, now);
  }, [conversations, query, now]);

  return (
    <PageContainer>
      <PageHeader
        title="Conversations"
        description="Everything you've asked, grouped by date. Stored in this browser only."
        actions={
          <Button
            onClick={async () => {
              await startNew();
              router.push("/assistant");
            }}
          >
            <MessageSquarePlus /> New conversation
          </Button>
        }
      />

      <div className="relative mb-8 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles and questions"
          aria-label="Search conversations"
          className="rounded-full pl-11"
        />
      </div>

      {status === "idle" || status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : status === "error" ? (
        <ErrorState message="Couldn't load your conversations." onRetry={() => void load()} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title={query ? "No matching conversations" : "No conversations yet"}
          description={query ? "Try different words." : "Ask your first question to get started."}
          action={
            !query && (
              <Button asChild>
                <Link href="/assistant">Ask a question</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="mb-3 text-eyebrow">{group.label}</h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {group.items.map((c) => {
                  const firstQuestion = c.messages.find((m) => m.role === "user");
                  return (
                    <li key={c.id}>
                      <Card interactive className="flex h-full flex-col p-5">
                        <Link
                          href="/assistant"
                          onClick={() => select(c.id)}
                          className="block flex-1 rounded-xl"
                        >
                          <p className="font-medium">{c.title}</p>
                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {firstQuestion?.role === "user" ? firstQuestion.content : "No messages yet"}
                          </p>
                        </Link>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            <RelativeTime iso={c.updatedAt} /> · {c.messages.length} messages · {formatJurisdiction(c.countryCode, c.regionCode)}
                          </p>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm" aria-label={`Rename ${c.title}`} onClick={() => { setDraft(c.title); setRenaming(c); }}>
                              <Pencil />
                            </Button>
                            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${c.title}`} onClick={() => setDeleting(c)}>
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Dialog open={!!renaming} onOpenChange={(open) => !open && setRenaming(null)}>
        <DialogContent className="max-w-md">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (renaming && draft.trim()) {
                await rename(renaming.id, draft);
                toast.success("Conversation renamed");
              }
              setRenaming(null);
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename conversation</DialogTitle>
            </DialogHeader>
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Conversation name" maxLength={80} autoFocus />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenaming(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!draft.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this conversation?"
        description={deleting ? `“${deleting.title}” will be removed from this device. This can't be undone.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleting && void remove(deleting.id).then(() => toast.success("Conversation deleted"))}
      />
    </PageContainer>
  );
}
