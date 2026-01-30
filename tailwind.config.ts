import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}", // Añadimos tus carpetas nuevas
  ],
  theme: {
    extend: {
      colors: {
        // Tus colores exactos extraídos de landing.css
        bg: {
          primary: "#0a0a0a",   // Fondo principal
          secondary: "#151515", // Fondo secundario
        },
        text: {
          primary: "#ffffff",
          secondary: "#a0a0a0",
        },
        // Colores de estado (para las tareas)
        status: {
          available: "#4ade80", // Verde
          coming: "#fb923c",    // Naranja
          high: "#f43f5e",      // Rojo prioridad
        }
      },
      animation: {
        // Tu animación Aurora registrada en Tailwind
        aurora: "aurora 25s ease infinite",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
          "33%": { transform: "scale(1.05) rotate(2deg)", opacity: "0.9" },
          "66%": { transform: "scale(0.98) rotate(-1deg)", opacity: "0.95" },
        },
      },
    },
  },
  plugins: [],
};
export default config;