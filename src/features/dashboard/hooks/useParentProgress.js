import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { PROGRESS_DATA_BY_CHILD } from "@data/mockParentData";

function fetchProgressData(childId) {
    if (!childId) return Promise.reject(new Error("No child selected"));

    return withMockFallback(
        () => apiClient.getChildProgress(childId),
        PROGRESS_DATA_BY_CHILD[childId] ?? null,
        { label: "useParentProgress" },
    ).then(({ data }) => data);
}

// Returns { status: "loading" | "empty" | "error" | "success", data, retry }
export default function useParentProgress(childId) {
    const [status, setStatus] = useState("loading");
    const [data, setData] = useState(null);
    const isMountedRef = useRef(true);

    const load = useCallback(async () => {
        setStatus("loading");
        try {
            const result = await fetchProgressData(childId);
            if (!isMountedRef.current) return;
            setData(result);
            setStatus(result ? "success" : "empty");
        } catch {
            if (isMountedRef.current) setStatus("error");
        }
    }, [childId]);

    useEffect(() => {
        isMountedRef.current = true;
        // Defer the initial call to a microtask so setState doesn't run
        // synchronously within the effect body.
        Promise.resolve().then(load);
        return () => {
            isMountedRef.current = false;
        };
    }, [load]);

    return { status, data, retry: load };
}