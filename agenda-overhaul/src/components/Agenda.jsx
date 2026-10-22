import React from "react";
import { useSelector } from "react-redux";
import AgendaRow from "./AgendaRow";
import { buildAgenda, VIEWS } from "../utils/agenda";

const TONE = {
  danger: "text-danger",
  accent: "text-accent",
};

function Agenda({ view, onNewTask }) {
  const boards = useSelector((state) => state.boards);
  const board = boards.find((b) => b.isActive === true);
  const groups = buildAgenda(board, view);

  if (!board.columns.length) {
    return (
      <div className="px-4 py-16 text-center sm:px-6">
        <h2 className="text-title font-semibold text-fg">No statuses yet</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-body text-dim">
          Statuses are the stages work moves through. Add them from the board
          menu, then tasks can be sorted into them.
        </p>
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="px-4 py-16 text-center sm:px-6">
        <h2 className="text-title font-semibold text-fg">{VIEWS[view].empty}</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-body text-dim">
          {view === "done"
            ? "Tick a task off and it will collect here."
            : "Add a task, or give an existing one a due date so it shows up here."}
        </p>
        {view !== "done" && (
          <button type="button" onClick={onNewTask} className="btn-primary btn-lg mt-4">
            New task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pb-safe">
      {groups.map((group) => (
        <section key={group.key}>
          <h2
            className="sticky top-0 z-10 flex items-baseline gap-2 border-b border-hairline
                       bg-canvas px-3 py-2 sm:px-4"
          >
            <span className={`text-label font-semibold ${TONE[group.tone] || "text-fg"}`}>
              {group.label}
            </span>
            <span className="tnum ml-auto text-micro text-dim">{group.rows.length}</span>
          </h2>

          {group.rows.map((row) => (
            <AgendaRow
              key={`${row.colIndex}-${row.taskIndex}-${row.task.title}`}
              colIndex={row.colIndex}
              taskIndex={row.taskIndex}
              showDue={group.key !== "someday"}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

export default Agenda;
