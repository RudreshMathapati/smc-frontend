/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB",
        card: "#FFFFFF",
        accent: "#D1D5DB",
        primary: "#111827",
        secondary: "#6B7280",
        button: "#2563EB",
        buttonHover: "#1D4ED8",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter","sans-serif"],
      },
    },
  },
  plugins: [],
};
