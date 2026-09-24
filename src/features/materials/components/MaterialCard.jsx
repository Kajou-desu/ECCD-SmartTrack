import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import formatDate from "@utils/formatDate";
import {
  Pencil,
  Trash2,
  Upload,
  FileText,
  Calendar,
  FolderOpen,
} from "lucide-react";

export default function LearningMaterialCard({
  material,
  onView,
  onUpload,
  onViewWorks,
  onEdit,
  onDelete,
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Material cover and quick actions. */}
      <div className="relative h-75 sm:h-85 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
        <div
          className="absolute inset-0 flex items-center justify-center text-6xl opacity-80 bg-slate-200"
          aria-hidden="true"
        >
          <FileText size={50} />
        </div>

        {/* Mobile-first priority: category is the first identifying badge
            shown, ahead of any secondary controls. */}
        <span className="absolute left-3 top-3 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wider text-slate-700 shadow-sm">
          {material.category}
        </span>

        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onEdit(material); }}
            aria-label={`Edit ${material.title}`}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/80 text-slate-700 shadow-sm transition hover:bg-orange-50 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onDelete(material); }}
            aria-label={`Delete ${material.title}`}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/80 text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-bold text-slate-900">
            {material.title}
          </h2>

          {material.createdAt && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} aria-hidden="true" />
              {formatDate(material.createdAt)}
            </p>
          )}

          <p className="mt-2 line-clamp-2 text-sm text-slate-600 hidden sm:inline">
            {material.description}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <PrimaryButton
            icon={<FileText className="h-5 w-5" aria-hidden="true" />}
            label="View Material"
            onClick={onView}
            ariaLabel={`View ${material.title} PDF`}
          />

          <SecondaryButton
            icon={<Upload className="h-5 w-5" aria-hidden="true" />}
            label="Upload Works"
            onClick={onUpload}
            ariaLabel={`Upload completed student work for ${material.title}`}
          />

          <SecondaryButton
            icon={<FolderOpen className="h-5 w-5" aria-hidden="true" />}
            label="Student Works"
            onClick={onViewWorks}
          />
        </div>
      </div>
    </article>
  );
}
