import { useEffect } from "react";

/**
 * Locks background page scrolling for as long as the calling component is
 * mounted with `enabled` true. Intended for full-screen modals/dialogs.
 *
 * @param {boolean} enabled
 */
export function useScrollLock(enabled = true) {
    useEffect(() => {
        if (!enabled) return undefined;

        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = overflow;
        };
    }, [enabled]);
}

export default useScrollLock;