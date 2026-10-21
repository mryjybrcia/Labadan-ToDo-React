import React from "react";
import { useEscape } from "../Hooks/useShortcuts";

function DeleteModal({ type, title, onDeleteBtnClick, setIsDeleteModalOpen }) {
  useEscape(() => setIsDeleteModalOpen(false));

  return (
    <div
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        setIsDeleteModalOpen(false);
      }}
      className="scrim z-[60]"
    >
      <div role="alertdialog" aria-modal="true" className="panel my-auto">
        <h2 className="text-title font-semibold text-danger">
          Delete this {type}?
        </h2>
        <p className="mt-2 text-body leading-relaxed text-dim">
          {type === "task"
            ? `"${title}" and its subtasks will be removed. This can't be undone.`
            : `"${title}" will be removed, along with all its columns and tasks. This can't be undone.`}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="btn-quiet btn-lg"
          >
            Cancel
          </button>
          <button onClick={onDeleteBtnClick} className="btn-danger btn-lg">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
