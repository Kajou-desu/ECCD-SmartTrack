// MOCK_FALLBACK: mock persistence for student work submissions. Stands in for
// a real `/api/submissions` table until the backend exists. Used as the
// fallback path by apiClient.submitStudentWork / apiClient.getSubmissions
// callers so teacher uploads and the parent portal see the same data.
//
// Persisted to localStorage (not just in-memory) so fallback data survives a
// page reload and is visible across tabs *in the same browser* — useful when
// testing the teacher and parent flows side by side without a live backend.
// Note: this does NOT sync across different browsers/devices; that requires
// the real backend. File contents are never persisted (blob URLs die on
// reload) — only submission metadata is kept.
//
// TO REMOVE once backend is live: delete this file and the MOCK_FALLBACK
// call sites in UploadStudentWork.jsx and useParentMaterials.js.

const STORAGE_KEY = "eccd_mock_submissions";

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(submissions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — fall back to
    // in-memory only for this session.
  }
}

let submissions = readStore();

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
  writeStore(submissions);
  return submission;
}