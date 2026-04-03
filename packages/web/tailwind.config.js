/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B", // Deepest black (dark)
        surface: "#161618",    // Card background (dark)
        primary: "#0052FF",    // Brand blue
        secondary: "#8F9BB3",  // Muted text (dark)
        success: "#00C853",
        danger: "#FF3D00",
        // Light mode palette
        'light-background': "#F7FAFC",
        'light-surface': "#FFFFFF",
        'light-primary': "#0052FF",
        'light-secondary': "#4B5563", // Muted text (light)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}