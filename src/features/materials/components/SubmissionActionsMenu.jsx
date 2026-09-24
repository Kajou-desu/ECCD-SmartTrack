import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileSearch, MoreVertical } from "lucide-react";
import { useEscapeKey } from "@hooks/useEscapeKey";

export default function SubmissionActionsMenu({
  studentName,
  disabled,
  onDownload,
  onViewFile,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const close = useCallback(() => setIsOpen(false), []);

  useEscapeKey(close, isOpen);

  // Close when clicking anywhere outside the menu.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) close();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  const run = (action) => () => {
    close();
    action();
  };

  const items = [
    { label: "Download", icon: Download, onClick: onDownload },
    { label: "View File", icon: FileSearch, onClick: onViewFile },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Open actions for ${studentName}'s work`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <MoreVertical size={20} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-2 shadow-lg"
        >
          {items.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={run(onClick)}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              {label}
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
