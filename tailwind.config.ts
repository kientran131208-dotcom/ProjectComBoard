import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cb-red": "#F24236",
        "cb-yellow": "#FFD166",
        "cb-mint": "#06D6A0",
        "cb-blue": "#118AB2",
        "cb-navy": "#1A1A2E",
        "cb-bg": "#FFF8F6",
        "cb-gray": "#6B6B8A",
        "cb-white": "#FFFFFF",
      },
      boxShadow: {
        "hard-xs": "1px 1px 0px #1A1A2E",
        "hard-sm": "2px 2px 0px #1A1A2E",
        hard: "4px 4px 0px #1A1A2E",
        "hard-lg": "6px 6px 0px #1A1A2E",
        "hard-xl": "8px 8px 0px #1A1A2E",
        "hard-white": "4px 4px 0px #FFFFFF",
        "hard-white-sm": "2px 2px 0px #FFFFFF",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "memphis-dots":
          "radial-gradient(circle, #1A1A2E 1px, transparent 1px)",
      },
      backgroundSize: {
        "dots-sm": "20px 20px",
        "dots-md": "28px 28px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.2s ease-out",
        wiggle: "wiggle 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
