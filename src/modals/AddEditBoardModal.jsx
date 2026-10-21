import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import CrossIcon from "../components/icons/CrossIcon";
import boardSlice from "../redux/boardSlice";
import { useEscape } from "../Hooks/useShortcuts";

function AddEditBoardModal({ setIsBoardModalOpen, type }) {
  const dispatch = useDispatch();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [name, setName] = useState("");
  const [newColumns, setNewColumns] = useState([
    { name: "Todo", tasks: [], id: uuidv4() },
    { name: "Doing", tasks: [], id: uuidv4() },
  ]);
  const [isValid, setIsValid] = useState(true);
  const board = useSelector((state) => state.boards).find((b) => b.isActive);

  useEscape(() => setIsBoardModalOpen(false));

  if (type === "edit" && isFirstLoad) {
    setNewColumns(board.columns.map((col) => ({ ...col, id: uuidv4() })));
    setName(board.name);
    setIsFirstLoad(false);
  }

  const validate = () => {
    setIsValid(false);
    if (!name.trim()) return false;
    for (let i = 0; i < newColumns.length; i++) {
      if (!newColumns[i].name.trim()) return false;
    }
    setIsValid(true);
    return true;
  };

  const onChange = (id, newValue) => {
    setNewColumns((prevState) => {
      const newState = [...prevState];
      newState.find((col) => col.id === id).name = newValue;
      return newState;
    });
  };

  const onDelete = (id) =>
    setNewColumns((prevState) => prevState.filter((el) => el.id !== id));

  const onSubmit = (type) => {
    setIsBoardModalOpen(false);
    if (type === "add") {
      dispatch(boardSlice.actions.addBoard({ name, newColumns }));
    } else {
      dispatch(boardSlice.actions.editBoard({ name, newColumns }));
    }
  };

  const nameInvalid = !isValid && !name.trim();

  return (
    <div
      className="scrim"
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        setIsBoardModalOpen(false);
      }}
    >
      <div role="dialog" aria-modal="true" className="panel my-auto">
        <h2 className="text-title font-semibold text-fg">
          {type === "edit" ? "Edit board" : "New board"}
        </h2>

        <div className="mt-4">
          <label htmlFor="board-name-input" className="text-micro font-semibold text-dimmer">
            Name
          </label>
          <input
            className={`field mt-1 ${nameInvalid ? "field-invalid" : ""}`}
            placeholder="e.g. Platform launch"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="board-name-input"
            aria-invalid={nameInvalid}
          />
          {nameInvalid && (
            <p className="mt-1 text-micro text-danger">Give the board a name.</p>
          )}
        </div>

        <div className="mt-4">
          <span className="text-micro font-semibold text-dimmer">Columns</span>
          <div className="mt-1 space-y-1.5">
            {newColumns.map((column, index) => {
              const invalid = !isValid && !column.name.trim();
              return (
                <div key={index} className="flex items-center gap-1.5">
                  <input
                    className={`field ${invalid ? "field-invalid" : ""}`}
                    onChange={(e) => onChange(column.id, e.target.value)}
                    type="text"
                    value={column.name}
                    aria-label={`Column ${index + 1} name`}
                    aria-invalid={invalid}
                  />
                  <button
                    type="button"
                    onClick={() => onDelete(column.id)}
                    aria-label={`Remove column ${column.name || index + 1}`}
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
              setNewColumns((state) => [
                ...state,
                { name: "", tasks: [], id: uuidv4() },
              ])
            }
          >
            Add column
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="btn-quiet btn-lg"
            onClick={() => setIsBoardModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (validate() === true) onSubmit(type);
            }}
            className="btn-primary btn-lg"
          >
            {type === "add" ? "Create board" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddEditBoardModal;
