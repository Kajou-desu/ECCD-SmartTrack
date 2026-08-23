import { useEffect, useRef } from "react";
import { useEscapeKey } from "@hooks/useEscapeKey";
import { useScrollLock } from "@hooks/useScrollLock";

export default function Modal({
  onClose,
  labelledBy,
  children,
  className = "w-full max-w-md max-h-[90vh] rounded-xl bg-white shadow-2xl",
  overlayClassName = "items-center justify-center bg-black/40 p-4",
  closeOnEscape = true,
  lockScroll = true,
  restoreFocus = true,
}) {
  const previouslyFocusedElementRef = useRef(null);

  useScrollLock(lockScroll);
  useEscapeKey(onClose, closeOnEscape);

  useEffect(() => {
    previouslyFocusedElementRef.current = document.activeElement;

    return () => {
      if (!restoreFocus) return;

      const previouslyFocusedElement = previouslyFocusedElementRef.current;

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus({ preventScroll: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      className={`fixed inset-0 z-60 flex ${overlayClassName}`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
        className={`flex flex-col overflow-hidden ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
