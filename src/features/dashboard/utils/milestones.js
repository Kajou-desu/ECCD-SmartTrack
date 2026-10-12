const NEW_WITHIN_DAYS = 14;

// Goals from the current or previous school week get a "New" badge, so a
// parent sees at a glance what was just achieved.
export function isNewMilestone(weekStart, now = new Date()) {
  const start = new Date(`${weekStart}T00:00:00.000Z`).getTime();
  if (Number.isNaN(start)) return false;
  return now.getTime() - start < NEW_WITHIN_DAYS * 24 * 60 * 60 * 1000;
}
