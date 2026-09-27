import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Regression test for: file/photo uploads (StudentForm, StudentDetail,
// ProfileSettings) were being aborted after only 10s — the same timeout
// used for a plain JSON request — even though the backend's own
// face-recognition enrollment call (recognitionClient.js) allows up to 15s
// for "several full-size photos". Large uploads on a real (non-office-wifi)
// connection routinely took longer than 10s and were killed mid-transfer.
vi.mock("../src/utils/compressImage.js", () => ({
  compressImage: async (f) => f,
  compressImages: async (files) => files,
}));

const { apiClient } = await import("@api/client.js");

function mockSlowServer(resolveAfterMs, response) {
  return vi.fn((url, options) => {
    const signal = options.signal;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(response), resolveAfterMs);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("The operation was aborted.", "AbortError"));
      });
    });
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("upload requests get a longer timeout than plain JSON requests", () => {
  it("does not abort a FormData upload that takes 20s (would have failed under the old 10s limit)", async () => {
    global.fetch = mockSlowServer(20000, jsonResponse({ documents: [] }));

    const file = new File(["x".repeat(1000)], "doc.pdf", { type: "application/pdf" });
    const promise = apiClient.uploadStudentDocuments(1, [file]);

    await vi.advanceTimersByTimeAsync(20000);

    await expect(promise).resolves.toEqual({ documents: [] });
  });

  it("still aborts an upload if the connection truly hangs past the upload timeout", async () => {
    global.fetch = mockSlowServer(60000, jsonResponse({ documents: [] }));

    const file = new File(["x".repeat(1000)], "doc.pdf", { type: "application/pdf" });
    const promise = apiClient.uploadStudentDocuments(1, [file]).catch((e) => e);

    await vi.advanceTimersByTimeAsync(31000);

    const result = await promise;
    expect(result.name).toBe("AbortError");
  });

  it("still aborts a plain (non-upload, non-retryable) request at the original 10s limit", async () => {
    global.fetch = mockSlowServer(15000, jsonResponse({ token: "t", user: {} }));

    // login() is a plain JSON POST — POST isn't a retryable method, so this
    // isolates the timeout behaviour without also exercising retry/backoff.
    const promise = apiClient.login("a@b.com", "pw").catch((e) => e);

    await vi.advanceTimersByTimeAsync(11000);

    const result = await promise;
    expect(result.name).toBe("AbortError");
  });
});
