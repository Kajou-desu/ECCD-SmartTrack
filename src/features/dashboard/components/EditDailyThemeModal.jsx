import { useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { X } from "lucide-react";

// A blank/placeholder theme (see dashboard.controller.js's getDailyTheme
// fallback) has title "No theme set for today" and every other field
// empty — that's not something to prefill into an edit form.
const PLACEHOLDER_TITLE = "No theme set for today";

export default function EditDailyThemeModal({ theme, onCancel, onConfirm }) {
  const isPlaceholder = !theme || theme.title === PLACEHOLDER_TITLE;

  const [letter, setLetter] = useState(isPlaceholder ? "" : theme.letter || "");
  const [label, setLabel] = useState(isPlaceholder ? "" : theme.label || "");
  const [subtitle, setSubtitle] = useState(isPlaceholder ? "" : theme.subtitle || "");
  const [title, setTitle] = useState(isPlaceholder ? "" : theme.title || "");
  const [description, setDescription] = useState(isPlaceholder ? "" : theme.description || "");
  const [objectivesText, setObjectivesText] = useState(
    isPlaceholder ? "" : (theme.objectives ?? []).join("\n"),
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const objectives = objectivesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    onConfirm({
      letter: letter.trim(),
      label: label.trim(),
      subtitle: subtitle.trim(),
      title: title.trim(),
      description: description.trim(),
      objectives,
    });
  };

  return (
    <Modal onClose={onCancel} labelledBy="daily-theme-form-title">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 id="daily-theme-form-title" className="text-lg font-bold text-slate-900">
              Today's Theme
            </h2>
            <p className="mt-1 text-sm text-slate-600">Set or edit today's lesson theme.</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="theme-letter" className="mb-2 block text-sm font-semibold text-slate-700">
                Letter
                <span className="text-red-600">*</span>
              </label>
              <input
                id="theme-letter"
                type="text"
                value={letter}
                onChange={(event) => setLetter(event.target.value)}
                placeholder="A"
                required
                maxLength={10}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label htmlFor="theme-label" className="mb-2 block text-sm font-semibold text-slate-700">
                Label
                <span className="text-red-600">*</span>
              </label>
              <input
                id="theme-label"
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Apple"
                required
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="theme-subtitle" className="mb-2 block text-sm font-semibold text-slate-700">
              Subtitle
            </label>
            <input
              id="theme-subtitle"
              type="text"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="e.g. Fruits we eat"
              maxLength={200}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="theme-title" className="mb-2 block text-sm font-semibold text-slate-700">
              Lesson Title
              <span className="text-red-600">*</span>
            </label>
            <input
              id="theme-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Letter A Day"
              required
              maxLength={200}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="theme-description" className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="theme-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What will the class explore today?"
              rows={3}
              maxLength={2000}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="theme-objectives" className="mb-2 block text-sm font-semibold text-slate-700">
              Objectives
            </label>
            <textarea
              id="theme-objectives"
              value={objectivesText}
              onChange={(event) => setObjectivesText(event.target.value)}
              placeholder={"One objective per line, e.g.\nRecognize the letter A\nName 3 fruits"}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            <p className="mt-1 text-xs text-slate-500">One objective per line.</p>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Save Theme" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
