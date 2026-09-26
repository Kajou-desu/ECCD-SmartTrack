import { Pencil, User } from "lucide-react";
import GuardianCard from "./GuardianCard";

const PARENT_TYPES = ["Mother", "Father"];
const LEGAL_GUARDIAN_TYPE = "Legal Guardian";
const MAX_CARDS_PER_GROUP = 2;

export default function GuardianContactsCard({ guardians, onEdit }) {
  const parents = (guardians ?? [])
    .filter((guardian) => PARENT_TYPES.includes(guardian.type))
    .slice(0, MAX_CARDS_PER_GROUP);

  const legalGuardians = (guardians ?? [])
    .filter((guardian) => guardian.type === LEGAL_GUARDIAN_TYPE)
    .slice(0, MAX_CARDS_PER_GROUP);

  const hasLegalGuardian = legalGuardians.length > 0;

  const primaryGuardian =
    guardians?.find((guardian) => guardian.isPrimary) ??
    (hasLegalGuardian ? legalGuardians[0] : guardians?.[0]);

  // Only show a separate Legal Guardians row when there are two of them;
  // a single legal guardian's info already replaces the Primary Guardian card above.
  const showLegalGuardiansRow =
    legalGuardians.length === 2 ||
    (legalGuardians.length === 1 && primaryGuardian?.type !== LEGAL_GUARDIAN_TYPE);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Guardian Information
        </h2>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#C2570C] transition-colors hover:bg-orange-50 hover:text-orange-700"
            aria-label="Edit guardian details"
          >
            <Pencil size={18} />
            <span>Edit Details</span>
          </button>
        ) : null}
      </div>

      <div className="space-y-6">
        {primaryGuardian ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Primary Guardian
            </p>
            <GuardianCard guardian={primaryGuardian} />
          </div>
        ) : null}

        {parents.length > 0 ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Parents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parents.map((guardian) => (
                <GuardianCard key={guardian.id} guardian={guardian} />
              ))}
            </div>
          </div>
        ) : null}

        {showLegalGuardiansRow ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Legal Guardians
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {legalGuardians.map((guardian) => (
                <GuardianCard key={guardian.id} guardian={guardian} />
              ))}
            </div>
          </div>
        ) : null}

        {!primaryGuardian && parents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <User size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">
              No guardian information available
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
