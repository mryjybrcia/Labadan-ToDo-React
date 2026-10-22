import React, { useState } from "react";
import AddEditBoardModal from "../modals/AddEditBoardModal";
import AddEditTaskModal from "../modals/AddEditTaskModal";
import Agenda from "./Agenda";
import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";
import { VIEWS, viewCounts } from "../utils/agenda";

function Home() {
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const boards = useSelector((state) => state.boards);
  const activeBoard = boards.find((b) => b.isActive === true);

  // Land on Today, unless nothing is due - a first visit with no due dates
  // would otherwise open on an empty screen and read as broken.
  const [view, setView] = useState(() => {
    const counts = viewCounts(activeBoard);
    return counts.today > 0 || counts.all === 0 ? "today" : "all";
  });


  return (
    <div className="h-screen bg-canvas pt-bar">
      <div className="hidden md:block">
        <Sidebar
          isSideBarOpen={isSideBarOpen}
          setIsSideBarOpen={setIsSideBarOpen}
          view={view}
          setView={setView}
        />
      </div>

      <div
        className={`h-full overflow-y-auto transition-[padding] duration-200
                    ${isSideBarOpen ? "md:pl-rooms" : "md:pl-9"}`}
      >
        {/* A readable measure rather than edge-to-edge: this is a list to read
            top to bottom, not a surface to scan sideways. */}
        <div className="mx-auto min-h-full max-w-3xl border-hairline md:border-x">
          {/* View switcher for small screens, where the sidebar is hidden. */}
          <div className="flex gap-1 overflow-x-auto border-b border-hairline px-3 py-2 md:hidden">
            {Object.entries(VIEWS).map(([key, v]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-current={view === key ? "page" : undefined}
                className={`shrink-0 rounded-full px-3 py-1 text-label font-medium transition-colors
                            ${
                              view === key
                                ? "bg-accent text-accent-fg"
                                : "text-dim hover:bg-raised hover:text-fg"
                            }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <Agenda view={view} onNewTask={() => setIsTaskModalOpen(true)} />
        </div>
      </div>

      {isBoardModalOpen && (
        <AddEditBoardModal type="edit" setIsBoardModalOpen={setIsBoardModalOpen} />
      )}
      {isTaskModalOpen && (
        <AddEditTaskModal setIsAddTaskModalOpen={setIsTaskModalOpen} type="add" />
      )}
    </div>
  );
}

export default Home;
