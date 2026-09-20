import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import QuickActions, { type QuickActionItem } from "./QuickActions";

const actions: QuickActionItem[] = [
  { id: "generate", label: "Generate post", intent: "primary" },
  { id: "analyze", label: "Analyze a post", intent: "secondary" },
  { id: "ideas", label: "Find ideas", intent: "secondary" },
];

describe("QuickActions", () => {
  it("keeps the primary action visible and exposes secondary actions in the compact menu", () => {
    render(<QuickActions actions={actions} />);

    expect(screen.getByRole("button", { name: "Generate post" })).toBeInTheDocument();
    expect(screen.getByText("More actions")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Analyze a post" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Find ideas" }).length).toBeGreaterThan(0);
  });

  it("dispatches the selected action", () => {
    const onAction = vi.fn();
    render(<QuickActions actions={actions} onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "Generate post" }));
    expect(onAction).toHaveBeenCalledWith(actions[0]);

    fireEvent.click(screen.getAllByRole("button", { name: "Find ideas" }).at(-1)!);
    expect(onAction).toHaveBeenCalledWith(actions[2]);
  });
});
