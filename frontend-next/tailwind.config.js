/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Mode Color System (Figma)
        bg: {
          primary: '#121316',    // Primary background
          secondary: '#121212',  // Secondary (navbar / sections)
          input: '#1A1C22',      // Input fields
          card: '#1A1C22',       // Cards / containers
        },
        text: {
          primary: '#FFFFFF',    // Primary (headings, titles, logo)
          secondary: '#A9B4CD',  // Secondary (labels, nav links)
          paragraph: '#8CA2C0',  // Paragraph text
          placeholder: '#6B7C93', // Placeholder text
        },
        accent: {
          main: '#0273B1',       // Main blue
          hover: '#0284CC',      // Hover blue
          logo: '#3276FA',       // Logo dot
        },
        border: {
          default: '#486284',    // Default border
          subtle: 'rgba(239, 243, 250, 0.2)', // Subtle border
        },
      },
    },
  },
  plugins: [],
}

