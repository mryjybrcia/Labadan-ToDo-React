import React from "react";

function ElipsisMenu({ type, setOpenEditModal, setOpenDeleteModal }) {
  const label = type.toLowerCase();
  return (
    <div
      role="menu"
      className="absolute right-0 top-full z-50 mt-1.5 w-40 overflow-hidden rounded-soft
                 border border-hairline bg-surface py-1"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => setOpenEditModal()}
        className="w-full px-3 py-1.5 text-left text-label text-dim transition-colors duration-150 hover:bg-raised hover:text-fg"
      >
        Edit {label}
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => setOpenDeleteModal()}
        className="w-full px-3 py-1.5 text-left text-label text-danger transition-colors duration-150 hover:bg-danger/10"
      >
        Delete {label}
      </button>
    </div>
  );
}

export default ElipsisMenu;
