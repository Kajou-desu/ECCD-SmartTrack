import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { normalizeStudent } from "@utils/normalizeStudent.js";

async function fetchStudents() {
    const data = await apiClient.getStudents();
    const list = Array.isArray(data) ? data : Array.isArray(data?.students) ? data.students : [];
    return { students: list.map((s) => normalizeStudent(s)) };
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