import React from "react";
import { useDispatch, useSelector } from "react-redux";
import boardSlice from "../redux/boardSlice";

function Subtask({ index, taskIndex, colIndex }) {
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.boards);
  const board = boards.find((board) => board.isActive === true);
  const col = board.columns.find((col, i) => i === colIndex);
  const task = col.tasks.find((task, i) => i === taskIndex);
  const subtask = task.subtasks.find((subtask, i) => i === index);
  const checked = subtask.isCompleted;

  const onChange = () => {
    dispatch(
      boardSlice.actions.setSubtaskCompleted({ index, taskIndex, colIndex })
    );
  };

  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5 border-b border-hairline py-2 transition-colors duration-150 last:border-b-0 hover:bg-raised">
      <input
        className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-accent"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span
        className={`text-body ${checked ? "text-dimmer line-through" : "text-fg"}`}
      >
        {subtask.title}
      </span>
    </label>
  );
}

export default Subtask;
