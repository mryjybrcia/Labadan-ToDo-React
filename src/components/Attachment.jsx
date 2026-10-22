import React, { useEffect, useState } from "react";
import { getFileURL, isImage, formatBytes } from "../utils/attachments";

/** One stored attachment: image thumbnail, or a file chip. */
function Attachment({ meta }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let revoked = false;
    let objectUrl = null;

    getFileURL(meta.id)
      .then((u) => {
        if (revoked) {
          if (u) URL.revokeObjectURL(u);
          return;
        }
        if (!u) setFailed(true);
        objectUrl = u;
        setUrl(u);
      })
      .catch(() => setFailed(true));

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [meta.id]);

  if (failed) {
    return (
      <span className="rounded-sharp border border-hairline px-2 py-1 text-micro text-dimmer">
        {meta.name} (missing)
      </span>
    );
  }

  if (isImage(meta.type)) {
    return (
      <a
        href={url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={`${meta.name} - ${formatBytes(meta.size)}`}
        className="block overflow-hidden rounded-sharp border border-hairline hover:border-accent"
      >
        {url ? (
          <img
            src={url}
            alt={meta.name}
            className="h-20 w-20 object-cover"
            loading="lazy"
          />
        ) : (
          <span className="block h-20 w-20 animate-pulse bg-raised" />
        )}
      </a>
    );
  }

  return (
    <a
      href={url || undefined}
      download={meta.name}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1.5 rounded-sharp border border-hairline px-2 py-1
                 text-micro text-dim transition-colors hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 12 14" aria-hidden="true" className="h-3 w-3 shrink-0 fill-none stroke-current" strokeWidth="1.3">
        <path d="M7 .6v4h4M7.1.6H2.1a1.5 1.5 0 0 0-1.5 1.5v9.8a1.5 1.5 0 0 0 1.5 1.5h7.8a1.5 1.5 0 0 0 1.5-1.5V4.6z" />
      </svg>
      <span className="max-w-[160px] truncate">{meta.name}</span>
      <span className="tnum shrink-0 text-dimmer">{formatBytes(meta.size)}</span>
    </a>
  );
}

export default Attachment;
