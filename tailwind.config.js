/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Caveat", "cursive"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#EFE7DE",
        ink: "#3A2E28",
        muted: "#9C8A7D",
        sage: "#7FA88C",
        sagedeep: "#4E7360",
        terracotta: "#B85C4A",
        terracottadeep: "#8F4436",
        sky: "#6B93B0",
        line: "#DDD2C2",
        focuscard: "#FBEFD8",
        gold: "#E4A94C",
        goldpill: "#F3DCA0",
        golddeep: "#B8863C",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
