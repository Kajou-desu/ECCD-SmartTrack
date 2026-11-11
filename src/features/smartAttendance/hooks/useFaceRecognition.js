import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@api/client.js";
import { readPreferred, videoConstraints, writePreferred } from "../utils/cameraDevices.js";
import {
  DEGRADED_AFTER_FAILURES,
  FRAME_JPEG_QUALITY,
  classifyFrameError,
  describeCameraError,
  describeStopReason,
  frameSize,
  nextFrameDelay,
} from "../utils/attendanceMonitor.js";

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Draws the current video frame (downscaled) onto a canvas and encodes a JPEG.
function captureFrame(video, canvas) {
  const { width, height } = frameSize(video?.videoWidth, video?.videoHeight);
  if (!width) return Promise.reject(new Error("Camera has no picture yet"));
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(video, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode frame"))),
      "image/jpeg",
      FRAME_JPEG_QUALITY,
    );
  });
}

// Streams this device's camera to the server for recognition, one frame at a
// time: the next frame is sent only after the previous response arrives, so a
// slow connection can never pile up requests. Only pixels leave the device —
// the server decides who is in each frame.
//
// `role` is which of the center's two cameras this device is: "entry" (arrivals,
// the default) or "exit" (pickup). It is sent with every frame. `onVerified`
// hears students marked present (entry); `onPickedUp` hears students marked
// picked up (exit).
//
// Which physical camera is used: start() with nothing uses the one chosen for
// this role (remembered per role, see utils/cameraDevices.js); start("user" |
// "environment") asks for the front/back camera; start({ deviceId }) for an exact
// one. `deviceId` is the camera actually in use; selectDevice(id) chooses one
// (and switches to it at once if the camera is on).
//
// Every exit path (turning it off, the session ending, losing permission,
// unmounting) goes through stop()/release(), so the camera light always goes out.
export function useFaceRecognition({ role = "entry", onVerified, onPickedUp } = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const wakeLockRef = useRef(null);
  const abortRef = useRef(null);
  // Bumped on every start/stop. A loop only keeps going while its own run id is
  // still current, so a stale loop can never outlive a stop or a restart.
  const runRef = useRef(0);
  const onVerifiedRef = useRef(onVerified);
  const onPickedUpRef = useRef(onPickedUp);
  // Read on every frame, so a role change takes effect on the very next one.
  const roleRef = useRef(role);

  const [status, setStatus] = useState("off"); // "off" | "starting" | "live"
  const [message, setMessage] = useState("");
  const [frame, setFrame] = useState(null); // { width, height, faces }
  const [degraded, setDegraded] = useState(false);
  const [deviceId, setDeviceId] = useState(null); // the camera in use, once live
  const [preferredDeviceId, setPreferredDeviceId] = useState(() => readPreferred(storage(), role));
  const preferredRef = useRef(preferredDeviceId);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
    onPickedUpRef.current = onPickedUp;
    roleRef.current = role;
  }, [onVerified, onPickedUp, role]);

  useEffect(() => {
    preferredRef.current = preferredDeviceId;
  }, [preferredDeviceId]);

  // Each role remembers its own camera, so changing role picks up that role's.
  const firstRole = useRef(role);
  useEffect(() => {
    if (firstRole.current === role) return;
    firstRole.current = role;
    setPreferredDeviceId(readPreferred(storage(), role));
  }, [role]);

  const release = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    wakeLockRef.current?.release?.().catch(() => {});
    wakeLockRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stop = useCallback(
    (notice = "") => {
      runRef.current += 1;
      release();
      setStatus("off");
      setFrame(null);
      setDegraded(false);
      setDeviceId(null);
      setMessage(notice);
    },
    [release],
  );

  const runLoop = useCallback(
    async (run) => {
      let failures = 0;
      while (run === runRef.current) {
        const startedAt = performance.now();
        const controller = new AbortController();
        abortRef.current = controller;
        try {
          canvasRef.current ||= document.createElement("canvas");
          const blob = await captureFrame(videoRef.current, canvasRef.current);
          const result = await apiClient.sendAttendanceFrame(blob, {
            signal: controller.signal,
            camera: roleRef.current,
          });
          if (run !== runRef.current) return;
          failures = 0;
          setDegraded(false);
          setFrame({ width: result.width, height: result.height, faces: result.faces ?? [] });
          if (result.verified?.length) onVerifiedRef.current?.(result.verified);
          if (result.pickedUp?.length) onPickedUpRef.current?.(result.pickedUp);
        } catch (error) {
          if (run !== runRef.current) return; // aborted because we stopped: not a failure
          failures += 1;
          const decision = classifyFrameError(error, failures);
          if (decision.action === "stop") {
            stop(describeStopReason(decision.reason));
            return;
          }
          if (failures >= DEGRADED_AFTER_FAILURES) setDegraded(true);
          await sleep(decision.delayMs);
          continue;
        }
        await sleep(nextFrameDelay(performance.now() - startedAt));
      }
    },
    [stop],
  );

  const start = useCallback(
    async (choice) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage(describeCameraError({ name: "UnsupportedError" }));
        return;
      }
      stop(); // tear down any previous run first
      const run = runRef.current;
      setStatus("starting");

      // A string is a facing mode; an object names an exact camera; nothing means
      // this role's remembered camera (if any).
      const wanted = typeof choice === "string" ? { facingMode: choice } : choice ?? { deviceId: preferredRef.current };
      let stream;
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints(wanted), audio: false });
        } catch (error) {
          // A remembered camera that was unplugged: forget it and use the default.
          if (!wanted.deviceId || !["OverconstrainedError", "NotFoundError"].includes(error?.name)) throw error;
          if (run === runRef.current) {
            writePreferred(storage(), roleRef.current, null);
            setPreferredDeviceId(null);
          }
          stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints({}), audio: false });
        }
      } catch (error) {
        if (run === runRef.current) {
          setStatus("off");
          setMessage(describeCameraError(error));
        }
        return;
      }
      // Turned off (or restarted) while the permission prompt was open.
      if (run !== runRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      try {
        await video.play();
      } catch (error) {
        if (run === runRef.current) stop(describeCameraError(error));
        return;
      }
      if (run !== runRef.current) return;

      try {
        wakeLockRef.current = (await navigator.wakeLock?.request("screen")) ?? null; // best effort: keeps the screen on
      } catch {
        /* Wake lock is optional (unsupported, or denied on low battery). */
      }
      setDeviceId(stream.getVideoTracks?.()[0]?.getSettings?.().deviceId ?? null);
      setStatus("live");
      runLoop(run);
    },
    [stop, runLoop],
  );

  // Choose this role's camera; if the camera is on, switch to it straight away.
  const selectDevice = useCallback(
    (id) => {
      const next = id || null;
      writePreferred(storage(), roleRef.current, next);
      preferredRef.current = next;
      setPreferredDeviceId(next);
      if (streamRef.current) start({ deviceId: next });
    },
    [start],
  );

  const dismissMessage = useCallback(() => setMessage(""), []);

  // Browsers drop a wake lock when the tab is hidden; take it again on return.
  useEffect(() => {
    const reacquire = async () => {
      if (document.visibilityState !== "visible" || !streamRef.current || !navigator.wakeLock) return;
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        /* optional */
      }
    };
    document.addEventListener("visibilitychange", reacquire);
    return () => document.removeEventListener("visibilitychange", reacquire);
  }, []);

  // Leaving the page must turn the camera off.
  useEffect(
    () => () => {
      runRef.current += 1;
      release();
    },
    [release],
  );

  return { videoRef, status, message, frame, degraded, deviceId, preferredDeviceId, start, stop, selectDevice, dismissMessage };
}

export default useFaceRecognition;
