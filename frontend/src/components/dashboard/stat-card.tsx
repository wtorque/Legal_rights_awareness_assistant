"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

/** Counts up once when scrolled into view; renders the final value immediately for reduced motion. */
export function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(value);
      return;
    }
    const controls = animate(0, value, { duration: 1, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <Card variant="tinted" className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p ref={ref} className="mt-2 font-display text-5xl leading-none tabular-nums" aria-label={`${value}`}>
        <span aria-hidden>{shown}</span>
      </p>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}
