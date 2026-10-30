"use client";

import { Copy, RefreshCw, ThumbsDown, ThumbsUp, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { isLiveBackend } from "@/lib/api-config";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Hint } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { getLanguage } from "@/config/languages";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import type { AssistantMessage, UserMessage } from "@/types/chat";
import type { StructuredAnswer } from "@/types/legal";
import { AnswerSections } from "./answer-sections";
import { TypingIndicator } from "./typing-indicator";

const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

function answerToText(a: StructuredAnswer): string {
  return [
    a.simpleExplanation,
    "",
    "Relevant provisions:",
    ...a.provisions.map((p) => `- ${p.title}: ${p.summary}`),
    "",
    "Next steps:",
    ...a.nextSteps.map((s, i) => `${i + 1}. ${s.title}: ${s.detail}`),
    "",
    `(${siteConfig.disclaimer} Sample content.)`,
  ].join("\n");
}

function AiBadge() {
  return (
    <Badge variant="warning" className="font-mono tracking-wide">
      <Sparkles aria-hidden />
      AI-generated · not verified
    </Badge>
  );
}

/** The hosted model can take up to a minute before the first words. Say so instead of looking stuck. */
function SlowHint() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!isLiveBackend) return;
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, []);
  return slow ? <p className="text-xs text-muted-foreground">Still working. The AI model can take up to a minute to start answering.</p> : null;
}

export function UserBubble({ message }: { message: UserMessage }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-primary px-5 py-3 text-sm leading-relaxed text-primary-foreground sm:max-w-[70%]">
        {message.content}
      </div>
      <time dateTime={message.createdAt} className="px-2 text-[0.7rem] text-muted-foreground">
        {timeFormat.format(new Date(message.createdAt))}
      </time>
    </div>
  );
}

interface AssistantBubbleProps {
  message: AssistantMessage;
  isLast: boolean;
  onFollowUp: (question: string) => void;
}

export function AssistantBubble({ message, isLast, onFollowUp }: AssistantBubbleProps) {
  const regenerate = useChatStore((s) => s.regenerate);
  const setFeedback = useChatStore((s) => s.setFeedback);
  const busy = useChatStore((s) => s.busy);
  const { answer, streamingText, status } = message;
  const text = answer?.simpleExplanation ?? streamingText;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(answer ? answerToText(answer) : text);
      toast.success("Answer copied");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access");
    }
  };

  return (
    <div className="flex gap-3">
      <span className="mt-1 hidden shrink-0 sm:block">
        <LogoMark className="size-8" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Aequa</span>
          {answer ? (
            answer.origin === "ai-unverified" ? <AiBadge /> : <MockDataBadge label="Sample answer · not verified" />
          ) : isLiveBackend ? (
            <AiBadge />
          ) : (
            <MockDataBadge label="Sample answer · not verified" />
          )}
          {answer?.languageFallback && (
            <span className="text-xs text-muted-foreground">Sample not available in the selected language; showing English.</span>
          )}
        </div>

        {status === "error" ? (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div>
              <p className="font-medium">The answer couldn&apos;t be completed.</p>
              {message.error && <p className="text-muted-foreground">{message.error}</p>}
              {isLast && <p className="text-muted-foreground">Use “Regenerate” to try again.</p>}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl rounded-tl-lg border border-border bg-card p-5 shadow-soft" aria-live="polite" aria-busy={status === "streaming"}>
            {!text && status === "streaming" ? (
              <>
                <TypingIndicator />
                <SlowHint />
              </>
            ) : (
              <p lang={answer?.language ?? undefined} className="text-[0.95rem] leading-relaxed">
                {text}
                {status === "streaming" && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-primary" aria-hidden />}
              </p>
            )}
            {!answer && status === "complete" && <p className="mt-2 text-xs text-muted-foreground">Stopped before the full answer was ready.</p>}
          </div>
        )}

        {answer && <AnswerSections answer={answer} />}

        {answer && (
          <div className="mt-4 flex flex-wrap gap-2">
            {answer.followUps.map((q) => (
              <button
                key={q}
                type="button"
                disabled={busy}
                onClick={() => onFollowUp(q)}
                className="rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs transition-colors hover:border-primary/40 hover:bg-secondary disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {status !== "streaming" && (
          <div className="mt-3 flex items-center gap-1">
            <time dateTime={message.createdAt} className="mr-2 text-[0.7rem] text-muted-foreground">
              {timeFormat.format(new Date(message.createdAt))}
              {answer && ` · ${getLanguage(answer.language).name}`}
            </time>
            <Hint label="Copy answer">
              <Button variant="ghost" size="icon-sm" onClick={copy} aria-label="Copy answer">
                <Copy />
              </Button>
            </Hint>
            {isLast && (
              <Hint label="Regenerate">
                <Button variant="ghost" size="icon-sm" disabled={busy} onClick={() => void regenerate()} aria-label="Regenerate answer">
                  <RefreshCw />
                </Button>
              </Hint>
            )}
            {answer && (["up", "down"] as const).map((kind) => (
              <Hint key={kind} label={kind === "up" ? "Helpful" : "Not helpful"}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={message.feedback === kind}
                  aria-label={kind === "up" ? "Mark helpful" : "Mark not helpful"}
                  className={cn(message.feedback === kind && "bg-secondary text-primary")}
                  onClick={() => {
                    const next = message.feedback === kind ? null : kind;
                    void setFeedback(message.id, next);
                    if (next) toast.success("Thanks — feedback saved on this device only");
                  }}
                >
                  {kind === "up" ? <ThumbsUp /> : <ThumbsDown />}
                </Button>
              </Hint>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
