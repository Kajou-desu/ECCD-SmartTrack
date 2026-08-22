import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import useClickOutside from "@hooks/useClickOutside";
import { useEscapeKey } from "@hooks/useEscapeKey";
import formatDate from "@utils/formatDate";
import {
  Pencil,
  Trash2,
  MoreVertical,
  Upload,
  FileText,
  Calendar,
} from "lucide-react";

export default function LearningMaterialCard({
  material,
  onView,
  onUpload,
  onEdit,
  onDelete,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const menuRef = useClickOutside(closeMenu, isMenuOpen);
  useEscapeKey(closeMenu, isMenuOpen);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setIsMenuOpen((current) => !current);
  };

  const runAndCloseMenu = (action) => () => {
    closeMenu();
    action();
  };

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

        {/* Mobile-first priority: category is the first identifying badge
            shown, ahead of any secondary controls. */}
        <span className="absolute left-3 top-3 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wider text-slate-700 shadow-sm">
          {material.category}
        </span>

        <div ref={menuRef} className="absolute right-2 top-2">
          <button
            type="button"
            onClick={handleMenuClick}
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
                onClick={runAndCloseMenu(onEdit)}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={runAndCloseMenu(onDelete)}
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
        </div>
      </div>
    </article>
  );
}
