/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8FBFF',
        primary: '#2DD4BF',
        secondary: '#E0F2FE',
        accent: '#0891B2',
        text: '#1E293B',
        'text-light': '#64748B',
        'primary-hover': '#14B8A6',
        'secondary-hover': '#BAE6FD',
        'blue-gradient-start': '#0EA5E9',
        'blue-gradient-end': '#2DD4BF',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'medical-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #2DD4BF 100%)',
        'chat-gradient': 'linear-gradient(135deg, #F8FBFF 0%, #E0F2FE 100%)',
      },
      boxShadow: {
        'medical': '0 10px 25px -5px rgba(14, 165, 233, 0.1), 0 10px 10px -5px rgba(14, 165, 233, 0.04)',
        'chat': '0 4px 6px -1px rgba(45, 212, 191, 0.1), 0 2px 4px -1px rgba(45, 212, 191, 0.06)',
      },
    },
  },
  plugins: [],
};