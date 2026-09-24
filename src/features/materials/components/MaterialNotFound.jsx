import { Link } from "react-router-dom";
import { ArrowLeft, FileX } from "lucide-react";

export default function MaterialNotFound() {
  return (
    <div className="flex min-h-64 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <FileX size={32} className="text-slate-400" aria-hidden="true" />

      <h2 className="mt-4 text-lg font-bold text-slate-900">Material not found</h2>

      <p className="mt-2 max-w-sm text-sm text-slate-600">
        This material may have been deleted or the link is no longer valid.
      </p>

      <Link
        to="/learning-materials"
        className="mt-5 flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Learning Materials
      </Link>
    </div>
  );
}
