/**
 * App state persistence.
 *
 * Without this the store is rebuilt from src/data/data.json on every page
 * load, so edits and deletions silently reappear on refresh.
 *
 * Boards and the work clock are stored under separate keys so a failure to
 * read one never costs the other. Every access is wrapped: localStorage
 * throws in private mode and when site data is blocked, and that must never
 * stop the app rendering.
 *
 * Attachment blobs do NOT live here - localStorage holds roughly 5MB for the
 * whole origin and base64 inflates a file by a third, so one photo would
 * evict the boards. Files go to IndexedDB via src/utils/attachments.js.
 */

const BOARDS_KEY = "project-task:boards:v1";
const CLOCK_KEY = "project-task:timeclock:v1";

function read(key, validate) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return validate(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded or storage unavailable - the session still works, it
    // just won't survive a reload.
    return false;
  }
}

export const loadBoards = () => read(BOARDS_KEY, Array.isArray);

export const loadTimeclock = () =>
  read(
    CLOCK_KEY,
    (v) => v && typeof v === "object" && Array.isArray(v.entries)
  );

export const saveBoards = (boards) => write(BOARDS_KEY, boards);
export const saveTimeclock = (timeclock) => write(CLOCK_KEY, timeclock);

export function clearAll() {
  try {
    localStorage.removeItem(BOARDS_KEY);
    localStorage.removeItem(CLOCK_KEY);
  } catch {
    /* nothing to do */
  }
}

export { BOARDS_KEY, CLOCK_KEY };
