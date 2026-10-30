"use client";

import { motion } from "framer-motion";
import { transitions } from "@/lib/motion";

/** Circular progress; animates pathLength (a transform-friendly property). */
export function ProgressRing({ fraction, size = 56, label }: { fraction: number; size?: number; label: string }) {
  const r = 22;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg viewBox="0 0 56 56" className="size-full -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="5" className="stroke-secondary" />
        <motion.circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: fraction }}
          transition={transitions.slow}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-medium tabular-nums">{Math.round(fraction * 100)}%</span>
    </div>
  );
}
