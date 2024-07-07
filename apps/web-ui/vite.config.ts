/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import { replaceCodePlugin } from "vite-plugin-replace";
// import { visualizer } from "rollup-plugin-visualizer";
import packageJson from "./package.json";

const isCypressRunning = process.env.CI;
// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/web-ui",
  server: {
    hmr: !isCypressRunning,
  },

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
    ...(!isCypressRunning
      ? VitePWA({
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
            description: "Visualize Bitcoin transactions in real time",
            theme_color: "rgb(229, 231, 235)",
            icons: [
              {
                src: "assets/pwa/android/android-launchericon-192-192.png",
                sizes: "192x192",
                type: "image/png",
              },
              {
                src: "assets/pwa/android/android-launchericon-512x512.png",
                sizes: "512x512",
                type: "image/png",
              },
              {
                src: "assets/pwa/android/android-launchericon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
              },
              {
                src: "assets/pwa/android/android-launchericon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
              },
            ],
          },
        })
      : []),
    svgr(),
    nxViteTsPaths(),
    // visualizer(),
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
  },
});
