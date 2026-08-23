import { useContext } from "react";
import { EventPhotosContext } from "@features/eventPhotos/context/EventPhotosContextObject";

export function useEventPhotos() {
    const ctx = useContext(EventPhotosContext);

    if (!ctx) {
        throw new Error("useEventPhotos must be used within an EventPhotosProvider");
    }

    return ctx;
}

export default useEventPhotos;