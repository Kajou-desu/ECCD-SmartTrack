import { FileText, FileWarning, FileX } from "lucide-react";
import { FILE_STATUS } from "@features/materials/hooks/useSubmissionFile";

function Message({ icon: Icon, children, role }) {
  return (
    <div role={role} className="flex flex-col items-center text-slate-900">
      <Icon size={72} strokeWidth={2} className="mb-4" aria-hidden="true" />
      <p className="text-center text-xl font-medium leading-snug">{children}</p>
    </div>
  );
}

// One place for every state of the preview area: loading, missing, failed,
// and the file itself (PDF in a frame, image inline).
export default function SubmissionFileViewer({ file, fileName }) {
  if (file.status === FILE_STATUS.LOADING) {
    return (
      <div role="status" className="flex flex-col items-center">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-[5px] border-gray-200 border-t-gray-800" />
        <p className="text-center text-xl font-medium leading-snug text-slate-900">
          Loading...
          <br />
          Please Wait
        </p>
      </div>
    );
  }

  if (file.status === FILE_STATUS.MISSING) {
    return <Message icon={FileX} role="alert">File Missing</Message>;
  }

  if (file.status === FILE_STATUS.ERROR) {
    return (
      <Message icon={FileWarning} role="alert">
        Unable to load this file.
        <br />
        Please try again.
      </Message>
    );
  }

  // The type comes from the server's Content-Type for the stored file.
  if (file.type === "application/pdf") {
    return (
      <iframe
        src={file.objectUrl}
        title={fileName}
        className="h-[70vh] w-full rounded-lg border border-slate-200 bg-white"
      />
    );
  }

  if (file.type?.startsWith("image/")) {
    return (
      <img
        src={file.objectUrl}
        alt={fileName}
        className="max-h-[70vh] w-full rounded-lg object-contain"
      />
    );
  }

  return <Message icon={FileText}>Preview not available for this file type.</Message>;
}
