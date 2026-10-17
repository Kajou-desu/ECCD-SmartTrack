import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const getActivityLogs = vi.fn();
const recordExport = vi.fn();
// downloadCsv's lazy import of the client resolves to this same module.
vi.mock("@api/client.js", () => ({
  apiClient: { getActivityLogs: (...a) => getActivityLogs(...a), recordExport: (...a) => recordExport(...a) },
}));

const { default: ActivityLogs } = await import("@pages/ActivityLogs.jsx");
const { downloadCsv } = await import("@utils/exportCsv.js");

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ActivityLogs />
    </QueryClientProvider>,
  );
}

const row = (id, over = {}) => ({
  id,
  createdAt: "2026-10-12T08:05:00Z",
  actorEmail: "admin@school.test",
  actorRole: "Admin",
  action: "student.create",
  summary: `Added student Ana ${id}`,
  ...over,
});

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("ActivityLogs page", () => {
  it("shows who did what, with the type in words", async () => {
    getActivityLogs.mockResolvedValue({ logs: [row(1)], total: 1, page: 1, pageSize: 25 });
    renderPage();
    expect(await screen.findByText("Added student Ana 1")).toBeTruthy();
    expect(screen.getByText("admin@school.test")).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Students" })).toBeTruthy();
    expect(getActivityLogs).toHaveBeenCalledWith({ page: 1, pageSize: 25 });
  });

  it("shows text from the log as plain text, not markup", async () => {
    getActivityLogs.mockResolvedValue({ logs: [row(1, { summary: '<img src=x onerror="alert(1)">' })], total: 1 });
    const { container } = renderPage();
    expect(await screen.findByText('<img src=x onerror="alert(1)">')).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });

  it("applies the filters and returns to page 1", async () => {
    getActivityLogs.mockResolvedValue({ logs: [row(1)], total: 60 });
    renderPage();
    await screen.findByText("Added student Ana 1");
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => expect(getActivityLogs).toHaveBeenLastCalledWith({ page: 2, pageSize: 25 }));

    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "attendance" } });
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "Ana" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    await waitFor(() =>
      expect(getActivityLogs).toHaveBeenLastCalledWith({ page: 1, pageSize: 25, category: "attendance", q: "Ana" }),
    );
  });

  it("won't apply a backwards date range", async () => {
    getActivityLogs.mockResolvedValue({ logs: [], total: 0 });
    renderPage();
    await screen.findByText(/no activity matches/i);
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-10-12" } });
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-10-01" } });
    expect(screen.getByRole("alert").textContent).toMatch(/must not be after/i);
    expect(screen.getByRole("button", { name: /apply/i }).disabled).toBe(true);
  });

  it("offers a retry when loading fails", async () => {
    getActivityLogs.mockRejectedValueOnce(new Error("x")).mockResolvedValue({ logs: [row(2)], total: 1 });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: /try again/i }));
    expect(await screen.findByText("Added student Ana 2")).toBeTruthy();
  });
});

describe("downloadCsv export reporting", () => {
  beforeEach(() => {
    window.URL.createObjectURL = vi.fn(() => "blob:x");
    window.URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  it("reports the kind and row count after the download", async () => {
    recordExport.mockResolvedValue({});
    downloadCsv("a.csv", ["A"], [["1"], ["2"]], { kind: "students" });
    await waitFor(() => expect(recordExport).toHaveBeenCalledWith("students", 2));
  });

  it("reports nothing without a kind, and ignores a failed report", async () => {
    downloadCsv("a.csv", ["A"], [["1"]]);
    recordExport.mockRejectedValue(new Error("offline"));
    expect(() => downloadCsv("a.csv", ["A"], [["1"]], { kind: "attendance" })).not.toThrow();
    await waitFor(() => expect(recordExport).toHaveBeenCalledTimes(1));
  });
});
