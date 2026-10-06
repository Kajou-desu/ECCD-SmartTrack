import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const downloadCsv = vi.fn();
vi.mock("@utils/exportCsv.js", async (importOriginal) => ({
  ...(await importOriginal()),
  downloadCsv,
}));

const students = [
  { id: 1, studentCode: "ECCD-2026-1", name: "Ana Cruz", birthday: "2021-05-01", gender: "prefer_not_to_say",
    session: "morning", status: "active", guardianName: "Mia Cruz", guardianPhone: "09171234567", address: "Angeles" },
  { id: 2, studentCode: "ECCD-2026-2", name: "Ben Reyes", birthday: "2020-01-09", gender: "male",
    session: "afternoon", status: "inactive", guardianName: "Lou Reyes", guardianPhone: "09179999999", address: "Mabalacat" },
];
// Same object every render so the hook's useMemo on `data` stays stable.
const queryResult = { data: { students }, isLoading: false, isError: false, refetch: vi.fn() };
vi.mock("@features/students/hooks/useStudentsQuery.js", () => ({
  useStudentsQuery: () => queryResult,
}));

const { default: useStudents } = await import("@features/students/hooks/useStudents.js");

beforeEach(() => downloadCsv.mockClear());

describe("student export", () => {
  it("exports the filter in the search box right now, not the debounced one the table shows", () => {
    const { result } = renderHook(() => useStudents());
    act(() => result.current.setSearchTerm("Ben"));
    // No timers advanced: the debounced term (and the table) still show everyone.
    expect(result.current.filteredStudents).toHaveLength(2);

    act(() => result.current.handleExport());

    const rows = downloadCsv.mock.calls[0][2];
    expect(rows).toHaveLength(1);
    expect(rows[0][1]).toBe("Ben Reyes");
  });

  it("includes the student code and birthday, and readable labels", () => {
    const { result } = renderHook(() => useStudents());
    act(() => result.current.handleExport());

    const [filename, headers, rows] = downloadCsv.mock.calls[0];
    expect(filename).toMatch(/^students-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(headers.slice(0, 3)).toEqual(["Student Code", "Name", "Birthday"]);
    expect(rows[0].slice(0, 6)).toEqual([
      "ECCD-2026-1", "Ana Cruz", "2021-05-01", "Morning", "Prefer not to say", "Mia Cruz",
    ]);
    expect(rows[0][8]).toBe("Active");
    expect(rows[1][3]).toBe("Afternoon");
    expect(rows[1][8]).toBe("Inactive");
    // Phone goes through csvText so Excel keeps the leading zero.
    expect(rows[0][6]).toEqual({ csvText: "09171234567" });
  });
});
