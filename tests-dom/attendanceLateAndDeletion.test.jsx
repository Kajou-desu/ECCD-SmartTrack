import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, renderHook, act, cleanup, fireEvent } from "@testing-library/react";

const api = vi.hoisted(() => ({ deleteAttendance: vi.fn(), recordAttendance: vi.fn(), markPickedUp: vi.fn() }));
const toast = vi.hoisted(() => vi.fn());
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toast }));

const { default: AttendanceCard } = await import("@features/attendance/components/AttendanceCard.jsx");
const { default: DeleteAttendanceDialog } = await import("@features/attendance/components/DeleteAttendanceDialog.jsx");
const { useAttendanceDeletion } = await import("@features/attendance/hooks/useAttendanceDeletion.js");
const { useBulkAttendance } = await import("@features/attendance/hooks/useBulkAttendance.js");
const { default: BulkAttendanceDialog } = await import("@features/attendance/components/BulkAttendanceDialog.jsx");
const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");

beforeEach(() => {
  api.deleteAttendance.mockReset();
  api.recordAttendance.mockReset();
  api.markPickedUp.mockReset();
  toast.mockReset();
});
afterEach(cleanup);

const record = (over = {}) => ({
  id: 7,
  firstName: "Ana",
  lastName: "Cruz",
  status: "present",
  arrivedAt: "2026-11-06T01:15:00.000Z",
  late: false,
  ...over,
});

