import reactGlow from "@codaworks/react-glow/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        coral: ["coral"],
        mystery: ["mystery"],
        press: ["press"],
        rogue: ["rogue"],
      },
    },
  },
  plugins: [reactGlow], // Using ES module import
};