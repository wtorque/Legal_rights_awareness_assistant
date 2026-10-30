"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePlansStore } from "@/stores/plans-store";
import type { ActionPlan } from "@/types/action-plans";

export function PlanChecklist({ plan }: { plan: ActionPlan }) {
  const { toggleItem, addItem, removeItem } = usePlansStore();
  const [text, setText] = useState("");
  const done = plan.checklist.filter((i) => i.done).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={plan.checklist.length} aria-label="Documents gathered">
          <div className="h-full origin-left rounded-full bg-primary transition-transform duration-500" style={{ transform: `scaleX(${plan.checklist.length ? done / plan.checklist.length : 0})` }} />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {done}/{plan.checklist.length}
        </span>
      </div>

      <ul className="space-y-1.5">
        {plan.checklist.map((item) => (
          <li key={item.id} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary/50">
            <input
              id={`chk-${item.id}`}
              type="checkbox"
              checked={item.done}
              onChange={() => toggleItem(plan.id, item.id)}
              className="size-4 shrink-0 accent-[var(--primary)]"
            />
            <label htmlFor={`chk-${item.id}`} className={cn("flex-1 cursor-pointer text-sm", item.done && "text-muted-foreground line-through")}>
              {item.text}
            </label>
            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${item.text}`} onClick={() => removeItem(plan.id, item.id)} className="opacity-0 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100">
              <X />
            </Button>
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addItem(plan.id, text);
          setText("");
        }}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add your own item" aria-label="Add checklist item" maxLength={120} className="h-10 rounded-full" />
        <Button type="submit" variant="secondary" disabled={!text.trim()}>
          <Plus /> Add
        </Button>
      </form>
    </div>
  );
}
