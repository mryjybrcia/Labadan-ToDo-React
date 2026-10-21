import { useEffect, useState } from "react";

/**
 * Returns [nextTheme, setTheme] - `nextTheme` is the theme a toggle would
 * switch TO, which is what the toggle label should name.
 */
function useDarkMode() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const nextTheme = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(nextTheme);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, nextTheme]);

  return [nextTheme, setTheme];
}

export default useDarkMode;
