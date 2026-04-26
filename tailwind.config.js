/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#fbe8e9',
        'pastel-pink-soft': '#fdf2f3',
        'sage-green': '#a5bda3',
        'sage-green-light': '#c8dac6',
        'water-blue': '#c5e0dc',
        'soft-dark': '#2a2521',
        'warm-white': '#fbfaf7',
        'gray-warm': '#8a8580',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}