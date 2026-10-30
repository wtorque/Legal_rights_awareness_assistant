"use client";

import { ArrowUp, Languages, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { countries, getCountry } from "@/config/jurisdictions";
import { languages } from "@/config/languages";
import { suggestedQuestions } from "@/mocks/dashboard";
import { useChatStore } from "@/stores/chat-store";
import { usePreferencesStore } from "@/stores/preferences-store";

export function AskAiPanel() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const send = useChatStore((s) => s.send);
  const select = useChatStore((s) => s.select);
  const { country, region, responseLanguage, set, setCountry } = usePreferencesStore();
  const current = getCountry(country);

  const submit = (text: string) => {
    if (!text.trim()) return;
    // A fresh conversation per dashboard question; the assistant page shows the stream.
    select(null);
    router.push("/assistant");
    void send(text);
  };

  return (
    <Card variant="glass" className="p-5 sm:p-7">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
      >
        <label htmlFor="dash-question" className="sr-only">
          Describe your legal situation
        </label>
        <textarea
          id="dash-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit(question);
            }
          }}
          rows={3}
          maxLength={2000}
          placeholder="Describe your legal situation..."
          className="block w-full resize-none bg-transparent font-display text-2xl leading-snug outline-none placeholder:text-muted-foreground/60 sm:text-3xl"
        />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Languages className="size-4 text-muted-foreground" aria-hidden />
            <Select
              aria-label="Response language"
              value={responseLanguage}
              onChange={(e) => set({ responseLanguage: e.target.value })}
              className="h-10 rounded-full"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" aria-hidden />
            <Select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="h-10 rounded-full">
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              aria-label={current.regionLabel}
              value={region ?? ""}
              onChange={(e) => set({ region: e.target.value || null })}
              className="h-10 rounded-full"
            >
              <option value="">{current.regionLabel}: any</option>
              {current.regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={!question.trim()} className="ml-auto">
            Ask <ArrowUp />
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-3 text-eyebrow">Try asking</p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => submit(q)}
              className="rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
