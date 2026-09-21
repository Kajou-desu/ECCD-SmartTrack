// BLE tag addresses are MAC addresses. Same rule as the server
// (utils/macAddress.js): six hex pairs, ":" or "-" separators, any case,
// normalised to upper-case with ":". The server re-checks everything; this only
// gives the teacher an immediate, friendly answer.
const MAC_RE = /^[0-9A-F]{2}([:-][0-9A-F]{2}){5}$/i;

export function normalizeTagAddress(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return MAC_RE.test(value) ? value.toUpperCase().replaceAll("-", ":") : null;
}

// Turns a failed add/update into a sentence that says what to do. Uses the
// server's own message only for 409 (duplicate / limit), which is written for
// teachers; everything else gets fixed wording.
export function describeTagError(error) {
  switch (error?.status) {
    case 400:
      return "Enter the tag's address as six pairs of letters and numbers, like D7:40:47:15:14:90.";
    case 404:
      return "This student or tag no longer exists. Reload the page.";
    case 409:
      return typeof error?.details?.message === "string" && error.details.message
        ? error.details.message
        : "This tag can't be added. It may already be registered.";
    case 403:
      return "You don't have permission to change attendance tags.";
    default:
      return "The tag couldn't be saved. Check your connection and try again.";
  }
}
