/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { replaceCodePlugin } from "vite-plugin-replace";
import packageJson from "./package.json";
// import path from

process.env.VITE_CONFIG_CHROME_EXTNSION = "true";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "bitcoinjs-lib": "@toshimoto821/bitcoinjs",
      "@root": "/src",
      "@components": "/src/components",
      "@lib": "/src/lib",
      "@machines": "/src/machines",
      "@models": "/src/models",
      "@providers": "/src/providers",
      "@screens": "/src/screens",
    },
  },
  build: {
    outDir: "dist-extension", // Output directory for the build files
  },
  plugins: [
    replaceCodePlugin({
      replacements: [
        {
          from: "__VERSION__",
          to: packageJson.version,
        },
        {
          from: "__RELOAD_SW__",
          to: "true",
        },
        {
          from: "__DATE__",
          to: new Date().toISOString(),
        },
      ],
    }),
    react(),
  ],
  test: {
    globals: true,
    environment: "happy-dom",
  },
});
