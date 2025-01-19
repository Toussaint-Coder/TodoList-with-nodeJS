/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        primary : "#ffffff",
        secondary : "#EEDF21",
        retiary : "#010103"
      }
    },
  },
  plugins: [],
}