/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors - Use these consistently across the project
        primary: {
          DEFAULT: '#0273B1', // Primary button color - use for ALL buttons
          hover: '#025a8f',  // Primary button hover state
        },
        text: {
          primary: '#1C2D4F',   // Primary font color - use for main text
          secondary: '#A9B4CD', // Secondary text / hover color
        },
      },
    },
  },
  plugins: [],
}

