import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { LogOut } from "lucide-react";

export default function LogoutConfirmModal({ onCancel, onConfirm }) {
  return (
    <Modal onClose={onCancel} labelledBy="logout-confirm-title">
      <div className="flex items-start gap-4 p-5">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100"
        >
          <LogOut className="h-5 w-5 text-red-600" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 id="logout-confirm-title" className="text-base font-bold text-slate-900">
            Log out?
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Are you sure you want to log out of ECCD SmartTrack?
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
        <SecondaryButton label="Cancel" onClick={onCancel} />
        <PrimaryButton
          label="Log out"
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700"
        />
      </div>
    </Modal>
  );
}