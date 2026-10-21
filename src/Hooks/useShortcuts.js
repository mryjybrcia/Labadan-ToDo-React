import { useEffect } from "react";

export const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Label for the primary modifier, so hints match the actual binding. */
export const modLabel = isMac ? "⌘" : "Ctrl";

/** The glyph needs no separator; the word does. */
export const shortcutLabel = (n) => (isMac ? `${modLabel}${n}` : `${modLabel} ${n}`);

const isTypingTarget = (el) =>
  el &&
  (el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable);

/**
 * Global key bindings.
 *
 * `onBoard(i)`  - mod+1..9
 * `onNewTask()` - n
 * Bindings are skipped while the user is typing in a field.
 */
export function useShortcuts({ onBoard, onNewTask, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (isTypingTarget(document.activeElement)) return;

      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && !e.shiftKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        onBoard?.(Number(e.key) - 1);
        return;
      }

      if (!mod && !e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        onNewTask?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBoard, onNewTask, enabled]);
}

/** Close-on-Escape for overlays. */
export function useEscape(onEscape) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEscape]);
}
