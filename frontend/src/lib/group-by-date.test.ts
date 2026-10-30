import { describe, expect, it } from "vitest";
import { groupByDate } from "./group-by-date";

const now = new Date("2026-10-31T12:00:00");
const at = (iso: string) => ({ at: iso });

describe("groupByDate", () => {
  it("buckets items and drops empty groups, preserving order", () => {
    const groups = groupByDate(
      [at("2026-10-31T09:00:00"), at("2026-10-30T09:00:00"), at("2026-10-27T09:00:00"), at("2026-10-10T09:00:00"), at("2026-01-01T09:00:00")],
      (i) => i.at,
      now,
    );
    expect(groups.map((g) => g.label)).toEqual(["Today", "Yesterday", "Previous 7 days", "Previous 30 days", "Older"]);
    expect(groups.every((g) => g.items.length === 1)).toBe(true);
  });

  it("omits groups with no items", () => {
    const groups = groupByDate([at("2026-10-31T01:00:00")], (i) => i.at, now);
    expect(groups.map((g) => g.label)).toEqual(["Today"]);
  });
});
