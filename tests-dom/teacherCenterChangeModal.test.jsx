import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

const { default: TeacherCenterChangeModal } = await import(
  "@features/accounts/components/TeacherCenterChangeModal.jsx"
);

const TEACHERS = [
  { id: 6, firstName: "Ana", lastName: "Reyes", role: "Teacher", centerId: 1 },
  { id: 8, firstName: "Bo", lastName: "Dela", role: "Teacher", centerId: 1 },
];

function setup(props = {}) {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <TeacherCenterChangeModal
      teacherName="Mia Santos"
      enrolled={3}
      oldCenterName="ECCD Angeles"
      newCenterName="ECCD Mabalacat"
      candidates={TEACHERS}
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />,
  );
  return { onConfirm, onClose };
}

const confirm = () => screen.getByRole("button", { name: "Confirm Update" });

afterEach(cleanup);

describe("TeacherCenterChangeModal", () => {
  it("names the teacher, both centers and the number of students, with nothing preselected", () => {
    setup();
    const text = screen.getByRole("dialog").textContent;
    expect(text).toMatch(/Mia Santos/);
    expect(text).toMatch(/ECCD Angeles/);
    expect(text).toMatch(/ECCD Mabalacat/);
    expect(text).toMatch(/3 enrolled students/);
    expect(screen.getAllByRole("radio").every((radio) => !radio.checked)).toBe(true);
    expect(confirm().disabled).toBe(true);
  });

  it("confirms 'stay with this teacher'", () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByRole("radio", { name: /Stay with this teacher/ }));
    fireEvent.click(confirm());
    expect(onConfirm).toHaveBeenCalledWith({ studentAction: "move", newTeacherId: "" });
  });

  it("asks for the new teacher when transferring, and only offers the given candidates", () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByRole("radio", { name: /Transfer to another teacher/ }));

    const select = screen.getByLabelText("New teacher");
    expect([...select.options].map((o) => o.textContent)).toEqual(["Select a teacher", "Reyes, Ana", "Dela, Bo"]);
    expect(confirm().disabled).toBe(true);

    fireEvent.change(select, { target: { value: "8" } });
    fireEvent.click(confirm());
    expect(onConfirm).toHaveBeenCalledWith({ studentAction: "transfer", newTeacherId: "8" });
  });

  it("blocks the transfer option when no other teacher is at the current center", () => {
    const { onConfirm } = setup({ candidates: [] });
    const transfer = screen.getByRole("radio", { name: /Transfer to another teacher/ });

    expect(transfer.disabled).toBe(true);
    expect(screen.getByRole("dialog").textContent).toMatch(/no other active teacher at ECCD Angeles/);

    fireEvent.click(transfer);
    expect(confirm().disabled).toBe(true);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("closes from Cancel and from Escape, unless it is saving", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);

    cleanup();
    const busy = setup({ loading: true });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(busy.onClose).not.toHaveBeenCalled();
  });

  it("says 'student' for one", () => {
    setup({ enrolled: 1 });
    expect(screen.getByRole("dialog").textContent).toMatch(/1 enrolled student\./);
  });
});
