import type { ActionPlan, NewPlanInput } from "@/types/action-plans";
import { mockActionPlansService } from "./mock/action-plans.mock";

export interface ActionPlansService {
  list(): Promise<ActionPlan[]>;
  get(id: string): Promise<ActionPlan | null>;
  create(input: NewPlanInput): Promise<ActionPlan>;
  /** Replaces the stored plan (progress, notes, checklist). */
  update(plan: ActionPlan): Promise<void>;
  remove(id: string): Promise<void>;
}

export const actionPlansService: ActionPlansService = mockActionPlansService;
