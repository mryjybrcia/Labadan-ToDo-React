/**
 * Board state persistence.
 *
 * Without this the store is rebuilt from src/data/data.json on every page
 * load, so edits and deletions silently reappear on refresh.
 *
 * Every access is wrapped: localStorage throws in private mode, when site
 * data is blocked, and inside some embedded webviews. A failure here must
 * never stop the app rendering - it just falls back to the seed data.
 */

const STORAGE_KEY = "project-task:boards:v1";

export function loadBoards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw);
    // Guard against a half-written or hand-edited value.
    if (!Array.isArray(parsed)) return undefined;

    return parsed;
  } catch {
    return undefined;
  }
}

export function saveBoards(boards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch {
    // Quota exceeded or storage unavailable - the session still works,
    // it just won't survive a reload.
  }
}

export function clearBoards() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

export { STORAGE_KEY };
