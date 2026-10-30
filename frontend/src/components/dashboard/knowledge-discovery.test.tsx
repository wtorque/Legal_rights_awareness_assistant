import type { HTMLAttributes, PropsWithChildren } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { KnowledgeDiscovery } from "./knowledge-discovery";

vi.mock("@/components/motion/reveal", () => {
  const Passthrough = ({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  );
  return { RevealGroup: Passthrough, RevealItem: Passthrough };
});

const topics = [
  {
    slug: "security-deposits",
    title: "Security deposits",
    category: "housing" as const,
    summary: "A sample topic about rental deposits.",
  },
  {
    slug: "termination-notice",
    title: "Termination and notice",
    category: "employment" as const,
    summary: "A sample topic about work.",
  },
];

const learning = [
  {
    id: "sample-guide",
    title: "A sample learning guide",
    kind: "Guide" as const,
    minutes: 6,
    description: "Sample guidance for this test.",
  },
];

describe("KnowledgeDiscovery", () => {
  it("filters topics by category and restores the full list", async () => {
    const user = userEvent.setup();
    render(<KnowledgeDiscovery topics={topics} learning={learning} />);

    expect(screen.getByRole("link", { name: /Security deposits/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Termination and notice/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Housing" }));
    expect(screen.getByRole("button", { name: "Housing" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: /Security deposits/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Termination and notice/ })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1 housing topic.");

    await user.click(screen.getByRole("button", { name: "All topics" }));
    expect(screen.getByRole("link", { name: /Termination and notice/ })).toBeInTheDocument();
  });

  it("supports keyboard category selection", async () => {
    const user = userEvent.setup();
    render(<KnowledgeDiscovery topics={topics} learning={learning} />);

    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Housing" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.queryByRole("link", { name: /Termination and notice/ })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1 housing topic.");
  });

  it("opens a recommended learning resource with its sample content", async () => {
    const user = userEvent.setup();
    render(<KnowledgeDiscovery topics={topics} learning={learning} />);

    await user.click(screen.getByText("A sample learning guide"));
    expect(screen.getByText("Sample guidance for this test.")).toBeVisible();
  });
});
