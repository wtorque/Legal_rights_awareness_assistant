"use client";

import { motion } from "framer-motion";
import { AlertCircle, CircleCheck, Footprints, Landmark, Lightbulb, ScrollText } from "lucide-react";
import { SourceCard } from "@/components/shared/source-card";
import { fadeUp, stagger } from "@/lib/motion";
import type { StructuredAnswer } from "@/types/legal";

function Section({ icon: Icon, title, children }: { icon: typeof Lightbulb; title: string; children: React.ReactNode }) {
  return (
    <motion.section variants={fadeUp} className="rounded-2xl border border-border bg-card/70 p-5">
      <h3 className="mb-3 flex items-center gap-2 text-eyebrow">
        <Icon className="size-4" aria-hidden />
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

/** The six structured parts of an answer. Sections stagger in once the answer is final. */
export function AnswerSections({ answer }: { answer: StructuredAnswer }) {
  return (
    <motion.div variants={stagger(0.09)} initial="hidden" animate="visible" className="mt-4 grid gap-3">
      {answer.provisions.length > 0 && (
      <Section icon={Landmark} title="Relevant legal provisions">
        <ul className="space-y-3">
          {answer.provisions.map((p) => {
            const source = answer.sources.find((s) => s.id === p.sourceId);
            return (
              <li key={p.id} className="text-sm leading-relaxed">
                <span className="font-medium">{p.title}</span>
                <span className="text-muted-foreground"> — {p.summary}</span>
                {source && <span className="ml-1.5 font-mono text-xs text-primary">[{source.sectionLabel}]</span>}
              </li>
            );
          })}
        </ul>
      </Section>
      )}

      {answer.rights.length > 0 && (
      <Section icon={CircleCheck} title="Potentially applicable rights">
        <ul className="space-y-2.5">
          {answer.rights.map((r) => (
            <li key={r.title} className="text-sm leading-relaxed">
              <span className="font-medium">{r.title}.</span> <span className="text-muted-foreground">{r.detail}</span>
            </li>
          ))}
        </ul>
      </Section>
      )}

      {answer.nextSteps.length > 0 && (
      <Section icon={Footprints} title="Practical next steps">
        <ol className="space-y-3">
          {answer.nextSteps.map((s, i) => (
            <li key={s.title} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs text-primary">{i + 1}</span>
              <span>
                <span className="font-medium">{s.title}.</span> <span className="text-muted-foreground">{s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">Suggestions, not legal requirements.</p>
      </Section>
      )}

      <Section icon={AlertCircle} title="Important limitations">
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-brass">
          {answer.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Section>

      <Section icon={ScrollText} title="Source references">
        {answer.sources.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No verified sources are linked to this answer. Check any legal point against the official text or a legal aid service before relying on it.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {answer.sources.map((s) => (
              <SourceCard key={s.id} source={s} />
            ))}
          </div>
        )}
      </Section>
    </motion.div>
  );
}
