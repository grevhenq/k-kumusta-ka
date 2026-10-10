import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7C5CFC",
        "primary-deep": "#5138B8",
        lavender: "#EDE7FF",
        "bg-pale": "#FAF8FF",
        surface: "#FFFFFF",
        "text-primary": "#242033",
        "text-secondary": "#777287",
        positive: "#4E9F6E",
        caution: "#C98A2A",
        negative: "#C85C5C",
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
