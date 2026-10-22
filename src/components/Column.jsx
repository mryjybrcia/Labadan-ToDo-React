import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import boardSlice from "../redux/boardSlice";
import Task from "./Task";
import { dueState } from "../utils/date";

function Column({ colIndex }) {
  const dispatch = useDispatch();
  const [isDropTarget, setIsDropTarget] = useState(false);
  const boards = useSelector((state) => state.boards);
  const board = boards.find((board) => board.isActive === true);
  const col = board.columns.find((col, i) => i === colIndex);

  // Only open work counts as late; a finished task's due date is history.
  const overdue = col.tasks.filter((task) => {
    const total = task.subtasks.length;
    const done = total > 0 && task.subtasks.every((s) => s.isCompleted);
    return !done && task.dueDate && dueState(task.dueDate) === "overdue";
  }).length;

  const handleOnDrop = (e) => {
    setIsDropTarget(false);
    const { prevColIndex, taskIndex } = JSON.parse(
      e.dataTransfer.getData("text")
    );
    if (colIndex !== prevColIndex) {
      dispatch(
        boardSlice.actions.dragTask({ colIndex, prevColIndex, taskIndex })
      );
    }
  };

  const handleOnDragOver = (e) => {
    e.preventDefault();
    setIsDropTarget(true);
  };

  const handleOnDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDropTarget(false);
  };

  return (
    <section
      onDrop={handleOnDrop}
      onDragOver={handleOnDragOver}
      onDragLeave={handleOnDragLeave}
      aria-label={`${col.name}, ${col.tasks.length} tasks`}
      className={`flex h-full min-w-[300px] max-w-[460px] flex-1 flex-col border-r border-hairline
                  transition-colors duration-150
                  ${isDropTarget ? "bg-accent/[0.07]" : ""}`}
    >
      <header className="sticky top-0 z-10 flex items-baseline gap-2 border-b border-hairline bg-canvas px-3 py-2.5">
        <h2 className="truncate text-label font-semibold text-fg">
          {col.name}
        </h2>
        {overdue > 0 && (
          <span className="tnum ml-auto shrink-0 text-micro font-medium text-danger">
            {overdue} late
          </span>
        )}
        <span
          className={`tnum shrink-0 text-micro text-dim ${overdue > 0 ? "ml-3" : "ml-auto"}`}
        >
          {col.tasks.length}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {col.tasks.map((task, index) => (
          <Task key={index} taskIndex={index} colIndex={colIndex} />
        ))}

        {col.tasks.length === 0 && (
          <p className="px-3 py-6 text-label text-dimmer">
            {isDropTarget ? "Release to move here" : "Nothing here yet"}
          </p>
        )}
      </div>
    </section>
  );
}

export default Column;
