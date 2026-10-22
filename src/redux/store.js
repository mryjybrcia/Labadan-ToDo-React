import { configureStore } from "@reduxjs/toolkit";
import boardSlice from "./boardSlice";
import timeclockSlice from "./timeclockSlice";
import {
  loadBoards,
  loadTimeclock,
  saveBoards,
  saveTimeclock,
} from "./persist";

// Saved state wins over the seed in src/data/data.json. On a first visit
// there is nothing saved, so each slice's own initialState is used.
const persistedBoards = loadBoards();
const persistedClock = loadTimeclock();

const preloadedState = {};
if (persistedBoards) preloadedState.boards = persistedBoards;
if (persistedClock) preloadedState.timeclock = persistedClock;

const store = configureStore({
  reducer: {
    boards: boardSlice.reducer,
    timeclock: timeclockSlice.reducer,
  },
  ...(Object.keys(preloadedState).length ? { preloadedState } : {}),
});

// Dragging a task or ticking subtasks fires actions in bursts, so writes are
// coalesced, and each slice is only re-serialised when it actually changed.
let writeQueued = false;
let lastBoards = store.getState().boards;
let lastClock = store.getState().timeclock;

store.subscribe(() => {
  if (writeQueued) return;
  writeQueued = true;
  setTimeout(() => {
    writeQueued = false;
    const { boards, timeclock } = store.getState();
    if (boards !== lastBoards) {
      lastBoards = boards;
      saveBoards(boards);
    }
    if (timeclock !== lastClock) {
      lastClock = timeclock;
      saveTimeclock(timeclock);
    }
  }, 150);
});

export default store;
