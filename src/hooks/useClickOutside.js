import { useEffect } from "react";

/**
 * Calls `onEscape` whenever the Escape key is pressed while `enabled` is true.
 * Shared so every modal/dialog doesn't re-implement its own keydown listener.
 *
 * @param {() => void} onEscape
 * @param {boolean} enabled
 */
export function useEscapeKey(onEscape, enabled = true) {
    useEffect(() => {
        if (!enabled) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onEscape();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onEscape, enabled]);
}

export default useEscapeKey;