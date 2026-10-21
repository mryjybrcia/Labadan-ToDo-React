/** @type {import('tailwindcss').Config} */

// Every themed colour is a CSS variable holding rgb channels, so a single
// utility (`bg-surface`, `text-dim`) resolves correctly in both themes and
// still supports Tailwind's opacity modifiers (`border-hairline/60`).
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: v("--canvas"),
        surface: v("--surface"),
        raised: v("--raised"),
        hairline: v("--hairline"),
        "hairline-strong": v("--hairline-strong"),
        fg: v("--fg"),
        dim: v("--dim"),
        dimmer: v("--dimmer"),
        accent: v("--accent"),
        "accent-fg": v("--accent-fg"),
        danger: v("--danger"),
      },
      fontFamily: {
        sans: [
          "Archivo",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // A tight scale: this UI only needs four sizes.
        micro: ["0.6875rem", { lineHeight: "0.875rem" }], // 11px - counts, kbd
        label: ["0.75rem", { lineHeight: "1rem" }], // 12px - labels
        body: ["0.8125rem", { lineHeight: "1.25rem" }], // 13px - task rows
        title: ["0.9375rem", { lineHeight: "1.375rem" }], // 15px - headings
      },
      spacing: {
        rail: "300px",
        bar: "48px",
        rooms: "220px",
      },
      borderRadius: {
        sharp: "3px",
        soft: "5px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
