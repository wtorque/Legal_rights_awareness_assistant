import { describe, expect, it } from "vitest";
import { diffWords } from "./text-diff";

describe("diffWords", () => {
  it("marks unchanged text as same", () => {
    expect(diffWords("a b c", "a b c")).toEqual([{ text: "a b c", kind: "same" }]);
  });

  it("detects a replaced word", () => {
    const parts = diffWords("notice of fifteen days", "notice of thirty days");
    expect(parts.filter((p) => p.kind === "removed").map((p) => p.text.trim())).toEqual(["fifteen"]);
    expect(parts.filter((p) => p.kind === "added").map((p) => p.text.trim())).toEqual(["thirty"]);
  });

  it("reconstructs both sides from the parts", () => {
    const before = "the deposit is returned after the tenant vacates";
    const after = "the deposit is returned within sixty days after the tenant vacates";
    const parts = diffWords(before, after);
    expect(parts.filter((p) => p.kind !== "added").map((p) => p.text).join("")).toBe(before);
    expect(parts.filter((p) => p.kind !== "removed").map((p) => p.text).join("")).toBe(after);
  });
});
