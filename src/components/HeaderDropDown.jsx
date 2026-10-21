import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BoardIcon from "./icons/BoardIcon";
import useDarkMode from "../Hooks/useDarkMode";
import darkIcon from "../assets/icon-dark-theme.svg";
import lightIcon from "../assets/icon-light-theme.svg";
import boardSlice from "../redux/boardSlice";
import { useEscape } from "../Hooks/useShortcuts";

function HeaderDropDown({ setOpenDropdown, setIsBoardModalOpen }) {
  const dispatch = useDispatch();
  const [colorTheme, setTheme] = useDarkMode();
  const boards = useSelector((state) => state.boards);

  useEscape(() => setOpenDropdown(false));

  return (
    <div
      className="scrim items-start pt-bar"
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        setOpenDropdown(false);
      }}
    >
      <div className="panel p-0">
        <h2 className="px-3 pb-1 pt-3 text-micro font-semibold text-dimmer">
          Boards
        </h2>

        <nav className="pb-1">
          {boards.map((board, index) => (
            <button
              type="button"
              key={index}
              aria-current={board.isActive ? "page" : undefined}
              onClick={() => {
                dispatch(boardSlice.actions.setBoardActive({ index }));
                setOpenDropdown(false);
              }}
              className={`flex w-full items-center gap-2 border-l-2 px-3 py-2 text-left text-body
                          transition-colors duration-150
                          ${
                            board.isActive
                              ? "border-accent bg-accent/10 font-medium text-fg"
                              : "border-transparent text-dim hover:bg-raised hover:text-fg"
                          }`}
            >
              <BoardIcon className="h-3.5 w-3.5 opacity-70" />
              <span className="truncate">{board.name}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setIsBoardModalOpen(true);
              setOpenDropdown(false);
            }}
            className="flex w-full items-center gap-2 border-l-2 border-transparent px-3 py-2
                       text-left text-body text-dimmer transition-colors duration-150
                       hover:bg-raised hover:text-accent"
          >
            <BoardIcon className="h-3.5 w-3.5 opacity-70" />
            <span className="truncate">New board</span>
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setTheme(colorTheme)}
          className="flex w-full items-center gap-2 border-t border-hairline px-3 py-2
                     text-left text-label text-dim transition-colors duration-150 hover:bg-raised hover:text-fg"
        >
          <img
            className="w-3.5 opacity-60"
            src={colorTheme === "dark" ? darkIcon : lightIcon}
            alt=""
          />
          <span>{colorTheme === "dark" ? "Dark theme" : "Light theme"}</span>
        </button>
      </div>
    </div>
  );
}

export default HeaderDropDown;
