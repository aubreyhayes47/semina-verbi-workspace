/** @type {import('tailwindcss').Config} */
export default {
  // Specify files to scan for Tailwind classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vellum-inspired paper tones for backgrounds and surfaces
        vellum: {
          light: "#f8f5e6",
          DEFAULT: "#f5f0e0",
          dark: "#ebe6d5",
        },
        // Ink tones for text and darker elements
        ink: {
          light: "#3a3a3a",
          DEFAULT: "#2a2a2a",
          dark: "#1a1a1a",
        },
        // Illuminated manuscript accent colors for highlights, borders, and interactive elements
        illuminated: {
          gold: "#d4af37", // A classic gold for accents and highlights
          red: "#8b2e2e", // A deep, rich red for important text or highlights (e.g., module titles)
          green: "#3c6e45", // A subtle green for success or positive indicators
        },
        // Navy for deeper, more formal elements like the logo background
        navy: "#0e2a47",
      },
      // Custom font families to match the "timeless manuscript" aesthetic
      fontFamily: {
        serif: ["EB Garamond", "Garamond", "Georgia", "serif"], // For headings and classic feel
        sans: ["Lato", "Open Sans", "sans-serif"], // For body text, modern readability
        mono: ["Fira Code", "Source Code Pro", "monospace"], // For code blocks or timestamps
      },
      // Custom box shadows for a subtle, layered and aged effect
      boxShadow: {
        parchment: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.12)", // Lighter shadow for subtle depth
        module: "0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)",   // Deeper shadow for main content blocks
      },
    },
  },
  plugins: [], // No additional Tailwind plugins are used in this configuration
}
