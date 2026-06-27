import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import UpcomingDeadlines from "../UpcomingDeadlines";
import type { Deadline } from "../../utils/dashboard";

const fixedNow = new Date("2026-06-18T12:00:00Z");

const deadlines: Deadline[] = [
  {
    id: "safe",
    name: "Safe Vault",
    deadline: "2026-06-28T12:00:00Z",
    amount: 9000,
  },
  {
    id: "expired",
    name: "Expired Vault",
    deadline: "2026-06-18T11:00:00Z",
    amount: 1200,
  },
  {
    id: "soon",
    name: "Soon Vault",
    deadline: "2026-06-21T12:00:00Z",
    amount: 3500,
  },
  {
    id: "critical",
    name: "Critical Vault",
    deadline: "2026-06-18T18:00:00Z",
    amount: 800,
  },
];

describe("UpcomingDeadlines", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sorts deadlines by remaining time ascending including expired first", () => {
    render(<UpcomingDeadlines deadlines={deadlines} />);

    const items = screen.getAllByTestId(/upcoming-deadline-/);
    expect(items).toHaveLength(4);
    expect(within(items[0]).getByText("Expired Vault")).toBeInTheDocument();
    expect(within(items[1]).getByText("Critical Vault")).toBeInTheDocument();
    expect(within(items[2]).getByText("Soon Vault")).toBeInTheDocument();
    expect(within(items[3]).getByText("Safe Vault")).toBeInTheDocument();
  });

  it("uses urgency token colors for critical, soon, safe, and expired rows", () => {
    render(<UpcomingDeadlines deadlines={deadlines} />);

    expect(screen.getByTestId("upcoming-deadline-critical")).toHaveAttribute(
      "style",
      expect.stringContaining("border-left: 3px solid var(--danger);"),
    );
    expect(screen.getByTestId("upcoming-deadline-soon")).toHaveAttribute(
      "style",
      expect.stringContaining("border-left: 3px solid var(--warning);"),
    );
    expect(screen.getByTestId("upcoming-deadline-safe")).toHaveAttribute(
      "style",
      expect.stringContaining("border-left: 3px solid var(--success);"),
    );
    expect(screen.getByTestId("upcoming-deadline-expired")).toHaveAttribute(
      "style",
      expect.stringContaining("border-left: 3px solid var(--danger);"),
    );
  });

  it("renders CountdownDeadline output for each row", () => {
    render(<UpcomingDeadlines deadlines={deadlines} />);

    expect(screen.getByLabelText(/Deadline .* Expired/)).toBeInTheDocument();
    expect(screen.getByText("6h 0m remaining")).toBeInTheDocument();
    expect(screen.getByText("3d 0h remaining")).toBeInTheDocument();
    expect(screen.getByText("10d 0h remaining")).toBeInTheDocument();
  });

  it("renders invalid deadlines last with a neutral label", () => {
    render(
      <UpcomingDeadlines
        deadlines={[
          ...deadlines,
          {
            id: "invalid",
            name: "Invalid Vault",
            deadline: "not-a-date",
            amount: 100,
          },
        ]}
      />,
    );

    const items = screen.getAllByTestId(/upcoming-deadline-/);
    expect(
      within(items[items.length - 1]).getByText("Invalid Vault"),
    ).toBeInTheDocument();
    expect(
      within(items[items.length - 1]).getByText("Invalid"),
    ).toBeInTheDocument();
    expect(
      within(items[items.length - 1]).getByText("Invalid deadline"),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no deadlines", () => {
    render(<UpcomingDeadlines deadlines={[]} />);

    expect(screen.getByText("No upcoming deadlines.")).toBeInTheDocument();
  });
});
