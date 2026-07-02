/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#FAF6F0",
        ink: "#2D2821",
        muted: "#8C8378",
        sage: "#8CA48A",
        sagedeep: "#5A7358",
        terracotta: "#C97A60",
        sky: "#8CA8C7",
        line: "#E6E0D6",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
