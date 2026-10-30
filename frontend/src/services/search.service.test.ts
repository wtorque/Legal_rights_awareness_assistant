import { describe, expect, it } from "vitest";
import { searchService } from "./search.service";

describe("search service", () => {
  it("returns nothing for an empty query", async () => {
    expect(await searchService.search("   ")).toEqual([]);
  });

  it("finds results across modules, grouped by kind", async () => {
    const results = await searchService.search("deposit");
    const groups = new Set(results.map((r) => r.group));
    expect(groups.has("Rights")).toBe(true);
    expect(groups.has("Action plans")).toBe(true);
  });

  it("matches documents by name", async () => {
    const results = await searchService.search("rental");
    expect(results.some((r) => r.group === "Documents" && r.href === "/documents/doc-rental")).toBe(true);
  });

  it("returns nothing for gibberish", async () => {
    expect(await searchService.search("qqqqzzzz")).toEqual([]);
  });
});
