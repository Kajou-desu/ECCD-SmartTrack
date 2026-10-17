import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

const { default: GradeGoalModal } = await import("@features/weeklyGoals/components/GradeGoalModal.jsx");

const goal = {
  title: "Counting to 10",
  students: [
    { studentId: 1, name: "Ana Cruz", progress: 40, status: "In progress" },
    { studentId: 2, name: "Ben Lim", progress: 100, status: "Mastered" },
  ],
};

afterEach(cleanup);

describe("GradeGoalModal — Mastered means 100%", () => {
  it("choosing Mastered moves the student to 100%", () => {
    render(<GradeGoalModal goal={goal} onCancel={() => {}} onConfirm={() => {}} />);
    fireEvent.change(screen.getByLabelText("Ana Cruz status"), { target: { value: "Mastered" } });
    expect(screen.getByLabelText("Ana Cruz progress percent").value).toBe("100");
  });

  it("lowering a Mastered student's progress takes them off Mastered", () => {
    render(<GradeGoalModal goal={goal} onCancel={() => {}} onConfirm={() => {}} />);
    fireEvent.change(screen.getByLabelText("Ben Lim progress percent"), { target: { value: "80" } });
    expect(screen.getByLabelText("Ben Lim status").value).toBe("In progress");
  });

  it("other statuses leave progress alone, and the saved rows carry both values", () => {
    const onConfirm = vi.fn();
    render(<GradeGoalModal goal={goal} onCancel={() => {}} onConfirm={onConfirm} />);
    fireEvent.change(screen.getByLabelText("Ana Cruz status"), { target: { value: "Almost there" } });
    expect(screen.getByLabelText("Ana Cruz progress percent").value).toBe("40");
    fireEvent.click(screen.getByRole("button", { name: /save progress/i }));
    expect(onConfirm).toHaveBeenCalledWith([
      { studentId: 1, progress: 40, status: "Almost there" },
      { studentId: 2, progress: 100, status: "Mastered" },
    ]);
  });
});
