"use client";

import { ArrowUp, Square } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { getLanguage } from "@/config/languages";
import { formatJurisdiction } from "@/config/jurisdictions";
import { usePreferencesStore } from "@/stores/preferences-store";

const MAX = 2000;

interface ComposerProps {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({ busy, onSend, onStop }: ComposerProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const country = usePreferencesStore((s) => s.country);
  const region = usePreferencesStore((s) => s.region);
  const language = usePreferencesStore((s) => s.responseLanguage);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const submit = () => {
    if (!value.trim() || busy) return;
    onSend(value);
    setValue("");
    requestAnimationFrame(resize);
  };

  return (
    <div className="glass rounded-[1.75rem] p-2.5 shadow-lift">
      <label htmlFor="composer" className="sr-only">
        Describe your legal situation
      </label>
      <textarea
        id="composer"
        ref={ref}
        rows={1}
        value={value}
        maxLength={MAX}
        placeholder="Describe your legal situation…"
        onChange={(e) => {
          setValue(e.target.value);
          resize();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        className="block max-h-52 w-full resize-none bg-transparent px-3 py-2 text-[0.95rem] leading-relaxed outline-none placeholder:text-muted-foreground/80"
      />
      <div className="flex items-center justify-between gap-3 px-1.5 pt-1">
        <p className="truncate text-xs text-muted-foreground">
          {formatJurisdiction(country, region)} · {getLanguage(language).name}
          <span className="hidden sm:inline"> · Enter to send, Shift+Enter for a new line</span>
        </p>
        {busy ? (
          <Hint label="Stop generating">
            <Button size="icon-sm" onClick={onStop} aria-label="Stop generating">
              <Square className="fill-current" />
            </Button>
          </Hint>
        ) : (
          <Button size="icon-sm" onClick={submit} disabled={!value.trim()} aria-label="Send message">
            <ArrowUp />
          </Button>
        )}
      </div>
    </div>
  );
}
