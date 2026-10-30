import { create } from "zustand";
import { uid } from "@/lib/mock-storage";
import { actionPlansService } from "@/services/action-plans.service";
import type { ActionPlan, NewPlanInput, PlanStatus } from "@/types/action-plans";

type Status = "idle" | "loading" | "ready" | "error";

interface PlansState {
  plans: ActionPlan[];
  status: Status;
  load: () => Promise<void>;
  create: (input: NewPlanInput) => Promise<ActionPlan>;
  remove: (id: string) => Promise<void>;
  toggleStep: (planId: string, stepId: string) => void;
  setNote: (planId: string, stepId: string, note: string) => void;
  toggleItem: (planId: string, itemId: string) => void;
  addItem: (planId: string, text: string) => void;
  removeItem: (planId: string, itemId: string) => void;
}

export function planProgress(plan: ActionPlan) {
  const done = plan.steps.filter((s) => s.done).length;
  return { done, total: plan.steps.length, fraction: plan.steps.length ? done / plan.steps.length : 0 };
}

export function planStatus(plan: ActionPlan): PlanStatus {
  return plan.steps.length > 0 && plan.steps.every((s) => s.done) ? "completed" : "active";
}

export const usePlansStore = create<PlansState>((set, get) => {
  /** Optimistic edit: apply locally, then persist through the service. */
  const edit = (planId: string, fn: (p: ActionPlan) => ActionPlan) => {
    const current = get().plans.find((p) => p.id === planId);
    if (!current) return;
    const next = { ...fn(current), updatedAt: new Date().toISOString() };
    set((s) => ({ plans: s.plans.map((p) => (p.id === planId ? next : p)) }));
    void actionPlansService.update(next);
  };

  return {
    plans: [],
    status: "idle",

    load: async () => {
      if (get().status === "loading") return;
      set({ status: "loading" });
      try {
        set({ plans: await actionPlansService.list(), status: "ready" });
      } catch {
        set({ status: "error" });
      }
    },

    create: async (input) => {
      const plan = await actionPlansService.create(input);
      set((s) => ({ plans: [plan, ...s.plans] }));
      return plan;
    },

    remove: async (id) => {
      set((s) => ({ plans: s.plans.filter((p) => p.id !== id) }));
      await actionPlansService.remove(id);
    },

    toggleStep: (planId, stepId) => edit(planId, (p) => ({ ...p, steps: p.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) })),
    setNote: (planId, stepId, note) => edit(planId, (p) => ({ ...p, steps: p.steps.map((s) => (s.id === stepId ? { ...s, note } : s)) })),
    toggleItem: (planId, itemId) => edit(planId, (p) => ({ ...p, checklist: p.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) })),
    addItem: (planId, text) => {
      const trimmed = text.trim();
      if (trimmed) edit(planId, (p) => ({ ...p, checklist: [...p.checklist, { id: uid("d"), text: trimmed, done: false, custom: true }] }));
    },
    removeItem: (planId, itemId) => edit(planId, (p) => ({ ...p, checklist: p.checklist.filter((i) => i.id !== itemId) })),
  };
});
