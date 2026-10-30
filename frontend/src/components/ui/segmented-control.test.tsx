import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented-control";

describe("SegmentedControl", () => {
  it("exposes a radiogroup and reports changes", async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Theme"
        value="light"
        onChange={onChange}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    await userEvent.click(screen.getByText("Dark"));
    expect(onChange).toHaveBeenCalledWith("dark");
  });
});
