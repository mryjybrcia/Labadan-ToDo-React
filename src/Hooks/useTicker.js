import { useEffect, useState } from "react";

/**
 * Re-renders once a second while `active`, so a running timer counts up.
 * When inactive no interval is registered at all.
 */
export default function useTicker(active, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  return now;
}
