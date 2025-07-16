/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite-plugin-pwa/client" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import { replaceCodePlugin } from "vite-plugin-replace";
// import { visualizer } from "rollup-plugin-visualizer";
import webpackStatsPlugin from "rollup-plugin-webpack-stats";
import packageJson from "./package.json";

const isCypressRunning = process.env.CI;
// https://vitejs.dev/config/

export default defineConfig({
  root: __dirname,
  // cacheDir: "../../node_modules/.vite/apps/web-ui",
  server: {
    hmr: !isCypressRunning,
  },
  build: {
    rollupOptions: {
      output: {
        // Use a supported file pattern for Vite 5/Rollup 4
        // @doc https://relative-ci.com/documentation/guides/vite-config
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
      },
    },
  },
  resolve: {
    alias: {
      "bitcoinjs-lib": "@toshimoto821/bitcoinjs",
      "@root": "/src",
      "@constants": "/src/constants",
      "@components": "/src/components",
      "@lib": "/src/lib",
      "@machines": "/src/machines",
      "@models": "/src/models",
      "@providers": "/src/providers",
      "@screens": "/src/screens",
    },
  },
  plugins: [
    webpackStatsPlugin(),
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
    VitePWA({
      injectRegister: "script",
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      workbox: {
        sourcemap: true,
      },
      devOptions: {
        enabled: true,
        type: "module",
        /* other options */
      },
      manifest: {
        name: "Toshi Moto",
        short_name: "Toshi Moto",
        display: "standalone",
        description: "Visualize Bitcoin transactions in real time",
        theme_color: "#e5e7eb",
        background_color: "#e5e7eb",

        icons: [
          {
            src: "assets/pwa/android/android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "assets/pwa/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "assets/pwa/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "assets/pwa/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    svgr(),
    nxViteTsPaths(),

    // visualizer({ template: "raw-data", filename: "apps/web-ui/stats.json" }),
  ],
  // worker: {
  //   plugins: [nxViteTsPaths()],
  // },
  // build: {
  //   outDir: "../../dist/apps/web-ui",
  //   emptyOutDir: true,
  //   reportCompressedSize: true,
  //   commonjsOptions: {
  //     transformMixedEsModules: true,
  //   },
  // },
  test: {
    globals: true,
    environment: "happy-dom",
    exclude: ["**/e2e/**", "**/node_modules/**"],
  },
});
