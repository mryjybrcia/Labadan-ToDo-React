import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TaskModal from "../modals/TaskModal";
import boardSlice from "../redux/boardSlice";
import useTicker from "../Hooks/useTicker";
import {
  taskElapsed,
  formatDuration,
  formatCompact,
  isRunning,
} from "../utils/time";
import { formatDueLabel, dueState } from "../utils/date";
import { isTaskDone } from "../utils/agenda";

function AgendaRow({ colIndex, taskIndex, showDue = true }) {
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.boards);
  const board = boards.find((b) => b.isActive === true);
  const columns = board.columns;
  const col = columns[colIndex];
  const task = col.tasks[taskIndex];
  const [open, setOpen] = useState(false);

  const done = isTaskDone(task);
  const running = isRunning(task);
  const now = useTicker(running);
  const elapsed = taskElapsed(task, now);

  const subtasks = task.subtasks || [];
  const completed = subtasks.filter((s) => s.isCompleted).length;
  const total = subtasks.length;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  const due = task.dueDate && !done ? dueState(task.dueDate) : null;
  const dueClass =
    due === "overdue" ? "text-danger" : due === "today" ? "text-accent" : "text-dim";

  const stop = (e) => e.stopPropagation();

  const toggleComplete = (e) => {
    stop(e);
    dispatch(
      boardSlice.actions.toggleTaskComplete({ colIndex, taskIndex, now: Date.now() })
    );
  };

  const toggleTimer = (e) => {
    stop(e);
    const payload = { colIndex, taskIndex, now: Date.now() };
    dispatch(
      running
        ? boardSlice.actions.stopTaskTimer(payload)
        : boardSlice.actions.startTaskTimer(payload)
    );
  };

  const changeStatus = (e) => {
    stop(e);
    const newColIndex = e.target.selectedIndex;
    if (newColIndex === colIndex) return;
    dispatch(
      boardSlice.actions.setTaskStatus({
        taskIndex,
        colIndex,
        newColIndex,
        status: e.target.value,
      })
    );
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-label={`${task.title}.${done ? " Done." : ""}${
          task.dueDate && !done ? ` Due ${formatDueLabel(task.dueDate)}.` : ""
        }`}
        className="group relative flex w-full cursor-pointer items-start gap-3 border-b border-hairline
                   px-3 py-3 text-left transition-colors duration-150 hover:bg-raised sm:px-4"
      >
        {running && <span className="absolute inset-y-0 left-0 w-[2px] bg-accent" />}

        {/* Tick to complete - the primary gesture in an agenda. */}
        <button
          type="button"
          onClick={toggleComplete}
          aria-pressed={done}
          aria-label={done ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
          className={`mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border
                      transition-colors duration-150
                      ${
                        done
                          ? "border-accent bg-accent text-accent-fg"
                          : "border-hairline-strong hover:border-accent"
                      }`}
        >
          {done && (
            <svg viewBox="0 0 10 8" aria-hidden="true" className="h-2 w-2.5 stroke-current" fill="none" strokeWidth="2">
              <path d="m1.276 3.066 2.756 2.756 5-5" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3
              className={`min-w-0 flex-1 text-body ${
                done ? "text-dim line-through" : "font-medium text-fg"
              }`}
            >
              {task.title}
            </h3>

            {showDue && task.dueDate && !done && (
              <span className={`mt-[1px] shrink-0 text-micro font-medium ${dueClass}`}>
                {formatDueLabel(task.dueDate)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {/* Status is a property here, not a position on the board. */}
            <select
              value={col.name}
              onChange={changeStatus}
              onClick={stop}
              aria-label={`Status for ${task.title}`}
              className="select-chevron cursor-pointer rounded-full border border-hairline bg-transparent
                         py-0.5 pl-2 text-micro text-dim transition-colors hover:border-accent hover:text-fg
                         touch:text-sm"
              style={{ backgroundPosition: "right 6px top 50%" }}
            >
              {columns.map((c, i) => (
                <option key={i}>{c.name}</option>
              ))}
            </select>

            {total > 0 && !done && (
              <span className="flex min-w-[88px] max-w-[160px] flex-1 items-center gap-2">
                <span className="h-[3px] flex-1 overflow-hidden rounded-sharp bg-hairline">
                  <span
                    className="block h-full bg-accent transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </span>
                <span className="tnum shrink-0 text-micro text-dim">
                  {completed}/{total}
                </span>
              </span>
            )}

            {(elapsed > 0 || !done) && (
              <span className="ml-auto flex shrink-0 items-center gap-1.5">
                {elapsed > 0 && (
                  <span className={`tnum text-micro ${running ? "text-accent" : "text-dimmer"}`}>
                    {running ? formatDuration(elapsed) : formatCompact(elapsed)}
                  </span>
                )}
                {!done && (
                  <button
                    type="button"
                    onClick={toggleTimer}
                    aria-label={running ? "Pause timer" : task.timeSpent ? "Resume timer" : "Start timer"}
                    title={running ? "Pause timer" : task.timeSpent ? "Resume timer" : "Start timer"}
                    className={`flex h-6 w-6 items-center justify-center rounded-sharp transition-opacity
                                duration-150 hover:bg-accent/20 ${running ? "opacity-100" : "reveal"}`}
                  >
                    {running ? (
                      <svg viewBox="0 0 10 10" className="h-2 w-2 fill-accent" aria-hidden="true">
                        <rect width="10" height="10" rx="1.5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-dim" aria-hidden="true">
                        <path d="M1.5 0.6 9 5 1.5 9.4Z" />
                      </svg>
                    )}
                  </button>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {open && (
        <TaskModal colIndex={colIndex} taskIndex={taskIndex} setIsTaskModalOpen={setOpen} />
      )}
    </>
  );
}

export default AgendaRow;
