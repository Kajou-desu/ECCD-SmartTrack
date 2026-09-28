import { useState } from "react";
import { createPortal } from "react-dom";
import { ConfirmDialog } from "./AttendanceDialogs";

// Shared by the Attendance page card and the dashboard's "Today's Attendance"
// list. Asks for confirmation first: marking a student departed sends an
// in-app notification, email and SMS to their parents/guardians, and can't be
// undone from the UI. The dialog is portalled to <body>: both host cards use a
// hover transform, which would otherwise turn its `fixed` overlay into one
// confined to (and clipped by) the card.
export default function MarkDepartedButton({ studentName, onDepart, disabled = false, className = "" }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`Mark ${studentName} departed`}
        onClick={() => setConfirming(true)}
        disabled={disabled}
        className={`cursor-pointer bg-[#C2570C] font-semibold text-white transition hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {disabled ? "..." : "Mark departed"}
      </button>

      {createPortal(
        <ConfirmDialog
          open={confirming}
          title="Mark as departed?"
          message={`${studentName} will be marked as departed and their parents/guardians will be notified by app, email and SMS.`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDepart();
          }}
        />,
        document.body,
      )}
    </>
  );
}
