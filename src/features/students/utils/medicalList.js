// The backend stores allergies/dietary/specialNotes as a single free-text
// string. The form edits each as a list of entries (one per line) so it
// can offer the same "+ Add entry" / removable-list UI as
// EditMedicalModal; we join/split on newlines to convert back and forth.

export function toMedicalList(text) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function fromMedicalList(items) {
  return (items ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
}
