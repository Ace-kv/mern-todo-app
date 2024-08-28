/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'black-paper': "url('https://www.transparenttextures.com/patterns/black-paper.png')",
      },
    },
  },
  plugins: [],
}

