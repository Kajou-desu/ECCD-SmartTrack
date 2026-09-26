import { useState } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

const { default: AccountForm } = await import("@features/accounts/components/AccountForm.jsx");

const STUDENTS = [
  { id: 1, firstName: "Juan", lastName: "Dela Cruz", studentCode: "ECCD-2026-1" },
  { id: 2, firstName: "Ana", lastName: "Dela Cruz", studentCode: "ECCD-2026-2" },
  { id: 3, firstName: "Pedro", lastName: "Santos", studentCode: "ECCD-2026-3" },
];

const BASE = {
  firstName: "Maria", middleName: "", lastName: "Dela Cruz", email: "maria@example.com",
  phone: "09171234567", address: "Angeles City", password: "", role: "Parent", studentIds: [],
};

// Mirrors how AccountManagement feeds the form: onChange receives {target:{name,value}}.
function Harness({ initial = [], role = "Parent", onSubmit = vi.fn() }) {
  const [form, setForm] = useState({ ...BASE, role, studentIds: initial });
  return (
    <AccountForm
      formData={form}
      onChange={(event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))}
      onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}
      onCancel={() => {}}
      submitLabel="Save"
      loading={false}
      message={null}
      isEdit
      assignableRoles={["Parent", "Guardian", "Teacher"]}
      students={STUDENTS}
    />
  );
}

afterEach(cleanup);

const box = (name) => screen.getByRole("checkbox", { name: new RegExp(name) });

describe("AccountForm student picker", () => {
  it("lets one account be connected to several students", () => {
    render(<Harness />);
    fireEvent.click(box("Juan Dela Cruz"));
    fireEvent.click(box("Ana Dela Cruz"));

    expect(box("Juan Dela Cruz").checked).toBe(true);
    expect(box("Ana Dela Cruz").checked).toBe(true);
    expect(box("Pedro Santos").checked).toBe(false);
    expect(screen.getByText("2 selected")).toBeTruthy();
  });

  it("shows every existing link as checked when editing (ids arrive as numbers)", () => {
    render(<Harness initial={[1, 3]} />);
    expect(box("Juan Dela Cruz").checked).toBe(true);
    expect(box("Pedro Santos").checked).toBe(true);
    expect(box("Ana Dela Cruz").checked).toBe(false);
  });

  it("unchecking removes only that student", () => {
    render(<Harness initial={[1, 2]} />);
    fireEvent.click(box("Juan Dela Cruz"));
    expect(box("Juan Dela Cruz").checked).toBe(false);
    expect(box("Ana Dela Cruz").checked).toBe(true);
  });

  it("submits the full array of selected ids", () => {
    const onSubmit = vi.fn();
    render(<Harness initial={[1]} onSubmit={onSubmit} />);
    fireEvent.click(box("Pedro Santos"));
    fireEvent.click(screen.getByText("Save"));

    expect(onSubmit.mock.calls[0][0].studentIds).toEqual([1, 3]);
  });

  it("filters by name or code without dropping hidden selections", () => {
    const onSubmit = vi.fn();
    render(<Harness initial={[1]} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("Search students"), { target: { value: "pedro" } });

    expect(screen.queryByRole("checkbox", { name: /Juan Dela Cruz/ })).toBeNull();
    fireEvent.click(box("Pedro Santos"));
    fireEvent.click(screen.getByText("Save"));

    expect(onSubmit.mock.calls[0][0].studentIds).toEqual([1, 3]);
  });

  it("says so when the search matches nothing", () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Search students"), { target: { value: "zzz" } });
    expect(screen.getByText("No students found.")).toBeTruthy();
  });

  it("does not submit the form when Enter is pressed in the search box", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const search = screen.getByLabelText("Search students");
    // fireEvent returns false when preventDefault() was called.
    expect(fireEvent.keyDown(search, { key: "Enter" })).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("groups the checkboxes under a labelled fieldset", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Connect Students" })).toBeTruthy();
  });

  it("is hidden for roles that cannot be connected to students", () => {
    render(<Harness role="Teacher" />);
    expect(screen.queryByRole("group", { name: "Connect Students" })).toBeNull();
  });

  it("clears the selection when the role changes away from Parent/Guardian", () => {
    const onSubmit = vi.fn();
    render(<Harness initial={[1, 2]} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/System Role/i), { target: { value: "Teacher" } });
    fireEvent.click(screen.getByText("Save"));

    // Otherwise a stale, non-empty studentIds rides along on this same
    // submit and the backend rejects it: "Only Parent or Guardian accounts
    // can be connected to students".
    expect(onSubmit.mock.calls[0][0].studentIds).toEqual([]);
  });
});
