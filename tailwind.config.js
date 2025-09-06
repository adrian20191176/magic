// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        epunda: ["EpundaSlab", "serif"], // custom name: fallback
      },
    },
  },
  plugins: [],
};
