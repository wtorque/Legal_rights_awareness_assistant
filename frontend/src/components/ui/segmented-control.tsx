"use client";

import { cn } from "@/lib/utils";

interface Option<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  hint?: string;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  label: string;
  className?: string;
}

/** Radiogroup styled as pills. Arrow keys move selection (native radio behaviour). */
export function SegmentedControl<T extends string | number>({ value, onChange, options, label, className }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex max-w-full flex-wrap gap-1 rounded-full bg-secondary/70 p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label
            key={String(o.value)}
            className={cn(
              "relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
              active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <input type="radio" name={label} value={String(o.value)} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
            {o.icon}
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
