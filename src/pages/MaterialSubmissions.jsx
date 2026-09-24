import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FolderOpen } from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import LoadingState from "@components/shared/LoadingState";
import ErrorMsg from "@components/ui/ErrorMsg";
import { useMaterialSubmissionsQuery } from "@features/materials/hooks/useMaterialSubmissionsQuery";
import SubmissionPreview from "@features/materials/components/SubmissionPreview";
import SubmissionsList from "@features/materials/components/SubmissionsList";
import MaterialNotFound from "@features/materials/components/MaterialNotFound";

const PAGE_CLASSES = "flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6";

export default function MaterialSubmissions() {
  const { materialId } = useParams();
  const { data, isLoading, error } = useMaterialSubmissionsQuery(materialId);
  const [selectedId, setSelectedId] = useState(null);
  const [dismissedError, setDismissedError] = useState(false);

  if (error?.status === 404) {
    return (
      <main className={PAGE_CLASSES}>
        <MaterialNotFound />
      </main>
    );
  }

  const submissions = data?.submissions ?? [];
  // Until the user picks someone, show the first (most recent) submission.
  const active = submissions.find((s) => s.id === selectedId) ?? submissions[0] ?? null;

  return (
    <main className={PAGE_CLASSES}>
      <header className="flex flex-col gap-4">
        <Link
          to="/learning-materials"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Learning Materials
        </Link>

        <PageHeader title="Activity Preview" subtitle={data?.material.title} />
      </header>

      {error && !dismissedError && (
        <ErrorMsg
          message="Unable to load student works. Please try again."
          onClose={() => setDismissedError(true)}
        />
      )}

      {isLoading && <LoadingState message="Loading student works..." />}

      {data && submissions.length === 0 && (
        <section className="flex min-h-96 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50" aria-hidden="true">
            <FolderOpen size={32} className="text-orange-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No student works yet</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Completed work uploaded for this material will show up here.
          </p>
        </section>
      )}

      {active && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <SubmissionPreview key={active.id} submission={active} />
          <SubmissionsList
            submissions={submissions}
            activeId={active.id}
            onSelect={setSelectedId}
          />
        </div>
      )}
    </main>
  );
}
