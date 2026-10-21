import React from "react";

function CrossIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 15 15"
      aria-hidden="true"
      focusable="false"
      className={`h-[15px] w-[15px] shrink-0 fill-current ${className}`}
    >
      <g fillRule="evenodd">
        <path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z" />
        <path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z" />
      </g>
    </svg>
  );
}

export default CrossIcon;
