/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--color-surface)",
        "surface-accent": "var(--color-surface-accent)",
        border: "var(--color-border)",
        primary: "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
      },
    },
  },
  plugins: [],
};
