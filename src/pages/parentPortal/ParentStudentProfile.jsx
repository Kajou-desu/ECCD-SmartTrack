import { useState } from "react";
import { getStudentData } from "@data/mockData";
import { useParentChild } from "@hooks/useParentChild";
import StudentProfileHeader from "@features/students/components/profile/StudentProfileHeader";
import GuardianContactsCard from "@features/students/components/profile/GuardianContactsCard";
import MedicalNotesCard from "@features/students/components/profile/MedicalNotesCard";
import RequiredDocumentsCard from "@features/students/components/profile/RequiredDocumentsCard";
import EditMedicalModal from "@features/students/components/profile/EditMedicalModal";
import UploadDocumentModal from "@features/students/components/profile/UploadDocumentModal";
import { Users, FileQuestion } from "lucide-react";

export default function ParentStudentProfile() {
  const { selectedChild } = useParentChild();
  const [loadedChildId, setLoadedChildId] = useState(selectedChild?.id);
  const [profile, setProfile] = useState(() =>
    selectedChild ? getStudentData(selectedChild.id) : null,
  );
  const [activeModal, setActiveModal] = useState(null); // "medical" | "upload" | null

  if (selectedChild?.id !== loadedChildId) {
    setLoadedChildId(selectedChild?.id);
    setProfile(selectedChild ? getStudentData(selectedChild.id) : null);
    setActiveModal(null);
  }

  if (!selectedChild) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <EmptyState
          Icon={Users}
          title="No child linked to your account"
          description="Contact your child's school to link their enrollment to this parent account."
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <EmptyState
          Icon={FileQuestion}
          title={`${selectedChild.name}'s profile isn't set up yet`}
          description="Guardian, medical, and document details will appear here once the school finishes enrollment setup."
        />
      </div>
    );
  }

  const { student, guardians, medical, documents } = profile;

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
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
        <GuardianContactsCard guardians={guardians} />
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

      {activeModal === "medical" && (
        <EditMedicalModal
          medical={medical}
          hideAccommodations
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

function EmptyState({ Icon, title, description }) {
  return (
    <div className="flex min-h-96 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50"
        aria-hidden="true"
      >
        <Icon size={32} className="text-orange-600" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p>
    </div>
  );
}
