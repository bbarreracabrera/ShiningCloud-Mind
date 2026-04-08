/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#fadadd', 
        'sage-green': '#a5bda3', 
        'water-blue': '#c5e0dc', 
        'soft-dark': '#4a4a4b', 
        'warm-white': '#fdfbf7', 
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}