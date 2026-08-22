import { useEffect, useRef } from "react";
import { useEscapeKey } from "@hooks/useEscapeKey";
import { useScrollLock } from "@hooks/useScrollLock";

/**
 * Standardized modal/dialog shell used across the app so every feature
 * shares one notification and modal pattern instead of re-implementing the
 * overlay, escape-to-close, scroll lock, and focus restoration behavior.
 *
 * Render this only while the modal should be visible (e.g.
 * `{isOpen && <Modal onClose={...}>...</Modal>}`) - mounting captures the
 * element that had focus, and unmounting restores focus back to it.
 *
 * The dialog itself uses `flex flex-col` with a caller-provided max height
 * (see `className`) so a tall header/body/footer layout can make only the
 * body scroll internally instead of growing past the viewport.
 */
export default function Modal({
  onClose,
  labelledBy,
  children,
  className = "w-full max-w-md max-h-[90vh] rounded-xl",
  overlayClassName = "items-center justify-center p-4",
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
    // Only run on mount/unmount: this captures and restores focus around the
    // modal's lifetime, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      className={`fixed inset-0 z-60 flex bg-black/40 ${overlayClassName}`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
        className={`flex flex-col overflow-hidden bg-white shadow-2xl ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
