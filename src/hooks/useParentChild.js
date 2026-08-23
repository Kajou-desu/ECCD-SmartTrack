import { useContext } from "react";
import { ParentChildContext } from "@context/parentChildContextObject.js";

export function useParentChild() {
    const ctx = useContext(ParentChildContext);
    if (!ctx) {
        throw new Error(
            "useParentChild must be used within a ParentChildProvider",
        );
    }
    return ctx;
}