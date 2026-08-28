// Mock persistence for student work submissions. Stands in for a real
// `/api/submissions` table until the backend exists. Used as the fallback
// path by apiClient.submitStudentWork / apiClient.getSubmissions callers so
// teacher uploads and the parent portal see the same session-local data.

let submissions = [];

export function getAllSubmissions() {
  return submissions;
}

export function getSubmissionsForChild(childId) {
  return submissions.filter((s) => String(s.studentId) === String(childId));
}

export function getSubmissionForMaterial(childId, materialId) {
  return submissions.find(
    (s) =>
      String(s.studentId) === String(childId) &&
      String(s.materialId) === String(materialId),
  );
}

export function addSubmission({ materialId, studentId, file }) {
  const submission = {
    id: crypto.randomUUID(),
    materialId,
    studentId,
    fileName: file?.name ?? "submission",
    fileUrl: file instanceof File ? URL.createObjectURL(file) : null,
    submittedAt: new Date().toISOString(),
  };

  submissions = [submission, ...submissions];
  return submission;
}