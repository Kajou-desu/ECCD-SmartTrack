import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStudentProfileQuery } from "@features/students/hooks/useStudentProfileQuery.js";
import StudentProfileHeader from "@features/students/components/profile/StudentProfileHeader";
import GuardianContactsCard from "@features/students/components/profile/GuardianContactsCard";
import MedicalNotesCard from "@features/students/components/profile/MedicalNotesCard";
import RequiredDocumentsCard from "@features/students/components/profile/RequiredDocumentsCard";
import EditGuardiansModal from "@features/students/components/profile/EditGuardiansModal";
import EditMedicalModal from "@features/students/components/profile/EditMedicalModal";
import UploadDocumentModal from "@features/students/components/profile/UploadDocumentModal";
import PageHeader from "@components/shared/PageHeader";
import LoadingState from "@components/shared/LoadingState";
import ErrorMsg from "@components/ui/ErrorMsg";
import { ArrowLeft } from "lucide-react";

export default function StudentDetail() {
  const { studentId } = useParams();
  // key forces a clean remount per student, so loading/profile/activeModal
  // reset naturally instead of needing manual reset logic in an effect.
  return <StudentDetailView key={studentId} studentId={studentId} />;
}

function StudentDetailView({ studentId }) {
  const navigate = useNavigate();

  const { data: queryData, isLoading } = useStudentProfileQuery(studentId);
  const [profile, setProfile] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null); // "guardians" | "medical" | "upload" | null

  if (queryData && !initialized) {
    setInitialized(true);
    setProfile(queryData.profile);
    if (queryData.usedMock)
      setError("Unable to sync with server. Showing cached data.");
  }

  const loading = isLoading;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <LoadingState message="Loading student profile..." />
      </div>
    );
  }

  if (!profile) {
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

      {error && <ErrorMsg message={error} onClose={() => setError("")} />}

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
        <RequiredDocumentsCard
          documents={documents}
          onUpload={() => setActiveModal("upload")}
          onRemove={(docId) => {
            setProfile((current) => ({
              ...current,
              documents: current.documents.filter((doc) => doc.id !== docId),
            }));
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
