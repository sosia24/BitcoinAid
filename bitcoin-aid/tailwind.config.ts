import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/componentes/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // Alterar o valor do breakpoint 'md'
        lg: "1200px",

        // Adicionar um breakpoint personalizado chamado 'xl2'
        xl2: "1400px",
      },
      fontFamily: {
        Agency: ["Agency", "sans-serif"],
      },
      animation: {
        marquee: "marquee 20s linear infinite",
        "slide-down": "slideDown 0.3s ease-out forwards",
        bounce: "bounce 0.5s ease-in-out 10", // Ajuste a duração e o timing function aqui
      },
      keyframes: {
        slideDown: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5%)" }, // Controle a intensidade do bounce
        },
      },
    },
  },
  plugins: [],
};

export default config;
