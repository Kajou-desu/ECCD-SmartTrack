import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { apiClient } from "@api/client.js";
import Modal from "@components/ui/Modal";
import formatDate from "@utils/formatDate.js";
import { Loader2 } from "lucide-react";

function formatLastLogin(lastLoginAt) {
  if (!lastLoginAt) return "First login";
  return new Date(lastLoginAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DeleteAccountModal({ onCancel, onDeleted }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (event) => {
    event.preventDefault();
    if (!password || deleting) return;

    setDeleting(true);
    setError("");

    try {
      await apiClient.deleteMyAccount(password);
      onDeleted();
    } catch (err) {
      setError(
        err?.details?.message ||
          "Failed to delete your account. Please check your password and try again.",
      );
      setDeleting(false);
    }
  };

  return (
    <Modal onClose={onCancel} labelledBy="delete-account-title">
      <form onSubmit={handleDelete} className="p-6">
        <h2 id="delete-account-title" className="text-lg font-bold text-gray-900">
          Delete your account?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          This permanently deletes your account and cannot be undone. Enter your
          password to confirm.
        </p>

        <label htmlFor="delete-account-password" className="mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500">
          Password
        </label>
        <input
          id="delete-account-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          placeholder="Enter your password"
        />

        {error && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!password || deleting}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete My Account"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleted = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Account Information
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 font-medium">Account Type</p>
            <p className="font-medium text-gray-800">{user?.role ?? "—"}</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 font-medium">Member Since</p>
            <p className="font-medium text-gray-800">
              {user?.createdAt ? formatDate(user.createdAt) : "—"}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 font-medium">Last Login</p>
            <p className="font-medium text-gray-800">
              {formatLastLogin(user?.lastLoginAt)}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="cursor-pointer w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition font-semibold"
      >
        Delete Account
      </button>

      {showDeleteModal && (
        <DeleteAccountModal
          onCancel={() => setShowDeleteModal(false)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
