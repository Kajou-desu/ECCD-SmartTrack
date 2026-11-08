import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, renderHook, act, cleanup, fireEvent } from "@testing-library/react";

const api = vi.hoisted(() => ({ deleteAttendance: vi.fn() }));
const toast = vi.hoisted(() => vi.fn());
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toast }));

const { default: AttendanceCard } = await import("@features/attendance/components/AttendanceCard.jsx");
const { default: DeleteAttendanceDialog } = await import("@features/attendance/components/DeleteAttendanceDialog.jsx");
const { useAttendanceDeletion } = await import("@features/attendance/hooks/useAttendanceDeletion.js");

beforeEach(() => {
  api.deleteAttendance.mockReset();
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
