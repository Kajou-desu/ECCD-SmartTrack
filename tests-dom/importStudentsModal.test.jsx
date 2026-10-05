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
