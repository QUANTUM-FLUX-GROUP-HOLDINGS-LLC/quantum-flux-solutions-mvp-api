/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0E5A8A',
          dark: '#0A4266',
          light: '#EDF4F9',
        }
      }
    },
  },
  plugins: [],
}
