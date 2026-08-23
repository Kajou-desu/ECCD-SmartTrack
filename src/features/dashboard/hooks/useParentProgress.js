import { useCallback, useEffect, useRef, useState } from "react";
import { PROGRESS_DATA_BY_CHILD } from "@data/mockParentData";

function fetchProgressData(childId) {
    return new Promise((resolve, reject) => {
        window.setTimeout(() => {
            if (!childId) {
                reject(new Error("No child selected"));
                return;
            }
            resolve(PROGRESS_DATA_BY_CHILD[childId] ?? null);
        }, 300);
    });
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