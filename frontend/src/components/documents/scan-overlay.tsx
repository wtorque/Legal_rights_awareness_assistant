"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useRef } from "react";
import { useGsap } from "@/hooks/use-gsap";
import { gsap } from "@/lib/gsap";

const steps = ["Reading pages", "Finding clauses", "Writing plain-language notes", "Matching to sample sources"];

/** Sweeping scan line + stepwise checklist while an analysis is pending (GSAP timeline). */
export function ScanOverlay() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    gsap.fromTo(".scan-line", { yPercent: 0 }, { yPercent: 2400, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.set(steps.map((_, i) => `.scan-step-${i}`), { opacity: 0, x: -8 });
    gsap.set(steps.map((_, i) => `.scan-check-${i}`), { scale: 0.5 });
    const tl = gsap.timeline();
    steps.forEach((_, i) => {
      tl.to(`.scan-step-${i}`, { opacity: 1, x: 0, duration: 0.35 }, i * 0.6);
      tl.to(`.scan-check-${i}`, { opacity: 1, scale: 1, duration: 0.25 }, i * 0.6 + 0.5);
      tl.to(`.scan-spin-${i}`, { opacity: 0, duration: 0.15 }, i * 0.6 + 0.5);
    });
  }, []);

  return (
    <div ref={root} className="absolute inset-0 z-10 overflow-hidden rounded-3xl bg-background/70 backdrop-blur-[2px]" role="status" aria-live="polite">
      <div className="scan-line absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_24px_4px] shadow-primary/40" />
      <div className="absolute inset-0 grid place-items-center p-6">
        <ul className="space-y-3 rounded-3xl border border-border bg-card/95 p-6 shadow-lift">
          <li className="mb-1 text-eyebrow">Analyzing document</li>
          {steps.map((s, i) => (
            <li key={s} className={`scan-step-${i} flex items-center gap-3 text-sm`}>
              <span className="relative grid size-5 place-items-center">
                <LoaderCircle className={`scan-spin-${i} absolute size-4 animate-spin text-primary`} aria-hidden />
                <Check className={`scan-check-${i} size-4 text-primary opacity-0`} aria-hidden />
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
