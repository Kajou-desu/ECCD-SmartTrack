// Pure helpers for choosing which camera a device uses, and for keeping the
// entry and the exit camera on different ones. No React and no aliased imports,
// so they can be unit tested with `node --test`. Storage is passed in (a
// Storage-like object) so tests don't need a browser, and every access is
// guarded: storage can be blocked or empty, and everything still works without it.

export const IN_USE_TTL_MS = 15_000; // a claim not refreshed for this long is stale (tab closed, crashed)
export const IN_USE_REFRESH_MS = 5_000;
const PREFERRED_KEY = (role) => `smarttrack.cameraDevice.${role}`;
const IN_USE_KEY = "smarttrack.cameraInUse";

// The video inputs from enumerateDevices(), as { deviceId, label } for a <select>.
// Browsers hide labels (and may hide ids) until the camera permission is granted,
// so those get a numbered name and, without an id, are left out (they can't be chosen).
export function toCameraOptions(devices) {
  const seen = new Set();
  const options = [];
  for (const device of Array.isArray(devices) ? devices : []) {
    if (device?.kind !== "videoinput" || !device.deviceId || seen.has(device.deviceId)) continue;
    seen.add(device.deviceId);
    const label = typeof device.label === "string" && device.label.trim() ? device.label.trim() : `Camera ${options.length + 1}`;
    options.push({ deviceId: device.deviceId, label });
  }
  return options;
}

// getUserMedia video constraints: an exact camera when one is chosen, otherwise
// the front camera (the old default).
export function videoConstraints({ deviceId, facingMode = "user" } = {}) {
  const base = { width: { ideal: 1280 }, height: { ideal: 720 } };
  return deviceId ? { ...base, deviceId: { exact: deviceId } } : { ...base, facingMode };
}

function readJson(storage, key) {
  try {
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function write(storage, key, value) {
  try {
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* optional */
  }
}

export function readPreferred(storage, role) {
  try {
    const value = storage?.getItem(PREFERRED_KEY(role));
    return typeof value === "string" && value ? value : null;
  } catch {
    return null;
  }
}
export function writePreferred(storage, role, deviceId) {
  write(storage, PREFERRED_KEY(role), deviceId || null);
}

// Which camera each role is using right now, { entry: id|null, exit: id|null }:
// only claims refreshed within IN_USE_TTL_MS, and only well-formed ones.
export function readInUse(storage, now = Date.now()) {
  const raw = readJson(storage, IN_USE_KEY);
  const result = { entry: null, exit: null };
  for (const role of Object.keys(result)) {
    const claim = raw?.[role];
    if (claim && typeof claim.deviceId === "string" && Number.isFinite(claim.at) && now - claim.at <= IN_USE_TTL_MS) {
      result[role] = claim.deviceId;
    }
  }
  return result;
}
export function claimInUse(storage, role, deviceId, now = Date.now()) {
  const raw = readJson(storage, IN_USE_KEY) ?? {};
  write(storage, IN_USE_KEY, { ...raw, [role]: { deviceId, at: now } });
}
export function releaseInUse(storage, role) {
  const raw = readJson(storage, IN_USE_KEY);
  if (!raw || !(role in raw)) return;
  const rest = { ...raw };
  delete rest[role];
  write(storage, IN_USE_KEY, Object.keys(rest).length ? rest : null);
}

// The role (other than `role`) that is using `deviceId`, or null.
export function takenByOther(inUse, role, deviceId) {
  if (!deviceId) return null;
  return Object.keys(inUse).find((other) => other !== role && inUse[other] === deviceId) ?? null;
}

// The camera a role should start on: its remembered one if it still exists and
// the other role isn't using it, otherwise the first camera the other role isn't
// using, otherwise null (no choice; the browser's default is used).
export function resolveSelection({ options, preferred, role, inUse }) {
  const free = options.filter((o) => !takenByOther(inUse, role, o.deviceId));
  if (preferred && free.some((o) => o.deviceId === preferred)) return preferred;
  return free[0]?.deviceId ?? null;
}
