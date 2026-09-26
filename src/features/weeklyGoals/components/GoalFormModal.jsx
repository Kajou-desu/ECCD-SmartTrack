import { useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { X } from "lucide-react";

export default function GoalFormModal({ mode, goal, onCancel, onConfirm }) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(goal?.title || "");
  const [category, setCategory] = useState(goal?.category || "");
  const [description, setDescription] = useState(goal?.description || "");

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
    });
  };

  return (
    <Modal onClose={onCancel} labelledBy="goal-form-title">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 id="goal-form-title" className="text-lg font-bold text-slate-900">
              {isEdit ? "Edit Goal" : "Add Goal"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {isEdit ? "Update this weekly goal." : "Set a new goal for this week's session."}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <label htmlFor="goal-title" className="mb-2 block text-sm font-semibold text-slate-700">
              Title
              <span className="text-red-600">*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Counting to 10"
              required
              maxLength={200}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="goal-category" className="mb-2 block text-sm font-semibold text-slate-700">
              Category
            </label>
            <input
              id="goal-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Numeracy, Motor Skills"
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="goal-description" className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="goal-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What should students accomplish?"
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label={isEdit ? "Save Changes" : "Add Goal"} type="submit" />
        </div>
      </form>
    </Modal>
  );
}
