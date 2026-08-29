import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { getStudentData } from "@data/mockData";

async function fetchStudentProfile(studentId) {
    const { data, usedMock } = await withMockFallback(
        () => apiClient.getStudent(studentId),
        getStudentData(studentId),
        { label: "studentProfile" },
    );
    return { profile: data ?? null, usedMock };
}

// Shared by the teacher StudentDetail page and the parent ParentStudentProfile
// page — both fetch the exact same student profile, so caching by studentId
// means switching between them (or re-visiting) doesn't refetch.
export function useStudentProfileQuery(studentId) {
    return useQuery({
        queryKey: ["studentProfile", studentId],
        queryFn: () => fetchStudentProfile(studentId),
        enabled: Boolean(studentId),
    });
}

export default useStudentProfileQuery;