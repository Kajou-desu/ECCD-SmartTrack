import { useState } from "react";
import Modal from "@components/ui/Modal";
import { Loader2 } from "lucide-react";

export default function EditAlbumModal({ album, onCancel, onConfirm }) {
  const [title, setTitle] = useState(album.title || "");
  const [category, setCategory] = useState(album.category || "Uncategorized");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      await onConfirm({ title: title.trim(), category });
    } catch (err) {
      setError(err?.details?.message || err?.message || "Failed to update album.");
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onCancel} labelledBy="edit-album-title">
      <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
        <h2 id="edit-album-title" className="text-lg font-bold text-slate-900">Edit Album</h2>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Album Name <span className="text-red-600">*</span></span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Category</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold">Cancel</button>
          <button type="submit" disabled={saving || !title.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
