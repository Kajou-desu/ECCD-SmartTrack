import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@api/client.js";
import {
  DEGRADED_AFTER_FAILURES,
  FRAME_JPEG_QUALITY,
  classifyFrameError,
  describeCameraError,
  describeStopReason,
  frameSize,
  nextFrameDelay,
} from "../utils/attendanceMonitor.js";

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
// Every exit path (turning it off, the session ending, losing permission,
// unmounting) goes through stop()/release(), so the camera light always goes out.
export function useFaceRecognition({ onVerified } = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const wakeLockRef = useRef(null);
  const abortRef = useRef(null);
  // Bumped on every start/stop. A loop only keeps going while its own run id is
  // still current, so a stale loop can never outlive a stop or a restart.
  const runRef = useRef(0);
  const onVerifiedRef = useRef(onVerified);

  const [status, setStatus] = useState("off"); // "off" | "starting" | "live"
  const [message, setMessage] = useState("");
  const [frame, setFrame] = useState(null); // { width, height, faces }
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

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
          const result = await apiClient.sendAttendanceFrame(blob, { signal: controller.signal });
          if (run !== runRef.current) return;
          failures = 0;
          setDegraded(false);
          setFrame({ width: result.width, height: result.height, faces: result.faces ?? [] });
          if (result.verified?.length) onVerifiedRef.current?.(result.verified);
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
    async (facingMode = "user") => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage(describeCameraError({ name: "UnsupportedError" }));
        return;
      }
      stop(); // tear down any previous run first
      const run = runRef.current;
      setStatus("starting");

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
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
      setStatus("live");
      runLoop(run);
    },
    [stop, runLoop],
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

  return { videoRef, status, message, frame, degraded, start, stop, dismissMessage };
}

export default useFaceRecognition;
