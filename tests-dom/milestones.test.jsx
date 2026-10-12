import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const { default: MilestonesCard } = await import("@features/dashboard/components/MilestonesCard.jsx");
const { isNewMilestone } = await import("@features/dashboard/utils/milestones.js");
const { default: WeeklyGoalsCard } = await import("@features/dashboard/components/WeeklyGoalsCard.jsx");

afterEach(cleanup);

describe("MilestonesCard", () => {
  it("lists each completed goal with its category and week", () => {
    render(
      <MilestonesCard
        childName="Ana"
        total={2}
        milestones={[
          { id: 1, title: "Counting to 10", category: "Numeracy", weekStart: "2026-10-05" },
          { id: 2, title: "Shapes", category: null, weekStart: "2026-09-28" },
        ]}
      />,
    );
    expect(screen.getByText("Counting to 10")).toBeTruthy();
    expect(screen.getByText("Numeracy · Week of Oct 5, 2026")).toBeTruthy();
    expect(screen.getByText("Week of Sep 28, 2026")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Milestones Reached" })).toBeTruthy();
  });

  it("explains an empty list", () => {
    render(<MilestonesCard milestones={[]} />);
    expect(screen.getByText(/no milestones yet/i)).toBeTruthy();
  });

  it("says when only the most recent are shown", () => {
    render(<MilestonesCard total={80} milestones={[{ id: 1, title: "A", category: null, weekStart: "2026-10-05" }]} />);
    expect(screen.getByText(/most recent of 80 milestones/i)).toBeTruthy();
  });

  it("badges only goals from the last two weeks as New", () => {
    const now = new Date("2026-10-12T04:00:00.000Z");
    expect(isNewMilestone("2026-10-05", now)).toBe(true);
    expect(isNewMilestone("2026-09-28", now)).toBe(false); // two weeks and a few hours ago
    expect(isNewMilestone("2026-09-21", now)).toBe(false);
    expect(isNewMilestone("nonsense", now)).toBe(false);
  });
});

describe("WeeklyGoalsCard", () => {
  it("says the goals are achieved when all of this week's goals moved to milestones", () => {
    render(<WeeklyGoalsCard goals={[]} totalGoals={3} />);
    expect(screen.getByText(/all of this week's goals are achieved/i)).toBeTruthy();
  });

  it("says no goals are set when there were none", () => {
    render(<WeeklyGoalsCard goals={[]} totalGoals={0} />);
    expect(screen.getByText(/no goals have been set/i)).toBeTruthy();
  });

  it("still lists unfinished goals", () => {
    render(<WeeklyGoalsCard goals={[{ id: 1, title: "Fine motor", progress: 60, status: "In progress" }]} totalGoals={2} />);
    expect(screen.getByText("Fine motor")).toBeTruthy();
    expect(screen.queryByText(/achieved/i)).toBeNull();
  });
});
