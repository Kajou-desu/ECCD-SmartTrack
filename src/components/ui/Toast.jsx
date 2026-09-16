import { useEffect, useRef } from "react";
import Modal from "@components/ui/Modal";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

const DIALOG_VARIANTS = {
  info: { icon: Info, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  error: { icon: AlertCircle, iconBg: "bg-red-50", iconColor: "text-red-600" },
};

export function NotificationToast({
  type = "info",
  title = "Notification",
  message,
  onClose,
}) {
  const variant = DIALOG_VARIANTS[type] || DIALOG_VARIANTS.info;
  const Icon = variant.icon;

  return (
    <Modal
      onClose={onClose}
      labelledBy="notification-title"
      className="w-full max-w-sm max-h-[90vh] rounded-xl bg-white shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variant.iconBg}`}
            aria-hidden="true"
          >
            <Icon size={20} className={variant.iconColor} />
          </div>

          <div>
            <h2
              id="notification-title"
              className="text-base font-bold text-slate-900"
            >
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        >
          Okay
        </button>
      </div>
    </Modal>
  );
}

const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle2,
    role: "status",
    ariaLive: "polite",
    border: "border-green-200",
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    text: "text-green-800",
    closeColor: "text-green-600 hover:bg-green-100",
  },
  error: {
    icon: AlertCircle,
    role: "alert",
    ariaLive: "assertive",
    border: "border-red-200",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    text: "text-red-800",
    closeColor: "text-red-500 hover:bg-red-100",
  },
  warning: {
    icon: AlertTriangle,
    role: "status",
    ariaLive: "polite",
    border: "border-amber-200",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    text: "text-amber-800",
    closeColor: "text-amber-600 hover:bg-amber-100",
  },
  info: {
    icon: Info,
    role: "status",
    ariaLive: "polite",
    border: "border-blue-200",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    text: "text-blue-800",
    closeColor: "text-blue-600 hover:bg-blue-100",
  },
};

// Errors and warnings get more time to read; success/info messages are
// typically shorter and lower-stakes.
const TOAST_DURATION_MS = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 6000,
};

export function Toast({ type = "success", message, onClose }) {
  const duration = TOAST_DURATION_MS[type] ?? 4000;
  const timerIdRef = useRef(null);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const startTimer = (ms) => {
    startedAtRef.current = Date.now();
    timerIdRef.current = window.setTimeout(() => onCloseRef.current(), ms);
  };

  // Pausing (rather than just running longer) means a user who's mid-read
  // when they mouse over or tab to the toast never has it vanish under them
  // — satisfies WCAG 2.2.2 (Pause, Stop, Hide) for any message length.
  const pauseTimer = () => {
    if (timerIdRef.current === null) return;
    window.clearTimeout(timerIdRef.current);
    timerIdRef.current = null;
    remainingRef.current -= Date.now() - startedAtRef.current;
  };

  const resumeTimer = () => {
    if (timerIdRef.current !== null) return;
    startTimer(Math.max(remainingRef.current, 0));
  };

  useEffect(() => {
    startTimer(remainingRef.current);

    return () => {
      if (timerIdRef.current !== null) window.clearTimeout(timerIdRef.current);
    };
    // Mount-only: startTimer reads onCloseRef.current, not onClose directly.
  }, []);

  const variant = TOAST_VARIANTS[type] || TOAST_VARIANTS.success;
  const Icon = variant.icon;

  return (
    <div
      role={variant.role}
      aria-live={variant.ariaLive}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
      className={`fixed bottom-4 right-4 z-70 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl ${variant.border} ${variant.bg}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${variant.iconBg}`}
        aria-hidden="true"
      >
        <Icon size={20} className={variant.iconColor} />
      </div>

      <p className={`flex-1 pt-1 text-sm font-medium ${variant.text}`}>
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-400 ${variant.closeColor}`}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
