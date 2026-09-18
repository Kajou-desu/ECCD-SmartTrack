// The backend stores each address (student, mother, father, guardian) as
// a single free-text string. To split the form into Purok/Barangay inputs
// without a backend/schema change, we combine the two into one string of
// the form "Purok {purok}, Barangay {barangay}" before it's sent, and
// parse it back the same way when loading an existing student for edit.

export function combineAddress(purok, barangay) {
  const p = (purok ?? "").trim();
  const b = (barangay ?? "").trim();

  if (!p && !b) return "";
  if (!p) return `Barangay ${b}`;
  if (!b) return `Purok ${p}`;
  return `Purok ${p}, Barangay ${b}`;
}

// Best-effort split for display/editing. Recognizes the "Purok X,
// Barangay Y" format this form writes going forward; for older
// free-text addresses that predate this split (no such pattern), falls
// back to splitting on the first comma so nothing is lost — the user can
// tidy it into the two fields the next time they save.
export function splitAddress(address) {
  const value = (address ?? "").trim();
  if (!value) return { purok: "", barangay: "" };

  const match = value.match(/^purok\s*:?\s*(.*?),?\s*barangay\s*:?\s*(.*)$/i);
  if (match) {
    return { purok: match[1].trim(), barangay: match[2].trim() };
  }

  const [first, ...rest] = value.split(",");
  return { purok: (first ?? "").trim(), barangay: rest.join(",").trim() };
}
