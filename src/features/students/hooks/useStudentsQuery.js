import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { getAllStudentsData } from "@data/mockData.js";
import { normalizeStudent } from "@utils/normalizeStudent.js";

async function fetchStudents() {
    const { data, usedMock } = await withMockFallback(
        () => apiClient.getStudents(),
        getAllStudentsData(),
        { label: "students" },
    );

    if (usedMock) {
        return {
            students: data.map(({ student, guardians }) => normalizeStudent(student, guardians)),
            usedMock: true,
        };
    }

    const list = Array.isArray(data) ? data : Array.isArray(data?.students) ? data.students : [];
    return { students: list.map((s) => normalizeStudent(s)), usedMock: false };
}

// Single cached query shared by every consumer of the students list
// (student roster, dashboard birthday widget, upload-work student picker),
// so switching between pages that all need this data doesn't refetch it.
export function useStudentsQuery() {
    return useQuery({
        queryKey: ["students"],
        queryFn: fetchStudents,
    });
}

export default useStudentsQuery;