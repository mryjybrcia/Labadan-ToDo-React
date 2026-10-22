/**
 * Due-date helpers.
 *
 * Dates are stored as plain "YYYY-MM-DD" strings - a calendar day, with no
 * time or zone attached. Never parse one with `new Date(str)`: that reads it
 * as UTC midnight, so anyone west of Greenwich sees the previous day. These
 * helpers build and read dates from local parts only.
 */

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromISODate(iso) {
  if (!iso || typeof iso !== "string") return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day); // local midnight
}

export const todayISO = () => toISODate(new Date());

/** Whole calendar days from today; negative is overdue. */
export function daysUntil(iso) {
  const target = fromISODate(iso);
  if (!target) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

export function formatDueLabel(iso) {
  const days = daysUntil(iso);
  if (days === null) return "";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return `${Math.abs(days)}d late`;

  const date = fromISODate(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** "overdue" | "today" | "later" | null */
export function dueState(iso) {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  return "later";
}

export function formatFullDate(iso) {
  const date = fromISODate(iso);
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Calendar grid for a month: leading/trailing blanks padded to whole weeks. */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = first.getDay(); // 0 = Sunday

  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
