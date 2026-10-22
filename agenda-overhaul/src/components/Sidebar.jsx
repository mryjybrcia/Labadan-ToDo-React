import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BoardIcon from "./icons/BoardIcon";
import useDarkMode from "../Hooks/useDarkMode";
import { shortcutLabel } from "../Hooks/useShortcuts";
import darkIcon from "../assets/icon-dark-theme.svg";
import lightIcon from "../assets/icon-light-theme.svg";
import showSidebarIcon from "../assets/icon-show-sidebar.svg";
import hideSidebarIcon from "../assets/icon-hide-sidebar.svg";
import boardSlice from "../redux/boardSlice";
import AddEditBoardModal from "../modals/AddEditBoardModal";
import { VIEWS, viewCounts } from "../utils/agenda";

function Sidebar({ isSideBarOpen, setIsSideBarOpen, view, setView }) {
  const dispatch = useDispatch();
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [colorTheme, setTheme] = useDarkMode();
  const boards = useSelector((state) => state.boards);
  const board = boards.find((b) => b.isActive === true);
  const counts = viewCounts(board);

  if (!isSideBarOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsSideBarOpen(true)}
        aria-label="Show sidebar"
        title="Show sidebar"
        className="fixed bottom-0 left-0 top-bar z-20 flex w-9 items-start justify-center
                   border-r border-hairline bg-surface pt-3 transition-colors duration-150 hover:bg-raised"
      >
        <img src={showSidebarIcon} alt="" className="opacity-60" />
      </button>
    );
  }

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-bar z-20 flex w-rooms flex-col border-r border-hairline bg-surface">
        <div className="min-h-0 flex-1 overflow-y-auto py-3">
          <h2 className="px-3 pb-1 text-micro font-semibold text-dimmer">Views</h2>
          <nav className="pb-2">
            {Object.entries(VIEWS).map(([key, v]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-current={view === key ? "page" : undefined}
                className={`flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-left text-body
                            transition-colors duration-150
                            ${
                              view === key
                                ? "border-accent bg-accent/10 font-medium text-fg"
                                : "border-transparent text-dim hover:bg-raised hover:text-fg"
                            }`}
              >
                <span className="flex-1 truncate">{v.label}</span>
                {counts[key] > 0 && (
                  <span
                    className={`tnum shrink-0 text-micro ${
                      key === "today" && counts[key] > 0 ? "text-accent" : "text-dimmer"
                    }`}
                  >
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <h2 className="border-t border-hairline px-3 pb-1 pt-3 text-micro font-semibold text-dimmer">
            Boards
          </h2>
          <nav>
            {boards.map((b, index) => (
              <button
                type="button"
                key={index}
                aria-current={b.isActive ? "page" : undefined}
                onClick={() => dispatch(boardSlice.actions.setBoardActive({ index }))}
                className={`group flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-left text-body
                            transition-colors duration-150
                            ${
                              b.isActive
                                ? "border-accent bg-accent/10 font-medium text-fg"
                                : "border-transparent text-dim hover:bg-raised hover:text-fg"
                            }`}
              >
                <BoardIcon className="h-3.5 w-3.5 opacity-70" />
                <span className="flex-1 truncate">{b.name}</span>
                {index < 9 && (
                  <kbd className="kbd reveal shrink-0 transition-opacity duration-150">
                    {shortcutLabel(index + 1)}
                  </kbd>
                )}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsBoardModalOpen(true)}
              className="mt-1 flex w-full items-center gap-2 border-l-2 border-transparent px-3 py-1.5
                         text-left text-body text-dimmer transition-colors duration-150
                         hover:bg-raised hover:text-accent"
            >
              <BoardIcon className="h-3.5 w-3.5 opacity-70" />
              <span className="truncate">New board</span>
            </button>
          </nav>
        </div>

        <div className="shrink-0 border-t border-hairline">
          <button
            type="button"
            onClick={() => setTheme(colorTheme)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-label text-dim
                       transition-colors duration-150 hover:bg-raised hover:text-fg"
          >
            <img className="w-3.5 opacity-60" src={colorTheme === "dark" ? darkIcon : lightIcon} alt="" />
            <span className="flex-1">
              {colorTheme === "dark" ? "Dark theme" : "Light theme"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsSideBarOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-label text-dim
                       transition-colors duration-150 hover:bg-raised hover:text-fg"
          >
            <img className="w-3.5 opacity-60" src={hideSidebarIcon} alt="" />
            <span className="flex-1">Hide sidebar</span>
          </button>
        </div>
      </aside>

      {isBoardModalOpen && (
        <AddEditBoardModal type="add" setIsBoardModalOpen={setIsBoardModalOpen} />
      )}
    </>
  );
}

export default Sidebar;
