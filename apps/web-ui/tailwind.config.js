import { mauve, violet } from "@radix-ui/colors";
const { join } = require("path");
const isCI = process.env.CI === "true";

const path = isCI ? "apps/web-ui/" : "./";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    `${path}index.html`,
    `${path}src/**/*.{ts,tsx}`,
    join(
      __dirname,
      "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"
    ),
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      boxShadow: {
        "inner-top-bottom":
          "inset 0 4px 6px -1px rgba(0, 0, 0, 0.05), inset 0 -4px 6px -1px rgba(0, 0, 0, 0.05)",
      },
      colors: {
        ...mauve,
        ...violet,
      },
      keyframes: {
        slideDown: {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        slideUp: {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0px" },
        },
        fadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
      },
      animation: {
        slideDown: "slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        slideUp: "slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        fadeOut: "fadeOut 1500ms ease-in-out",
      },
    },
  },
  plugins: [],
};
