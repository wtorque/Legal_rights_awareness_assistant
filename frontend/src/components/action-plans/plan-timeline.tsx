"use client";

import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/input";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { usePlansStore } from "@/stores/plans-store";
import type { ActionPlan, PlanStep } from "@/types/action-plans";

function StepRow({ planId, step, index, last }: { planId: string; step: PlanStep; index: number; last: boolean }) {
  const toggleStep = usePlansStore((s) => s.toggleStep);
  const setNote = usePlansStore((s) => s.setNote);
  const [open, setOpen] = useState(false);
  const [note, setLocalNote] = useState(step.note);

  return (
    <motion.li variants={fadeUp} className="relative flex gap-4 pb-8 last:pb-0">
      {!last && <span aria-hidden className="absolute left-[1.0625rem] top-9 h-[calc(100%-2.25rem)] w-px bg-border" />}
      <button
        type="button"
        role="checkbox"
        aria-checked={step.done}
        aria-label={`Mark step ${index + 1} ${step.done ? "not done" : "done"}`}
        onClick={() => toggleStep(planId, step.id)}
        className={cn(
          "relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-medium transition-colors duration-300",
          step.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50",
        )}
      >
        {step.done ? <Check className="size-4" aria-hidden /> : index + 1}
      </button>

      <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card/70 p-4">
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
          <span className={cn("font-medium transition-colors", step.done && "text-muted-foreground line-through decoration-primary/40")}>{step.title}</span>
          <ChevronDown className={cn("mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")} aria-hidden />
        </button>
        {open && (
          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
            <div className="space-y-1.5">
              <label htmlFor={`note-${step.id}`} className="text-xs font-medium">
                Your notes
              </label>
              <Textarea
                id={`note-${step.id}`}
                rows={2}
                value={note}
                maxLength={500}
                placeholder="Add dates, names or what you did…"
                onChange={(e) => setLocalNote(e.target.value)}
                onBlur={() => note !== step.note && setNote(planId, step.id, note)}
                className="min-h-16 text-sm"
              />
            </div>
          </div>
        )}
        {!open && step.note && <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">Note: {step.note}</p>}
      </div>
    </motion.li>
  );
}

export function PlanTimeline({ plan }: { plan: ActionPlan }) {
  return (
    <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, margin: "0px 0px -10% 0px" }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
      {plan.steps.map((step, i) => (
        <StepRow key={step.id} planId={plan.id} step={step} index={i} last={i === plan.steps.length - 1} />
      ))}
    </motion.ol>
  );
}
