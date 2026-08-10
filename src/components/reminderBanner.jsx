import { useState } from "react";
import { Megaphone, X } from "lucide-react";

export default function ReminderBanner({ reminder }) {
  const [showReminder, setShowReminder] = useState(true);

  return (
    <div>
      {showReminder && reminder && (
        <div className="border-b border-slate-100 bg-orange-50 px-4 py-2 sm:px-6 overflow-hidden">
          <style>{`
            @keyframes marquee {
              0% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            .reminder-marquee {
              animation: marquee 15s linear infinite;
              white-space: nowrap;
              display: inline-block;
            }
            .reminder-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 flex-1">
              <span className="shrink-0 text-lg">
                <Megaphone className="h-5 w-5 text-orange-700 shrink-0" />
              </span>
              <div className="overflow-hidden flex-1">
                <p className="text-sm text-gray-700 reminder-marquee">
                  {reminder} &nbsp;&nbsp;
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReminder(false)}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              aria-label="Dismiss reminder"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
