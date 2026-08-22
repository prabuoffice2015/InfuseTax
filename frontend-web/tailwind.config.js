/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0a192f",
          navy: "#0f2744",
          blue: "#1d4ed8",
          lightBlue: "#3b82f6",
          accent: "#f59e0b",
          gold: "#eab308",
          green: "#10b981",
          gray: "#64748b",
          lightGray: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};
