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
