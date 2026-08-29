import { FileText, Calendar, CheckCircle2, Clock } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";

export default function ParentMaterialCard({ material, onView }) {
  const isCompleted = material.completion?.status === "completed";

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Material cover */}
      <div className="relative h-75 sm:h-85 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
        <div
          className={`absolute inset-0 flex items-center justify-center text-6xl opacity-80 ${material.bgColor ?? "bg-slate-200"}`}
          aria-hidden="true"
        >
          {material.icon ?? "📄"}
        </div>

        <span className="absolute left-3 top-3 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wider text-slate-700 shadow-sm">
          {material.category}
        </span>

        {isCompleted ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-50/95 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
            <CheckCircle2 size={14} aria-hidden="true" />
            Completed
          </span>
        ) : (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            <Clock size={14} aria-hidden="true" />
            Not completed yet
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-bold text-slate-900">
            {material.title}
          </h2>

          {material.date && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} aria-hidden="true" />
              {material.date}
            </p>
          )}

          {material.createdBy && (
            <p className="mt-1 text-xs text-slate-500">
              By {material.createdBy}
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
            icon={
              isCompleted ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Clock className="h-5 w-5" aria-hidden="true" />
              )
            }
            label={isCompleted ? "See Completed Work" : "Not Completed Yet"}
            onClick={
              isCompleted
                ? () =>
                    window.open(
                      material.completion.fileUrl,
                      "_blank",
                      "noopener",
                    )
                : undefined
            }
            disabled={!isCompleted}
          />
        </div>
      </div>
    </article>
  );
}
