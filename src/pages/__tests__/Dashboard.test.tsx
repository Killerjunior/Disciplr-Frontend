import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../Dashboard";
import * as dashboardUtils from "../../utils/dashboard";

describe("Dashboard page", () => {
  test("renders successfully with default mock data", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    // Verify header title
    expect(
      screen.getByRole("heading", { level: 1, name: /Dashboard/i }),
    ).toBeInTheDocument();

    // Verify cards and sections
    expect(screen.getByText(/Total Locked/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Active Vaults/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pending Milestones/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Recent Activity/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Upcoming Deadlines/i }),
    ).toBeInTheDocument();
  });

  test("renders empty state for vaults when vaults array is empty", () => {
    render(
      <MemoryRouter>
        <Dashboard vaults={[]} />
      </MemoryRouter>,
    );

    // Verify empty state message
    expect(screen.getByText(/No vaults yet/i)).toBeInTheDocument();
  });

  test("memoization stability: does not recompute view models when props do not change", () => {
    const summarySpy = vi.spyOn(dashboardUtils, "formatSummary");
    const activitySpy = vi.spyOn(dashboardUtils, "processActivity");

    const testSummary = {
      totalLocked: 20000,
      activeVaults: 2,
      pendingMilestones: 1,
      completionRate: 80,
    };
    const testDeadlines = [
      {
        id: "1",
        name: "Vault 1",
        deadline: "2026-07-01T12:00:00Z",
        amount: 5000,
      },
    ];
    const testActivity = [
      {
        id: "a1",
        type: "created" as const,
        vault: "Vault 1",
        timestamp: "2026-06-25T12:00:00Z",
      },
    ];

    const { rerender } = render(
      <MemoryRouter>
        <Dashboard
          summary={testSummary}
          deadlines={testDeadlines}
          activity={testActivity}
        />
      </MemoryRouter>,
    );

    // Initial render should call processing helpers exactly once
    expect(summarySpy).toHaveBeenCalledTimes(1);
    expect(activitySpy).toHaveBeenCalledTimes(1);

    // Re-render with identical prop references (or same values for mock)
    rerender(
      <MemoryRouter>
        <Dashboard
          summary={testSummary}
          deadlines={testDeadlines}
          activity={testActivity}
        />
      </MemoryRouter>,
    );

    // Spies should still be called only once (memoized)
    expect(summarySpy).toHaveBeenCalledTimes(1);
    expect(activitySpy).toHaveBeenCalledTimes(1);

    // Now re-render with fresh references of the same data structure but new references
    // Since React useMemo dependency checks are shallow reference comparison, this should trigger re-evaluation
    rerender(
      <MemoryRouter>
        <Dashboard
          summary={{ ...testSummary }}
          deadlines={[...testDeadlines]}
          activity={[...testActivity]}
        />
      </MemoryRouter>,
    );

    expect(summarySpy).toHaveBeenCalledTimes(2);
    expect(activitySpy).toHaveBeenCalledTimes(2);

    summarySpy.mockRestore();
    activitySpy.mockRestore();
  });
});
