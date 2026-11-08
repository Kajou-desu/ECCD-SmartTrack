import { useEffect } from "react";

// Toasts appear at the top right, directly under the header. The header's height
// changes (the reminder banner comes and goes, the layout wraps on small
// screens), so it reports its own bottom edge here as a CSS variable that the
// Toast reads. Without a header (e.g. the login page) the toast sits at the top.
export const TOAST_OFFSET_VAR = "--toast-top";

export function useToastOffset(ref) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const root = document.documentElement;
    const update = () => root.style.setProperty(TOAST_OFFSET_VAR, `${Math.max(0, Math.round(element.getBoundingClientRect().bottom))}px`);

    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(element);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty(TOAST_OFFSET_VAR);
    };
  }, [ref]);
}

export default useToastOffset;
