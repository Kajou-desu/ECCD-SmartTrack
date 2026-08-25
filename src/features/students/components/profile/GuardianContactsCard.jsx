import { Pencil, User } from "lucide-react";
import GuardianCard from "./GuardianCard";

export default function GuardianContactsCard({ guardians, onEdit }) {
  const primaryGuardian =
    guardians?.find((guardian) => guardian.isPrimary) ?? guardians?.[0];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Guardian Information
        </h2>
        <button
          type="button"
          onClick={onEdit}
          className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#C2570C] transition-colors hover:bg-orange-50 hover:text-orange-700"
          aria-label="Edit guardian details"
        >
          <Pencil size={18} />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="space-y-6">
        {primaryGuardian ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Primary Guardian
            </p>
            <GuardianCard
              guardian={{ ...primaryGuardian, type: "Primary Guardian" }}
            />
          </div>
        ) : null}

        {guardians && guardians.length > 0 ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Parents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guardians.map((guardian) => (
                <GuardianCard key={guardian.id} guardian={guardian} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <User size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">
              No guardian information available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
