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
    act(() => result.current.setExportPeriod("week"));
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
    act(() => result.current.setExportPeriod("month"));
    await act(() => result.current.handleExportRange());
    expect(api.getAttendanceRange).toHaveBeenCalledWith("2026-02-01", "2026-02-28");
  });

  it("says so, and downloads nothing, when the period has no records", async () => {
    api.getAttendanceRange.mockResolvedValue({ records: [] });
    const { result } = await setup("2026-10-07");
    act(() => result.current.setExportPeriod("week"));
    await act(() => result.current.handleExportRange());
    expect(csv.downloadCsv).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("warning", "No attendance was recorded in that period.");
  });

  it("shows the server's message when the request fails", async () => {
    api.getAttendanceRange.mockRejectedValue(
      Object.assign(new Error("Something went wrong."), { name: "ApiError", status: 400, details: { message: "Too many records in this range." } }),
    );
    const { result } = await setup("2026-10-07");
    act(() => result.current.setExportPeriod("month"));
    await act(() => result.current.handleExportRange());
    expect(toast).toHaveBeenCalledWith("error", "Too many records in this range.");
    expect(result.current.exportingRange).toBe(false);
  });
});
