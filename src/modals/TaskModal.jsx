import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ElipsisMenu from "../components/ElipsisMenu";
import elipsis from "../assets/icon-vertical-ellipsis.svg";
import boardSlice from "../redux/boardSlice";
import Subtask from "../components/Subtask";
import AddEditTaskModal from "./AddEditTaskModal";
import DeleteModal from "./DeleteModal";
import { useEscape } from "../Hooks/useShortcuts";
import useTicker from "../Hooks/useTicker";
import { taskElapsed, formatDuration, isRunning } from "../utils/time";
import DatePicker from "../components/DatePicker";
import Comments from "../components/Comments";
import { deleteFiles } from "../utils/attachments";

function TaskModal({ taskIndex, colIndex, setIsTaskModalOpen }) {
  const dispatch = useDispatch();
  const [isElipsisMenuOpen, setIsElipsisMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const boards = useSelector((state) => state.boards);
  const board = boards.find((board) => board.isActive === true);
  const columns = board.columns;
  const col = columns.find((col, i) => i === colIndex);
  const task = col.tasks.find((task, i) => i === taskIndex);
  const subtasks = task.subtasks;
  const completed = subtasks.filter((s) => s.isCompleted).length;

  const running = isRunning(task);
  const now = useTicker(running);
  const elapsed = taskElapsed(task, now);

  const toggleTimer = () => {
    const payload = { colIndex, taskIndex, now: Date.now() };
    dispatch(
      running
        ? boardSlice.actions.stopTaskTimer(payload)
        : boardSlice.actions.startTaskTimer(payload)
    );
  };

  const [status, setStatus] = useState(task.status);
  const [newColIndex, setNewColIndex] = useState(columns.indexOf(col));

  const commitAndClose = () => {
    dispatch(
      boardSlice.actions.setTaskStatus({
        taskIndex,
        colIndex,
        newColIndex,
        status,
      })
    );
    setIsTaskModalOpen(false);
  };

  useEscape(() => {
    if (!isDeleteModalOpen && !isAddTaskModalOpen) commitAndClose();
  });

  const onChange = (e) => {
    setStatus(e.target.value);
    setNewColIndex(e.target.selectedIndex);
  };

  const onClose = (e) => {
    if (e.target !== e.currentTarget) return;
    commitAndClose();
  };

  const onDeleteBtnClick = (e) => {
    if (e.target.textContent === "Delete") {
      // Drop the comment attachments with the task so no blobs are orphaned.
      const attachmentIds = (task.comments || []).flatMap((c) =>
        (c.attachments || []).map((a) => a.id)
      );
      deleteFiles(attachmentIds);
      dispatch(boardSlice.actions.deleteTask({ taskIndex, colIndex }));
      setIsTaskModalOpen(false);
      setIsDeleteModalOpen(false);
    } else {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div onClick={onClose} className="scrim">
      <div role="dialog" aria-modal="true" aria-label={task.title} className="panel my-auto">
        <div className="relative flex items-start justify-between gap-3">
          <h2 className="text-title font-semibold text-fg">{task.title}</h2>
          <button
            type="button"
            onClick={() => setIsElipsisMenuOpen((p) => !p)}
            aria-label="Task options"
            aria-expanded={isElipsisMenuOpen}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-soft transition-colors duration-150 hover:bg-raised"
          >
            <img src={elipsis} alt="" className="h-4 opacity-70" />
          </button>
          {isElipsisMenuOpen && (
            <ElipsisMenu
              setOpenEditModal={() => {
                setIsAddTaskModalOpen(true);
                setIsElipsisMenuOpen(false);
              }}
              setOpenDeleteModal={() => {
                setIsElipsisMenuOpen(false);
                setIsDeleteModalOpen(true);
              }}
              type="Task"
            />
          )}
        </div>

        {task.description && (
          <p className="mt-2.5 text-body leading-relaxed text-dim">
            {task.description}
          </p>
        )}

        {subtasks.length > 0 && (
          <>
            <div className="mt-5 flex items-baseline justify-between">
              <h3 className="text-micro font-semibold text-dimmer">Subtasks</h3>
              <span className="tnum text-micro text-dim">
                {completed}/{subtasks.length}
              </span>
            </div>
            <div className="mt-1 border-t border-hairline">
              {subtasks.map((subtask, index) => (
                <Subtask
                  index={index}
                  taskIndex={taskIndex}
                  colIndex={colIndex}
                  key={index}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="task-status" className="text-micro font-semibold text-dimmer">
              Status
            </label>
            <select
              id="task-status"
              className="field select-chevron mt-1 cursor-pointer"
              value={status}
              onChange={onChange}
            >
              {columns.map((col, index) => (
                <option key={index}>{col.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-micro font-semibold text-dimmer">Due date</span>
            <div className="mt-1">
              <DatePicker
                value={task.dueDate || null}
                onChange={(dueDate) =>
                  dispatch(
                    boardSlice.actions.setTaskDueDate({
                      colIndex,
                      taskIndex,
                      dueDate,
                    })
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <span className="text-micro font-semibold text-dimmer">Time</span>
          <div className="mt-1 flex items-center gap-2 rounded-soft border border-hairline px-3 py-2">
            <span
              className={`tnum flex-1 text-title font-semibold ${
                running ? "text-accent" : "text-fg"
              }`}
            >
              {formatDuration(elapsed)}
            </span>

            {elapsed > 0 && !running && (
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    boardSlice.actions.resetTaskTimer({ colIndex, taskIndex })
                  )
                }
                className="btn-quiet"
              >
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={toggleTimer}
              className={running ? "btn-quiet" : "btn-primary"}
            >
              {running ? "Pause" : task.timeSpent ? "Resume" : "Start"}
            </button>
          </div>
        </div>


        <Comments
          colIndex={colIndex}
          taskIndex={taskIndex}
          comments={task.comments || []}
        />

        <p className="mt-4 flex items-center gap-1.5 text-micro text-dimmer">
          <kbd className="kbd">Esc</kbd> to close
        </p>
      </div>

      {isDeleteModalOpen && (
        <DeleteModal
          onDeleteBtnClick={onDeleteBtnClick}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          type="task"
          title={task.title}
        />
      )}

      {isAddTaskModalOpen && (
        <AddEditTaskModal
          setIsAddTaskModalOpen={setIsAddTaskModalOpen}
          setIsTaskModalOpen={setIsTaskModalOpen}
          type="edit"
          taskIndex={taskIndex}
          prevColIndex={colIndex}
        />
      )}
    </div>
  );
}

export default TaskModal;
