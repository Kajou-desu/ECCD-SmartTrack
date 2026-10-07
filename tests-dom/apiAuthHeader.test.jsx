import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { apiClient } = await import("@api/client.js");

let fetchMock;
beforeEach(() => {
  localStorage.setItem("authToken", "stale-token");
  fetchMock = vi.fn(async () =>
    new Response(JSON.stringify({ message: "ok" }), { status: 200, headers: { "content-type": "application/json" } }),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

const authHeaderOf = (call) => new Headers(fetchMock.mock.calls[call][1].headers).get("Authorization");

describe("Authorization header", () => {
  it("is not sent with sign-in or password-reset requests", async () => {
    await apiClient.login("a@b.co", "pw");
    await apiClient.requestPasswordReset("a@b.co");
    await apiClient.resetPassword("a@b.co", "123456", "Sunshine2026ab");
    expect(authHeaderOf(0)).toBeNull();
    expect(authHeaderOf(1)).toBeNull();
    expect(authHeaderOf(2)).toBeNull();
  });

  it("is still sent with ordinary requests", async () => {
    await apiClient.deleteStudent(5);
    expect(authHeaderOf(0)).toBe("Bearer stale-token");
  });
});
