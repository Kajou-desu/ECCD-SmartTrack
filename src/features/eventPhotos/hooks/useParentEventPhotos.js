import { useContext } from "react";
import { ParentEventPhotosContext } from "@features/eventPhotos/context/parentEventPhotosContextObject";

export function useParentEventPhotos() {
    const ctx = useContext(ParentEventPhotosContext);

    if (!ctx) {
        throw new Error("useParentEventPhotos must be used within a ParentEventPhotosProvider");
    }

    return ctx;
}

export default useParentEventPhotos;
