import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import boardSlice from "../redux/boardSlice";
import Attachment from "./Attachment";
import Linkify from "./Linkify";
import { putFile, deleteFiles, isImage, formatBytes } from "../utils/attachments";

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function Comments({ colIndex, taskIndex, comments = [] }) {
  const dispatch = useDispatch();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState([]); // {id,name,type,size,file}
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef(null);

  const acceptFiles = (fileList) => {
    setError(null);
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    setPending((prev) => [
      ...prev,
      ...incoming.map((file) => ({
        id: uuidv4(),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      })),
    ]);
  };

  const removePending = (id) =>
    setPending((prev) => prev.filter((p) => p.id !== id));

  const submit = async () => {
    const text = body.trim();
    if (!text && !pending.length) return;
    setError(null);

    const stored = [];
    try {
      for (const item of pending) {
        await putFile(item.id, item.file);
        stored.push({
          id: item.id,
          name: item.name,
          type: item.type,
          size: item.size,
        });
      }
    } catch (err) {
      // Roll back anything already written so no orphan blobs are left.
      await deleteFiles(stored.map((s) => s.id));
      setError(err.message || "Couldn't save the attachment.");
      return;
    }

    dispatch(
      boardSlice.actions.addComment({
        colIndex,
        taskIndex,
        comment: {
          id: uuidv4(),
          body: text,
          createdAt: Date.now(),
          attachments: stored,
        },
      })
    );
    setBody("");
    setPending([]);
  };

  const remove = async (comment) => {
    await deleteFiles((comment.attachments || []).map((a) => a.id));
    dispatch(
      boardSlice.actions.deleteComment({
        colIndex,
        taskIndex,
        commentId: comment.id,
      })
    );
  };

  const onPaste = (e) => {
    const files = Array.from(e.clipboardData?.files || []);
    if (files.length) {
      e.preventDefault();
      acceptFiles(files);
    }
  };

  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between">
        <span className="text-micro font-semibold text-dimmer">Comments</span>
        {comments.length > 0 && (
          <span className="tnum text-micro text-dim">{comments.length}</span>
        )}
      </div>

      {comments.length > 0 && (
        <ul className="mt-1 border-t border-hairline">
          {comments.map((comment) => (
            <li key={comment.id} className="group border-b border-hairline py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="text-micro text-dimmer">
                  {timeAgo(comment.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(comment)}
                  className="ml-auto text-micro text-dimmer opacity-0 transition-opacity
                             hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>

              {comment.body && (
                <p className="mt-1 whitespace-pre-wrap break-words text-body text-fg">
                  <Linkify text={comment.body} />
                </p>
              )}

              {comment.attachments?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {comment.attachments.map((meta) => (
                    <Attachment key={meta.id} meta={meta} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Composer */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          acceptFiles(e.dataTransfer.files);
        }}
        className={`mt-2 rounded-soft border transition-colors ${
          dragOver ? "border-accent bg-accent/[0.06]" : "border-hairline"
        }`}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onPaste={onPaste}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Add a comment. Paste or drop an image, or include a link."
          aria-label="New comment"
          className="w-full resize-y bg-transparent px-2.5 py-2 text-body text-fg
                     placeholder:text-dim/80 focus:outline-none"
        />

        {pending.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-2.5 pb-2">
            {pending.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-1.5 rounded-sharp border border-hairline px-2 py-1 text-micro text-dim"
              >
                <span className="max-w-[140px] truncate">
                  {isImage(item.type) ? "Image" : "File"}: {item.name}
                </span>
                <span className="tnum text-dimmer">{formatBytes(item.size)}</span>
                <button
                  type="button"
                  onClick={() => removePending(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="text-dimmer hover:text-danger"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-hairline px-2 py-1.5">
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              acceptFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="rounded-sharp px-2 py-1 text-micro text-dim transition-colors hover:bg-raised hover:text-fg"
          >
            Attach file
          </button>
          <span className="text-micro text-dimmer">or paste an image</span>

          <button
            type="button"
            onClick={submit}
            disabled={!body.trim() && !pending.length}
            className="btn-primary ml-auto"
          >
            Comment
          </button>
        </div>
      </div>

      {error && <p className="mt-1.5 text-micro text-danger">{error}</p>}
    </div>
  );
}

export default Comments;
