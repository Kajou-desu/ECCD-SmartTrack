import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchStudentProfile(studentId) {
    const response = await apiClient.getStudent(studentId);
    const data = response?.data ?? response;

    if (!data) return { profile: null };
    if (data.student) return { profile: data };

    const guardians = [
        {
            id: `${data.id}-mother`,
            type: "Mother",
            name: data.motherName,
            phone: data.motherPhone,
            email: data.motherEmail,
            address: data.motherAddress,
            isPrimary: Boolean(data.motherName),
        },
        {
            id: `${data.id}-father`,
            type: "Father",
            name: data.fatherName,
            phone: data.fatherPhone,
            email: data.fatherEmail,
            address: data.fatherAddress,
            isPrimary: !data.motherName && Boolean(data.fatherName),
        },
        {
            id: `${data.id}-guardian`,
            type: "Legal Guardian",
            name: data.guardianName,
            phone: data.guardianPhone,
            email: data.guardianEmail,
            address: data.guardianAddress,
            isPrimary: !data.motherName && !data.fatherName && Boolean(data.guardianName),
        },
    ].filter((guardian) => guardian.name);

    const toList = (value) => (value || "").split("\n").map((item) => item.trim()).filter(Boolean);

    return {
        profile: {
            student: data,
            guardians,
            medical: {
                allergies: toList(data.allergies),
                dietary: toList(data.dietary),
                accommodations: toList(data.specialNotes),
            },
            documents: Array.isArray(data.documents) ? data.documents : [],
        },
    };
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