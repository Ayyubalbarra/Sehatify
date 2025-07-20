// apps/admin/frontend/tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ini memberitahu Tailwind untuk memindai semua file di folder src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}