import { createSlice } from "@reduxjs/toolkit";
import data from "../data/data.json";

const boardSlice = createSlice({
  name: "boards",
  initialState: data.boards,
  reducers: {
    addBoard: (state, action) => {
      const isActive = state.length > 0 ? false : true;
      const payload = action.payload;
      const board = {
        name: payload.name,
        isActive,
        columns: [],
      };
      board.columns = payload.newColumns;
      state.push(board);
    },
    editBoard: (state, action) => {
      const payload = action.payload;
      const board = state.find((board) => board.isActive);
      board.name = payload.name;
      board.columns = payload.newColumns;
    },
    deleteBoard: (state) => {
      const board = state.find((board) => board.isActive);
      state.splice(state.indexOf(board), 1);
    },
    setBoardActive: (state, action) => {
      state.map((board, index) => {
        index === action.payload.index
          ? (board.isActive = true)
          : (board.isActive = false);
        return board;
      });
    },
    addTask: (state, action) => {
      const { title, status, description, subtasks, newColIndex, dueDate, now } =
        action.payload;

      // A new task starts its own clock, so creating one banks whatever was
      // already running - only one task is ever on the clock.
      if (now) {
        state.forEach((board) =>
          board.columns.forEach((col) =>
            col.tasks.forEach((task) => {
              if (task.startedAt) {
                task.timeSpent =
                  (task.timeSpent || 0) + Math.max(0, now - task.startedAt);
                task.startedAt = null;
              }
            })
          )
        );
      }

      const task = {
        title,
        description,
        subtasks,
        status,
        dueDate: dueDate || null,
        timeSpent: 0,
        startedAt: now || null,
      };
      const board = state.find((board) => board.isActive);
      const column = board.columns.find((col, index) => index === newColIndex);
      column.tasks.push(task);
    },
    editTask: (state, action) => {
      const {
        title,
        status,
        description,
        subtasks,
        prevColIndex,
        newColIndex,
        taskIndex,
        dueDate,
      } = action.payload;
      const board = state.find((board) => board.isActive);
      const column = board.columns.find((col, index) => index === prevColIndex);
      const task = column.tasks.find((task, index) => index === taskIndex);
      task.title = title;
      task.status = status;
      task.description = description;
      task.subtasks = subtasks;
      task.dueDate = dueDate || null;
      if (prevColIndex === newColIndex) return;
      column.tasks = column.tasks.filter((task, index) => index !== taskIndex);
      const newCol = board.columns.find((col, index) => index === newColIndex);
      newCol.tasks.push(task);
    },
    dragTask: (state, action) => {
      const { colIndex, prevColIndex, taskIndex } = action.payload;
      const board = state.find((board) => board.isActive);
      const prevCol = board.columns.find((col, i) => i === prevColIndex);
      const task = prevCol.tasks.splice(taskIndex, 1)[0];
      board.columns.find((col, i) => i === colIndex).tasks.push(task);
    },
    setSubtaskCompleted: (state, action) => {
      const payload = action.payload;
      const board = state.find((board) => board.isActive);
      const col = board.columns.find((col, i) => i === payload.colIndex);
      const task = col.tasks.find((task, i) => i === payload.taskIndex);
      const subtask = task.subtasks.find((subtask, i) => i === payload.index);
      subtask.isCompleted = !subtask.isCompleted;
    },
    setTaskStatus: (state, action) => {
      const payload = action.payload;
      const board = state.find((board) => board.isActive);
      const columns = board.columns;
      const col = columns.find((col, i) => i === payload.colIndex);
      if (payload.colIndex === payload.newColIndex) return;
      const task = col.tasks.find((task, i) => i === payload.taskIndex);
      task.status = payload.status;
      col.tasks = col.tasks.filter((task, i) => i !== payload.taskIndex);
      const newCol = columns.find((col, i) => i === payload.newColIndex);
      newCol.tasks.push(task);
    },
    /**
     * Timer actions. `now` is passed in by the caller so reducers stay pure.
     * Starting a task banks whatever was running first, so only one task can
     * ever be running.
     */
    startTaskTimer: (state, action) => {
      const { colIndex, taskIndex, now } = action.payload;

      state.forEach((board) =>
        board.columns.forEach((col) =>
          col.tasks.forEach((task) => {
            if (task.startedAt) {
              task.timeSpent =
                (task.timeSpent || 0) + Math.max(0, now - task.startedAt);
              task.startedAt = null;
            }
          })
        )
      );

      const board = state.find((board) => board.isActive);
      const task = board.columns[colIndex]?.tasks[taskIndex];
      if (task) task.startedAt = now;
    },
    stopTaskTimer: (state, action) => {
      const now = action.payload.now;
      state.forEach((board) =>
        board.columns.forEach((col) =>
          col.tasks.forEach((task) => {
            if (task.startedAt) {
              task.timeSpent =
                (task.timeSpent || 0) + Math.max(0, now - task.startedAt);
              task.startedAt = null;
            }
          })
        )
      );
    },
    addComment: (state, action) => {
      const { colIndex, taskIndex, comment } = action.payload;
      const board = state.find((board) => board.isActive);
      const task = board.columns[colIndex]?.tasks[taskIndex];
      if (!task) return;
      if (!Array.isArray(task.comments)) task.comments = [];
      task.comments.push(comment);
    },
    deleteComment: (state, action) => {
      const { colIndex, taskIndex, commentId } = action.payload;
      const board = state.find((board) => board.isActive);
      const task = board.columns[colIndex]?.tasks[taskIndex];
      if (!task || !Array.isArray(task.comments)) return;
      task.comments = task.comments.filter((c) => c.id !== commentId);
    },
    setTaskDueDate: (state, action) => {
      const { colIndex, taskIndex, dueDate } = action.payload;
      const board = state.find((board) => board.isActive);
      const task = board.columns[colIndex]?.tasks[taskIndex];
      if (task) task.dueDate = dueDate || null;
    },
    resetTaskTimer: (state, action) => {
      const { colIndex, taskIndex } = action.payload;
      const board = state.find((board) => board.isActive);
      const task = board.columns[colIndex]?.tasks[taskIndex];
      if (task) {
        task.timeSpent = 0;
        task.startedAt = null;
      }
    },
    deleteTask: (state, action) => {
      const payload = action.payload;
      const board = state.find((board) => board.isActive);
      const col = board.columns.find((col, i) => i === payload.colIndex);
      col.tasks = col.tasks.filter((task, i) => i !== payload.taskIndex);
    },
  },
});

export default boardSlice;
