import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { ATTENDANCE_DATA_BY_CHILD } from "@data/mockParentData";

function fetchAttendance(childId, monthKey) {
    if (!childId) return Promise.reject(new Error("No child selected"));

    return withMockFallback(
        () => apiClient.getChildAttendance(childId, monthKey),
        ATTENDANCE_DATA_BY_CHILD[childId]?.[monthKey] ?? null,
        { label: "useParentAttendance" },
    ).then(({ data }) => data);
}

// Returns { status: "loading" | "empty" | "error" | "success", data, retry }
// Re-fetches whenever childId or monthKey changes (e.g. child switch, month nav).
export default function useParentAttendance(childId, monthKey) {
    const [status, setStatus] = useState("loading");
    const [data, setData] = useState(null);
    const isMountedRef = useRef(true);

    const load = useCallback(async () => {
        setStatus("loading");
        try {
            const result = await fetchAttendance(childId, monthKey);
            if (!isMountedRef.current) return;
            setData(result);
            setStatus(result ? "success" : "empty");
        } catch {
            if (isMountedRef.current) setStatus("error");
        }
    }, [childId, monthKey]);

    useEffect(() => {
        isMountedRef.current = true;
        Promise.resolve().then(load);
        return () => {
            isMountedRef.current = false;
        };
    }, [load]);

    return { status, data, retry: load };
}