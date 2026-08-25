import { useCallback, useEffect, useRef, useState } from "react";
import { ATTENDANCE_DATA_BY_CHILD } from "@data/mockParentData";

function fetchAttendance(childId, monthKey) {
    return new Promise((resolve, reject) => {
        window.setTimeout(() => {
            if (!childId) {
                reject(new Error("No child selected"));
                return;
            }
            resolve(ATTENDANCE_DATA_BY_CHILD[childId]?.[monthKey] ?? null);
        }, 300);
    });
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