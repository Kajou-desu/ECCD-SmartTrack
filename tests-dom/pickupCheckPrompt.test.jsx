import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

const api = vi.hoisted(() => ({ getAttendanceSession: vi.fn(), answerPickupCheck: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: PickupCheckPrompt } = await import("@features/smartAttendance/components/PickupCheckPrompt.jsx");

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 20)); });
const session = { id: 1, date: "2026-10-12", status: "active" };
const check = (over = {}) => ({ id: 9, studentId: 5, name: "Ana Cruz", expiresInMs: 15000, ...over });
const status = ({ checks = [], active = true, hasSession = true } = {}) => ({
  session: hasSession ? session : null,
  pickupChecks: checks,
  pickupWindow: { active, endsAt: null },
});

function mount(path = "/dashboard") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <PickupCheckPrompt />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => Object.values(api).forEach((f) => f.mockReset()));
afterEach(cleanup);

describe("PickupCheckPrompt", () => {
  it("asks whether the student is still in the center, with the time left", async () => {
    api.getAttendanceSession.mockResolvedValue(status({ checks: [check()] }));
    mount();
    await settle();
    expect(screen.getByText("Is Ana Cruz still in the center?")).toBeTruthy();
    expect(screen.getByText(/Closes in 1\d s/)).toBeTruthy();
  });

  it("'Yes, still here' sends stillHere=true and closes the prompt", async () => {
    api.getAttendanceSession.mockResolvedValue(status({ checks: [check()] }));
    api.answerPickupCheck.mockResolvedValue({ ok: true });
    mount();
    await settle();
    fireEvent.click(screen.getByRole("button", { name: /yes, still here/i }));
    await settle();
    expect(api.answerPickupCheck).toHaveBeenCalledWith(9, true);
    expect(screen.queryByText("Is Ana Cruz still in the center?")).toBeNull();
  });

  it("'No, picked up' sends stillHere=false", async () => {
    api.getAttendanceSession.mockResolvedValue(status({ checks: [check()] }));
    api.answerPickupCheck.mockResolvedValue({ ok: true });
    mount();
    await settle();
    fireEvent.click(screen.getByRole("button", { name: /no, picked up/i }));
    await settle();
    expect(api.answerPickupCheck).toHaveBeenCalledWith(9, false);
  });

  it("closes the prompt even if the server says it had already ended", async () => {
    api.getAttendanceSession.mockResolvedValue(status({ checks: [check()] }));
    api.answerPickupCheck.mockRejectedValue(new Error("409"));
    mount();
    await settle();
    fireEvent.click(screen.getByRole("button", { name: /yes, still here/i }));
    await settle();
    expect(screen.queryByText("Is Ana Cruz still in the center?")).toBeNull();
  });

  it("shows nothing when there are no prompts and tracking is off", async () => {
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
