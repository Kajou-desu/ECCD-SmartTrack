import { Play, Square } from "lucide-react";

// Automatic pickup on the Live attendance page: what it is doing right now, and
// the button that starts or stops it. `endsAtLabel` is a ready-to-show time.
export default function PickupWatchControl({ pickupWindow, endsAtLabel, isToggling, onStart, onStop }) {
  const running = pickupWindow.active;
  const message = running
    ? `Automatic pickup is on${endsAtLabel ? ` until ${endsAtLabel}` : ""}. Keep the exit camera on: a student it sees leaving is marked picked up. If the exit camera misses a student, they show as Not Detected in the table below once their tag goes quiet, where you can mark them picked up; after several minutes they are marked picked up automatically.`
    : pickupWindow.mode === "off"
      ? "Automatic pickup is stopped. No one will be checked on or marked picked up until you start it again."
      : "Automatic pickup is off. It starts by itself in the pickup window, or you can start it now.";
  const Icon = running ? Square : Play;

  return (
    <section
      className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        running ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      <p role="status" className="min-w-0 text-sm">{message}</p>
      <button
        type="button"
        onClick={running ? onStop : onStart}
        disabled={isToggling}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon aria-hidden="true" className="h-4 w-4" />
        {running ? "Stop auto pickup" : "Start auto pickup"}
      </button>
    </section>
  );
}
