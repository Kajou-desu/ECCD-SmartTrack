import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getMaterialSubmissions: vi.fn(),
  getFileBlob: vi.fn(),
}));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: MaterialSubmissions } = await import("@pages/MaterialSubmissions.jsx");

const sub = (id, studentName, studentSession) => ({
  id, studentId: id, studentName, studentSession,
  fileName: `${id}.pdf`, fileUrl: `https://api.test/api/files/${id}.pdf?sig=1`,
  submittedAt: "2026-09-24T00:15:00.000Z",
});

function mount(submissions) {
  api.getMaterialSubmissions.mockResolvedValue({
    material: { id: 7, title: "Number Tracing", category: "Math" },
    submissions,
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/learning-materials/7/submissions"]}>
        <Routes>
          <Route path="/learning-materials/:materialId/submissions" element={<MaterialSubmissions />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset());
  api.getFileBlob.mockResolvedValue(new Blob(["x"], { type: "application/pdf" }));
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

describe("Activity Preview session filter", () => {
  const DATA = [sub(1, "Amy Morning", "morning"), sub(2, "Ben Afternoon", "afternoon")];

  it("starts on All and lists every student", async () => {
    mount(DATA);
    expect(await screen.findByLabelText("Preview Amy Morning's work")).toBeTruthy();
    expect(screen.getByLabelText("Preview Ben Afternoon's work")).toBeTruthy();
    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("Morning keeps only morning students, Afternoon only afternoon ones", async () => {
    mount(DATA);
    await screen.findByLabelText("Preview Amy Morning's work");

    fireEvent.click(screen.getByRole("button", { name: "Morning" }));
    expect(screen.getByLabelText("Preview Amy Morning's work")).toBeTruthy();
    expect(screen.queryByLabelText("Preview Ben Afternoon's work")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Afternoon" }));
    expect(screen.getByLabelText("Preview Ben Afternoon's work")).toBeTruthy();
    expect(screen.queryByLabelText("Preview Amy Morning's work")).toBeNull();
  });

  it("explains an empty session and keeps the toggle so the teacher can switch back", async () => {
    mount([sub(1, "Amy Morning", "morning")]);
    await screen.findByLabelText("Preview Amy Morning's work");

    fireEvent.click(screen.getByRole("button", { name: "Afternoon" }));
    expect(screen.getByText("No student work for the afternoon session")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByLabelText("Preview Amy Morning's work")).toBeTruthy();
  });

  it("shows no filter when nobody has submitted work", async () => {
    mount([]);
    expect(await screen.findByText("No student works yet")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Morning" })).toBeNull();
  });
});
