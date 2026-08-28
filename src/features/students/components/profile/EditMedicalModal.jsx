import { useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { Plus, Trash2, X } from "lucide-react";

function makeId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toListField(list) {
  return (list ?? []).map((value) => ({ id: makeId(), value }));
}

function fromListField(list) {
  return list.map((item) => item.value.trim()).filter(Boolean);
}

export default function EditMedicalModal({
  medical,
  onCancel,
  onSave,
  hideAccommodations = false,
}) {
  const [allergies, setAllergies] = useState(() =>
    toListField(medical.allergies),
  );
  const [dietary, setDietary] = useState(() => toListField(medical.dietary));
  const [accommodations, setAccommodations] = useState(() =>
    toListField(medical.accommodations),
  );

  const updateItem = (setter, id, value) =>
    setter((current) =>
      current.map((item) => (item.id === id ? { ...item, value } : item)),
    );

  const removeItem = (setter, id) =>
    setter((current) => current.filter((item) => item.id !== id));

  const addItem = (setter) =>
    setter((current) => [...current, { id: makeId(), value: "" }]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      allergies: fromListField(allergies),
      dietary: fromListField(dietary),
      accommodations: hideAccommodations
        ? (medical.accommodations ?? [])
        : fromListField(accommodations),
    });
  };

  return (
    <Modal onClose={onCancel} labelledBy="edit-medical-title">
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2
              id="edit-medical-title"
              className="text-lg font-bold text-slate-900"
            >
              Edit Medical & Special Notes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {hideAccommodations
                ? "Keep allergy and dietary restriction details up to date."
                : "Keep allergy, dietary restriction, and accommodation details up to date."}
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

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          <MedicalListSection
            title="Allergies"
            items={allergies}
            placeholder="e.g. Peanuts — severe allergy, avoid all peanut products"
            onChange={(id, value) => updateItem(setAllergies, id, value)}
            onRemove={(id) => removeItem(setAllergies, id)}
            onAdd={() => addItem(setAllergies)}
            addLabel="Add allergy"
          />

          <MedicalListSection
            title="Dietary Restrictions"
            items={dietary}
            placeholder="e.g. Vegetarian diet — no meat products"
            onChange={(id, value) => updateItem(setDietary, id, value)}
            onRemove={(id) => removeItem(setDietary, id)}
            onAdd={() => addItem(setDietary)}
            addLabel="Add dietary restriction"
          />

          {!hideAccommodations && (
            <MedicalListSection
              title="Learning Accommodations"
              items={accommodations}
              placeholder="e.g. Extra time for written activities"
              onChange={(id, value) => updateItem(setAccommodations, id, value)}
              onRemove={(id) => removeItem(setAccommodations, id)}
              onAdd={() => addItem(setAccommodations)}
              addLabel="Add accommodation"
            />
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Save Changes" type="submit" />
        </div>
      </form>
    </Modal>
  );
}

function MedicalListSection({
  title,
  items,
  placeholder,
  onChange,
  onRemove,
  onAdd,
  addLabel,
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
        {title}
      </p>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start gap-2">
              <textarea
                value={item.value}
                onChange={(e) => onChange(item.id, e.target.value)}
                placeholder={placeholder}
                rows={2}
                aria-label={`${title} entry ${index + 1}`}
                className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${title.toLowerCase()} entry ${index + 1}`}
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 transition hover:border-orange-400 hover:text-orange-700"
      >
        <Plus size={16} />
        {addLabel}
      </button>
    </div>
  );
}
