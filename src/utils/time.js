/**
 * Task time tracking helpers.
 *
 * A task carries two fields, both optional so existing data keeps working:
 *   timeSpent  - milliseconds banked from finished runs
 *   startedAt  - epoch ms of the current run, or null/undefined when stopped
 *
 * Only one task runs at a time; starting another banks the previous one.
 */

/** Total milliseconds for a task, including the run in progress. */
export function taskElapsed(task, now = Date.now()) {
  const banked = task?.timeSpent || 0;
  if (!task?.startedAt) return banked;
  return banked + Math.max(0, now - task.startedAt);
}

export const isRunning = (task) => Boolean(task?.startedAt);

/** "4:07" under an hour, "1:04:07" beyond it. */
export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/**
 * Compact form for banked time: "47m", "3h 12m", "5h".
 * A running clock uses formatDuration instead, which ticks to the second.
 */
export function formatCompact(ms) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "<1m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/** Locate the running task across every board, or null. */
export function findRunningTask(boards) {
  for (let b = 0; b < boards.length; b++) {
    const columns = boards[b].columns || [];
    for (let c = 0; c < columns.length; c++) {
      const tasks = columns[c].tasks || [];
      for (let t = 0; t < tasks.length; t++) {
        if (tasks[t].startedAt) {
          return { boardIndex: b, colIndex: c, taskIndex: t, task: tasks[t] };
        }
      }
    }
  }
  return null;
}
