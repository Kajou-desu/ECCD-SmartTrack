import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

const api = vi.hoisted(() => ({ getAttendanceSession: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: PickupTrackingBanner } = await import("@features/smartAttendance/components/PickupTrackingBanner.jsx");

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 20)); });
const session = { id: 1, date: "2026-10-12", status: "active" };
const status = ({ active = true, hasSession = true } = {}) => ({
  session: hasSession ? session : null,
  pickupWindow: { active, endsAt: null },
});

function mount(path = "/dashboard") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <PickupTrackingBanner />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => Object.values(api).forEach((f) => f.mockReset()));
afterEach(cleanup);

describe("PickupTrackingBanner", () => {
  it("never asks whether a student is still in the center, even if an old server still sends prompts", async () => {
    api.getAttendanceSession.mockResolvedValue({
      ...status(),
      pickupChecks: [{ id: 9, studentId: 5, name: "Ana Cruz", expiresInMs: 15000 }],
    });
    mount();
    await settle();
    expect(screen.queryByText(/still in the center/)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows nothing when tracking is off", async () => {
    api.getAttendanceSession.mockResolvedValue(status({ active: false }));
    mount();
    await settle();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText(/Pickup tracking is on/)).toBeNull();
  });

  it("tells the teacher to open Live attendance on any other page while tracking is on", async () => {
    api.getAttendanceSession.mockResolvedValue(status());
    mount("/dashboard");
    await settle();
    expect(screen.getByText(/Pickup tracking is on/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /open live attendance/i }).getAttribute("href")).toBe("/attendance/live");
  });

  it("does not nag on the live page itself, or when no session is running", async () => {
    api.getAttendanceSession.mockResolvedValue(status());
    mount("/attendance/live");
    await settle();
    expect(screen.queryByText(/Pickup tracking is on/)).toBeNull();
    cleanup();

    api.getAttendanceSession.mockResolvedValue(status({ hasSession: false }));
    mount("/dashboard");
    await settle();
    expect(screen.queryByText(/Pickup tracking is on/)).toBeNull();
  });
});
