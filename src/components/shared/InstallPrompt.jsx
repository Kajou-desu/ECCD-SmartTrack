import { Download, Share, SquarePlus, X } from "lucide-react";
import useInstallPrompt from "@hooks/useInstallPrompt.js";

// A small, dismissible offer to add the app to the home screen. On a phone it
// sits at the top and on larger screens at the bottom left, so it never covers
// the pickup-check prompt (bottom right / bottom centre). It is a plain region,
// not an alert: it is optional.
export default function InstallPrompt() {
  const { mode, install, dismiss } = useInstallPrompt();
  if (!mode) return null;

  return (
    <div
      role="region"
      aria-label="Add to home screen"
      className="fixed inset-x-3 top-3 z-50 mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:inset-x-auto sm:bottom-3 sm:left-3 sm:top-auto sm:mx-0"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700" aria-hidden="true">
          <Download className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">Add SmartTrack to your home screen</p>
          {mode === "install" ? (
            <p className="mt-1 text-xs text-gray-600">Open it like an app, with one tap.</p>
          ) : (
            <p className="mt-1 text-xs text-gray-600">
              Tap <Share className="inline h-3.5 w-3.5 align-text-bottom" aria-label="Share" /> in Safari, then{" "}
              <strong>Add to Home Screen</strong> <SquarePlus className="inline h-3.5 w-3.5 align-text-bottom" aria-hidden="true" />.
            </p>
          )}

          <div className="mt-3 flex gap-2">
            {mode === "install" && (
              <button
                type="button"
                onClick={install}
                className="cursor-pointer rounded-lg bg-[#C2570C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#a84a0a] focus:outline-none focus:ring-2 focus:ring-[#C2570C] focus:ring-offset-2"
              >
                Add to home screen
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C2570C]"
            >
              {mode === "install" ? "Not now" : "Got it"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="shrink-0 cursor-pointer rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C2570C]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
