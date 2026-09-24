import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchStudentProfile(studentId) {
    const response = await apiClient.getStudent(studentId);
    const data = response?.data ?? response;

    if (!data) return { profile: null };
    if (data.student) return { profile: data };

    return { profile: { student: data } };
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