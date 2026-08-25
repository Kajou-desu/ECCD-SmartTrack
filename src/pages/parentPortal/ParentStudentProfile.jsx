import { useState } from "react";
import { getStudentData } from "@data/mockData";
import { PHOTO_ALBUMS_DATA } from "@data/mockParentData";
import { useParentChild } from "@hooks/useParentChild";
import useParentAttendance from "@features/attendance/hooks/useParentAttendance";
import useParentProgress from "@features/dashboard/hooks/useParentProgress";
import { EventCard } from "@features/dashboard/components/EventCard";
import RecentActivitiesCard from "@features/dashboard/components/RecentActivitiesCard";
import StudentProfileHeader from "@features/students/components/profile/StudentProfileHeader";
import GuardianContactsCard from "@features/students/components/profile/GuardianContactsCard";
import MedicalNotesCard from "@features/students/components/profile/MedicalNotesCard";
import RequiredDocumentsCard from "@features/students/components/profile/RequiredDocumentsCard";
import EditGuardiansModal from "@features/students/components/profile/EditGuardiansModal";
import EditMedicalModal from "@features/students/components/profile/EditMedicalModal";
import UploadDocumentModal from "@features/students/components/profile/UploadDocumentModal";
import AttendanceSummaryCard from "@features/students/components/profile/AttendanceSummaryCard";
import RecentPhotosCard from "@features/students/components/profile/RecentPhotosCard";
import { toMonthKey } from "@utils/dateKeys";
import { Users, FileQuestion } from "lucide-react";

export default function ParentStudentProfile() {
  const { selectedChild } = useParentChild();
  const [loadedChildId, setLoadedChildId] = useState(selectedChild?.id);
  const [profile, setProfile] = useState(() =>
    selectedChild ? getStudentData(selectedChild.id) : null,
  );
  const [activeModal, setActiveModal] = useState(null); // "guardians" | "medical" | "upload" | null

  if (selectedChild?.id !== loadedChildId) {
    setLoadedChildId(selectedChild?.id);
    setProfile(selectedChild ? getStudentData(selectedChild.id) : null);
    setActiveModal(null);
  }

  const monthKey = toMonthKey(new Date(2026, 7, 7));
  const monthName = new Date(2026, 7, 7).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const { status: attendanceStatus, data: attendance } = useParentAttendance(
    selectedChild?.id,
    monthKey,
  );
  const { status: progressStatus, data: progress } = useParentProgress(
    selectedChild?.id,
  );

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

      {/* Basic information + class/teacher info */}
      <StudentProfileHeader student={student} />

      {/* Attendance summary */}
      <div className="mt-8">
        <AttendanceSummaryCard
          stats={attendanceStatus === "success" ? attendance?.stats : null}
          monthName={monthName}
        />
      </div>

      {/* Recent activities + upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {progressStatus === "success" && progress?.recentActivities ? (
          <RecentActivitiesCard activities={progress.recentActivities} />
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Recent Activities
            </h2>
            <p className="text-sm text-gray-500">
              No recent activities recorded for {student.name} yet.
            </p>
          </div>
        )}
        <EventCard />
      </div>

      {/* Recent photos */}
      <div className="mt-8">
        <RecentPhotosCard albums={PHOTO_ALBUMS_DATA} />
      </div>

      {/* Guardian + medical */}
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

      {/* Documents */}
      <div className="mt-8">
        <RequiredDocumentsCard
          documents={documents}
          onUpload={() => setActiveModal("upload")}
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
