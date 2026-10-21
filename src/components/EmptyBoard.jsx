import React, { useState } from "react";
import AddEditBoardModal from "../modals/AddEditBoardModal";

function EmptyBoard({ type }) {
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const isEdit = type === "edit";

  return (
    <div className="flex h-full w-full flex-col items-start justify-center px-8">
      <h2 className="text-title font-semibold text-fg">
        {isEdit ? "No columns yet" : "No boards yet"}
      </h2>
      <p className="mt-1.5 max-w-xs text-body text-dim">
        {isEdit
          ? "Columns are the stages work moves through. Add the first one."
          : "A board holds the columns and tasks for one piece of work."}
      </p>
      <button
        onClick={() => setIsBoardModalOpen(true)}
        className="btn-primary btn-lg mt-4"
      >
        {isEdit ? "Add column" : "Create board"}
      </button>

      {isBoardModalOpen && (
        <AddEditBoardModal
          type={type}
          setIsBoardModalOpen={setIsBoardModalOpen}
        />
      )}
    </div>
  );
}

export default EmptyBoard;
