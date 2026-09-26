import { useStudentProfileQuery } from "@features/students/hooks/useStudentProfileQuery.js";
import { useParentChild } from "@hooks/useParentChild";
import StudentProfileHeader from "@features/students/components/profile/StudentProfileHeader";
import GuardianContactsCard from "@features/students/components/profile/GuardianContactsCard";
import MedicalNotesCard from "@features/students/components/profile/MedicalNotesCard";
import RequiredDocumentsCard from "@features/students/components/profile/RequiredDocumentsCard";
import LoadingState from "@components/shared/LoadingState";
import { Users, FileQuestion } from "lucide-react";

export default function ParentStudentProfile() {
  const { selectedChild } = useParentChild();

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

  // key forces a clean remount per child, so profile/activeModal reset
  // naturally instead of needing manual reset logic in an effect.
  return (
    <ParentStudentProfileView
      key={selectedChild.id}
      selectedChild={selectedChild}
    />
  );
}

function ParentStudentProfileView({ selectedChild }) {
  const { data: queryData, isLoading, isError, refetch } = useStudentProfileQuery(
    selectedChild.id,
  );
  const profile = queryData?.profile;

  const loading = isLoading;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f8f9ff] p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
          <p className="text-gray-600">Unable to load this profile.</p>
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
        <MedicalNotesCard medical={medical} />
      </div>

      <div className="mt-8">
        <RequiredDocumentsCard documents={documents} />
      </div>
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
