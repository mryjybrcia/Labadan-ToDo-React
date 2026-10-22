import React, { useEffect, useRef, useState } from "react";
import {
  MONTHS,
  WEEKDAYS,
  monthGrid,
  toISODate,
  fromISODate,
  todayISO,
  formatDueLabel,
  dueState,
} from "../utils/date";

const STATE_CLASS = {
  overdue: "text-danger",
  today: "text-accent",
  later: "text-fg",
};

/**
 * Compact month calendar in a popover. `value` and `onChange` use
 * "YYYY-MM-DD" strings; onChange(null) clears the date.
 */
function DatePicker({ value, onChange, placeholder = "Set due date" }) {
  const [open, setOpen] = useState(false);
  const selected = fromISODate(value);
  const [view, setView] = useState(() => {
    const base = selected || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const rootRef = useRef(null);

  // Reopen on the selected month rather than wherever the user browsed to.
  useEffect(() => {
    if (!open) return;
    const base = fromISODate(value) || new Date();
    setView(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const cells = monthGrid(view.getFullYear(), view.getMonth());
  const today = todayISO();
  const shiftMonth = (delta) =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  const pick = (date) => {
    onChange(toISODate(date));
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="field flex items-center gap-2 text-left"
      >
        <svg viewBox="0 0 14 14" aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-none stroke-dim" strokeWidth="1.3">
          <rect x="0.65" y="2.15" width="12.7" height="11.2" rx="1.6" />
          <path d="M0.65 5.5h12.7M4 0.65v3M10 0.65v3" />
        </svg>
        <span className={`flex-1 ${value ? STATE_CLASS[dueState(value)] : "text-dim/80"}`}>
          {value ? formatDueLabel(value) : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear due date"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange(null);
              }
            }}
            className="shrink-0 rounded-sharp px-1 text-micro text-dimmer hover:text-danger"
          >
            Clear
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a due date"
          className="absolute left-0 top-full z-[70] mt-1 w-[232px] rounded-soft border border-hairline bg-surface p-2 shadow-lg"
        >
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-6 w-6 items-center justify-center rounded-sharp text-dim hover:bg-raised hover:text-fg"
            >
              &#8249;
            </button>
            <span className="tnum text-label font-semibold text-fg">
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-6 w-6 items-center justify-center rounded-sharp text-dim hover:bg-raised hover:text-fg"
            >
              &#8250;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px">
            {WEEKDAYS.map((d) => (
              <span key={d} className="pb-1 text-center text-micro text-dimmer">
                {d}
              </span>
            ))}

            {cells.map((date, i) => {
              if (!date) return <span key={`pad-${i}`} />;
              const iso = toISODate(date);
              const isSelected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(date)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  className={`tnum flex h-7 items-center justify-center rounded-sharp text-micro
                              transition-colors duration-100
                              ${
                                isSelected
                                  ? "bg-accent font-semibold text-accent-fg"
                                  : isToday
                                  ? "font-semibold text-accent hover:bg-raised"
                                  : "text-dim hover:bg-raised hover:text-fg"
                              }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex gap-1 border-t border-hairline pt-1">
            <button
              type="button"
              onClick={() => pick(new Date())}
              className="flex-1 rounded-sharp px-2 py-1 text-micro text-dim hover:bg-raised hover:text-fg"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                pick(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1));
              }}
              className="flex-1 rounded-sharp px-2 py-1 text-micro text-dim hover:bg-raised hover:text-fg"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                pick(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 7));
              }}
              className="flex-1 rounded-sharp px-2 py-1 text-micro text-dim hover:bg-raised hover:text-fg"
            >
              +1 week
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
