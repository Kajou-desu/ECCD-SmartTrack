// Pure helpers for the attendance-session hook. Kept free of React and of
// aliased imports so they can be unit tested with `node --test`.

// While a session is running, poll fast enough that the header (and, later, the
// live monitor) reflects a stop/start from another device within seconds. When
// idle, poll slowly: it only exists so a second device eventually notices a
// session someone else started, without spending the backend's per-user quota.
export const ACTIVE_POLL_MS = 3000;
export const IDLE_POLL_MS = 30000;

export function sessionPollInterval(session) {
  return session ? ACTIVE_POLL_MS : IDLE_POLL_MS;
}

// The backend answers { session: {...} | null } for status, start and stop.
// React Query treats an `undefined` query result as an error, so always
// normalise to an object or null.
export function normalizeSessionResponse(data) {
  const session = data?.session;
  return session && typeof session === "object" ? session : null;
}
