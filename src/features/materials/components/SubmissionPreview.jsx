import SubmissionActionsMenu from "@features/materials/components/SubmissionActionsMenu";
import SubmissionFileViewer from "@features/materials/components/SubmissionFileViewer";
import { FILE_STATUS, useSubmissionFile } from "@features/materials/hooks/useSubmissionFile";

export default function SubmissionPreview({ submission }) {
  const file = useSubmissionFile(submission.fileUrl);
  const isReady = file.status === FILE_STATUS.READY;

  // Saved from the already-downloaded blob: the `download` attribute is
  // ignored for cross-origin URLs, but works for a same-origin blob: URL.
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.objectUrl;
    link.download = submission.fileName;
    link.click();
  };

  // Opens the signed URL itself (top-level navigation isn't affected by the
  // API's embedding restrictions). noopener: the new tab gets no handle back.
  const handleViewFile = () => {
    window.open(submission.fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      aria-label={`${submission.studentName}'s submitted work`}
      className="relative flex min-h-[600px] flex-col rounded-3xl border border-slate-100 bg-white shadow-sm lg:col-span-2"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6">
        <h2 className="truncate text-lg font-bold text-slate-900">
          {submission.studentName}
        </h2>

        <SubmissionActionsMenu
          studentName={submission.studentName}
          disabled={!isReady}
          onDownload={handleDownload}
          onViewFile={handleViewFile}
        />
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <SubmissionFileViewer file={file} fileName={submission.fileName} />
      </div>
    </section>
  );
}
