import { createSlice } from "@reduxjs/toolkit";

/**
 * Work-shift clock, separate from the per-task timers.
 *
 *   clockedInAt - epoch ms of the open shift, or null
 *   entries     - closed shifts, newest first
 *
 * `now` is supplied by the caller so the reducers stay pure.
 */
const timeclockSlice = createSlice({
  name: "timeclock",
  initialState: {
    clockedInAt: null,
    entries: [],
  },
  reducers: {
    clockIn: (state, action) => {
      if (state.clockedInAt) return;
      state.clockedInAt = action.payload.now;
    },
    clockOut: (state, action) => {
      if (!state.clockedInAt) return;
      const { now, id } = action.payload;
      state.entries.unshift({
        id,
        start: state.clockedInAt,
        end: now,
      });
      state.clockedInAt = null;
      // Keep the log bounded; this is a personal tracker, not an archive.
      if (state.entries.length > 200) state.entries.length = 200;
    },
    deleteEntry: (state, action) => {
      state.entries = state.entries.filter((e) => e.id !== action.payload.id);
    },
  },
});

export default timeclockSlice;
