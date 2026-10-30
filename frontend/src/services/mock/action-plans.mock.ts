import { delay, readJson, uid, writeJson } from "@/lib/mock-storage";
import { buildPlanFromTemplate, samplePlans } from "@/mocks/action-plans";
import type { ActionPlan } from "@/types/action-plans";
import type { ActionPlansService } from "../action-plans.service";

const KEY = "aequa-mock-plans";
let cache: ActionPlan[] | null = null;

function db() {
  cache ??= readJson<ActionPlan[]>(KEY, samplePlans);
  return cache;
}
function save(next: ActionPlan[]) {
  cache = next;
  writeJson(KEY, next);
}

export const mockActionPlansService: ActionPlansService = {
  async list() {
    await delay(350);
    return [...db()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async get(id) {
    await delay(200);
    return db().find((p) => p.id === id) ?? null;
  },
  async create(input) {
    await delay(300);
    const plan = buildPlanFromTemplate(input, uid("plan"), new Date().toISOString());
    save([plan, ...db()]);
    return plan;
  },
  async update(plan) {
    save(db().map((p) => (p.id === plan.id ? plan : p)));
  },
  async remove(id) {
    save(db().filter((p) => p.id !== id));
  },
};
