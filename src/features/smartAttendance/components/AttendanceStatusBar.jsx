import { Camera, CircleCheck, TriangleAlert, ScanFace, RadioTower } from "lucide-react";

// One line per thing that must be working for automatic attendance to work.
// State is always written out in words as well as colour.
function StatusItem({ icon: Icon, label, ok, text }) {
  const Indicator = ok ? CircleCheck : TriangleAlert;
  return (
    <li className="flex min-w-0 items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`flex items-center gap-1 text-sm font-semibold ${ok ? "text-green-700" : "text-amber-700"}`}>
          <Indicator aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="truncate">{text}</span>
        </p>
      </div>
    </li>
  );
}

export default function AttendanceStatusBar({ cameraStatus, recognitionAvailable, gatewayOnline }) {
  return (
    <ul aria-label="System status" className="grid gap-2 sm:grid-cols-3">
      <StatusItem
        icon={Camera}
        label="This device's camera"
        ok={cameraStatus === "live"}
        text={cameraStatus === "live" ? "On" : cameraStatus === "starting" ? "Starting" : "Off"}
      />
      <StatusItem
        icon={ScanFace}
        label="Face recognition"
        ok={recognitionAvailable}
        text={recognitionAvailable ? "Ready" : "Not set up on the server"}
      />
      <StatusItem
        icon={RadioTower}
        label="Door tag reader"
        ok={gatewayOnline}
        text={gatewayOnline ? "Online" : "Not connected"}
      />
    </ul>
  );
}
