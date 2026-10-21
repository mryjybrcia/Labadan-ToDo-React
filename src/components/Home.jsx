import React, { useState } from "react";
import { useSelector } from "react-redux";
import AddEditBoardModal from "../modals/AddEditBoardModal";
import Column from "./Column";
import EmptyBoard from "./EmptyBoard";
import Sidebar from "./Sidebar";

function Home() {
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  const boards = useSelector((state) => state.boards);
  const board = boards.find((board) => board.isActive === true);
  const columns = board.columns;

  return (
    <div className="h-screen bg-canvas pt-bar">
      <div className="hidden md:block">
        <Sidebar
          isSideBarOpen={isSideBarOpen}
          setIsSideBarOpen={setIsSideBarOpen}
        />
      </div>

      <div
        className={`h-full overflow-x-auto overflow-y-hidden transition-[padding] duration-200
                    ${isSideBarOpen ? "md:pl-rooms" : "md:pl-9"}`}
      >
        {columns.length > 0 ? (
          <div className="flex h-full border-l border-hairline">
            {columns.map((col, index) => (
              <Column key={index} colIndex={index} />
            ))}

            {/* A quiet rail rather than a large dashed placeholder: it should
                read as "there is room for another column", not compete with
                the columns that hold real work. */}
            <button
              type="button"
              onClick={() => setIsBoardModalOpen(true)}
              className="group flex h-full w-[150px] shrink-0 items-start justify-center
                         pt-2.5 text-label font-medium text-dimmer
                         transition-colors duration-150 hover:bg-raised hover:text-accent"
            >
              + New column
            </button>
          </div>
        ) : (
          <EmptyBoard type="edit" />
        )}
      </div>

      {isBoardModalOpen && (
        <AddEditBoardModal
          type="edit"
          setIsBoardModalOpen={setIsBoardModalOpen}
        />
      )}
    </div>
  );
}

export default Home;
