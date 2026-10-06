import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

const downloadCsv = vi.fn();
vi.mock("@utils/exportCsv", () => ({ downloadCsv }));

const { default: ParentRecentLogs } = await import("@features/attendance/components/ParentRecentLogs.jsx");

afterEach(() => {
  cleanup();
  downloadCsv.mockClear();
});

const logs = [
  { date: "Oct 01, 2026", status: "present", arrivedAt: "2026-10-01T00:05:00.000Z", departedAt: "2026-10-01T04:00:00.000Z" },
  { date: "Oct 02, 2026", status: "absent", arrivedAt: null, departedAt: null },
];

describe("ParentRecentLogs export", () => {
  it("fills the check-in column from arrivedAt (it was always empty: log.time doesn't exist)", () => {
    render(<ParentRecentLogs logs={logs} childName="Ana Cruz" monthName="October 2026" />);
    fireEvent.click(screen.getByText("Export"));

    const [filename, headers, rows] = downloadCsv.mock.calls[0];
    expect(filename).toBe("attendance_Ana_Cruz_October_2026.csv");
    expect(headers).toEqual(["Date", "Status", "Check-in", "Check-out"]);
    expect(rows[0][1]).toBe("Present");
    expect(rows[0][2]).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
    expect(rows[0][3]).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
    expect(rows[1].slice(2)).toEqual(["", ""]);
  });

  it("doesn't crash on export while childName / monthName are still undefined", () => {
    render(<ParentRecentLogs logs={logs} />);
    fireEvent.click(screen.getByText("Export"));
    expect(downloadCsv.mock.calls[0][0]).toBe("attendance_child_month.csv");
  });
});
