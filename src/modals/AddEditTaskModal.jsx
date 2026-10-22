import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import CrossIcon from "../components/icons/CrossIcon";
import { useEscape } from "../Hooks/useShortcuts";
import DatePicker from "../components/DatePicker";
import boardSlice from "../redux/boardSlice";

function AddEditTaskModal({
  type,
  device,
  setIsTaskModalOpen,
  setIsAddTaskModalOpen,
  taskIndex,
  prevColIndex = 0,
}) {
  const dispatch = useDispatch();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isValid, setIsValid] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const board = useSelector((state) => state.boards).find(
    (board) => board.isActive
  );

  const columns = board.columns;
  const col = columns.find((col, index) => index === prevColIndex);
  const task = col ? col.tasks.find((task, index) => index === taskIndex) : [];
  const [status, setStatus] = useState(columns[prevColIndex].name);
  const [newColIndex, setNewColIndex] = useState(prevColIndex);
  const [subtasks, setSubtasks] = useState([
    { title: "", isCompleted: false, id: uuidv4() },
    { title: "", isCompleted: false, id: uuidv4() },
  ]);

  const onChangeSubtasks = (id, newValue) => {
    setSubtasks((prevState) => {
      const newState = [...prevState];
      const subtask = newState.find((subtask) => subtask.id === id);
      subtask.title = newValue;
      return newState;
    });
  };

  const onChangeStatus = (e) => {
    setStatus(e.target.value);
    setNewColIndex(e.target.selectedIndex);
  };

  const validate = () => {
    setIsValid(false);
    if (!title.trim()) return false;
    for (let i = 0; i < subtasks.length; i++) {
      if (!subtasks[i].title.trim()) return false;
    }
    setIsValid(true);
    return true;
  };

  if (type === "edit" && isFirstLoad) {
    setSubtasks(
      task.subtasks.map((subtask) => ({ ...subtask, id: uuidv4() }))
    );
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate || null);
    setIsFirstLoad(false);
  }

  const onDelete = (id) => {
    setSubtasks((prevState) => prevState.filter((el) => el.id !== id));
  };

  const onSubmit = (type) => {
    if (type === "add") {
      dispatch(
        boardSlice.actions.addTask({
          title,
          description,
          subtasks,
          status,
          newColIndex,
          dueDate,
          now: Date.now(),
        })
      );
    } else {
      dispatch(
        boardSlice.actions.editTask({
          title,
          description,
          subtasks,
          status,
          taskIndex,
          prevColIndex,
          newColIndex,
          dueDate,
        })
      );
    }
  };

  useEscape(() => setIsAddTaskModalOpen(false));

  const titleInvalid = !isValid && !title.trim();

  return (
    <div
      className="scrim"
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        setIsAddTaskModalOpen(false);
      }}
    >
      <div role="dialog" aria-modal="true" className="panel my-auto">
        <h2 className="text-title font-semibold text-fg">
          {type === "edit" ? "Edit task" : "New task"}
        </h2>

        <div className="mt-4">
          <label htmlFor="task-name-input" className="text-micro font-semibold text-dimmer">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id="task-name-input"
            type="text"
            className={`field mt-1 ${titleInvalid ? "field-invalid" : ""}`}
            placeholder="e.g. Take a coffee break"
            aria-invalid={titleInvalid}
          />
          {titleInvalid && (
            <p className="mt-1 text-micro text-danger">Give the task a title.</p>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="task-description-input" className="text-micro font-semibold text-dimmer">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            id="task-description-input"
            className="field mt-1 min-h-[76px] resize-y leading-relaxed"
            placeholder="What does done look like?"
          />
        </div>

        <div className="mt-4">
          <span className="text-micro font-semibold text-dimmer">Subtasks</span>
          <div className="mt-1 space-y-1.5">
            {subtasks.map((subtask, index) => {
              const invalid = !isValid && !subtask.title.trim();
              return (
                <div key={index} className="flex items-center gap-1.5">
                  <input
                    onChange={(e) => onChangeSubtasks(subtask.id, e.target.value)}
                    type="text"
                    value={subtask.title}
                    className={`field ${invalid ? "field-invalid" : ""}`}
                    placeholder="e.g. Make coffee"
                    aria-label={`Subtask ${index + 1}`}
                    aria-invalid={invalid}
                  />
                  <button
                    type="button"
                    onClick={() => onDelete(subtask.id)}
                    aria-label={`Remove subtask ${subtask.title || index + 1}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-soft text-dimmer
                               transition-colors duration-150 hover:bg-danger/10 hover:text-danger"
                  >
                    <CrossIcon className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-quiet mt-2 w-full"
            onClick={() =>
              setSubtasks((state) => [
                ...state,
                { title: "", isCompleted: false, id: uuidv4() },
              ])
            }
          >
            Add subtask
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="task-status-input" className="text-micro font-semibold text-dimmer">
              Status
            </label>
            <select
              id="task-status-input"
              value={status}
              onChange={onChangeStatus}
              className="field select-chevron mt-1 cursor-pointer"
            >
              {columns.map((column, index) => (
                <option key={index}>{column.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-micro font-semibold text-dimmer">Due date</span>
            <div className="mt-1">
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>
          </div>
        </div>

        <div className="mt-4">
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="btn-quiet btn-lg"
            onClick={() => setIsAddTaskModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (validate()) {
                onSubmit(type);
                setIsAddTaskModalOpen(false);
                type === "edit" && setIsTaskModalOpen(false);
              }
            }}
            className="btn-primary btn-lg"
          >
            {type === "edit" ? "Save changes" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddEditTaskModal;
