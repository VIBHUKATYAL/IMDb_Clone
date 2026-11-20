/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        imdb: {
          yellow: '#F5C518',
          gold: '#E2B616',
          dark: '#121212',
          card: '#1A1A1A',
          cardHover: '#252525',
          border: '#2E2E2E',
          muted: '#8C8C8C',
          text: '#F5F5F5'
        }
      }
    },
  },
  plugins: [],
}