describe("AttendanceCard late badge", () => {
  it("shows just Late, not Present as well, for a late arrival", () => {
    render(<AttendanceCard record={record({ late: true })} onMarkStatus={() => {}} onPickUp={() => {}} />);
    expect(screen.getAllByText("Late")).toHaveLength(1);
    expect(screen.queryByText("Present", { selector: "span" })).toBeNull();
    expect(screen.queryByText(/\(late\)/)).toBeNull();
  });

  it("shows no status at all (not Absent) for a student with no record yet", () => {
    render(<AttendanceCard record={record({ status: null, arrivedAt: null })} onMarkStatus={() => {}} onPickUp={() => {}} />);
    expect(screen.queryByText("Absent", { selector: "span" })).toBeNull();
    expect(screen.queryByText("Present", { selector: "span" })).toBeNull();
    expect(screen.getByText("No record yet")).toBeTruthy();
  });

  it("still shows Absent for a student marked absent", () => {
    render(<AttendanceCard record={record({ status: "absent", arrivedAt: null })} onMarkStatus={() => {}} onPickUp={() => {}} />);
    expect(screen.getByText("Absent", { selector: "span" })).toBeTruthy();
  });

  it("shows Present and no Late for an on-time arrival", () => {
    render(<AttendanceCard record={record()} onMarkStatus={() => {}} onPickUp={() => {}} />);
    expect(screen.queryByText("Late")).toBeNull();
    expect(screen.getByText("Present", { selector: "span" })).toBeTruthy();
  });

  it("never shows Late for a record that isn't present", () => {
    render(<AttendanceCard record={record({ status: "absent", late: true })} onMarkStatus={() => {}} onPickUp={() => {}} />);
    expect(screen.queryByText("Late")).toBeNull();
  });

  it("offers a selection checkbox only in selection mode", () => {
    const onToggleSelect = vi.fn();
    const { rerender } = render(<AttendanceCard record={record()} onMarkStatus={() => {}} onPickUp={() => {}} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    rerender(<AttendanceCard record={record()} onMarkStatus={() => {}} onPickUp={() => {}} selectable onToggleSelect={onToggleSelect} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggleSelect).toHaveBeenCalledWith(7);
  });
});

describe("useAttendanceDeletion", () => {
  const setup = (props = {}) =>
    renderHook((p) => useAttendanceDeletion({ date: "2026-11-06", visibleIds: [1, 2, 3], onDeleted: vi.fn(), ...p }), {
      initialProps: props,
    });

  it("select all covers the listed students and a second press clears it", () => {
    const { result } = setup();
    act(() => result.current.toggleAll());
    expect([...result.current.selectedIds]).toEqual([1, 2, 3]);
    act(() => result.current.toggleAll());
    expect(result.current.selectedIds.size).toBe(0);
  });

  it("counts with a dry run first and deletes nothing until confirmed", async () => {
    api.deleteAttendance.mockResolvedValueOnce({ dryRun: true, wouldDelete: 2 });
    const { result } = setup();
    act(() => result.current.toggle(1));
    act(() => result.current.toggle(2));
    await act(() => result.current.requestDelete());

    expect(api.deleteAttendance).toHaveBeenCalledTimes(1);
    expect(api.deleteAttendance).toHaveBeenCalledWith({ from: "2026-11-06", studentIds: [1, 2], dryRun: true });
    expect(result.current.pending).toEqual({ ids: [1, 2], count: 2 });
  });

  it("says so and asks for nothing when no selected student has a record", async () => {
    api.deleteAttendance.mockResolvedValueOnce({ dryRun: true, wouldDelete: 0 });
    const { result } = setup();
    act(() => result.current.toggle(1));
    await act(() => result.current.requestDelete());
    expect(result.current.pending).toBeNull();
    expect(toast).toHaveBeenCalledWith("info", expect.stringMatching(/have a record/));
  });

  it("deletes the confirmed students, refreshes, and leaves selection mode", async () => {
    const onDeleted = vi.fn();
    api.deleteAttendance
      .mockResolvedValueOnce({ dryRun: true, wouldDelete: 1 })
      .mockResolvedValueOnce({ dryRun: false, deleted: 1 });
    const { result } = setup({ onDeleted });
    act(() => result.current.toggleMode());
    act(() => result.current.toggle(3));
    await act(() => result.current.requestDelete());
    await act(() => result.current.confirmDelete());

    expect(api.deleteAttendance).toHaveBeenLastCalledWith({ from: "2026-11-06", studentIds: [3] });
    expect(onDeleted).toHaveBeenCalled();
    expect(result.current.selectionMode).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
    expect(toast).toHaveBeenCalledWith("success", "1 attendance record(s) deleted.");
  });

  it("keeps the selection and shows a generic message when the delete fails", async () => {
    api.deleteAttendance
      .mockResolvedValueOnce({ dryRun: true, wouldDelete: 1 })
      .mockRejectedValueOnce(Object.assign(new Error("boom"), { name: "ApiError", status: 500 }));
    const { result } = setup();
    act(() => result.current.toggle(1));
    await act(() => result.current.requestDelete());
    await act(() => result.current.confirmDelete());
    expect(result.current.selectedIds.has(1)).toBe(true);
    expect(toast).toHaveBeenCalledWith("error", expect.any(String));
    expect(toast.mock.calls.at(-1)[1]).not.toMatch(/boom/);
  });

  it("drops the selection when the date changes", () => {
    const { result, rerender } = setup();
    act(() => result.current.toggle(1));
    rerender({ date: "2026-11-05" });
    expect(result.current.selectedIds.size).toBe(0);
  });
});

describe("DeleteAttendanceDialog", () => {
  it("states the count and date, and confirms or cancels", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<DeleteAttendanceDialog date="2026-11-06" students={3} count={2} busy={false} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText(/2 attendance record\(s\) for 3 selected student\(s\) on 11\/06\/2026/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete records" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons while deleting", () => {
    render(<DeleteAttendanceDialog date="2026-11-06" students={1} count={1} busy onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole("button", { name: /Deleting/ }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Cancel" }).disabled).toBe(true);
  });
});

describe("useBulkAttendance", () => {
  const wrapper = ({ children }) => <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
  const records = [
    { id: 1, status: "present", pickedUpAt: null },
    { id: 2, status: "present", pickedUpAt: "2026-11-09T05:00:00Z" },
    { id: 3, status: null, pickedUpAt: null },
    { id: 4, status: "absent", pickedUpAt: null },
  ];
  const setup = (over = {}) =>
    renderHook(
      (p) => useBulkAttendance({ date: "2026-11-09", todayKey: "2026-11-09", records, selectedIds: new Set([1, 2, 3, 4]), onDone: vi.fn(), ...p }),
      { wrapper, initialProps: over },
    );

  it("changes nothing until confirmed", () => {
    const { result } = setup();
    act(() => result.current.request("absent"));
    expect(result.current.pending).toMatchObject({ action: "absent", ids: [1, 2, 3, 4] });
    expect(api.recordAttendance).not.toHaveBeenCalled();
  });

  it("marks everyone selected with one bulk save for the viewed date", async () => {
    api.recordAttendance.mockResolvedValue([]);
    const onDone = vi.fn();
    const { result } = setup({ onDone });
    act(() => result.current.request("excused"));
    await act(() => result.current.confirm());
    expect(api.recordAttendance).toHaveBeenCalledTimes(1);
    expect(api.recordAttendance).toHaveBeenCalledWith([1, 2, 3, 4].map((studentId) => ({ studentId, date: "2026-11-09", status: "excused" })));
    expect(onDone).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("success", "4 student(s) marked excused.");
    expect(result.current.pending).toBeNull();
  });

  it("splits a large selection into saves of at most 200", async () => {
    api.recordAttendance.mockResolvedValue([]);
    const ids = Array.from({ length: 450 }, (_, i) => i + 1);
    const { result } = setup({ selectedIds: new Set(ids) });
    act(() => result.current.request("present"));
    await act(() => result.current.confirm());
    expect(api.recordAttendance.mock.calls.map(([rows]) => rows.length)).toEqual([200, 200, 50]);
  });

  it("picks up only today's present students who are not already picked up, and counts the rest as skipped", async () => {
    api.markPickedUp.mockResolvedValue({});
    const { result } = setup();
    expect(result.current.pickupCount).toBe(1);
    act(() => result.current.request("pickup"));
    expect(result.current.pending).toMatchObject({ action: "pickup", ids: [1], skipped: 3 });
    await act(() => result.current.confirm());
    expect(api.markPickedUp).toHaveBeenCalledTimes(1);
    expect(api.markPickedUp).toHaveBeenCalledWith(1);
  });

  it("offers no pickup for a past day", () => {
    const { result } = setup({ date: "2026-11-08" });
    expect(result.current.pickupCount).toBe(0);
    act(() => result.current.request("pickup"));
    expect(result.current.pending).toBeNull();
    expect(toast).toHaveBeenCalledWith("info", expect.stringMatching(/present today/));
  });

  it("keeps going when one pickup fails, and says how many failed", async () => {
    api.markPickedUp.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce({});
    const recs = [{ id: 1, status: "present", pickedUpAt: null }, { id: 2, status: "present", pickedUpAt: null }];
    const { result } = setup({ records: recs, selectedIds: new Set([1, 2]) });
    act(() => result.current.request("pickup"));
    await act(() => result.current.confirm());
    expect(api.markPickedUp).toHaveBeenCalledTimes(2);
    expect(toast).toHaveBeenCalledWith("success", "1 student(s) marked picked up.");
    expect(toast).toHaveBeenCalledWith("error", "1 student(s) couldn't be updated. Please try again.");
  });

  it("shows a generic message when the whole save fails", async () => {
    api.recordAttendance.mockRejectedValue(Object.assign(new Error("boom"), { name: "ApiError", status: 500 }));
    const { result } = setup();
    act(() => result.current.request("absent"));
    await act(() => result.current.confirm());
    expect(toast.mock.calls.at(-1)[0]).toBe("error");
    expect(toast.mock.calls.at(-1)[1]).not.toMatch(/boom/);
  });

  it("does nothing with an empty selection", () => {
    const { result } = setup({ selectedIds: new Set() });
    act(() => result.current.request("present"));
    expect(result.current.pending).toBeNull();
  });
});

describe("BulkAttendanceDialog", () => {
  it("says who and what, and warns about parent notifications", () => {
    const onConfirm = vi.fn();
    render(<BulkAttendanceDialog pending={{ action: "present", ids: [1, 2], skipped: 0, date: "2026-11-09" }} todayKey="2026-11-09" busy={false} onConfirm={onConfirm} onCancel={() => {}} />);
    expect(screen.getByText(/2 students will be marked present for 11\/09\/2026/)).toBeTruthy();
    expect(screen.getByText(/will be notified of the arrival/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("does not mention arrival notices for a past day, and mentions skipped students for pickup", () => {
    const { rerender } = render(<BulkAttendanceDialog pending={{ action: "present", ids: [1], skipped: 0, date: "2026-11-08" }} todayKey="2026-11-09" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByText(/notified of the arrival/)).toBeNull();
    rerender(<BulkAttendanceDialog pending={{ action: "pickup", ids: [1], skipped: 3, date: "2026-11-09" }} todayKey="2026-11-09" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/3 other selected students are skipped/)).toBeTruthy();
  });
});
