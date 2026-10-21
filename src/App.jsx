import React, { useState } from "react";
import Header from "./components/Header";
import { useDispatch, useSelector } from "react-redux";
import Home from "./components/Home";
import EmptyBoard from "./components/EmptyBoard";
import boardSlice from "./redux/boardSlice";

function App() {
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.boards);
  const activeBoard = boards.find((board) => board.isActive);
  if (!activeBoard && boards.length > 0)
    dispatch(boardSlice.actions.setBoardActive({ index: 0 }));

  if (boards.length === 0) {
    return (
      <div className="h-screen">
        <EmptyBoard type="add" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <Header
        setIsBoardModalOpen={setIsBoardModalOpen}
        isBoardModalOpen={isBoardModalOpen}
      />
      <Home
        setIsBoardModalOpen={setIsBoardModalOpen}
        isBoardModalOpen={isBoardModalOpen}
      />
    </div>
  );
}

export default App;
