import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentData } from "@data/mockData";
import StudentProfileHeader from "@features/students/components/profile/StudentProfileHeader";
import GuardianContactsCard from "@features/students/components/profile/GuardianContactsCard";
import MedicalNotesCard from "@features/students/components/profile/MedicalNotesCard";
import RequiredDocumentsCard from "@features/students/components/profile/RequiredDocumentsCard";
import EditGuardiansModal from "@features/students/components/profile/EditGuardiansModal";
import EditMedicalModal from "@features/students/components/profile/EditMedicalModal";
import UploadDocumentModal from "@features/students/components/profile/UploadDocumentModal";
import { ArrowLeft } from "lucide-react";

export default function StudentDetail() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [state, setState] = useState(() => ({
    loadedStudentId: studentId,
    profile: getStudentData(studentId),
    activeModal: null, // "guardians" | "medical" | "upload" | null
  }));
  const { profile, activeModal } = state;

  if (studentId !== state.loadedStudentId) {
    setState({
      loadedStudentId: studentId,
      profile: getStudentData(studentId),
      activeModal: null,
    });
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {student.name}'s Information
        </h1>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
          View your child's profile, guardian contacts, medical records, and
          uploaded documents. All information is kept secure and confidential.
        </p>
      </div>

      <StudentProfileHeader student={student} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <GuardianContactsCard
          guardians={guardians}
          onEdit={() => setState((s) => ({ ...s, activeModal: "guardians" }))}
        />
        <MedicalNotesCard
          medical={medical}
          onEdit={() => setState((s) => ({ ...s, activeModal: "medical" }))}
        />
      </div>

      <div className="mt-8">
        <RequiredDocumentsCard
          documents={documents}
          onUpload={() => setState((s) => ({ ...s, activeModal: "upload" }))}
        />
      </div>

      {activeModal === "guardians" && (
        <EditGuardiansModal
          guardians={guardians}
          onCancel={() => setState((s) => ({ ...s, activeModal: null }))}
          onSave={(updatedGuardians) => {
            setState((s) => ({
              ...s,
              profile: { ...s.profile, guardians: updatedGuardians },
              activeModal: null,
            }));
          }}
        />
      )}

      {activeModal === "medical" && (
        <EditMedicalModal
          medical={medical}
          onCancel={() => setState((s) => ({ ...s, activeModal: null }))}
          onSave={(updatedMedical) => {
            setState((s) => ({
              ...s,
              profile: { ...s.profile, medical: updatedMedical },
              activeModal: null,
            }));
          }}
        />
      )}

      {activeModal === "upload" && (
        <UploadDocumentModal
          onCancel={() => setState((s) => ({ ...s, activeModal: null }))}
          onSave={(newDocument) => {
            setState((s) => ({
              ...s,
              profile: {
                ...s.profile,
                documents: [...(s.profile.documents ?? []), newDocument],
              },
              activeModal: null,
            }));
          }}
        />
      )}
    </div>
  );
}
