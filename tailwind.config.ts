import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // Paleta tirada das proprias fotos do ensaio e do monograma:
        // areia molhada, mar, hora dourada e os florais lilas da logo.
        cream: "#FBF8F3", // marfim -- fundo padrao
        linen: "#F3EDE4", // um tom abaixo do marfim, para alternar secoes
        sand: "#E5D9C7", // bordas e blocos neutros
        stone: "#6E6357", // texto secundario
        ink: "#191410", // texto principal
        night: "#0B1520", // azul-oceano profundo -- secoes escuras
        gold: "#C4A063", // champanhe -- detalhes e fios
        lilac: "#B3A6DA", // lilas do monograma
        sky: "#8FA9C9", // azul-periwinkle do mar
      },
      maxWidth: {
        "8xl": "88rem",
      },
      transitionTimingFunction: {
        // Curva unica do site: saida rapida, chegada longa e macia.
        silk: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translate3d(0, 20px, 0)" },
          to: { opacity: "1", transform: "none" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 0)" },
        },
        "cue-slide": {
          "0%": { transform: "translateY(-100%)" },
          "60%, 100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        drift: "drift 7s ease-in-out infinite",
        "cue-slide": "cue-slide 2.4s cubic-bezier(0.76, 0, 0.24, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
