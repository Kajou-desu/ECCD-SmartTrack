import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  getStudentTransfers: vi.fn(),
  getTransferTeachers: vi.fn(),
  createStudentTransfer: vi.fn(),
  answerStudentTransfer: vi.fn(),
}));
const toast = vi.hoisted(() => vi.fn());
vi.mock("@api/client.js", () => ({ apiClient: api }));
vi.mock("@hooks/useToast.js", () => ({ useToast: () => toast }));

const { default: TransferStudentModal } = await import("@features/transfers/components/TransferStudentModal.jsx");
const { default: TransfersPanel } = await import("@features/transfers/components/TransfersPanel.jsx");

const STUDENT = { id: 5, name: "Ana Cruz", teacherId: 10, teacher: "Ann", session: "morning" };
const TEACHERS = [
  { id: 10, name: "Ann", centerId: 1, centerName: "North" },
  { id: 11, name: "Cora", centerId: 1, centerName: "North" },
  { id: 20, name: "Dina", centerId: 2, centerName: "South" },
];
const row = (over = {}) => ({
  id: 7, status: "pending", student: { id: 5, name: "Ana Cruz" },
  fromTeacher: { id: 10, name: "Ann", centerName: "North" }, toTeacher: { id: 20, name: "Dina", centerName: "South" },
  fromSession: "morning", toSession: "morning", ...over,
});

function mount(ui) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  toast.mockReset();
  api.getTransferTeachers.mockResolvedValue(TEACHERS);
  api.getStudentTransfers.mockResolvedValue({ incoming: [], outgoing: [] });
});
afterEach(cleanup);

describe("TransferStudentModal", () => {
  const open = (props = {}) => mount(<TransferStudentModal student={STUDENT} studentCenterId={1} onClose={vi.fn()} {...props} />);
  const submitButton = () => screen.getByRole("button", { name: /Transfer student|Send request/ });

  it("can't be sent until something changes", async () => {
    open();
    await screen.findByRole("option", { name: "Cora — North" });
    expect(submitButton().disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("Afternoon"));
    expect(submitButton().disabled).toBe(false);
  });

  it("lists the other teachers, not the one the student already has", async () => {
    open();
    await screen.findByRole("option", { name: "Dina — South" });
    expect(screen.queryByRole("option", { name: "Ann — North" })).toBeNull();
    expect(screen.getByRole("option", { name: "Keep Ann" })).toBeTruthy();
  });

  it("a session change applies at once and sends only the session", async () => {
    api.createStudentTransfer.mockResolvedValue({ status: "accepted", toTeacher: { name: "Ann" } });
    const onClose = vi.fn();
    open({ onClose });
    await screen.findByRole("option", { name: "Cora — North" });
    fireEvent.click(screen.getByLabelText("Afternoon"));
    expect(screen.getByText("This takes effect right away.")).toBeTruthy();
    fireEvent.click(submitButton());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.createStudentTransfer).toHaveBeenCalledWith({ studentId: 5, toSession: "afternoon" });
    expect(toast).toHaveBeenCalledWith("success", "Ana Cruz was moved.");
  });

  it("a teacher at another center warns that they must accept first, and the student stays meanwhile", async () => {
    api.createStudentTransfer.mockResolvedValue({ status: "pending", toTeacher: { name: "Dina" } });
    open();
    await screen.findByRole("option", { name: "Dina — South" });
    fireEvent.change(screen.getByLabelText("Teacher"), { target: { value: "20" } });
    expect(screen.getByText(/Dina \(South\) has to accept first/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));
    await waitFor(() => expect(api.createStudentTransfer).toHaveBeenCalledWith({ studentId: 5, toTeacherId: 20 }));
    expect(toast).toHaveBeenCalledWith("success", expect.stringContaining("stays with you until it is accepted"));
  });

  it("keeps the dialog open and shows a message when the server refuses", async () => {
    api.createStudentTransfer.mockRejectedValue(Object.assign(new Error("x"), { name: "ApiError", status: 409, details: { message: "There is already a transfer waiting for this student" } }));
    const onClose = vi.fn();
    open({ onClose });
    await screen.findByRole("option", { name: "Cora — North" });
    fireEvent.click(screen.getByLabelText("Afternoon"));
    fireEvent.click(submitButton());
    await waitFor(() => expect(toast).toHaveBeenCalledWith("error", "There is already a transfer waiting for this student"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("doesn't send twice on a double click", async () => {
    let resolve;
    api.createStudentTransfer.mockReturnValue(new Promise((r) => { resolve = r; }));
    open();
    await screen.findByRole("option", { name: "Cora — North" });
    fireEvent.click(screen.getByLabelText("Afternoon"));
    fireEvent.click(submitButton());
    fireEvent.click(submitButton());
    expect(api.createStudentTransfer).toHaveBeenCalledTimes(1);
    resolve({ status: "accepted", toTeacher: { name: "Ann" } });
  });
});

describe("TransfersPanel", () => {
  it("shows nothing when nothing is pending", async () => {
    const { container } = mount(<TransfersPanel />);
    await waitFor(() => expect(api.getStudentTransfers).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  it("lets the receiving teacher accept or decline, and the requester cancel", async () => {
    api.getStudentTransfers.mockResolvedValue({ incoming: [row()], outgoing: [row({ id: 8, student: { id: 6, name: "Ben Reyes" } })] });
    api.answerStudentTransfer.mockResolvedValue({});
    mount(<TransfersPanel />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept Ana Cruz" }));
    await waitFor(() => expect(api.answerStudentTransfer).toHaveBeenCalledWith(7, "accept"));
    expect(toast).toHaveBeenCalledWith("success", expect.stringContaining("accepted"));

    fireEvent.click(screen.getByRole("button", { name: "Decline Ana Cruz" }));
    await waitFor(() => expect(api.answerStudentTransfer).toHaveBeenCalledWith(7, "decline"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel the request for Ben Reyes" }));
    await waitFor(() => expect(api.answerStudentTransfer).toHaveBeenCalledWith(8, "cancel"));
  });

  it("says who asked, with their center", async () => {
    api.getStudentTransfers.mockResolvedValue({ incoming: [row()], outgoing: [] });
    mount(<TransfersPanel />);
    expect(await screen.findByText("Asked by Ann (North)")).toBeTruthy();
    expect(screen.getByText("Ana Cruz: to Dina (South)")).toBeTruthy();
  });

  it("shows a message and no crash when answering fails", async () => {
    api.getStudentTransfers.mockResolvedValue({ incoming: [row()], outgoing: [] });
    api.answerStudentTransfer.mockRejectedValue(Object.assign(new Error("x"), { name: "ApiError", status: 409, details: { message: "This transfer has already been dealt with" } }));
    mount(<TransfersPanel />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept Ana Cruz" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith("error", "This transfer has already been dealt with"));
  });
});
