/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pettech: {
          orange: '#FF8C42',
          yellow: '#FFD166',
          cream: '#FFF8F0',
          'orange-dark': '#E67A35',
          'orange-light': '#FFAA72',
          'cream-dark': '#F5EDE0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
