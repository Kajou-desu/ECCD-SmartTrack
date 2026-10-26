import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mocks = vi.hoisted(() => {
  const parent = {
    id: 5, role: "Parent", firstName: "Maria", lastName: "Dela Cruz", email: "maria@example.com",
    phone: "9171234567", address: "Balibago, Angeles City, Pampanga", studentIds: [],
  };
  return {
    parent,
    accounts: {
      accounts: [parent],
      groupedAccounts: { admins: [], teachers: [], guardians: [], parents: [parent] },
      loading: false, mutating: false, error: "", retry: vi.fn(),
      createAccount: vi.fn(), updateAccount: vi.fn(), deleteAccount: vi.fn(),
    },
  };
});

vi.mock("@api/client.js", () => ({ apiClient: { getCenters: vi.fn().mockResolvedValue([]), createCenter: vi.fn() } }));
vi.mock("@hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 1, role: "Admin" } }) }));
vi.mock("@features/accounts/hooks/useAccounts", () => ({ default: () => mocks.accounts }));
vi.mock("@features/students/hooks/useStudentsQuery.js", () => ({ useStudentsQuery: () => ({ data: { students: [] } }) }));

const { default: AccountManagement } = await import("@pages/AccountManagement.jsx");
const { default: AccountFormModal } = await import("@features/accounts/components/AccountFormModal.jsx");

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AccountManagement />
    </QueryClientProvider>,
  );

afterEach(cleanup);

describe("AccountManagement add/edit form is a popup", () => {
  it("shows no form until New Account is clicked, then opens it in a dialog", () => {
    renderPage();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.querySelector("form")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /New Account/ }));

    const dialog = screen.getByRole("dialog", { name: "New Account" });
    expect(dialog.querySelector("form")).not.toBeNull();
    expect(within(dialog).getByRole("button", { name: "Create Account" })).toBeTruthy();
    // the form lives only inside the dialog, never inline on the page
    expect(document.querySelectorAll("form")).toHaveLength(1);
  });

  it("closes with Cancel, the close button, and Escape", () => {
    renderPage();
    for (const close of [
      () => fireEvent.click(screen.getByRole("button", { name: "Cancel" })),
      () => fireEvent.click(screen.getByRole("button", { name: "Close modal" })),
      () => fireEvent.keyDown(document, { key: "Escape" }),
    ]) {
      fireEvent.click(screen.getByRole("button", { name: /New Account/ }));
      expect(screen.getByRole("dialog")).toBeTruthy();
      close();
      expect(screen.queryByRole("dialog")).toBeNull();
    }
  });

  it("opens Edit in a dialog titled with the account, prefilled", () => {
    renderPage();
    fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);

    const dialog = screen.getByRole("dialog", { name: "Edit Account" });
    expect(within(dialog).getByText("Dela Cruz, Maria")).toBeTruthy();
    expect(dialog.querySelector('input[name="email"]').value).toBe("maria@example.com");
    expect(within(dialog).getByRole("button", { name: "Review Update" })).toBeTruthy();
  });
});

describe("AccountFormModal", () => {
  it("can't be closed while a save is running", () => {
    const onClose = vi.fn();
    render(<AccountFormModal title="T" onClose={onClose} disabled><form /></AccountFormModal>);

    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(screen.getByRole("presentation"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores Escape when told to (a confirmation popup is on top)", () => {
    const onClose = vi.fn();
    render(<AccountFormModal title="T" onClose={onClose} closeOnEscape={false}><form /></AccountFormModal>);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
