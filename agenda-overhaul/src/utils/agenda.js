import { daysUntil, fromISODate } from "./date";

/**
 * A task is done when it is explicitly ticked off, or when it has subtasks
 * and every one is checked. The explicit flag matters because a task with no
 * subtasks could otherwise never be completed.
 */
export function isTaskDone(task) {
  if (task.completedAt) return true;
  const subtasks = task.subtasks || [];
  return subtasks.length > 0 && subtasks.every((s) => s.isCompleted);
}

/** Flatten the active board into addressable rows. */
export function flattenBoard(board) {
  const rows = [];
  (board?.columns || []).forEach((col, colIndex) => {
    (col.tasks || []).forEach((task, taskIndex) => {
      rows.push({ task, colIndex, taskIndex, status: col.name });
    });
  });
  return rows;
}

export const BUCKETS = [
  { key: "overdue", label: "Overdue", tone: "danger" },
  { key: "today", label: "Today", tone: "accent" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "week", label: "This week" },
  { key: "later", label: "Later" },
  { key: "someday", label: "No date" },
];

function bucketFor(task) {
  if (!task.dueDate) return "someday";
  const days = daysUntil(task.dueDate);
  if (days === null) return "someday";
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 7) return "week";
  return "later";
}

/** Earlier dates first; undated work sinks to the bottom of its group. */
function byDue(a, b) {
  const da = a.task.dueDate ? fromISODate(a.task.dueDate).getTime() : Infinity;
  const db = b.task.dueDate ? fromISODate(b.task.dueDate).getTime() : Infinity;
  if (da !== db) return da - db;
  return a.task.title.localeCompare(b.task.title);
}

export const VIEWS = {
  today: {
    label: "Today",
    empty: "Nothing due today.",
    match: (row) =>
      !isTaskDone(row.task) && ["overdue", "today"].includes(bucketFor(row.task)),
  },
  upcoming: {
    label: "Upcoming",
    empty: "Nothing scheduled ahead.",
    match: (row) =>
      !isTaskDone(row.task) &&
      ["tomorrow", "week", "later"].includes(bucketFor(row.task)),
  },
  all: {
    label: "All",
    empty: "No open work on this board.",
    match: (row) => !isTaskDone(row.task),
  },
  done: {
    label: "Done",
    empty: "Nothing finished yet.",
    match: (row) => isTaskDone(row.task),
  },
};

/** Rows for a view, grouped into date buckets and ordered within each. */
export function buildAgenda(board, view) {
  const rows = flattenBoard(board).filter(VIEWS[view].match);

  if (view === "done") {
    const sorted = [...rows].sort(
      (a, b) => (b.task.completedAt || 0) - (a.task.completedAt || 0)
    );
    return [{ key: "done", label: "Completed", rows: sorted }];
  }

  const groups = new Map();
  rows.forEach((row) => {
    const key = bucketFor(row.task);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });

  return BUCKETS.filter((b) => groups.has(b.key)).map((b) => ({
    key: b.key,
    label: b.label,
    tone: b.tone,
    rows: groups.get(b.key).sort(byDue),
  }));
}

export function viewCounts(board) {
  const rows = flattenBoard(board);
  return Object.fromEntries(
    Object.entries(VIEWS).map(([key, v]) => [key, rows.filter(v.match).length])
  );
}
