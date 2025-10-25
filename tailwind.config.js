/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#F7F8FB',
          100: '#F2F4F7',
          200: '#E7ECF3',
        },
      },
    },
  },
  plugins: [],
}
