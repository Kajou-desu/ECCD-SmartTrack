import { useState } from "react";
import { Camera, CameraOff, CircleCheck, Clock, SwitchCamera } from "lucide-react";
import ErrorMsg from "@components/ui/ErrorMsg";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { boxToStyle, faceTone } from "../utils/attendanceMonitor.js";

// Box styling per tone. Colour is never the only signal: verified and waiting
// faces also carry an icon and a name.
const TONES = {
  verified: { box: "border-green-400", label: "bg-green-600 text-white", Icon: CircleCheck },
  waiting: { box: "border-amber-400", label: "bg-amber-500 text-white", Icon: Clock },
  unknown: { box: "border-white/70", label: "", Icon: null },
};

function FaceBox({ face, frame }) {
  const style = boxToStyle(face.box, frame.width, frame.height);
  if (!style) return null;
  const tone = TONES[faceTone(face)];
  return (
    <div aria-hidden="true" className={`absolute rounded-md border-2 ${tone.box}`} style={style}>
      {face.student && tone.Icon && (
        <span className={`absolute inset-x-0 bottom-0 flex items-center gap-1 truncate px-1.5 py-0.5 text-xs font-semibold ${tone.label}`}>
          <tone.Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{face.student.name}</span>
        </span>
      )}
    </div>
  );
}

export default function AttendanceCamera({ camera }) {
  const { videoRef, status, message, frame, degraded, start, stop, dismissMessage } = camera;
  const [facing, setFacing] = useState("user");
  // The stage is sized from the picture's own aspect ratio so face boxes (which
  // are percentages of the frame) line up exactly with the video.
  const [ratio, setRatio] = useState(4 / 3);
  const isOn = status !== "off";

  const switchCamera = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    start(next);
  };

  return (
    <section aria-label="Camera" className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Camera</h2>
        <div className="flex flex-wrap gap-2">
          {isOn ? (
            <>
              <SecondaryButton icon={<SwitchCamera className="h-5 w-5" />} label="Switch camera" onClick={switchCamera} disabled={status === "starting"} />
              <SecondaryButton icon={<CameraOff className="h-5 w-5" />} label="Turn off camera" onClick={() => stop()} />
            </>
          ) : (
            <PrimaryButton icon={<Camera className="h-5 w-5" />} label="Use this device's camera" onClick={() => start(facing)} />
          )}
        </div>
      </div>

      {message && (
        <div className="mt-4">
          <ErrorMsg message={message} onClose={dismissMessage} />
        </div>
      )}

      <div
        className="relative mx-auto mt-4 overflow-hidden rounded-lg bg-slate-900"
        style={{ aspectRatio: ratio, width: `min(100%, ${(70 * ratio).toFixed(2)}vh)` }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Live camera view"
          onLoadedMetadata={(event) => {
            const { videoWidth, videoHeight } = event.currentTarget;
            if (videoWidth && videoHeight) setRatio(videoWidth / videoHeight);
          }}
          className="block h-full w-full object-fill"
        />

        {status === "live" && frame?.faces.map((face, index) => <FaceBox key={index} face={face} frame={frame} />)}

        {!isOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-300">
            <CameraOff aria-hidden="true" className="h-10 w-10" />
            <p className="max-w-xs text-sm">
              Turn on this device's camera to recognise students as they arrive. Place it facing the door.
            </p>
          </div>
        )}
        {status === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300" role="status">
            Starting the camera
          </div>
        )}
      </div>

      {status === "live" && degraded && (
        <p role="status" className="mt-3 text-sm text-amber-700">
          Recognition isn't responding right now. The camera is still on and will keep trying.
        </p>
      )}
      {status === "live" && !degraded && (
        <p className="mt-3 text-sm text-gray-500">Keep this screen open and awake while attendance is running.</p>
      )}
    </section>
  );
}
