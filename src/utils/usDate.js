// MM/DD/YYYY is how the app writes dates for people: attendance CSV imports and
// exports, and the attendance screens. The server and the data keep
// "YYYY-MM-DD" (a "date key"), so these only convert at the edge. Free of React
// and aliased imports so it can be unit-tested directly; no Date objects, so the
// browser's timezone can never shift a day.

const pad = (n) => String(n).padStart(2, "0");

// "MM/DD/YYYY" -> "YYYY-MM-DD", or null when it isn't a real date in exactly that
// format. One- or two-digit month and day are fine ("9/5/2026", as Excel writes
// them); the year must have four digits. Day-first ("25/12/2026") is not
// recognised: it fails as month 25 rather than being guessed at, and
// "05/10/2026" always means May 10.
export function parseUsDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  // Date.UTC rolls 02/30 over into March; a real date comes back unchanged.
  const check = new Date(Date.UTC(year, month - 1, day));
  const isReal = check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
  return isReal ? `${year}-${pad(month)}-${pad(day)}` : null;
}

// "YYYY-MM-DD" (a trailing time, as in an ISO timestamp, is ignored) ->
// "MM/DD/YYYY". Anything else gives "" so a missing date shows as blank.
export function formatUsDate(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateKey ?? ""));
  return match ? `${match[2]}/${match[3]}/${match[1]}` : "";
}
