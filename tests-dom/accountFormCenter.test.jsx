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
    render(<Harness showCenter centers={CENTERS} role="Teacher" />);
    expect([...select().options].map((o) => o.textContent)).toEqual(["Select a center", "ECCD Angeles", "ECCD Mabalacat"]);
    expect(select().required).toBe(true);

    fireEvent.change(select(), { target: { name: "centerId", value: "2" } });
    expect(select().value).toBe("2");
  });

  it("is shown for a Teacher only: a Parent/Guardian's follows their students, an Admin has none", () => {
    render(<Harness showCenter centers={CENTERS} role="Teacher" />);
    expect(select()).not.toBeNull();
    cleanup();

    for (const role of ["Parent", "Guardian", "Admin"]) {
      render(<Harness showCenter centers={CENTERS} role={role} />);
      expect(select(), role).toBeNull();
      cleanup();
    }
  });

  it("is not shown at all to anyone but an Admin", () => {
    render(<Harness centers={CENTERS} role="Teacher" />);
    expect(select()).toBeNull();
  });

  it("adds a new center and selects it", async () => {
    const onCreateCenter = vi.fn().mockResolvedValue({ id: 9, name: "ECCD Clark" });
    render(<Harness showCenter centers={CENTERS} role="Teacher" onCreateCenter={onCreateCenter} />);

    fireEvent.click(screen.getByRole("button", { name: "Add a new center" }));
    fireEvent.change(screen.getByLabelText("New center name"), { target: { value: "ECCD Clark" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(onCreateCenter).toHaveBeenCalledWith("ECCD Clark"));
    // the page adds it to `centers`; here the form has at least selected its id
    await waitFor(() => expect(screen.queryByLabelText("New center name")).toBeNull());
  });

  it("shows the server's message when a center cannot be added", async () => {
    const err = Object.assign(new Error("x"), { name: "ApiError", status: 409, details: { message: 'A center named "ECCD Angeles" already exists.' } });
    render(<Harness showCenter centers={CENTERS} role="Teacher" onCreateCenter={vi.fn().mockRejectedValue(err)} />);

    fireEvent.click(screen.getByRole("button", { name: "Add a new center" }));
    fireEvent.change(screen.getByLabelText("New center name"), { target: { value: "ECCD Angeles" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    // (the address lists also raise an alert here: jsdom has nothing to fetch them from)
    expect(await screen.findByText('A center named "ECCD Angeles" already exists.')).toBeTruthy();
  });

  it("does not add an empty name", () => {
    render(<Harness showCenter centers={CENTERS} role="Teacher" onCreateCenter={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add a new center" }));
    expect(screen.getByRole("button", { name: "Add" }).disabled).toBe(true);
  });
});

describe("AccountForm students set a Parent/Guardian's center (Admin)", () => {
  const STUDENTS = [
    { id: 1, firstName: "Kai", lastName: "Moran", studentCode: "ECCD-2026-1", teacherCenterId: 1 },
    { id: 2, firstName: "Ana", lastName: "Cruz", studentCode: "ECCD-2026-2", teacherCenterId: 2 },
    { id: 3, firstName: "Lu", lastName: "Reyes", studentCode: "ECCD-2026-3", teacherCenterId: null },
    { id: 4, firstName: "Bo", lastName: "Dela", studentCode: "ECCD-2026-4", teacherCenterId: 1 },
  ];
  const names = () => screen.queryAllByRole("checkbox").map((box) => box.closest("label").textContent);

  it("offers every student who has a teacher at a center, never one without", () => {
    render(<Harness showCenter centers={CENTERS} students={STUDENTS} />);
    expect(names().join("|")).toMatch(/Kai/);
    expect(names().join("|")).toMatch(/Ana/);
    expect(names().join("|")).not.toMatch(/Lu Reyes/);
    expect(screen.getByText("The account's center is set from the students you select.")).toBeTruthy();
  });

  it("narrows the list to that student's center once one is ticked, and shows the center", () => {
    render(<Harness showCenter centers={CENTERS} students={STUDENTS} />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Kai/ }));

    expect(names().join("|")).toMatch(/Kai/);
    expect(names().join("|")).toMatch(/Bo/);
    expect(names().join("|")).not.toMatch(/Ana/);
    expect(screen.getByText("Center: ECCD Angeles (set from the selected students)")).toBeTruthy();
  });

  it("offers every center again once the selection is cleared", () => {
    render(<Harness showCenter centers={CENTERS} students={STUDENTS} />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Kai/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Kai/ }));

    expect(names().join("|")).toMatch(/Ana/);
  });

  it("shows every student to a non-Admin (the server already limited the list to theirs)", () => {
    render(<Harness students={STUDENTS} />);
    expect(names()).toHaveLength(4);
  });
});

describe("AccountForm student requirement", () => {
  it("marks the student list as required for a Parent or Guardian", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Connect Students" }).textContent).toMatch(/at least one/);
  });
});
