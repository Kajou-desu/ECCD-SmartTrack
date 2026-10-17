import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// The session is an httpOnly cookie, so requests must be sent with
// credentials included (the browser attaches the cookie) and the app must never
// keep a token in localStorage. A request without credentials would 401 and the
// unauthorized handler would sign the user straight back out.
// This uses the REAL AuthProvider, NotificationProvider and apiClient; only
// fetch is faked.
const { AuthProvider } = await import("@context/AuthContext.jsx");
const { NotificationProvider } = await import("@context/NotificationContext.jsx");
const { useAuth } = await import("@hooks/useAuth.js");

let doLogin;
function Probe() {
  const { isAuthenticated, login } = useAuth();
  doLogin = () => login({ id: 7, role: "Teacher" });
  return <span data-testid="auth">{String(isAuthenticated)}</span>;
}

let fetchMock;
beforeEach(() => {
  localStorage.clear();
  // Mirror the backend: no cookie sent -> 401, otherwise an empty list.
  fetchMock = vi.fn(async (_url, opts) => {
    const ok = opts?.credentials === "include";
    return new Response(JSON.stringify(ok ? [] : { message: "Missing or invalid token" }), {
      status: ok ? 200 : 401,
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function tree() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <NotificationProvider><Probe /></NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("login -> first authenticated request", () => {
  it("sends credentials, keeps no token in storage, and stays signed in", async () => {
    render(tree());
    await waitFor(() => expect(screen.getByTestId("auth").textContent).toBe("false"));

    await act(async () => { doLogin(); });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });

    for (const [url, opts] of fetchMock.mock.calls) {
      expect(opts.credentials, url).toBe("include");
      expect(new Headers(opts.headers).get("Authorization"), url).toBeNull();
    }
    expect(screen.getByTestId("auth").textContent).toBe("true");
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("keeps a stored session across a StrictMode-style double mount", async () => {
    localStorage.setItem("authUser", JSON.stringify({ id: 7, role: "Teacher" }));

    const { StrictMode } = await import("react");
    render(<StrictMode>{tree()}</StrictMode>);

    await waitFor(() => expect(screen.getByTestId("auth").textContent).toBe("true"));
  });

  it("removes a token left in storage by an older version", async () => {
    localStorage.setItem("authToken", "legacy-token");
    localStorage.setItem("authUser", JSON.stringify({ id: 7, role: "Teacher" }));
    render(tree());
    await waitFor(() => expect(screen.getByTestId("auth").textContent).toBe("true"));
    expect(localStorage.getItem("authToken")).toBeNull();
  });
});
