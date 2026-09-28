import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

const api = vi.hoisted(() => ({ getAttendance: vi.fn(), markDeparted: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: AttendanceCard } = await import("@features/attendance/components/AttendanceCard.jsx");
const { AttendanceList: DashboardAttendanceList } = await import("@features/dashboard/components/AttendanceList.jsx");
const { toDayKey } = await import("@utils/dateKeys.js");

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 20)); });
const nineAm = () => { const d = new Date(); d.setHours(9, 0, 0, 0); return d.toISOString(); };
const rec = (over = {}) => ({ id: 5, name: "Ana Cruz", status: "present", arrivedAt: nineAm(), departedAt: null, verified: false, ...over });

beforeEach(() => Object.values(api).forEach((f) => f.mockReset()));
afterEach(cleanup);

describe("AttendanceCard — Mark departed", () => {
  const card = (record, props = {}) =>
    render(<AttendanceCard record={record} onMarkStatus={vi.fn()} onDepart={props.onDepart ?? vi.fn()} canDepart={props.canDepart ?? true} isSaving={false} />);

  it("shows the button for a present student", () => {
    card(rec());
    expect(screen.getByRole("button", { name: /mark ana cruz departed/i })).toBeTruthy();
  });

  it("hides it when the page says it isn't allowed (absent, excused, already left, or not today)", () => {
    card(rec({ status: "absent", arrivedAt: null }), { canDepart: false });
    expect(screen.queryByRole("button", { name: /departed/i })).toBeNull();
  });

  it("asks for confirmation and only then departs", () => {
    const onDepart = vi.fn();
    card(rec(), { onDepart });

    fireEvent.click(screen.getByRole("button", { name: /mark ana cruz departed/i }));
    expect(onDepart).not.toHaveBeenCalled();
    expect(screen.getByText("Mark as departed?")).toBeTruthy();

    fireEvent.click(screen.getByText("Confirm"));
    expect(onDepart).toHaveBeenCalledWith(5);
  });

  it("cancelling does nothing", () => {
    const onDepart = vi.fn();
    card(rec(), { onDepart });
    fireEvent.click(screen.getByRole("button", { name: /mark ana cruz departed/i }));
    fireEvent.click(screen.getByText("Cancel"));
    expect(onDepart).not.toHaveBeenCalled();
    expect(screen.queryByText("Mark as departed?")).toBeNull();
  });

  it("shows the departure time for a student who has left", () => {
    card(rec({ departedAt: new Date().toISOString() }), { canDepart: false });
    expect(screen.getByText(/Departed at/)).toBeTruthy();
  });
});

describe("Dashboard Today's Attendance — Mark departed", () => {
  function mount() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
      <QueryClientProvider client={qc}>
        <MemoryRouter><DashboardAttendanceList /></MemoryRouter>
      </QueryClientProvider>,
    );
  }

  it("offers departure only for present students who haven't left, and never for absent ones", async () => {
    api.getAttendance.mockResolvedValue([
      rec({ id: 1, name: "Ana Cruz" }),
      rec({ id: 2, name: "Ben Reyes", departedAt: new Date().toISOString() }),
      rec({ id: 3, name: "Cara Lim", status: "absent", arrivedAt: null }),
    ]);
    mount(); await settle();

    expect(api.getAttendance).toHaveBeenCalledWith(toDayKey());
    expect(screen.getByRole("button", { name: /mark ana cruz departed/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /mark ben reyes departed/i })).toBeNull();
    expect(screen.getByText(/Departed/)).toBeTruthy();
    expect(screen.queryByText(/Cara/)).toBeNull();
    expect(screen.queryByRole("button", { name: /cara/i })).toBeNull();
  });

  it("calls the API after confirmation and refreshes the list", async () => {
    api.getAttendance.mockResolvedValueOnce([rec({ id: 1, name: "Ana Cruz" })]);
    api.markDeparted.mockResolvedValue({});
    api.getAttendance.mockResolvedValue([rec({ id: 1, name: "Ana Cruz", departedAt: new Date().toISOString() })]);
    mount(); await settle();

    fireEvent.click(screen.getByRole("button", { name: /mark ana cruz departed/i }));
    fireEvent.click(screen.getByText("Confirm"));
    await settle();

    expect(api.markDeparted).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("button", { name: /mark ana cruz departed/i })).toBeNull();
    expect(screen.getByText(/Departed/)).toBeTruthy();
  });

  it("shows an error and keeps the button if the server rejects it", async () => {
    api.getAttendance.mockResolvedValue([rec({ id: 1, name: "Ana Cruz" })]);
    api.markDeparted.mockRejectedValue(new Error("nope"));
    mount(); await settle();

    fireEvent.click(screen.getByRole("button", { name: /mark ana cruz departed/i }));
    fireEvent.click(screen.getByText("Confirm"));
    await settle();

    expect(screen.getByRole("alert").textContent).toMatch(/couldn't mark/i);
    expect(screen.getByRole("button", { name: /mark ana cruz departed/i })).toBeTruthy();
  });
});
