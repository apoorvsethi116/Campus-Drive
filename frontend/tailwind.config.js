/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0F172A",
        },
        brand: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          500: "#0D9488",
          600: "#0B7C72",
          700: "#0A6D64",
        },
        eligible: "#059669",
        pending: "#D97706",
        ineligible: "#DC2626",
        surface: "#F8FAFC",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.625rem",
      },
    },
  },
  plugins: [],
};
