"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, PanelLeft, Scale } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { suggestedQuestions } from "@/mocks/dashboard";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { ChatHeader } from "./chat-header";
import { Composer } from "./composer";
import { ConversationList } from "./conversation-list";
import { AssistantBubble, UserBubble } from "./message-bubble";

function Welcome({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-12 text-center sm:py-20">
      <span className="grid size-14 place-items-center rounded-3xl bg-primary/10 text-primary">
        <Scale className="size-6" aria-hidden />
      </span>
      <h2 className="mt-6 text-display-lg">What&apos;s your situation?</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Describe it in your own words. Answers in this prototype are labelled sample content.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-secondary"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AssistantWorkspace() {
  const { conversations, status, activeId, busy, load, send, stop } = useChatStore();
  const [listOpen, setListOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);

  const scrollToEnd = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Follow the stream only while the user hasn't scrolled away from the bottom.
  const tail = active?.messages.at(-1);
  const tailSignal = tail?.role === "assistant" ? `${tail.streamingText.length}-${tail.status}` : tail?.id;
  useEffect(() => {
    if (pinned) scrollToEnd(false);
  }, [tailSignal, active?.id, pinned, scrollToEnd]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 120);
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)]">
      <aside className="hidden w-80 shrink-0 border-r border-border bg-card/30 lg:block" aria-label="Conversations">
        <ConversationList />
      </aside>

      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="h-[80dvh] max-w-sm p-0" hideClose>
          <DialogTitle className="sr-only">Conversations</DialogTitle>
          <ConversationList onSelect={() => setListOpen(false)} />
        </DialogContent>
      </Dialog>

      <section className="relative flex min-w-0 flex-1 flex-col" aria-label="Conversation">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="ml-2 lg:hidden" onClick={() => setListOpen(true)} aria-label="Open conversations">
            <PanelLeft />
          </Button>
          <div className="min-w-0 flex-1">
            <ChatHeader conversation={active} />
          </div>
        </div>

        <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
          <div className="mx-auto max-w-3xl space-y-8 px-4 pb-48 pt-6 sm:px-6">
            {status === "loading" || status === "idle" ? (
              <div className="space-y-4">
                <Skeleton className="ml-auto h-12 w-2/3" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : !active || active.messages.length === 0 ? (
              <Welcome onPick={(q) => void send(q)} />
            ) : (
              <AnimatePresence initial={false}>
                {active.messages.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    {m.role === "user" ? (
                      <UserBubble message={m} />
                    ) : (
                      <AssistantBubble message={m} isLast={i === active.messages.length - 1} onFollowUp={(q) => void send(q)} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-4 pt-10 sm:px-6">
          <div className="pointer-events-auto mx-auto max-w-3xl">
            {!pinned && (
              <Button variant="glass" size="icon-sm" onClick={() => scrollToEnd()} aria-label="Scroll to latest" className={cn("mx-auto mb-3 flex")}>
                <ArrowDown />
              </Button>
            )}
            <Composer busy={busy} onSend={(t) => void send(t)} onStop={stop} />
            <p className="mt-2 text-center text-[0.7rem] leading-relaxed text-muted-foreground">{siteConfig.disclaimer}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
