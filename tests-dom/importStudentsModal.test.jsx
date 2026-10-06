import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({ importStudents: vi.fn() }));
const toast = vi.hoisted(() => vi.fn());
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toast }));

const { default: ImportStudentsModal } = await import(
  "@features/students/components/ImportStudentsModal.jsx"
);

const CSV = [
  "firstName,lastName,birthday,gender,address,session,guardianName,guardianPhone",
  "Ana,Cruz,2022-03-15,female,12 Main St,morning,Maria Cruz,09171234567",
  "Bad,Row,not-a-date,female,12 Main St,morning,Maria Cruz,09171234567",
].join("\n");

async function upload(onCancel, onImported) {
  render(<ImportStudentsModal onCancel={onCancel} onImported={onImported} />);
  const input = document.querySelector('input[type="file"]');
  const file = new File([CSV], "students.csv", { type: "text/csv" });
  file.text = () => Promise.resolve(CSV);
  fireEvent.change(input, { target: { files: [file] } });
  await screen.findByText(/ready to import/i);
  fireEvent.click(screen.getByRole("button", { name: "Import Students" }));
}

beforeEach(() => {
  api.importStudents.mockReset();
  toast.mockReset();
});
afterEach(cleanup);

describe("ImportStudentsModal result reporting", () => {
  it("keeps the dialog open and lists rejected rows when some rows fail", async () => {
    api.importStudents.mockResolvedValue({
      imported: 1,
      failed: [{ row: 3, message: "Invalid birthday, expected YYYY-MM-DD" }],
      students: [],
    });
    const onCancel = vi.fn();
    const onImported = vi.fn();
    await upload(onCancel, onImported);

    expect(await screen.findByText(/Row 3: Invalid birthday/)).toBeTruthy();
    expect(onCancel).not.toHaveBeenCalled();
    expect(onImported).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith("warning", "1 imported, 1 failed.");
    // File was cleared so the saved rows cannot be imported twice.
    expect(screen.getByRole("button", { name: "Import Students" }).disabled).toBe(true);
  });

  it("closes with a success toast when every row is imported", async () => {
    api.importStudents.mockResolvedValue({ imported: 2, failed: [], students: [] });
    const onCancel = vi.fn();
    await upload(onCancel, vi.fn());

    await waitFor(() => expect(onCancel).toHaveBeenCalled());
    expect(toast).toHaveBeenCalledWith("success", "2 student(s) imported successfully.");
  });
});

function bigCsv(count) {
  const lines = ["firstName,lastName,birthday,gender,address,motherName"];
  for (let i = 0; i < count; i += 1) lines.push(`S${i},Cruz,2022-03-15,female,12 Main St,Maria Cruz`);
  return lines.join("\n");
}

async function uploadCsv(csv, props = {}) {
  render(<ImportStudentsModal onCancel={vi.fn()} onImported={vi.fn()} {...props} />);
  const input = document.querySelector('input[type="file"]');
  const file = new File([csv], "students.csv", { type: "text/csv" });
  file.text = () => Promise.resolve(csv);
  fireEvent.change(input, { target: { files: [file] } });
  await screen.findByText(/ready to import/i);
  fireEvent.click(screen.getByRole("button", { name: /Import Students/ }));
}

describe("ImportStudentsModal — chunking and interruption", () => {
  it("sends 120 rows as 3 requests and shifts server row numbers by each chunk's offset", async () => {
    api.importStudents
      .mockResolvedValueOnce({ imported: 50, failed: [] })
      .mockResolvedValueOnce({ imported: 49, failed: [{ row: 4, message: "Invalid birthday" }] })
      .mockResolvedValueOnce({ imported: 20, failed: [] });
    const onImported = vi.fn();
    await uploadCsv(bigCsv(120), { onImported });

    // Row 4 of the 2nd chunk (rows 51-100) is spreadsheet row 4 + 50 = 54.
    expect(await screen.findByText(/Row 54: Invalid birthday/)).toBeTruthy();
    expect(api.importStudents.mock.calls.map(([chunk]) => chunk.length)).toEqual([50, 50, 20]);
    expect(onImported).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith("warning", "119 imported, 1 failed.");
  });

  it("after a timeout mid-import, says what was saved and does not leave the rows ready to re-send", async () => {
    api.importStudents
      .mockResolvedValueOnce({ imported: 50, failed: [] })
      .mockRejectedValueOnce(Object.assign(new Error("timeout"), { name: "AbortError" }));
    const onImported = vi.fn();
    await uploadCsv(bigCsv(120), { onImported });

    const alert = await screen.findByText(/The import was interrupted/);
    expect(alert.textContent).toMatch(/50 student\(s\) were saved/);
    expect(alert.textContent).toMatch(/rows 52-101 may or may not/);
    expect(onImported).toHaveBeenCalledTimes(1); // list refreshes to show what was saved
    expect(api.importStudents).toHaveBeenCalledTimes(2); // the 3rd chunk was never sent
    expect(screen.getByRole("button", { name: /Import Students/ }).disabled).toBe(true);
  });

  it("keeps the rows ready when the very first request is rejected outright (nothing was saved)", async () => {
    api.importStudents.mockRejectedValueOnce(Object.assign(new Error("Something went wrong."), { name: "ApiError", status: 400, details: { message: "No student records supplied" } }));
    await uploadCsv(bigCsv(3));
    expect(await screen.findByText("No student records supplied")).toBeTruthy();
    // Nothing was saved, so the same file can simply be retried.
    expect(screen.getByRole("button", { name: /Import Students/ }).disabled).toBe(false);
  });

  it("warns Admins that imported students have no teacher; Teachers don't see it", () => {
    render(<ImportStudentsModal onCancel={vi.fn()} onImported={vi.fn()} isAdmin />);
    expect(screen.getByText(/aren.t assigned to a teacher/)).toBeTruthy();
    cleanup();
    render(<ImportStudentsModal onCancel={vi.fn()} onImported={vi.fn()} />);
    expect(screen.queryByText(/aren.t assigned to a teacher/)).toBeNull();
  });

  it("rejects an oversized file before uploading", async () => {
    render(<ImportStudentsModal onCancel={vi.fn()} onImported={vi.fn()} />);
    const file = new File(["x"], "big.csv", { type: "text/csv" });
    Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
    expect(await screen.findByText(/too large/i)).toBeTruthy();
    expect(api.importStudents).not.toHaveBeenCalled();
  });
});
