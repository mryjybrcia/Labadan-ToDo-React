import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TaskModal from "../modals/TaskModal";
import boardSlice from "../redux/boardSlice";
import useTicker from "../Hooks/useTicker";
import { taskElapsed, formatDuration, isRunning } from "../utils/time";

function Task({ colIndex, taskIndex }) {
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.boards);
  const board = boards.find((board) => board.isActive === true);
  const col = board.columns.find((col, i) => i === colIndex);
  const task = col.tasks.find((task, i) => i === taskIndex);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const subtasks = task.subtasks;
  const completed = subtasks.filter((s) => s.isCompleted).length;
  const total = subtasks.length;
  const isDone = total > 0 && completed === total;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  const running = isRunning(task);
  const now = useTicker(running);
  const elapsed = taskElapsed(task, now);

  const handleOnDrag = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData(
      "text",
      JSON.stringify({ taskIndex, prevColIndex: colIndex })
    );
  };

  const toggleTimer = (e) => {
    e.stopPropagation();
    const payload = { colIndex, taskIndex, now: Date.now() };
    dispatch(
      running
        ? boardSlice.actions.stopTaskTimer(payload)
        : boardSlice.actions.startTaskTimer(payload)
    );
  };

  const open = () => setIsTaskModalOpen(true);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${task.title}. ${completed} of ${total} subtasks done.${
          elapsed > 0 ? ` ${formatDuration(elapsed)} tracked.` : ""
        }`}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        draggable
        onDragStart={handleOnDrag}
        onDragEnd={() => setIsDragging(false)}
        className={`group relative w-full cursor-grab border-b border-hairline px-3 py-2.5
                    text-left transition-colors duration-150 hover:bg-raised active:cursor-grabbing
                    ${isDragging ? "opacity-40" : ""}`}
      >
        {/* A running task keeps the accent edge pinned, not just on hover. */}
        <span
          className={`absolute inset-y-0 left-0 w-[2px] bg-accent transition-transform duration-150
                      ${
                        running
                          ? "scale-y-100"
                          : isDone
                          ? "scale-y-0"
                          : "scale-y-0 group-hover:scale-y-100"
                      }`}
        />

        <div className="flex items-start gap-2">
          <h3
            className={`flex-1 text-body ${
              isDone && !running ? "font-normal text-dim" : "font-medium text-fg"
            }`}
          >
            {task.title}
          </h3>

          {/* Elapsed time: always visible once there is any, live while running. */}
          {elapsed > 0 && (
            <span
              className={`tnum mt-[2px] shrink-0 text-micro ${
                running ? "text-accent" : "text-dimmer"
              }`}
            >
              {formatDuration(elapsed)}
            </span>
          )}

          <button
            type="button"
            onClick={toggleTimer}
            aria-label={running ? `Stop timer` : `Start timer`}
            title={running ? "Stop timer" : "Start timer"}
            className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sharp
                        transition-opacity duration-150 hover:bg-accent/20
                        ${running ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
          >
            {running ? (
              <svg viewBox="0 0 10 10" className="h-2 w-2 fill-accent" aria-hidden="true">
                <rect x="0" y="0" width="10" height="10" rx="1.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-dim" aria-hidden="true">
                <path d="M1.5 0.6 9 5 1.5 9.4Z" />
              </svg>
            )}
          </button>

          {isDone && !running && (
            <svg
              viewBox="0 0 10 8"
              aria-hidden="true"
              className="mt-[6px] h-2 w-2.5 shrink-0 stroke-dim"
              fill="none"
              strokeWidth="2"
            >
              <path d="m1.276 3.066 2.756 2.756 5-5" />
            </svg>
          )}
        </div>

        {total > 0 && !isDone && (
          <div className="mt-2 flex items-center gap-2">
            <div
              className="h-[3px] flex-1 overflow-hidden rounded-sharp bg-hairline"
              role="progressbar"
              aria-valuenow={completed}
              aria-valuemin={0}
              aria-valuemax={total}
            >
              <div
                className="h-full bg-accent transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="tnum shrink-0 text-micro text-dim">
              {completed}/{total}
            </span>
          </div>
        )}
      </div>

      {isTaskModalOpen && (
        <TaskModal
          colIndex={colIndex}
          taskIndex={taskIndex}
          setIsTaskModalOpen={setIsTaskModalOpen}
        />
      )}
    </>
  );
}

export default Task;
