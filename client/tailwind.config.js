/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#f5f0e8', 100: '#e9dfd0', 200: '#d7c2aa', 500: '#8b6b51', 600: '#72533d', 700: '#5b4030' },
        primary: { 50: '#f8f2ec', 100: '#eee1d4', 200: '#dcc4af', 500: '#9a704f', 600: '#7a5439', 700: '#60402d', 800: '#452d21' },
      },
      fontFamily: { sans: ['DM Sans', 'ui-sans-serif', 'system-ui'], editorial: ['Playfair Display', 'Georgia', 'serif'] },
      boxShadow: { soft: '0 16px 40px rgba(75, 51, 35, .07)' },
    },
  },
  plugins: [],
};
