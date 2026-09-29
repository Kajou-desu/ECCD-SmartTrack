import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// NotificationSettings: the Email and SMS switches are real server-side
// preferences (they decide what the backend sends), not local-only state.
const apiMock = vi.hoisted(() => ({
  getNotificationPreferences: vi.fn(),
  updateNotificationPreferences: vi.fn(),
}));
const toastMock = vi.hoisted(() => vi.fn());
const authState = vi.hoisted(() => ({ value: { user: { id: 1 } } }));

vi.mock("@api/client.js", () => ({ apiClient: apiMock }));
vi.mock("@hooks/useAuth.js", () => ({ useAuth: () => authState.value }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toastMock }));

const { default: NotificationSettings } = await import(
  "@features/settings/components/NotificationSettings.jsx"
);

function renderSettings(client) {
  return render(
    <QueryClientProvider client={client}>
      <NotificationSettings />
    </QueryClientProvider>,
  );
}

let client;
beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  authState.value = { user: { id: 1 } };
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("NotificationSettings", () => {
  it("shows the saved email and SMS preferences from the server", async () => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: false });

    renderSettings(client);

    const email = await screen.findByRole("switch", { name: /email notifications/i });
    const sms = screen.getByRole("switch", { name: /sms notifications/i });
    expect(email.checked).toBe(true);
    expect(sms.checked).toBe(false);
  });

  it("saves only the toggled channel", async () => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: true });
    apiMock.updateNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: false });

    renderSettings(client);
    const sms = await screen.findByRole("switch", { name: /sms notifications/i });

    fireEvent.click(sms);

    await waitFor(() => expect(sms.checked).toBe(false)); // optimistic
    expect(apiMock.updateNotificationPreferences).toHaveBeenCalledTimes(1);
    expect(apiMock.updateNotificationPreferences.mock.calls[0][0]).toEqual({ notifyBySms: false });
  });

  it("tells the user and re-syncs from the server when saving fails", async () => {
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: true, notifyBySms: true });
    apiMock.updateNotificationPreferences.mockRejectedValue(new Error("boom"));

    renderSettings(client);
    const email = await screen.findByRole("switch", { name: /email notifications/i });

    fireEvent.click(email);

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith("error", expect.stringMatching(/couldn't save/i)));
    // The server still says "on", so the switch must not be left showing "off".
    await waitFor(() => expect(apiMock.getNotificationPreferences.mock.calls.length).toBeGreaterThan(1));
    await waitFor(() => expect(email.checked).toBe(true));
  });

  it("offers a retry instead of guessing when the preferences can't be loaded", async () => {
    apiMock.getNotificationPreferences.mockRejectedValueOnce(new Error("down"));
    apiMock.getNotificationPreferences.mockResolvedValue({ notifyByEmail: false, notifyBySms: true });

    renderSettings(client);

    // No switches are shown with made-up values while the load has failed.
    fireEvent.click(await screen.findByRole("button", { name: /try again/i }));

    const email = await screen.findByRole("switch", { name: /email notifications/i });
    expect(email.checked).toBe(false);
  });

  it("does not request anything without a signed-in user", async () => {
    authState.value = { user: null };

    renderSettings(client);
    await new Promise((r) => setTimeout(r, 0));

    expect(apiMock.getNotificationPreferences).not.toHaveBeenCalled();
  });
});
