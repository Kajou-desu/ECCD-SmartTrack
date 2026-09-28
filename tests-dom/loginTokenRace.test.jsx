import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Regression: right after login the first /api/notifications request went out
// WITHOUT an Authorization header (the token was only written to localStorage
// in a parent effect, which runs after the child's query effect). The backend
// answered 401 and the unauthorized handler signed the user straight back out.
// This uses the REAL AuthProvider, NotificationProvider and apiClient; only
// fetch is faked.
const { AuthProvider } = await import("@context/AuthContext.jsx");
const { NotificationProvider } = await import("@context/NotificationContext.jsx");
const { useAuth } = await import("@hooks/useAuth.js");

// Not a real credential: a structurally valid, unsigned JWT-shaped string with
// a far-future exp, used only so the client-side expiry check passes.
const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, "");
const TEST_TOKEN = `${b64({ alg: "none" })}.${b64({ exp: 4102444800 })}.sig`;

let doLogin;
function Probe() {
  const { isAuthenticated, login } = useAuth();
  doLogin = () => login(TEST_TOKEN, { id: 7, role: "Teacher" });
  return <span data-testid="auth">{String(isAuthenticated)}</span>;
}

let fetchMock;
beforeEach(() => {
  localStorage.clear();
  // Mirror the backend: no bearer token -> 401, otherwise an empty list.
  fetchMock = vi.fn(async (_url, opts) => {
    const auth = new Headers(opts?.headers).get("Authorization");
    const ok = auth === `Bearer ${TEST_TOKEN}`;
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
  it("sends the bearer token and stays signed in", async () => {
    render(tree());
    await waitFor(() => expect(screen.getByTestId("auth").textContent).toBe("false"));

    await act(async () => { doLogin(); });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });

    for (const [url, opts] of fetchMock.mock.calls) {
      expect(new Headers(opts.headers).get("Authorization"), url).toBe(`Bearer ${TEST_TOKEN}`);
    }
    expect(screen.getByTestId("auth").textContent).toBe("true");
    expect(localStorage.getItem("authToken")).toBe(TEST_TOKEN);
  });

  it("keeps a stored session across a StrictMode-style double mount", async () => {
    localStorage.setItem("authToken", TEST_TOKEN);
    localStorage.setItem("authUser", JSON.stringify({ id: 7, role: "Teacher" }));

    const { StrictMode } = await import("react");
    render(<StrictMode>{tree()}</StrictMode>);

    await waitFor(() => expect(screen.getByTestId("auth").textContent).toBe("true"));
    expect(localStorage.getItem("authToken")).toBe(TEST_TOKEN);
  });
});
