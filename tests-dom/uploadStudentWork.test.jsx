import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getStudents: vi.fn(),
  submitStudentWork: vi.fn(),
}));
vi.mock("@api/client.js", () => ({ apiClient: api }));

const { default: UploadStudentWork } = await import(
  "@features/materials/components/UploadStudentWork.jsx"
);

beforeEach(() => {
  Object.values(api).forEach((method) => method.mockReset());
  api.getStudents.mockResolvedValue({
    students: [{ id: 123, firstName: "Ava", lastName: "Santos", name: "Ava Santos" }],
  });
});
afterEach(cleanup);

describe("UploadStudentWork student picker", () => {
  it("matches a numeric student ID without throwing", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <UploadStudentWork material={{ id: 7, title: "Number Tracing" }} />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("From Student *"), {
      target: { value: "123" },
    });

    expect(await screen.findByRole("option")).toBeTruthy();
    expect(screen.getByText("Student ID: 123")).toBeTruthy();
  });
});

describe("UploadStudentWork when the student already uploaded", () => {
  const exists = () =>
    Object.assign(new Error("x"), {
      name: "ApiError",
      status: 409,
      details: { code: "SUBMISSION_EXISTS", message: "This student has already uploaded work for this material." },
    });

  async function fillAndSubmit(onSuccess = vi.fn()) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <UploadStudentWork material={{ id: 7, title: "Number Tracing" }} onClose={() => {}} onSuccess={onSuccess} />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText("From Student *"), { target: { value: "123" } });
    fireEvent.click(await screen.findByRole("option"));
    const file = new File(["x"], "new.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Completed Material *"), { target: { files: [file] } });
    fireEvent.submit(screen.getByRole("button", { name: /Upload Work/ }).closest("form"));
    return onSuccess;
  }

  it("uploads straight away, without asking, when there is no earlier work", async () => {
    api.submitStudentWork.mockResolvedValue({ id: 1 });
    const onSuccess = await fillAndSubmit();
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.submitStudentWork).toHaveBeenCalledTimes(1);
    expect(api.submitStudentWork).toHaveBeenCalledWith(expect.objectContaining({ replace: false }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("asks before replacing, and only replaces after the teacher agrees", async () => {
    api.submitStudentWork.mockRejectedValueOnce(exists()).mockResolvedValueOnce({ id: 2 });
    const onSuccess = await fillAndSubmit();

    expect(await screen.findByRole("alertdialog")).toBeTruthy();
    expect(screen.getByText(/already uploaded work for this material/)).toBeTruthy();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(api.submitStudentWork).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.submitStudentWork).toHaveBeenLastCalledWith(expect.objectContaining({ replace: true }));
  });

  it("Keep existing dismisses the question and uploads nothing more", async () => {
    api.submitStudentWork.mockRejectedValueOnce(exists());
    const onSuccess = await fillAndSubmit();

    fireEvent.click(await screen.findByRole("button", { name: "Keep existing" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(api.submitStudentWork).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("other errors still show as errors, not as a replace question", async () => {
    api.submitStudentWork.mockRejectedValueOnce(
      Object.assign(new Error("x"), { name: "ApiError", status: 400, details: { message: "file required" } }),
    );
    await fillAndSubmit();
    expect(await screen.findByText("file required")).toBeTruthy();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
