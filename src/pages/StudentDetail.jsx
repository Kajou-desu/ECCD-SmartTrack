import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStudentProfileQuery } from "@features/students/hooks/useStudentProfileQuery.js";
import { apiClient } from "@api/client.js";
import { parseStudentCode } from "@features/students/utils/studentCode.js";
import StudentProfileHeader from "@features/students/components/profile/StudentProfileHeader";
import GuardianContactsCard from "@features/students/components/profile/GuardianContactsCard";
import MedicalNotesCard from "@features/students/components/profile/MedicalNotesCard";
import RequiredDocumentsCard from "@features/students/components/profile/RequiredDocumentsCard";
import EditGuardiansModal from "@features/students/components/profile/EditGuardiansModal";
import EditMedicalModal from "@features/students/components/profile/EditMedicalModal";
import UploadDocumentModal from "@features/students/components/profile/UploadDocumentModal";
import StudentBleDevicesCard from "@features/smartAttendance/components/StudentBleDevicesCard";
import PageHeader from "@components/shared/PageHeader";
import LoadingState from "@components/shared/LoadingState";
import ErrorMsg from "@components/ui/ErrorMsg";
import { ArrowLeft } from "lucide-react";

export default function StudentDetail() {
  const { studentId: studentCode } = useParams();

  // The URL must be a student code (ECCD-2026-<number>). Anything else —
  // including a bare numeric id — is rejected here, before any request is made.
  const studentId = parseStudentCode(studentCode);
  if (studentId === null) return <StudentNotFound />;

  // key forces a clean remount per student, so loading/profile/activeModal
  // reset naturally instead of needing manual reset logic in an effect.
  // studentId below is the numeric id the API (and every child component) uses.
  return <StudentDetailView key={studentCode} studentId={studentId} />;
}

function StudentNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate("/student-info")}
        className="cursor-pointer flex items-center gap-2 text-[#C2570C] hover:text-orange-700 font-semibold mb-4 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
      <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
        <p className="text-gray-600">Student not found</p>
      </div>
    </div>
  );
}

function StudentDetailView({ studentId }) {
  const navigate = useNavigate();

  const { data: queryData, isLoading, isError, refetch } = useStudentProfileQuery(studentId);
  const [profile, setProfile] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "guardians" | "medical" | "upload" | null
  const [docError, setDocError] = useState("");

  if (queryData && !initialized) {
    setInitialized(true);
    setProfile(queryData.profile);
  }

  const loading = isLoading;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <LoadingState message="Loading student profile..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <button
          onClick={() => navigate("/student-info")}
          className="cursor-pointer flex items-center gap-2 text-[#C2570C] hover:text-orange-700 font-semibold mb-4 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
          <p className="text-gray-600">Unable to load this student's profile.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 cursor-pointer rounded-lg bg-[#C2570C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile?.student) return <StudentNotFound />;

  const { student, guardians, medical, documents } = profile;

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/student-info")}
          className="cursor-pointer flex items-center gap-2 text-[#C2570C] hover:text-orange-700 font-semibold mb-4 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
          aria-label="Go back to student information"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <PageHeader
          title={`${student.name}'s Information`}
          subtitle="View your child's profile, guardian contacts, medical records, and
          uploaded documents."
        />
      </div>

      {docError && <ErrorMsg message={docError} onClose={() => setDocError("")} />}

      <StudentProfileHeader student={student} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <GuardianContactsCard
          guardians={guardians}
          onEdit={() => setActiveModal("guardians")}
        />
        <MedicalNotesCard
          medical={medical}
          onEdit={() => setActiveModal("medical")}
        />
      </div>

      <div className="mt-8">
        <StudentBleDevicesCard studentId={studentId} />
      </div>

      <div className="mt-8">
        <RequiredDocumentsCard
          documents={documents}
          onUpload={() => setActiveModal("upload")}
          onRemove={(docId) => {
            const removedDoc = profile.documents?.find((doc) => doc.id === docId);
            setDocError("");
            setProfile((current) => ({
              ...current,
              documents: current.documents.filter((doc) => doc.id !== docId),
            }));

            apiClient.deleteStudentDocument(studentId, docId).catch((err) => {
              // Roll back — the delete didn't actually happen server-side.
              setProfile((current) => ({
                ...current,
                documents: [...current.documents, removedDoc].filter(Boolean),
              }));
              setDocError(err.message || "Failed to delete the document. Please try again.");
            });
          }}
        />
      </div>

      {activeModal === "guardians" && (
        <EditGuardiansModal
          guardians={guardians}
          onCancel={() => setActiveModal(null)}
          onSave={(updatedGuardians) => {
            setProfile((current) => ({
              ...current,
              guardians: updatedGuardians,
            }));
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === "medical" && (
        <EditMedicalModal
          medical={medical}
          onCancel={() => setActiveModal(null)}
          onSave={(updatedMedical) => {
            setProfile((current) => ({ ...current, medical: updatedMedical }));
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === "upload" && (
        <UploadDocumentModal
          studentId={studentId}
          onCancel={() => setActiveModal(null)}
          onSave={(newDocument) => {
            setProfile((current) => ({
              ...current,
              documents: [...(current.documents ?? []), newDocument],
            }));
            setActiveModal(null);
          }}
        />
      )}
    </div>
  );
}
