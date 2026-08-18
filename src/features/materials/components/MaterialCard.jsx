import { Pencil, Trash2, MoreVertical, Upload, FileText } from "lucide-react";

export function LearningMaterialCard({
  material,
  menuRef,
  isMenuOpen,
  onView,
  onUpload,
  onEdit,
  onDelete,
  onMenuClick,
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Material cover and quick actions. */}
      <div className="relative h-75 sm:h-85 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
        <div
          className={`absolute inset-0 flex items-center justify-center text-6xl opacity-80 ${material.bgColor}`}
          aria-hidden="true"
        >
          {material.icon}
        </div>

        <span className="absolute left-3 top-3 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wider text-slate-700 shadow-sm">
          {material.category}
        </span>

        <div ref={menuRef} className="absolute right-2 top-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={`Open actions for ${material.title}`}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/80 text-slate-700 shadow-sm transition hover:bg-white hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <MoreVertical size={18} aria-hidden="true" />
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-2 min-w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={onEdit}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={onDelete}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-bold text-slate-900">
            {material.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm text-slate-600 hidden sm:inline">
            {material.description}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={onView}
            aria-label={`View ${material.title} PDF`}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <FileText size={16} aria-hidden="true" />
            View PDF
          </button>

          <button
            type="button"
            onClick={onUpload}
            aria-label={`Upload completed student work for ${material.title}`}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <Upload size={16} aria-hidden="true" />
            Upload Works
          </button>
        </div>
      </div>
    </article>
  );
}
