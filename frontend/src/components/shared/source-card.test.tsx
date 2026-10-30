import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { sampleSources } from "@/mocks/legal-sources";
import { SourceCard } from "./source-card";

describe("SourceCard", () => {
  it("labels sample sources as not verified and has no official link", () => {
    render(<SourceCard source={sampleSources[0]} />);
    expect(screen.getByText("Sample data · not verified")).toBeInTheDocument();
    expect(screen.getByText("No official link (sample)")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows a verified badge and official link only for verified sources", () => {
    render(<SourceCard source={{ ...sampleSources[0], origin: "verified", verifiedAt: "2026-10-31", url: "https://example.org/act" }} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Official text/ })).toHaveAttribute("rel", "noopener noreferrer");
  });
});
