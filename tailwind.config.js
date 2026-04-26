/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#fcd7d9',
        'pastel-pink-soft': '#fbe5e7',
        'sage-green': '#a5bda3',
        'sage-green-light': '#c8dac6',
        'water-blue': '#c5e0dc',
        'soft-dark': '#3a2e26',
        'warm-white': '#faf5ee',
        'gray-warm': '#8a8580',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}