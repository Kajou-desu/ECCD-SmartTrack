import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Regression tests for NotificationProvider:
//  1. new notifications arriving after first load must appear (was: ignored)
//  2. nothing is requested while logged out (was: 401 from the login screen)
//  3. one user's notifications never show for the next user (was: leaked)
const apiMock = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  dismissNotification: vi.fn(),
  dismissAllNotifications: vi.fn(),
}));
const authState = vi.hoisted(() => ({ value: { isAuthenticated: false, user: null } }));

vi.mock("@api/client.js", () => ({ apiClient: apiMock }));
vi.mock("@hooks/useAuth.js", () => ({ useAuth: () => authState.value }));

const { NotificationProvider } = await import("@context/NotificationContext.jsx");
const { useNotifications } = await import("@hooks/useNotifications.js");

function row(id, message, isRead = false) {
  return { id, title: "Arrival", message, isRead, createdAt: new Date().toISOString() };
}

function Probe() {
  const { notifications, unreadCount } = useNotifications();
  return (
    <div>
      <span data-testid="count">{unreadCount}</span>
      <ul>{notifications.map((n) => <li key={n.id}>{n.message}</li>)}</ul>
    </div>
  );
}

function tree(client) {
  return (
    <QueryClientProvider client={client}>
      <NotificationProvider><Probe /></NotificationProvider>
    </QueryClientProvider>
  );
}

// Only setInterval (which drives react-query's polling) is faked. Faking every
// timer also freezes react-query's own zero-delay update batching.
const tick = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const advancePoll = (ms) => act(async () => { vi.advanceTimersByTime(ms); });

let client;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  vi.clearAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  authState.value = { isAuthenticated: true, user: { id: 1 } };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("NotificationProvider", () => {
  it("shows notifications that arrive on a later poll", async () => {
    apiMock.getNotifications
      .mockResolvedValueOnce([row(1, "Ana arrived at school at 7:40 AM.")])
      .mockResolvedValue([
        row(2, "Ana has departed from school at 11:30 AM."),
        row(1, "Ana arrived at school at 7:40 AM."),
      ]);

    render(tree(client));
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1));

    await advancePoll(30_000);
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("makes no request while logged out", async () => {
    authState.value = { isAuthenticated: false, user: null };
    render(tree(client));
    await tick();
    await advancePoll(60_000);
    await tick();
    expect(apiMock.getNotifications).not.toHaveBeenCalled();
  });

  it("never shows the previous user's notifications to the next user", async () => {
    apiMock.getNotifications.mockImplementation(async () =>
      authState.value.user?.id === 1
        ? [row(1, "Ana arrived (user 1 only).")]
        : [row(9, "Ben submitted work (user 2 only).")],
    );

    const { rerender } = render(tree(client));
    await waitFor(() => expect(screen.getByText(/user 1 only/)).toBeTruthy());

    authState.value = { isAuthenticated: false, user: null }; // logout
    rerender(tree(client));
    await waitFor(() => expect(screen.queryByText(/user 1 only/)).toBeNull());
    expect(client.getQueryData(["notifications", 1])).toBeUndefined();

    authState.value = { isAuthenticated: true, user: { id: 2 } }; // next login
    rerender(tree(client));
    await waitFor(() => expect(screen.getByText(/user 2 only/)).toBeTruthy());
    expect(screen.queryByText(/user 1 only/)).toBeNull();
  });

  it("marks as read optimistically and re-syncs from the server on failure", async () => {
    apiMock.getNotifications.mockResolvedValue([row(1, "Ana arrived.")]);
    apiMock.markNotificationRead.mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    function Marker() {
      const { markAsRead } = useNotifications();
      return <button onClick={() => markAsRead(1)}>mark</button>;
    }
    render(
      <QueryClientProvider client={client}>
        <NotificationProvider><Probe /><Marker /></NotificationProvider>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("count").textContent).toBe("1"));

    await act(async () => { screen.getByText("mark").click(); });
    // Server still says unread -> the failed optimistic edit is rolled back
    // by a re-sync, not left showing "read".
    await waitFor(() => expect(apiMock.getNotifications.mock.calls.length).toBeGreaterThan(1));
    await waitFor(() => expect(screen.getByTestId("count").textContent).toBe("1"));
  });
});
