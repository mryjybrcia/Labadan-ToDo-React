import { configureStore } from "@reduxjs/toolkit";
import boardSlice from "./boardSlice";
import { loadBoards, saveBoards } from "./persist";

// Saved boards win over the seed in src/data/data.json. On a first visit
// there is nothing saved, so the slice's own initialState (the seed) is used.
const persistedBoards = loadBoards();

const store = configureStore({
  reducer: {
    boards: boardSlice.reducer,
  },
  ...(persistedBoards ? { preloadedState: { boards: persistedBoards } } : {}),
});

// Dragging a task or ticking subtasks fires actions in bursts, so writes are
// coalesced instead of serialising the whole board on every dispatch.
let writeQueued = false;
store.subscribe(() => {
  if (writeQueued) return;
  writeQueued = true;
  setTimeout(() => {
    writeQueued = false;
    saveBoards(store.getState().boards);
  }, 150);
});

export default store;
