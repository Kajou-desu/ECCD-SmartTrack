import { X } from "lucide-react";

import {
  getAccountId,
  getAccountName,
  getFirstName,
  getLastName,
  getMiddleName,
  normalizeRole,
} from "../utils/accountUtils.js";

function Detail({ label, children, wide = false }) {
  return (
    <div
      className={`rounded-xl border border-slate-100 p-3 ${wide ? "sm:col-span-2" : ""}`}
    >
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-1 text-xs font-semibold text-slate-800">
        {children}
      </div>
    </div>
  );
}

export default function AccountViewModal({ account, onClose }) {
  if (!account) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-800">
            Account Information
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-slate-600">
              {getAccountName(account).charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800">
                {getAccountName(account)}
              </p>

              <p className="mt-0.5 break-all text-[10px] font-bold text-slate-400">
                ID: {getAccountId(account) || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Last Name">{getLastName(account) || "-"}</Detail>

            <Detail label="First Name">{getFirstName(account) || "-"}</Detail>

            <Detail label="Middle Name">
              {getMiddleName(account) || "None"}
            </Detail>

            <Detail label="Role">
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-blue-600">
                {normalizeRole(account.role)}
              </span>
            </Detail>

            <Detail label="Email Address" wide>
              <span className="break-all">
                {account.email || "No email provided"}
              </span>
            </Detail>

            <Detail label="Phone">
              {account.phone || "No phone provided"}
            </Detail>

            <Detail label="Address">
              <span className="wrap-break-word">
                {account.address || "No address provided"}
              </span>
            </Detail>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
