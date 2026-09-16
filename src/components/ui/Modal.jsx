import { useEffect, useRef } from "react";
import { useEscapeKey } from "@hooks/useEscapeKey";
import { useScrollLock } from "@hooks/useScrollLock";

// Standard focusable-element selector for the dialog focus trap below.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const dialogRef = useRef(null);

  useScrollLock(lockScroll);
  useEscapeKey(onClose, closeOnEscape);

  useEffect(() => {
    previouslyFocusedElementRef.current = document.activeElement;

    // Move focus into the dialog on open — its first focusable descendant,
    // or the dialog container itself if it has none — so keyboard and
    // screen-reader users get a cue the dialog appeared, instead of focus
    // silently staying on the (now hidden-behind-overlay) trigger element.
    const dialogNode = dialogRef.current;
    const firstFocusable = dialogNode?.querySelector(FOCUSABLE_SELECTOR);
    (firstFocusable || dialogNode)?.focus({ preventScroll: true });

    return () => {
      if (!restoreFocus) return;

      const previouslyFocusedElement = previouslyFocusedElementRef.current;

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus({ preventScroll: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps Tab/Shift+Tab cycling within the dialog while it's open (the ARIA
  // dialog pattern) — without this, Tab would walk into page content that's
  // only visually hidden behind the overlay, not actually removed from the
  // tab order.
  const handleKeyDown = (event) => {
    if (event.key !== "Tab") return;

    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    const focusable = Array.from(
      dialogNode.querySelectorAll(FOCUSABLE_SELECTOR)
    ).filter((el) => el.offsetParent !== null); // skip hidden elements

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      className={`fixed inset-0 z-60 flex ${overlayClassName}`}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        className={`flex flex-col overflow-hidden ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
