export function calculateAge(birthday) {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) return "N/A";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }
    return age;
}

export function normalizeStatus(status) {
    const normalized = String(status ?? "").trim().toLowerCase();
    return normalized === "active" ? "active" : "inactive";
}

export function normalizeSession(session) {
    const normalized = String(session ?? "").trim().toLowerCase();
    return normalized === "afternoon" ? "afternoon" : "morning";
}

export function normalizeStudent(student, guardians = []) {
    const guardian = guardians?.[0];
    return {
        ...student,
        age: student.age ?? calculateAge(student.birthday),
        status: normalizeStatus(student.status),
        session: normalizeSession(student.session),
        guardianName: student.guardianName ?? guardian?.name ?? "N/A",
        guardianPhone: student.guardianPhone ?? guardian?.phone ?? "N/A",
    };
}