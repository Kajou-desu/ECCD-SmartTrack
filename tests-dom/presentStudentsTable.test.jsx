import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, cleanup, fireEvent, renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ markPickedUp: vi.fn(), markStillHere: vi.fn() }));
const toast = vi.hoisted(() => vi.fn());
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toast }));

const { default: PresentStudentsTable } = await import("@features/smartAttendance/components/PresentStudentsTable.jsx");
const { useMarkPickedUp } = await import("@features/smartAttendance/hooks/useMarkPickedUp.js");
const { useStillHere } = await import("@features/smartAttendance/hooks/useStillHere.js");

beforeEach(() => {
  api.markPickedUp.mockReset();
  api.markStillHere.mockReset();
  toast.mockReset();
});
afterEach(cleanup);

const student = (studentId, name, status) => ({ studentId, name, status, arrivedAt: "2026-11-06T00:05:00.000Z", pickedUpAt: null });
const STUDENTS = [student(2, "Ben Reyes", "not_detected"), student(1, "Ana Cruz", "inside"), student(3, "Cara Diaz", "picked_up")];

describe("PresentStudentsTable", () => {
  it("shows each student's status and the counts", () => {
    render(<PresentStudentsTable students={STUDENTS} onMarkPickedUp={() => {}} />);
    expect(screen.getByText("1 inside, 1 not detected, 1 picked up")).toBeTruthy();
    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("Not Detected")).toBeTruthy();
    expect(within(rows[1]).getByText("Inside")).toBeTruthy();
    expect(within(rows[2]).getByText("Picked Up")).toBeTruthy();
  });

  it("offers Mark picked up only on Not Detected rows", () => {
    render(<PresentStudentsTable students={STUDENTS} onMarkPickedUp={() => {}} />);
    const buttons = screen.getAllByRole("button", { name: /picked up/i });
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute("aria-label")).toBe("Mark Ben Reyes picked up");
  });

  it("offers Still here only on Not Detected rows, and presses it for that student at once", () => {
    const onStillHere = vi.fn();
    render(<PresentStudentsTable students={STUDENTS} onMarkPickedUp={() => {}} onStillHere={onStillHere} />);
    const buttons = screen.getAllByRole("button", { name: /still here/i });
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute("aria-label")).toBe("Ben Reyes is still here");
    fireEvent.click(buttons[0]);
    expect(onStillHere).toHaveBeenCalledWith(STUDENTS[0]);
  });

  it("disables both actions on a row while its request is in flight", () => {
    render(<PresentStudentsTable students={STUDENTS} busyIds={new Set([2])} onMarkPickedUp={() => {}} onStillHere={() => {}} />);
    expect(screen.getByRole("button", { name: "Ben Reyes is still here" }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Mark Ben Reyes picked up" }).disabled).toBe(true);
  });

  it("asks for confirmation, then marks that student", () => {
    const onMarkPickedUp = vi.fn();
    render(<PresentStudentsTable students={STUDENTS} onMarkPickedUp={onMarkPickedUp} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark Ben Reyes picked up" }));
    expect(onMarkPickedUp).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onMarkPickedUp).toHaveBeenCalledWith(STUDENTS[0]);
  });

  it("says nobody is present when the list is empty", () => {
    render(<PresentStudentsTable students={[]} onMarkPickedUp={() => {}} />);
    expect(screen.getByText("Nobody is marked present yet today.")).toBeTruthy();
  });

  it("warns when detection is offline", () => {
    render(<PresentStudentsTable students={STUDENTS} detectionActive={false} onMarkPickedUp={() => {}} />);
    expect(screen.getByText(/camera or the tag reader is offline/)).toBeTruthy();
  });
});

describe("useMarkPickedUp", () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>{children}</QueryClientProvider>
  );

  it("marks the student, tells the teacher, and ignores a second press while it is in flight", async () => {
    let resolve;
    api.markPickedUp.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { result } = renderHook(() => useMarkPickedUp(), { wrapper });
    act(() => result.current.markPickedUp({ studentId: 2, name: "Ben Reyes" }));
    await waitFor(() => expect(result.current.busyIds.has(2)).toBe(true));
    act(() => result.current.markPickedUp({ studentId: 2, name: "Ben Reyes" }));
    expect(api.markPickedUp).toHaveBeenCalledTimes(1);
    expect(api.markPickedUp).toHaveBeenCalledWith(2);
    await act(async () => resolve({}));
    await waitFor(() => expect(result.current.busyIds.size).toBe(0));
    expect(toast).toHaveBeenCalledWith("success", "Ben Reyes was marked picked up.");
  });

  it("shows the server's message when it fails", async () => {
    api.markPickedUp.mockRejectedValue(
      Object.assign(new Error("Something went wrong."), { name: "ApiError", status: 409, details: { message: "Already picked up." } }),
    );
    const { result } = renderHook(() => useMarkPickedUp(), { wrapper });
    act(() => result.current.markPickedUp({ studentId: 2, name: "Ben Reyes" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith("error", "Already picked up."));
    expect(result.current.busyIds.size).toBe(0);
  });
});

describe("useStillHere", () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>{children}</QueryClientProvider>
  );

  it("restarts the clock, tells the teacher, and ignores a second press while it is in flight", async () => {
    let resolve;
    api.markStillHere.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { result } = renderHook(() => useStillHere(), { wrapper });
    act(() => result.current.markStillHere({ studentId: 2, name: "Ben Reyes" }));
    await waitFor(() => expect(result.current.busyIds.has(2)).toBe(true));
    act(() => result.current.markStillHere({ studentId: 2, name: "Ben Reyes" }));
    expect(api.markStillHere).toHaveBeenCalledTimes(1);
    expect(api.markStillHere).toHaveBeenCalledWith(2);
    await act(async () => resolve({}));
    await waitFor(() => expect(result.current.busyIds.size).toBe(0));
    expect(toast).toHaveBeenCalledWith("success", "Ben Reyes is marked as still here.");
  });

  it("shows the server's message when it fails", async () => {
    api.markStillHere.mockRejectedValue(
      Object.assign(new Error("Something went wrong."), { name: "ApiError", status: 400, details: { message: "Student is not present and inside today" } }),
    );
    const { result } = renderHook(() => useStillHere(), { wrapper });
    act(() => result.current.markStillHere({ studentId: 2, name: "Ben Reyes" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith("error", "Student is not present and inside today"));
    expect(result.current.busyIds.size).toBe(0);
  });
});
