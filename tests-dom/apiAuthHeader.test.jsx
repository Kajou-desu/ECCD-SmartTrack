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

const optsOf = (call) => fetchMock.mock.calls[call][1];

describe("session cookie", () => {
  it("is sent with every request, and no Authorization header is ever built from storage", async () => {
    await apiClient.login("a@b.co", "pw");
    await apiClient.deleteStudent(5);
    await apiClient.logout();
    for (const i of [0, 1, 2]) {
      expect(optsOf(i).credentials).toBe("include");
      expect(new Headers(optsOf(i).headers).get("Authorization")).toBeNull();
    }
  });

  it("logout posts to the server so it can clear the cookie", async () => {
    await apiClient.logout();
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/auth\/logout$/);
    expect(optsOf(0).method).toBe("POST");
  });
});
