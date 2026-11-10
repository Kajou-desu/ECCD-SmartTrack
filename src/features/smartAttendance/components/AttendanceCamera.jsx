import formatStudentName from "@utils/formatStudentName.js";

import { useState } from "react";
import { Camera, CameraOff, CircleCheck, Clock, LogOut, SwitchCamera } from "lucide-react";
import ErrorMsg from "@components/ui/ErrorMsg";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { CAMERA_ROLES, CAMERA_ROLE_LABELS, boxToStyle, faceTone } from "../utils/attendanceMonitor.js";

// Box styling per tone. Colour is never the only signal: verified and waiting
// faces also carry an icon and a name.
const TONES = {
  pickedUp: { box: "border-sky-400", label: "bg-sky-700 text-white", Icon: LogOut },
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
          <span className="truncate">{formatStudentName(face.student)}</span>
        </span>
      )}
    </div>
  );
}

// What each role is for, in the words a teacher needs when placing the device.
const ROLE_COPY = {
  entry: {
    hint: "Point it at the door students come in by. They are marked present when their face and their tag are both seen.",
    empty: "Turn on this device's camera to recognise students as they come in. Place it where it can see the door.",
  },
  exit: {
    hint: "Point it at the door students leave by. During the pickup window, a student it recognises going out is marked picked up.",
    empty: "Turn on this device's camera to recognise students as they leave. Place it where it can see the door.",
  },
};

// Which camera this device is. It can't change while the camera is on: the
// server treats the two streams differently, so a switch mid-stream would be
// confusing. Native radios, so keyboard and screen readers work for free.
function RoleSelector({ role, onChange, disabled }) {
  return (
    <fieldset className="mt-4 min-w-0" disabled={disabled}>
      <legend className="text-sm font-medium text-gray-700">This device is the</legend>
      <div className="mt-2 inline-flex rounded-lg border border-slate-300 bg-slate-50 p-1">
        {CAMERA_ROLES.map((value) => (
          <label
            key={value}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#C2570C] ${
              role === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
          >
            <input
              type="radio"
              name="camera-role"
              value={value}
              checked={role === value}
              disabled={disabled}
              onChange={() => onChange(value)}
              className="sr-only"
            />
            {CAMERA_ROLE_LABELS[value]}
          </label>
        ))}
      </div>
      {disabled && <p className="mt-2 text-xs text-gray-500">Turn the camera off to change this.</p>}
    </fieldset>
  );
}

export default function AttendanceCamera({ camera, role = "entry", onRoleChange }) {
  const { videoRef, status, message, frame, degraded, start, stop, dismissMessage } = camera;
  const [facing, setFacing] = useState("user");
  // The stage is sized from the picture's own aspect ratio so face boxes (which
  // are percentages of the frame) line up exactly with the video.
  const [ratio, setRatio] = useState(4 / 3);
  const isOn = status !== "off";
  const copy = ROLE_COPY[role] ?? ROLE_COPY.entry;

  const switchCamera = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    start(next);
  };

  return (
    <section aria-label={CAMERA_ROLE_LABELS[role] ?? "Camera"} className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-800">{CAMERA_ROLE_LABELS[role] ?? "Camera"}</h2>
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

      {onRoleChange && <RoleSelector role={role} onChange={onRoleChange} disabled={isOn} />}
      <p className="mt-3 text-sm text-gray-600">{copy.hint}</p>

      {message && (
        <div className="mt-4">
          <ErrorMsg message={message} onClose={dismissMessage} />
        </div>
      )}

      <div
        className="relative mx-auto mt-4 overflow-hidden rounded-lg bg-slate-900 dark:bg-black"
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
            <p className="max-w-xs text-sm">{copy.empty}</p>
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
