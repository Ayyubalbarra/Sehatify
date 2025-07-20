// apps/admin/frontend/tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FBFF',
        primary: '#2DD4BF',
        secondary: '#E0F2FE',
        accent: '#0891B2',
        text: '#1E293B',
        'text-light': '#64748B',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'medical-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #2DD4BF 100%)',
      },
      boxShadow: {
        'medical': '0 10px 25px -5px rgba(14, 165, 233, 0.1), 0 10px 10px -5px rgba(14, 165, 233, 0.04)',
      },
    },
  },
  plugins: [],
};