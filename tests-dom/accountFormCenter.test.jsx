import { useState } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

const { default: AccountForm } = await import("@features/accounts/components/AccountForm.jsx");

const CENTERS = [{ id: 1, name: "ECCD Angeles" }, { id: 2, name: "ECCD Mabalacat" }];
const BASE = {
  firstName: "Maria", middleName: "", lastName: "Dela Cruz", email: "maria@example.com", phone: "9171234567",
  address: "", addressProvince: "", addressMunicipality: "", addressBarangay: "", addressDetails: "",
  password: "", role: "Parent", studentIds: [], centerId: "",
};

function Harness({ role = "Parent", onSubmit = vi.fn(), ...props }) {
  const [form, setForm] = useState({ ...BASE, role });
  return (
    <AccountForm
      formData={form}
      onChange={(event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))}
      onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}
      onCancel={() => {}}
      submitLabel="Save"
      loading={false}
      message={null}
      assignableRoles={["Parent", "Guardian", "Teacher", "Admin"]}
      students={[]}
      {...props}
    />
  );
}

afterEach(cleanup);

const select = () => document.querySelector('select[name="centerId"]');

describe("AccountForm center (Admin)", () => {
  it("lists the centers and lets the Admin pick one", () => {
    render(<Harness showCenter centers={CENTERS} />);
    expect([...select().options].map((o) => o.textContent)).toEqual(["Select a center", "ECCD Angeles", "ECCD Mabalacat"]);
    expect(select().required).toBe(true);

    fireEvent.change(select(), { target: { name: "centerId", value: "2" } });
    expect(select().value).toBe("2");
  });

  it("is shown for Parent, Guardian and Teacher, but not for an Admin account", () => {
    for (const role of ["Parent", "Guardian", "Teacher"]) {
      render(<Harness showCenter centers={CENTERS} role={role} />);
      expect(select(), role).not.toBeNull();
      cleanup();
    }
    render(<Harness showCenter centers={CENTERS} role="Admin" />);
    expect(select()).toBeNull();
  });

  it("is not shown at all to anyone but an Admin", () => {
    render(<Harness centers={CENTERS} />);
    expect(select()).toBeNull();
  });

  it("adds a new center and selects it", async () => {
    const onCreateCenter = vi.fn().mockResolvedValue({ id: 9, name: "ECCD Clark" });
    render(<Harness showCenter centers={CENTERS} onCreateCenter={onCreateCenter} />);

    fireEvent.click(screen.getByRole("button", { name: "Add a new center" }));
    fireEvent.change(screen.getByLabelText("New center name"), { target: { value: "ECCD Clark" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(onCreateCenter).toHaveBeenCalledWith("ECCD Clark"));
    // the page adds it to `centers`; here the form has at least selected its id
    await waitFor(() => expect(screen.queryByLabelText("New center name")).toBeNull());
  });

  it("shows the server's message when a center cannot be added", async () => {
    const err = Object.assign(new Error("x"), { name: "ApiError", status: 409, details: { message: 'A center named "ECCD Angeles" already exists.' } });
    render(<Harness showCenter centers={CENTERS} onCreateCenter={vi.fn().mockRejectedValue(err)} />);

    fireEvent.click(screen.getByRole("button", { name: "Add a new center" }));
    fireEvent.change(screen.getByLabelText("New center name"), { target: { value: "ECCD Angeles" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    // (the address lists also raise an alert here: jsdom has nothing to fetch them from)
    expect(await screen.findByText('A center named "ECCD Angeles" already exists.')).toBeTruthy();
  });

  it("does not add an empty name", () => {
    render(<Harness showCenter centers={CENTERS} onCreateCenter={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add a new center" }));
    expect(screen.getByRole("button", { name: "Add" }).disabled).toBe(true);
  });
});

describe("AccountForm student list follows the chosen center (Admin)", () => {
  const STUDENTS = [
    { id: 1, firstName: "Kai", lastName: "Moran", studentCode: "ECCD-2026-1", teacherCenterId: 1 },
    { id: 2, firstName: "Ana", lastName: "Cruz", studentCode: "ECCD-2026-2", teacherCenterId: 2 },
    { id: 3, firstName: "Lu", lastName: "Reyes", studentCode: "ECCD-2026-3", teacherCenterId: null },
  ];
  const names = () => screen.queryAllByRole("checkbox").map((box) => box.closest("label").textContent);

  it("offers no students until a center is chosen", () => {
    render(<Harness showCenter centers={CENTERS} students={STUDENTS} />);
    expect(names()).toEqual([]);
    expect(screen.getByText("Choose a center to see its students.")).toBeTruthy();
  });

  it("offers only the chosen center's students, never ones without a teacher", () => {
    render(<Harness showCenter centers={CENTERS} students={STUDENTS} />);
    fireEvent.change(select(), { target: { name: "centerId", value: "1" } });
    expect(names().join("|")).toMatch(/Kai/);
    expect(names().join("|")).not.toMatch(/Ana|Lu Reyes/);

    fireEvent.change(select(), { target: { name: "centerId", value: "2" } });
    expect(names().join("|")).toMatch(/Ana/);
    expect(names().join("|")).not.toMatch(/Kai/);
  });

  it("drops the selection when another center is chosen, but keeps it for the same one", () => {
    render(<Harness showCenter centers={CENTERS} students={STUDENTS} />);
    fireEvent.change(select(), { target: { name: "centerId", value: "1" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Kai/ }));
    expect(screen.getByText("1 selected")).toBeTruthy();

    fireEvent.change(select(), { target: { name: "centerId", value: "1" } });
    expect(screen.getByText("1 selected")).toBeTruthy();

    fireEvent.change(select(), { target: { name: "centerId", value: "2" } });
    expect(screen.getByText("0 selected")).toBeTruthy();
  });

  it("shows every student to a non-Admin (the server already limited the list to theirs)", () => {
    render(<Harness students={STUDENTS} />);
    expect(names()).toHaveLength(3);
  });
});

describe("AccountForm student requirement", () => {
  it("marks the student list as required for a Parent or Guardian", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Connect Students" }).textContent).toMatch(/at least one/);
  });
});
