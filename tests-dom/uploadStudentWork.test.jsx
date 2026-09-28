import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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