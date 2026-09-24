import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getMaterialSubmissions: vi.fn(),
  getFileBlob: vi.fn(),
}));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: MaterialSubmissions } = await import("@pages/MaterialSubmissions.jsx");

const DATA = {
  material: { id: 7, title: "Number Tracing", category: "Math" },
  submissions: [
    { id: 1, studentId: 10, studentName: "Kurt Macaraeg", fileName: "kurt.pdf", fileUrl: "https://api.test/api/files/a.pdf?sig=1", submittedAt: "2026-09-24T00:15:00.000Z" },
    { id: 2, studentId: 11, studentName: "Kenneth Alvarez", fileName: "kenneth.png", fileUrl: "https://api.test/api/files/b.png?sig=2", submittedAt: "2026-09-24T00:20:00.000Z" },
  ],
};

function mount(path = "/learning-materials/7/submissions") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/learning-materials/:materialId/submissions" element={<MaterialSubmissions />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset());
  api.getMaterialSubmissions.mockResolvedValue(DATA);
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

describe("MaterialSubmissions page", () => {
  it("asks the API for the material in the URL and lists its students", async () => {
    api.getFileBlob.mockResolvedValue(new Blob(["x"], { type: "application/pdf" }));
    mount();

    expect(await screen.findByText("Number Tracing")).toBeTruthy();
    expect(api.getMaterialSubmissions).toHaveBeenCalledWith("7", expect.anything());
    expect(screen.getByLabelText("Preview Kurt Macaraeg's work")).toBeTruthy();
    expect(screen.getByLabelText("Preview Kenneth Alvarez's work")).toBeTruthy();
  });

  it("shows loading, then the first submission as a PDF preview", async () => {
    let resolveBlob;
    api.getFileBlob.mockReturnValue(new Promise((r) => { resolveBlob = r; }));
    mount();

    expect(await screen.findByText(/Please Wait/)).toBeTruthy();
    resolveBlob(new Blob(["x"], { type: "application/pdf" }));

    await waitFor(() => expect(screen.getByTitle("kurt.pdf").getAttribute("src")).toBe("blob:mock"));
    expect(api.getFileBlob).toHaveBeenCalledWith("https://api.test/api/files/a.pdf?sig=1", expect.anything());
  });

  it("selecting another student loads that student's file (an image here)", async () => {
    api.getFileBlob.mockResolvedValue(new Blob(["x"], { type: "image/png" }));
    mount();
    fireEvent.click(await screen.findByLabelText("Preview Kenneth Alvarez's work"));

    expect((await screen.findByAltText("kenneth.png")).getAttribute("src")).toBe("blob:mock");
    expect(api.getFileBlob).toHaveBeenLastCalledWith("https://api.test/api/files/b.png?sig=2", expect.anything());
  });

  it("shows 'File Missing' and disables Download/View File when the file is gone", async () => {
    api.getFileBlob.mockResolvedValue(null);
    mount();

    expect(await screen.findByText("File Missing")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Open actions for Kurt Macaraeg's work"));
    expect(screen.getByRole("menuitem", { name: /Download/ }).disabled).toBe(true);
    expect(screen.getByRole("menuitem", { name: /View File/ }).disabled).toBe(true);
  });

  it("shows an error state (not 'File Missing') when the download fails", async () => {
    api.getFileBlob.mockRejectedValue(new Error("network"));
    mount();
    expect(await screen.findByText(/Unable to load this file/)).toBeTruthy();
    expect(screen.queryByText("File Missing")).toBeNull();
  });

  it("View File opens the signed URL in a new tab without giving it access to the app", async () => {
    api.getFileBlob.mockResolvedValue(new Blob(["x"], { type: "application/pdf" }));
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    mount();

    await screen.findByTitle("kurt.pdf");
    fireEvent.click(screen.getByLabelText("Open actions for Kurt Macaraeg's work"));
    fireEvent.click(screen.getByRole("menuitem", { name: /View File/ }));

    expect(open).toHaveBeenCalledWith("https://api.test/api/files/a.pdf?sig=1", "_blank", "noopener,noreferrer");
  });

  it("closes the menu on an outside click and on Escape", async () => {
    api.getFileBlob.mockResolvedValue(new Blob(["x"], { type: "application/pdf" }));
    mount();
    await screen.findByTitle("kurt.pdf");

    const trigger = screen.getByLabelText("Open actions for Kurt Macaraeg's work");
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("shows an empty state when nobody has submitted work", async () => {
    api.getMaterialSubmissions.mockResolvedValue({ ...DATA, submissions: [] });
    mount();
    expect(await screen.findByText("No student works yet")).toBeTruthy();
    expect(api.getFileBlob).not.toHaveBeenCalled();
  });

  it("shows 'Material not found' on a 404", async () => {
    api.getMaterialSubmissions.mockRejectedValue(Object.assign(new Error("x"), { status: 404 }));
    mount();
    expect(await screen.findByText("Material not found")).toBeTruthy();
  });

  it("shows a generic error (no internals) on other failures", async () => {
    api.getMaterialSubmissions.mockRejectedValue(Object.assign(new Error("boom stack"), { status: 500 }));
    mount();
    expect(await screen.findByText("Unable to load student works. Please try again.")).toBeTruthy();
    expect(screen.queryByText(/boom/)).toBeNull();
  });
});
