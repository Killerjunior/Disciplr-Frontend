import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Notification from "../Notification";
import { useNotification } from "@/Zustand/Store";
import { getNotifications } from "@/components/Notification/exampleNotification/example";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

const initialNotifications = getNotifications();

function resetStore() {
  useNotification.setState({
    notification: initialNotifications,
    unreadCount: initialNotifications.filter((n) => !n.isRead).length,
  });
}

function renderNotification() {
  return render(
    <MemoryRouter>
      <Notification />
    </MemoryRouter>,
  );
}

describe("Notification page", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders the first page of notifications", () => {
    renderNotification();
    const items = screen.getAllByText(/\.\.\./);
    expect(items.length).toBeLessThanOrEqual(5);
  });

  it("displays pagination info", () => {
    renderNotification();
    const totalPages = Math.ceil(initialNotifications.length / 5);
    expect(
      screen.getByText(`Page 1 of ${totalPages}`),
    ).toBeInTheDocument();
  });

  it("navigates to the next page", () => {
    renderNotification();
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);
    const totalPages = Math.ceil(initialNotifications.length / 5);
    expect(
      screen.getByText(`Page 2 of ${totalPages}`),
    ).toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    renderNotification();
    const prevButton = screen.getByText("Previous");
    expect(prevButton).toBeDisabled();
  });

  it("filters by unread via the read filter dropdown", () => {
    renderNotification();

    const filterButton = screen.getByText("Filter");
    fireEvent.click(filterButton);

    const readSelect = document.querySelector(
      'select[name="filter_by_read"]',
    ) as HTMLSelectElement;
    fireEvent.change(readSelect, { target: { value: "0" } });

    const unreadCount = initialNotifications.filter((n) => !n.isRead).length;
    const expectedItems = Math.min(unreadCount, 5);
    const items = screen.getAllByText(/\.\.\./);
    expect(items.length).toBe(expectedItems);
  });

  it("shows empty state when no notifications match filter", () => {
    useNotification.setState({
      notification: initialNotifications.map((n) => ({
        ...n,
        isRead: true,
      })),
      unreadCount: 0,
    });
    renderNotification();

    const filterButton = screen.getByText("Filter");
    fireEvent.click(filterButton);

    const readSelect = document.querySelector(
      'select[name="filter_by_read"]',
    ) as HTMLSelectElement;
    fireEvent.change(readSelect, { target: { value: "0" } });

    expect(screen.getByText("No notifications found.")).toBeInTheDocument();
  });

  it("marks a notification as read via the store", () => {
    const unreadNotification = initialNotifications.find((n) => !n.isRead)!;

    useNotification.getState().markRead(unreadNotification.id);

    const state = useNotification.getState();
    const updated = state.notification.find(
      (n) => n.id === unreadNotification.id,
    );
    expect(updated!.isRead).toBe(true);
  });

  it("resets to page 1 when filter changes", () => {
    renderNotification();

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);
    const totalPages = Math.ceil(initialNotifications.length / 5);
    expect(
      screen.getByText(`Page 2 of ${totalPages}`),
    ).toBeInTheDocument();

    const filterButton = screen.getByText("Filter");
    fireEvent.click(filterButton);

    const readSelect = document.querySelector(
      'select[name="filter_by_read"]',
    ) as HTMLSelectElement;
    fireEvent.change(readSelect, { target: { value: "0" } });

    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
  });
});
