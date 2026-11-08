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

// The status call also says whether automatic pickup tracking is running;
// start/stop answer with the session alone, which normalises to no window.
// mode: "auto" (the schedule), "on" or "off" (the teacher pressed Start / Stop).
const PICKUP_MODES = ["auto", "on", "off"];

export function normalizePickupWindow(value) {
  return {
    active: value?.active === true,
    endsAt: typeof value?.endsAt === "string" ? value.endsAt : null,
    mode: PICKUP_MODES.includes(value?.mode) ? value.mode : "auto",
  };
}

// The backend answers { session: {...} | null, ... } for status, start and stop.
// React Query treats an `undefined` query result as an error, so always
// normalise to an object or null.
export function normalizeSessionResponse(data) {
  const session = data?.session;
  if (!session || typeof session !== "object") return null;
  return {
    ...session,
    pickupWindow: normalizePickupWindow(data.pickupWindow),
  };
}
