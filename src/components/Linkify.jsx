import React from "react";

// Deliberately conservative: http(s) and bare www. only. Anything else stays
// as plain text rather than being guessed into a link.
const URL_RE = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

const trimTrailingPunctuation = (url) => url.replace(/[.,;:!?)\]]+$/, "");

/** Renders text with URLs turned into links, leaving everything else alone. */
function Linkify({ text, className = "" }) {
  const parts = String(text).split(URL_RE);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (!URL_RE.test(part)) {
          URL_RE.lastIndex = 0;
          return <React.Fragment key={i}>{part}</React.Fragment>;
        }
        URL_RE.lastIndex = 0;

        const clean = trimTrailingPunctuation(part);
        const tail = part.slice(clean.length);
        const href = clean.startsWith("http") ? clean : `https://${clean}`;

        return (
          <React.Fragment key={i}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={(e) => e.stopPropagation()}
              className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
            >
              {clean}
            </a>
            {tail}
          </React.Fragment>
        );
      })}
    </span>
  );
}

export default Linkify;
