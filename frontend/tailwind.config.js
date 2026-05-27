/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: { 500: '#22c55e', 600: '#16a34a' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        danger:  { 500: '#ef4444', 600: '#dc2626' },
        // Extended shades for the dark clinical UI
        zinc: {
          150: '#ececef',
          250: '#dcdce0',
          350: '#bbbbc1',
          450: '#898992',
          550: '#616169',
          650: '#484850',
          750: '#333338',
          805: '#242428',
          850: '#202023',
          905: '#1a1a1e',
        },
        teal: {
          350: '#46dfca',
        },
        rose: {
          350: '#fc8b9a',
        },
        emerald: {
          150: '#bcf7db',
        },
      },
    },
  },
  plugins: [],
}