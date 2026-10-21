import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Logo from "../assets/logo-mobile.svg";
import iconDown from "../assets/icon-chevron-down.svg";
import iconUp from "../assets/icon-chevron-up.svg";
import elipsis from "../assets/icon-vertical-ellipsis.svg";
import HeaderDropDown from "./HeaderDropDown";
import ElipsisMenu from "./ElipsisMenu";
import AddEditBoardModal from "../modals/AddEditBoardModal";
import AddEditTaskModal from "../modals/AddEditTaskModal";
import DeleteModal from "../modals/DeleteModal";
import boardSlice from "../redux/boardSlice";
import { useShortcuts } from "../Hooks/useShortcuts";

function Header({ setIsBoardModalOpen, isBoardModalOpen }) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isElipsisMenuOpen, setIsElipsisMenuOpen] = useState(false);
  const [boardType, setBoardType] = useState("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const dispatch = useDispatch();
  const boards = useSelector((state) => state.boards);
  const board = boards.find((board) => board.isActive);

  const anyOverlayOpen =
    isTaskModalOpen || isBoardModalOpen || isDeleteModalOpen || openDropdown;

  const onBoard = useCallback(
    (index) => {
      if (index < boards.length) {
        dispatch(boardSlice.actions.setBoardActive({ index }));
      }
    },
    [dispatch, boards.length]
  );

  const onNewTask = useCallback(() => setIsTaskModalOpen(true), []);

  useShortcuts({ onBoard, onNewTask, enabled: !anyOverlayOpen });

  const onDropdownClick = () => {
    setOpenDropdown((state) => !state);
    setIsElipsisMenuOpen(false);
    setBoardType("add");
  };

  const setOpenEditModal = () => {
    setIsBoardModalOpen(true);
    setIsElipsisMenuOpen(false);
  };
  const setOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setIsElipsisMenuOpen(false);
  };

  const onDeleteBtnClick = (e) => {
    if (e.target.textContent === "Delete") {
      dispatch(boardSlice.actions.deleteBoard());
      dispatch(boardSlice.actions.setBoardActive({ index: 0 }));
      setIsDeleteModalOpen(false);
    } else {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-bar border-b border-hairline bg-surface">
      <header className="flex h-full items-center gap-3 px-3">
        <img src={Logo} alt="" className="h-4 w-4 shrink-0" />
        <span className="hidden shrink-0 text-label font-semibold text-dim md:inline">
          Project Task
        </span>

        <span className="hidden h-3.5 w-px shrink-0 bg-hairline md:block" />

        <div className="flex min-w-0 items-center">
          <h1 className="truncate text-title font-semibold text-fg">
            {board.name}
          </h1>
          <button
            type="button"
            onClick={onDropdownClick}
            aria-label="Switch board"
            aria-expanded={openDropdown}
            className="ml-1.5 rounded-sharp p-1 md:hidden"
          >
            <img src={openDropdown ? iconUp : iconDown} alt="" className="w-2.5" />
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            className="btn-primary"
            onClick={() => setIsTaskModalOpen(true)}
          >
            <span className="hidden sm:inline">New task</span>
            <span className="sm:hidden">+</span>
            <kbd className="kbd ml-0.5 hidden border-accent-fg/30 text-accent-fg/70 sm:inline-flex">
              N
            </kbd>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBoardType("edit");
                setOpenDropdown(false);
                setIsElipsisMenuOpen((prevState) => !prevState);
              }}
              aria-label="Board options"
              aria-expanded={isElipsisMenuOpen}
              className="flex h-7 w-7 items-center justify-center rounded-soft transition-colors duration-150 hover:bg-raised"
            >
              <img src={elipsis} alt="" className="h-4 opacity-70" />
            </button>
            {isElipsisMenuOpen && (
              <ElipsisMenu
                type="Board"
                setOpenEditModal={setOpenEditModal}
                setOpenDeleteModal={setOpenDeleteModal}
              />
            )}
          </div>
        </div>

        {openDropdown && (
          <HeaderDropDown
            setOpenDropdown={setOpenDropdown}
            setIsBoardModalOpen={setIsBoardModalOpen}
          />
        )}
      </header>

      {isTaskModalOpen && (
        <AddEditTaskModal
          setIsAddTaskModalOpen={setIsTaskModalOpen}
          type="add"
          device="mobile"
        />
      )}

      {isBoardModalOpen && (
        <AddEditBoardModal
          setBoardType={setBoardType}
          type={boardType}
          setIsBoardModalOpen={setIsBoardModalOpen}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteModal
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          type="board"
          title={board.name}
          onDeleteBtnClick={onDeleteBtnClick}
        />
      )}
    </div>
  );
}

export default Header;
