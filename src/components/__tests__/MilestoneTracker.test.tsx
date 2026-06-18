import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Milestone,
  MilestoneTracker,
} from "../../components/MilestoneTracker";

const milestones: Milestone[] = [
  {
    id: "m1",
    title: "Phase 1 Complete",
    description: "Complete initial development phase",
    criteria: "All unit tests passing, code reviewed",
    status: "validated",
    validatedAt: "2024-02-20T14:30:00Z",
    evidenceUrl: "https://github.com/org/repo/pull/42",
  },
  {
    id: "m2",
    title: "Beta Launch",
    description: "Launch beta version to 100 users",
    criteria: "Beta deployed, 100 active users onboarded",
    status: "pending",
  },
  {
    id: "m3",
    title: "Production Audit",
    description: "Security audit before production release",
    criteria: "Critical findings resolved",
    status: "failed",
  },
];

describe("MilestoneTracker", () => {
  it("renders milestone titles, criteria, and status badges in order", () => {
    render(<MilestoneTracker milestones={milestones} />);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);
    expect(screen.getByText("Phase 1 Complete")).toBeInTheDocument();
    expect(
      screen.getByText(/All unit tests passing, code reviewed/),
    ).toBeInTheDocument();
    expect(screen.getByText("Validated")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("marks the first pending milestone as the current step", () => {
    render(<MilestoneTracker milestones={milestones} />);

    const currentStep = screen.getByText("Beta Launch").closest("li");
    const validatedStep = screen.getByText("Phase 1 Complete").closest("li");

    expect(currentStep).toHaveAttribute("aria-current", "step");
    expect(validatedStep).not.toHaveAttribute("aria-current");
  });

  it("renders evidence links and formatted validation timestamps", () => {
    render(<MilestoneTracker milestones={milestones} />);

    expect(screen.getByText(/Validated Feb 20, 2024/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View evidence" })).toHaveAttribute(
      "href",
      "https://github.com/org/repo/pull/42",
    );
  });

  it("handles a single pending milestone", () => {
    render(<MilestoneTracker milestones={[milestones[1]]} />);

    const currentStep = screen.getByText("Beta Launch").closest("li");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(currentStep).toHaveAttribute("aria-current", "step");
  });

  it("handles an empty milestone list", () => {
    render(<MilestoneTracker milestones={[]} />);

    expect(
      screen.getByText("No milestones have been defined for this vault."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
