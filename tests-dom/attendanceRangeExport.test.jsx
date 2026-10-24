import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ getAttendance: vi.fn(), getAttendanceRange: vi.fn() }));
const toast = vi.hoisted(() => vi.fn());
const csv = vi.hoisted(() => ({ downloadCsv: vi.fn() }));
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toast }));
vi.mock("@utils/exportCsv.js", () => csv);

const { default: useAttendance } = await import("@features/attendance/hooks/useAttendance.js");

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
);

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset());
  toast.mockReset();
  csv.downloadCsv.mockReset();
  api.getAttendance.mockResolvedValue([]);
});
afterEach(cleanup);

async function setup(date) {
  const hook = renderHook(() => useAttendance(date), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("week and month attendance export", () => {
  it("requests the Monday-Sunday week of the selected date and downloads the rows", async () => {
    api.getAttendanceRange.mockResolvedValue({
      records: [{ date: "2026-10-06", studentCode: "ECCD-2026-1", name: "Ana", session: "morning", status: "absent" }],
    });
    const { result } = await setup("2026-10-07"); // a Wednesday
    act(() => result.current.setPeriod("week"));
    await act(() => result.current.handleExportRange());

    expect(api.getAttendanceRange).toHaveBeenCalledWith("2026-10-05", "2026-10-11");
    const [filename, headers, rows] = csv.downloadCsv.mock.calls[0];
    expect(filename).toBe("attendance_week_2026-10-05_to_2026-10-11.csv");
    expect(headers[0]).toBe("Date");
    expect(rows[0].slice(0, 5)).toEqual(["2026-10-06", "ECCD-2026-1", "Ana", "Morning", "Absent"]);
    expect(toast).toHaveBeenCalledWith("success", "Attendance data was exported.");
  });

  it("requests the whole calendar month", async () => {
    api.getAttendanceRange.mockResolvedValue({ records: [] });
    const { result } = await setup("2026-02-14");
    act(() => result.current.setPeriod("month"));
    await act(() => result.current.handleExportRange());
    expect(api.getAttendanceRange).toHaveBeenCalledWith("2026-02-01", "2026-02-28");
  });

  it("says so, and downloads nothing, when the period has no records", async () => {
    api.getAttendanceRange.mockResolvedValue({ records: [] });
    const { result } = await setup("2026-10-07");
    act(() => result.current.setPeriod("week"));
    await act(() => result.current.handleExportRange());
    expect(csv.downloadCsv).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("warning", "No attendance was recorded in that period.");
  });

  it("shows the server's message when the request fails", async () => {
    api.getAttendanceRange.mockRejectedValue(
      Object.assign(new Error("Something went wrong."), { name: "ApiError", status: 400, details: { message: "Too many records in this range." } }),
    );
    const { result } = await setup("2026-10-07");
    act(() => result.current.setPeriod("month"));
    await act(() => result.current.handleExportRange());
    expect(toast).toHaveBeenCalledWith("error", "Too many records in this range.");
    expect(result.current.exportingRange).toBe(false);
  });
});

describe("week and month attendance table", () => {
  it("loads nothing extra in the day view", async () => {
    const { result } = await setup("2026-10-07");
    expect(result.current.period).toBe("day");
    expect(result.current.periodTable).toBeNull();
    expect(api.getAttendanceRange).not.toHaveBeenCalled();
  });

  it("switching to week loads that week and builds Mon-Fri rows for the roster", async () => {
    api.getAttendance.mockResolvedValue([{ id: 1, name: "Ana", session: "morning", status: "present" }]);
    api.getAttendanceRange.mockResolvedValue({
      records: [
        { studentId: 1, name: "Ana", session: "morning", date: "2026-10-05", status: "present", late: false },
        { studentId: 1, name: "Ana", session: "morning", date: "2026-10-06", status: "present", late: true },
        { studentId: 1, name: "Ana", session: "morning", date: "2026-10-07", status: "absent", late: false },
      ],
    });
    const { result } = await setup("2026-10-07");
    act(() => result.current.setPeriod("week"));

    await waitFor(() => expect(result.current.rangeLoading).toBe(false));
    await waitFor(() => expect(result.current.periodTable.rows[0].cells[0]).toBe("present"));
    expect(api.getAttendanceRange).toHaveBeenCalledWith("2026-10-05", "2026-10-11");
    expect(result.current.periodTable.rows[0].cells).toEqual(["present", "late", "absent", "none", "none"]);
  });

  it("reports a friendly message, not the server's, when the period fails to load", async () => {
    api.getAttendanceRange.mockRejectedValue(new Error("boom: internal detail"));
    const { result } = await setup("2026-10-07");
    act(() => result.current.setPeriod("month"));

    await waitFor(() => expect(result.current.rangeError).not.toBe(""));
    expect(result.current.rangeError).toBe("Unable to load attendance for this period. Please try again.");
  });
});
