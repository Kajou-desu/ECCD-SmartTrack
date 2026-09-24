import { useEffect, useState } from "react";
import { apiClient } from "@api/client.js";

export const FILE_STATUS = {
  LOADING: "loading",
  READY: "ready",
  MISSING: "missing", // the API says the file no longer exists
  ERROR: "error", // anything else (network, server)
};

const LOADING = { status: FILE_STATUS.LOADING };

/**
 * Loads one submission's file so it can be previewed and downloaded.
 * Resolves to { status, objectUrl, type }: `objectUrl` is a same-origin blob:
 * URL, present only when ready. Only one file is held in memory at a time —
 * it is released when another is selected or the page is left.
 */
export function useSubmissionFile(fileUrl) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = null;

    apiClient
      .getFileBlob(fileUrl, { signal: controller.signal })
      .then((blob) => {
        if (controller.signal.aborted) return;
        if (!blob) {
          setResult({ forUrl: fileUrl, status: FILE_STATUS.MISSING });
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setResult({ forUrl: fileUrl, status: FILE_STATUS.READY, objectUrl, type: blob.type });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ forUrl: fileUrl, status: FILE_STATUS.ERROR });
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl]);

  // A result for a different file is stale: show loading until this file's
  // own result arrives (derived here, so no state reset inside the effect).
  return result?.forUrl === fileUrl ? result : LOADING;
}

export default useSubmissionFile;
