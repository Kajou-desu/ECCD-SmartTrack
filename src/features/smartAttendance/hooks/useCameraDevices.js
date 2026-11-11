import { useEffect, useState } from "react";
import {
  IN_USE_REFRESH_MS,
  claimInUse,
  readInUse,
  releaseInUse,
  resolveSelection,
  takenByOther,
  toCameraOptions,
} from "../utils/cameraDevices.js";

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

// The cameras this device can use, for the dropdown, and which of them the OTHER
// role (entry vs exit) is using in another tab of this browser, so the two roles
// can be kept on different cameras. Claims live in localStorage and are refreshed
// while the camera is on; a tab that closes or crashes simply stops refreshing,
// and its claim expires.
//
//   role          "entry" | "exit"
//   status        the camera's status ("off" | "starting" | "live")
//   activeId      the camera in use (from the stream), once live
//   preferredId   the camera chosen for this role
//   onSelect(id)  choose a camera
export function useCameraDevices({ role, status, activeId, preferredId, onSelect }) {
  const [options, setOptions] = useState([]);
  const [inUse, setInUse] = useState(() => readInUse(storage()));

  // The list, and again when a camera is plugged in or out, and once the camera
  // is live (labels and ids only appear after permission is granted).
  useEffect(() => {
    let cancelled = false;
    const media = navigator.mediaDevices;
    const load = () =>
      Promise.resolve(media?.enumerateDevices?.())
        .then((devices) => {
          if (!cancelled) setOptions(toCameraOptions(devices));
        })
        .catch(() => {
          if (!cancelled) setOptions([]);
        });
    load();
    media?.addEventListener?.("devicechange", load);
    return () => {
      cancelled = true;
      media?.removeEventListener?.("devicechange", load);
    };
  }, [status]);

  // What the other role is using, from other tabs' claims.
  useEffect(() => {
    const read = () => setInUse(readInUse(storage()));
    window.addEventListener("storage", read);
    const timer = setInterval(read, IN_USE_REFRESH_MS);
    return () => {
      window.removeEventListener("storage", read);
      clearInterval(timer);
    };
  }, []);

  // While live, claim the camera in use and keep the claim fresh; let it go when
  // the camera goes off or the page closes.
  useEffect(() => {
    if (status !== "live" || !activeId) return undefined;
    const claim = () => claimInUse(storage(), role, activeId);
    claim();
    const timer = setInterval(claim, IN_USE_REFRESH_MS);
    const release = () => releaseInUse(storage(), role);
    window.addEventListener("pagehide", release);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", release);
      release();
    };
  }, [status, role, activeId]);

  // With the camera off, keep this role off the camera the other role has: pick
  // its remembered one if free, otherwise another that is.
  useEffect(() => {
    if (status !== "off" || options.length === 0) return;
    const wanted = resolveSelection({ options, preferred: preferredId, role, inUse });
    if (wanted !== null && wanted !== preferredId) onSelect(wanted);
  }, [status, options, preferredId, role, inUse, onSelect]);

  const selectedId = activeId ?? preferredId ?? null;
  const entries = options.map((option) => ({ ...option, takenBy: takenByOther(inUse, role, option.deviceId) }));
  return { options: entries, selectedId };
}
