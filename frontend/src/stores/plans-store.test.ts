import { beforeEach, describe, expect, it } from "vitest";
import { samplePlans } from "@/mocks/action-plans";
import { planProgress, planStatus, usePlansStore } from "./plans-store";

const plan = () => structuredClone(samplePlans[0]);

describe("plan progress", () => {
  it("counts completed steps", () => {
    expect(planProgress(plan())).toMatchObject({ done: 2, total: 5 });
  });

  it("is completed only when every step is done", () => {
    const p = plan();
    expect(planStatus(p)).toBe("active");
    p.steps.forEach((s) => (s.done = true));
    expect(planStatus(p)).toBe("completed");
  });
});

describe("plans store", () => {
  beforeEach(async () => {
    usePlansStore.setState({ plans: [plan()], status: "ready" });
  });

  it("toggles a step and stamps updatedAt", () => {
    const before = usePlansStore.getState().plans[0].updatedAt;
    usePlansStore.getState().toggleStep("plan-deposit", "s3");
    const p = usePlansStore.getState().plans[0];
    expect(p.steps.find((s) => s.id === "s3")?.done).toBe(true);
    expect(p.updatedAt >= before).toBe(true);
  });

  it("adds a trimmed custom checklist item, ignores blank ones, and removes items", () => {
    const { addItem, removeItem } = usePlansStore.getState();
    const start = usePlansStore.getState().plans[0].checklist.length;
    addItem("plan-deposit", "   ");
    expect(usePlansStore.getState().plans[0].checklist).toHaveLength(start);
    addItem("plan-deposit", "  Bank statement  ");
    const added = usePlansStore.getState().plans[0].checklist.at(-1)!;
    expect(added).toMatchObject({ text: "Bank statement", custom: true, done: false });
    removeItem("plan-deposit", added.id);
    expect(usePlansStore.getState().plans[0].checklist).toHaveLength(start);
  });
});
