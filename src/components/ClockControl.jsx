import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import timeclockSlice from "../redux/timeclockSlice";
import useTicker from "../Hooks/useTicker";
import { formatDuration, formatCompact } from "../utils/time";

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Work-shift clock: clock in, clock out, and a log of recent shifts. */
function ClockControl() {
  const dispatch = useDispatch();
  const { clockedInAt, entries } = useSelector((state) => state.timeclock);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const now = useTicker(Boolean(clockedInAt));
  const openShift = clockedInAt ? Math.max(0, now - clockedInAt) : 0;

  const today = new Date();
  const todayClosed = entries
    .filter((e) => sameDay(new Date(e.start), today))
    .reduce((sum, e) => sum + (e.end - e.start), 0);
  const todayTotal = todayClosed + openShift;

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

  const toggleClock = () => {
    if (clockedInAt) {
      dispatch(timeclockSlice.actions.clockOut({ now: Date.now(), id: uuidv4() }));
    } else {
      dispatch(timeclockSlice.actions.clockIn({ now: Date.now() }));
    }
  };

  const time = (ts) =>
    new Date(ts).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={clockedInAt ? "On the clock" : "Off the clock"}
        className={`flex items-center gap-1.5 rounded-soft border px-2 py-1 transition-colors duration-150
                    ${
                      clockedInAt
                        ? "border-accent/40 bg-accent/10 hover:bg-accent/20"
                        : "border-hairline text-dim hover:bg-raised hover:text-fg"
                    }`}
      >
        <svg viewBox="0 0 14 14" aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-none stroke-current" strokeWidth="1.3">
          <circle cx="7" cy="7" r="6.35" />
          <path d="M7 3.4V7l2.4 1.6" />
        </svg>
        {clockedInAt ? (
          <span className="tnum text-micro font-semibold text-accent">
            {formatDuration(openShift)}
          </span>
        ) : (
          <span className="text-micro font-semibold">Clock in</span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Work clock"
          className="absolute right-0 top-full z-[70] mt-1 w-[272px] rounded-soft border border-hairline bg-surface p-3"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-micro font-semibold text-dimmer">Today</span>
            <span className="tnum text-title font-semibold text-fg">
              {todayTotal > 0 ? formatCompact(todayTotal) : "0m"}
            </span>
          </div>

          <button type="button" onClick={toggleClock} className={`mt-2 w-full ${clockedInAt ? "btn-quiet btn-lg" : "btn-primary btn-lg"}`}>
            {clockedInAt ? "Clock out" : "Clock in"}
          </button>

          {clockedInAt && (
            <p className="mt-1.5 text-micro text-dim">
              On the clock since {time(clockedInAt)}.
            </p>
          )}

          {entries.length > 0 && (
            <>
              <span className="mt-4 block text-micro font-semibold text-dimmer">
                Recent shifts
              </span>
              <ul className="mt-1 max-h-[180px] overflow-y-auto border-t border-hairline">
                {entries.slice(0, 12).map((entry) => (
                  <li
                    key={entry.id}
                    className="group flex items-center gap-2 border-b border-hairline py-1.5"
                  >
                    <span className="tnum shrink-0 text-micro text-dim">
                      {new Date(entry.start).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="tnum flex-1 truncate text-micro text-dimmer">
                      {time(entry.start)} - {time(entry.end)}
                    </span>
                    <span className="tnum shrink-0 text-micro text-fg">
                      {formatCompact(entry.end - entry.start)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(timeclockSlice.actions.deleteEntry({ id: entry.id }))
                      }
                      aria-label="Delete shift"
                      className="shrink-0 text-micro text-dimmer opacity-0 transition-opacity
                                 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ClockControl;
