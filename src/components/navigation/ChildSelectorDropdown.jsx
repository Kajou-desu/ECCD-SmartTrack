import { useState } from "react";
import useClickOutside from "@hooks/useClickOutside";
import { useEscapeKey } from "@hooks/useEscapeKey";
import { useParentChild } from "@hooks/useParentChild";
import { ChevronDown, User } from "lucide-react";
import formatStudentName from "@utils/formatStudentName.js";

export default function ChildSelectorDropdown() {
  const { availableChildren, selectedChild, setSelectedChildId } =
    useParentChild();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const menuRef = useClickOutside(closeMenu, isMenuOpen);
  useEscapeKey(closeMenu, isMenuOpen);

  if (!selectedChild) {
    return (
      <p className="text-sm text-slate-500">No child linked to this account.</p>
    );
  }

  // Single child: show identity without a switching control.
  if (availableChildren.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700">
        <User className="h-4 w-4 text-[#C2570C]" aria-hidden="true" />
        {formatStudentName(selectedChild)}
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen((current) => !current)}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label={`Viewing ${formatStudentName(selectedChild)}. Switch child`}
        className="cursor-pointer flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#C2570C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
      >
        <User className="h-4 w-4 text-[#C2570C]" aria-hidden="true" />
        <span className="max-w-32 truncate sm:max-w-none">
          {formatStudentName(selectedChild)}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          aria-label="Select child"
          className="absolute right-0 top-full z-30 mt-2 min-w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {availableChildren.map((child) => (
            <button
              key={child.id}
              type="button"
              role="menuitemradio"
              aria-checked={child.id === selectedChild.id}
              onClick={() => {
                setSelectedChildId(child.id);
                closeMenu();
              }}
              className={`cursor-pointer flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-medium transition hover:bg-slate-50 ${
                child.id === selectedChild.id
                  ? "text-[#C2570C]"
                  : "text-slate-700"
              }`}
            >
              {formatStudentName(child)}
              {child.id === selectedChild.id && (
                <span className="text-xs uppercase text-slate-400">
                  Viewing
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
