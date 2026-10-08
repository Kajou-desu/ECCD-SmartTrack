import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({ importAttendance: vi.fn() }));
const toast = vi.hoisted(() => vi.fn());
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toast }));

const { default: ImportAttendanceModal } = await import(
  "@features/attendance/components/ImportAttendanceModal.jsx"
);

const CSV = "studentCode,date,status\nECCD-2026-1,2026-10-05,Present\nZZ,2026-10-05,absent\n";

function choose(text = CSV) {
  const input = document.querySelector('input[type="file"]');
  const file = new File([text], "attendance.csv", { type: "text/csv" });
  file.text = () => Promise.resolve(text);
  fireEvent.change(input, { target: { files: [file] } });
}

beforeEach(() => {
  api.importAttendance.mockReset();
  toast.mockReset();
});
afterEach(cleanup);

describe("ImportAttendanceModal", () => {
  it("checks the file first (dry run), shows what would change, and saves nothing yet", async () => {
    api.importAttendance.mockResolvedValue({
      dryRun: true, created: 1, updated: 0, unchanged: 0,
      failed: [{ row: 3, message: 'Student code "ZZ" was not found' }],
    });
    render(<ImportAttendanceModal onCancel={vi.fn()} onImported={vi.fn()} />);
    choose();

    expect(await screen.findByText(/1 new, 0 changed, 0 already up to date, 1 with problems/)).toBeTruthy();
    expect(screen.getByText(/Row 3: Student code "ZZ" was not found/)).toBeTruthy();
    expect(api.importAttendance).toHaveBeenCalledTimes(1);
    expect(api.importAttendance.mock.calls[0][1]).toBe(true);
    // Rows were normalized client-side ("Present" -> present).
    expect(api.importAttendance.mock.calls[0][0][0]).toEqual({ studentCode: "ECCD-2026-1", date: "2026-10-05", status: "present" });
  });

  it("imports after the preview, keeps the dialog open when rows failed, and clears the file", async () => {
    api.importAttendance
      .mockResolvedValueOnce({ dryRun: true, created: 1, updated: 0, unchanged: 0, failed: [{ row: 3, message: "bad" }] })
      .mockResolvedValueOnce({ dryRun: false, created: 1, updated: 0, unchanged: 0, failed: [{ row: 3, message: "bad" }] });
    const onCancel = vi.fn();
    const onImported = vi.fn();
    render(<ImportAttendanceModal onCancel={onCancel} onImported={onImported} />);
    choose();
    await screen.findByText(/1 new/);

    fireEvent.click(screen.getByRole("button", { name: "Import Attendance" }));
    await waitFor(() => expect(onImported).toHaveBeenCalledTimes(1));

    expect(api.importAttendance.mock.calls[1][1]).toBe(false);
    expect(onCancel).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("warning", "1 attendance record(s) saved.");
    expect(screen.getByRole("button", { name: "Import Attendance" }).disabled).toBe(true); // can't be sent twice
  });

  it("closes itself after a fully successful import", async () => {
    api.importAttendance
      .mockResolvedValueOnce({ dryRun: true, created: 2, updated: 0, unchanged: 0, failed: [] })
      .mockResolvedValueOnce({ dryRun: false, created: 2, updated: 0, unchanged: 0, failed: [] });
    const onCancel = vi.fn();
    render(<ImportAttendanceModal onCancel={onCancel} onImported={vi.fn()} />);
    choose();
    await screen.findByText(/2 new/);
    fireEvent.click(screen.getByRole("button", { name: "Import Attendance" }));
    await waitFor(() => expect(onCancel).toHaveBeenCalled());
    expect(toast).toHaveBeenCalledWith("success", "2 attendance record(s) saved.");
  });

  it("offers nothing to import when every record is already up to date", async () => {
    api.importAttendance.mockResolvedValue({ dryRun: true, created: 0, updated: 0, unchanged: 2, failed: [] });
    render(<ImportAttendanceModal onCancel={vi.fn()} onImported={vi.fn()} />);
    choose();
    await screen.findByText(/2 already up to date/);
    expect(screen.getByRole("button", { name: "Import Attendance" }).disabled).toBe(true);
  });

  it("shows a local file problem without calling the server", async () => {
    render(<ImportAttendanceModal onCancel={vi.fn()} onImported={vi.fn()} />);
    choose("studentCode,date\nX,2026-10-05\n");
    expect(await screen.findByText(/Missing CSV columns: status/)).toBeTruthy();
    expect(api.importAttendance).not.toHaveBeenCalled();
  });

  it("shows the server's message when the check fails", async () => {
    api.importAttendance.mockRejectedValue(
      Object.assign(new Error("Something went wrong."), { name: "ApiError", status: 403, details: { message: "Forbidden" } }),
    );
    render(<ImportAttendanceModal onCancel={vi.fn()} onImported={vi.fn()} />);
    choose();
    expect(await screen.findByText("Forbidden")).toBeTruthy();
  });
});
