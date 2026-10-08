import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const { default: AccountForm } = await import("@features/accounts/components/AccountForm.jsx");
const { getAssignableRoles } = await import("@features/accounts/utils/accountUtils.js");

const FORM = {
  firstName: "Maria", middleName: "", lastName: "Cruz", email: "maria@example.com",
  phone: "9171234567", address: "Angeles City", password: "", role: "Parent", studentIds: [],
};

function renderForm(props) {
  return render(
    <AccountForm
      formData={FORM}
      onChange={vi.fn()}
      onSubmit={(e) => e.preventDefault()}
      onCancel={() => {}}
      submitLabel="Save"
      loading={false}
      message={null}
      isEdit
      assignableRoles={["Parent", "Guardian", "Teacher"]}
      students={[]}
      {...props}
    />,
  );
}

afterEach(cleanup);

describe("AccountForm when the editor is not an Admin", () => {
  it("makes the email read-only and says why", () => {
    renderForm({ restrictedEdit: true });
    const email = screen.getByPlaceholderText("Email Address");
    expect(email.readOnly).toBe(true);
    expect(email.getAttribute("aria-describedby")).toBe("account-email-locked");
    expect(screen.getByText(/Only an Admin can change an account's email/)).toBeTruthy();
  });

  it("locks the role to the account's current role", () => {
    renderForm({ restrictedEdit: true });
    const role = document.querySelector('select[name="role"]');
    expect(role.disabled).toBe(true);
    expect([...role.options].map((o) => o.value)).toEqual(["Parent"]);
  });

  it("leaves both editable for an Admin (the default)", () => {
    renderForm({});
    expect(screen.getByPlaceholderText("Email Address").readOnly).toBe(false);
    expect(screen.queryByText(/Only an Admin can change/)).toBeNull();
    const role = document.querySelector('select[name="role"]');
    expect(role.disabled).toBe(false);
    expect([...role.options].map((o) => o.value)).toEqual(["Parent", "Guardian", "Teacher"]);
  });
});

describe("getAssignableRoles", () => {
  it("offers every role to an Admin and only Parent/Guardian to anyone else", () => {
    expect(getAssignableRoles("Admin")).toEqual(["Parent", "Guardian", "Teacher", "Admin"]);
    expect(getAssignableRoles("Teacher")).toEqual(["Parent", "Guardian"]);
    expect(getAssignableRoles(undefined)).toEqual(["Parent", "Guardian"]);
  });
});
