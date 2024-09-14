// apps/web-ui/vite.config.ts
import { defineConfig } from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/vitest@1.6.0_@types+node@18.16.20_@vitest+ui@1.6.0_happy-dom@12.10.3_less@4.1.3_stylus@0.59.0/node_modules/vitest/dist/config.js";
import react from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/@vitejs+plugin-react@4.2.1_vite@5.4.2/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { nxViteTsPaths } from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/@nx+vite@19.4.0_@swc-node+register@1.9.2_@swc+core@1.5.29_@types+node@18.16.20_nx@19.1.0_type_6pehq4b6hua7nkakd4pesndqn4/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js";
import { VitePWA } from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/vite-plugin-pwa@0.20.2_vite@5.4.2_workbox-build@7.1.1_workbox-window@7.1.0/node_modules/vite-plugin-pwa/dist/index.js";
import svgr from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/vite-plugin-svgr@4.2.0_rollup@4.21.2_typescript@5.3.3_vite@5.4.2/node_modules/vite-plugin-svgr/dist/index.js";
import { replaceCodePlugin } from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/vite-plugin-replace@0.1.1_vite@5.4.2/node_modules/vite-plugin-replace/index.js";
import webpackStatsPlugin from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/rollup-plugin-webpack-stats@1.0.1_rollup@4.21.2/node_modules/rollup-plugin-webpack-stats/dist/index.mjs";

// apps/web-ui/package.json
var package_default = {
  name: "web-ui",
  private: true,
  version: "1.17.2",
  type: "module",
  scripts: {
    "cypress:open": "cypress open",
    dev: "vite",
    build: "tsc && vite build",
    "build:docker": 'docker buildx build --platform linux/arm64,linux/amd64 --tag toshimoto821/toshi-moto:${VERSION} --output "type=registry" .',
    "build:extension": "tsc && vite build --config vite.config.extension.ts",
    tsc: "tsc",
    lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 200",
    preview: "vite preview",
    storybook: "storybook dev -p 6006",
    "build-storybook": "storybook build",
    chromatic: "npx chromatic",
    test: "vitest --run"
  },
  dependencies: {
    "@radix-ui/colors": "^3.0.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/themes": "^3.1.3",
    "@types/d3": "^7.4.3",
    "@types/d3-sankey": "^0.12.4",
    "@types/lodash": "^4.14.202",
    "@uiw/react-json-view": "2.0.0-alpha.12",
    "@xstate/react": "^4.0.1",
    "class-variance-authority": "^0.7.0",
    clsx: "^2.0.0",
    d3: "^7.8.5",
    "d3-sankey": "0.12",
    "date-fns": "^3.3.1",
    "dot-prop-immutable": "^2.1.1",
    lodash: "^4.17.21",
    react: "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-rewards": "^2.0.4",
    "react-router-dom": "^6.21.0",
    "tailwind-merge": "^2.1.0",
    "tailwindcss-animate": "^1.0.7",
    xstate: "^5.4.1",
    "xstate-helpers": "^2.0.0"
  },
  devDependencies: {
    "@storybook/addon-essentials": "^7.6.5",
    "@storybook/addon-interactions": "^7.6.5",
    "@storybook/addon-links": "^7.6.5",
    "@storybook/addon-onboarding": "^1.0.10",
    "@storybook/blocks": "^7.6.5",
    "@storybook/react": "^7.6.5",
    "@storybook/react-vite": "^7.6.5",
    "@storybook/test": "^7.6.5",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/chrome": "^0.0.263",
    "@types/jest": "^29.5.11",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    autoprefixer: "^10.4.16",
    eslint: "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "eslint-plugin-storybook": "^0.6.15",
    "happy-dom": "^12.10.3",
    msw: "^2.2.2",
    postcss: "^8.4.32",
    storybook: "^7.6.5",
    tailwindcss: "^3.3.6",
    typescript: "^5.2.2",
    "vite-plugin-replace": "^0.1.1",
    vitest: "^1.6.0",
    "workbox-core": "^7.0.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "workbox-window": "^7.0.0"
  },
  readme: "ERROR: No README data found!",
  volta: {
    node: "18.19.0"
  }
};

// apps/web-ui/vite.config.ts
var __vite_injected_original_dirname = "/Users/jamescharlesworth/projects/btc/toshi-moto/apps/web-ui";
var isCypressRunning = process.env.CI;
var vite_config_default = defineConfig({
  root: __vite_injected_original_dirname,
  // cacheDir: "../../node_modules/.vite/apps/web-ui",
  server: {
    hmr: !isCypressRunning
  },
  build: {
    rollupOptions: {
      output: {
        // Use a supported file pattern for Vite 5/Rollup 4
        // @doc https://relative-ci.com/documentation/guides/vite-config
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js"
      }
    }
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
      "@screens": "/src/screens"
    }
  },
  plugins: [
    webpackStatsPlugin(),
    replaceCodePlugin({
      replacements: [
        {
          from: "__VERSION__",
          to: package_default.version
        },
        {
          from: "__RELOAD_SW__",
          to: "true"
        },
        {
          from: "__DATE__",
          to: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]
    }),
    react(),
    VitePWA({
      injectRegister: "script",
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      workbox: {
        sourcemap: true
      },
      devOptions: {
        enabled: true,
        type: "module"
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
            type: "image/png"
          },
          {
            src: "assets/pwa/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "assets/pwa/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "assets/pwa/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    }),
    svgr(),
    nxViteTsPaths()
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
    environment: "happy-dom"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHMiLCAiYXBwcy93ZWItdWkvcGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvamFtZXNjaGFybGVzd29ydGgvcHJvamVjdHMvYnRjL3Rvc2hpLW1vdG8vYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlLXBsdWdpbi1zdmdyL2NsaWVudFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gXCJAbngvdml0ZS9wbHVnaW5zL254LXRzY29uZmlnLXBhdGhzLnBsdWdpblwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBzdmdyIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XG5pbXBvcnQgeyByZXBsYWNlQ29kZVBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1yZXBsYWNlXCI7XG4vLyBpbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IHdlYnBhY2tTdGF0c1BsdWdpbiBmcm9tIFwicm9sbHVwLXBsdWdpbi13ZWJwYWNrLXN0YXRzXCI7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSBcIi4vcGFja2FnZS5qc29uXCI7XG5cbmNvbnN0IGlzQ3lwcmVzc1J1bm5pbmcgPSBwcm9jZXNzLmVudi5DSTtcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJvb3Q6IF9fZGlybmFtZSxcbiAgLy8gY2FjaGVEaXI6IFwiLi4vLi4vbm9kZV9tb2R1bGVzLy52aXRlL2FwcHMvd2ViLXVpXCIsXG4gIHNlcnZlcjoge1xuICAgIGhtcjogIWlzQ3lwcmVzc1J1bm5pbmcsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFVzZSBhIHN1cHBvcnRlZCBmaWxlIHBhdHRlcm4gZm9yIFZpdGUgNS9Sb2xsdXAgNFxuICAgICAgICAvLyBAZG9jIGh0dHBzOi8vcmVsYXRpdmUtY2kuY29tL2RvY3VtZW50YXRpb24vZ3VpZGVzL3ZpdGUtY29uZmlnXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdW2V4dG5hbWVdXCIsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdLmpzXCIsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdLmpzXCIsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJiaXRjb2luanMtbGliXCI6IFwiQHRvc2hpbW90bzgyMS9iaXRjb2luanNcIixcbiAgICAgIFwiQHJvb3RcIjogXCIvc3JjXCIsXG4gICAgICBcIkBjb25zdGFudHNcIjogXCIvc3JjL2NvbnN0YW50c1wiLFxuICAgICAgXCJAY29tcG9uZW50c1wiOiBcIi9zcmMvY29tcG9uZW50c1wiLFxuICAgICAgXCJAbGliXCI6IFwiL3NyYy9saWJcIixcbiAgICAgIFwiQG1hY2hpbmVzXCI6IFwiL3NyYy9tYWNoaW5lc1wiLFxuICAgICAgXCJAbW9kZWxzXCI6IFwiL3NyYy9tb2RlbHNcIixcbiAgICAgIFwiQHByb3ZpZGVyc1wiOiBcIi9zcmMvcHJvdmlkZXJzXCIsXG4gICAgICBcIkBzY3JlZW5zXCI6IFwiL3NyYy9zY3JlZW5zXCIsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHdlYnBhY2tTdGF0c1BsdWdpbigpLFxuICAgIHJlcGxhY2VDb2RlUGx1Z2luKHtcbiAgICAgIHJlcGxhY2VtZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX1ZFUlNJT05fX1wiLFxuICAgICAgICAgIHRvOiBwYWNrYWdlSnNvbi52ZXJzaW9uLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX1JFTE9BRF9TV19fXCIsXG4gICAgICAgICAgdG86IFwidHJ1ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX0RBVEVfX1wiLFxuICAgICAgICAgIHRvOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICBpbmplY3RSZWdpc3RlcjogXCJzY3JpcHRcIixcbiAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXG4gICAgICBzdHJhdGVnaWVzOiBcImluamVjdE1hbmlmZXN0XCIsXG4gICAgICBzcmNEaXI6IFwic3JjXCIsXG4gICAgICBmaWxlbmFtZTogXCJzdy50c1wiLFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICB0eXBlOiBcIm1vZHVsZVwiLFxuICAgICAgICAvKiBvdGhlciBvcHRpb25zICovXG4gICAgICB9LFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogXCJUb3NoaSBNb3RvXCIsXG4gICAgICAgIHNob3J0X25hbWU6IFwiVG9zaGkgTW90b1wiLFxuICAgICAgICBkaXNwbGF5OiBcInN0YW5kYWxvbmVcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVmlzdWFsaXplIEJpdGNvaW4gdHJhbnNhY3Rpb25zIGluIHJlYWwgdGltZVwiLFxuICAgICAgICB0aGVtZV9jb2xvcjogXCIjZTVlN2ViXCIsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6IFwiI2U1ZTdlYlwiLFxuXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcImFzc2V0cy9wd2EvYW5kcm9pZC9hbmRyb2lkLWxhdW5jaGVyaWNvbi0xOTItMTkyLnBuZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJhc3NldHMvcHdhL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNTEyLTUxMi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiYXNzZXRzL3B3YS9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTUxMi01MTIucG5nXCIsXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgICAgcHVycG9zZTogXCJhbnlcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJhc3NldHMvcHdhL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNTEyLTUxMi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICBwdXJwb3NlOiBcIm1hc2thYmxlXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgc3ZncigpLFxuICAgIG54Vml0ZVRzUGF0aHMoKSxcbiAgICAvLyB2aXN1YWxpemVyKHsgdGVtcGxhdGU6IFwicmF3LWRhdGFcIiwgZmlsZW5hbWU6IFwiYXBwcy93ZWItdWkvc3RhdHMuanNvblwiIH0pLFxuICBdLFxuICAvLyB3b3JrZXI6IHtcbiAgLy8gICBwbHVnaW5zOiBbbnhWaXRlVHNQYXRocygpXSxcbiAgLy8gfSxcbiAgLy8gYnVpbGQ6IHtcbiAgLy8gICBvdXREaXI6IFwiLi4vLi4vZGlzdC9hcHBzL3dlYi11aVwiLFxuICAvLyAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAvLyAgIHJlcG9ydENvbXByZXNzZWRTaXplOiB0cnVlLFxuICAvLyAgIGNvbW1vbmpzT3B0aW9uczoge1xuICAvLyAgICAgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXG4gIC8vICAgfSxcbiAgLy8gfSxcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6IFwiaGFwcHktZG9tXCIsXG4gIH0sXG59KTtcbiIsICJ7XG4gIFwibmFtZVwiOiBcIndlYi11aVwiLFxuICBcInByaXZhdGVcIjogdHJ1ZSxcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4xNy4yXCIsXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiY3lwcmVzczpvcGVuXCI6IFwiY3lwcmVzcyBvcGVuXCIsXG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInRzYyAmJiB2aXRlIGJ1aWxkXCIsXG4gICAgXCJidWlsZDpkb2NrZXJcIjogXCJkb2NrZXIgYnVpbGR4IGJ1aWxkIC0tcGxhdGZvcm0gbGludXgvYXJtNjQsbGludXgvYW1kNjQgLS10YWcgdG9zaGltb3RvODIxL3Rvc2hpLW1vdG86JHtWRVJTSU9OfSAtLW91dHB1dCBcXFwidHlwZT1yZWdpc3RyeVxcXCIgLlwiLFxuICAgIFwiYnVpbGQ6ZXh0ZW5zaW9uXCI6IFwidHNjICYmIHZpdGUgYnVpbGQgLS1jb25maWcgdml0ZS5jb25maWcuZXh0ZW5zaW9uLnRzXCIsXG4gICAgXCJ0c2NcIjogXCJ0c2NcIixcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLiAtLWV4dCB0cyx0c3ggLS1yZXBvcnQtdW51c2VkLWRpc2FibGUtZGlyZWN0aXZlcyAtLW1heC13YXJuaW5ncyAyMDBcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcInN0b3J5Ym9va1wiOiBcInN0b3J5Ym9vayBkZXYgLXAgNjAwNlwiLFxuICAgIFwiYnVpbGQtc3Rvcnlib29rXCI6IFwic3Rvcnlib29rIGJ1aWxkXCIsXG4gICAgXCJjaHJvbWF0aWNcIjogXCJucHggY2hyb21hdGljXCIsXG4gICAgXCJ0ZXN0XCI6IFwidml0ZXN0IC0tcnVuXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHJhZGl4LXVpL2NvbG9yc1wiOiBcIl4zLjAuMFwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvblwiOiBcIl4xLjEuMlwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LWljb25zXCI6IFwiXjEuMy4wXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3QtcHJvZ3Jlc3NcIjogXCJeMS4wLjNcIixcbiAgICBcIkByYWRpeC11aS9yZWFjdC10b2FzdFwiOiBcIl4xLjEuNVwiLFxuICAgIFwiQHJhZGl4LXVpL3RoZW1lc1wiOiBcIl4zLjEuM1wiLFxuICAgIFwiQHR5cGVzL2QzXCI6IFwiXjcuNC4zXCIsXG4gICAgXCJAdHlwZXMvZDMtc2Fua2V5XCI6IFwiXjAuMTIuNFwiLFxuICAgIFwiQHR5cGVzL2xvZGFzaFwiOiBcIl40LjE0LjIwMlwiLFxuICAgIFwiQHVpdy9yZWFjdC1qc29uLXZpZXdcIjogXCIyLjAuMC1hbHBoYS4xMlwiLFxuICAgIFwiQHhzdGF0ZS9yZWFjdFwiOiBcIl40LjAuMVwiLFxuICAgIFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCI6IFwiXjAuNy4wXCIsXG4gICAgXCJjbHN4XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJkM1wiOiBcIl43LjguNVwiLFxuICAgIFwiZDMtc2Fua2V5XCI6IFwiMC4xMlwiLFxuICAgIFwiZGF0ZS1mbnNcIjogXCJeMy4zLjFcIixcbiAgICBcImRvdC1wcm9wLWltbXV0YWJsZVwiOiBcIl4yLjEuMVwiLFxuICAgIFwibG9kYXNoXCI6IFwiXjQuMTcuMjFcIixcbiAgICBcInJlYWN0XCI6IFwiXjE4LjIuMFwiLFxuICAgIFwicmVhY3QtZGF5LXBpY2tlclwiOiBcIl44LjEwLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xOC4yLjBcIixcbiAgICBcInJlYWN0LXJld2FyZHNcIjogXCJeMi4wLjRcIixcbiAgICBcInJlYWN0LXJvdXRlci1kb21cIjogXCJeNi4yMS4wXCIsXG4gICAgXCJ0YWlsd2luZC1tZXJnZVwiOiBcIl4yLjEuMFwiLFxuICAgIFwidGFpbHdpbmRjc3MtYW5pbWF0ZVwiOiBcIl4xLjAuN1wiLFxuICAgIFwieHN0YXRlXCI6IFwiXjUuNC4xXCIsXG4gICAgXCJ4c3RhdGUtaGVscGVyc1wiOiBcIl4yLjAuMFwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBzdG9yeWJvb2svYWRkb24tZXNzZW50aWFsc1wiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1pbnRlcmFjdGlvbnNcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svYWRkb24tbGlua3NcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svYWRkb24tb25ib2FyZGluZ1wiOiBcIl4xLjAuMTBcIixcbiAgICBcIkBzdG9yeWJvb2svYmxvY2tzXCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL3JlYWN0XCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL3JlYWN0LXZpdGVcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svdGVzdFwiOiBcIl43LjYuNVwiLFxuICAgIFwiQHRlc3RpbmctbGlicmFyeS9qZXN0LWRvbVwiOiBcIl42LjEuNVwiLFxuICAgIFwiQHRlc3RpbmctbGlicmFyeS9yZWFjdFwiOiBcIl4xNC4xLjJcIixcbiAgICBcIkB0eXBlcy9jaHJvbWVcIjogXCJeMC4wLjI2M1wiLFxuICAgIFwiQHR5cGVzL2plc3RcIjogXCJeMjkuNS4xMVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiXjE4LjIuNDNcIixcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCJeMTguMi4xN1wiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L2VzbGludC1wbHVnaW5cIjogXCJeNi4xNC4wXCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvcGFyc2VyXCI6IFwiXjYuMTQuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCJeNC4yLjFcIixcbiAgICBcImF1dG9wcmVmaXhlclwiOiBcIl4xMC40LjE2XCIsXG4gICAgXCJlc2xpbnRcIjogXCJeOC41NS4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0LWhvb2tzXCI6IFwiXjQuNi4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0LXJlZnJlc2hcIjogXCJeMC40LjVcIixcbiAgICBcImVzbGludC1wbHVnaW4tc3Rvcnlib29rXCI6IFwiXjAuNi4xNVwiLFxuICAgIFwiaGFwcHktZG9tXCI6IFwiXjEyLjEwLjNcIixcbiAgICBcIm1zd1wiOiBcIl4yLjIuMlwiLFxuICAgIFwicG9zdGNzc1wiOiBcIl44LjQuMzJcIixcbiAgICBcInN0b3J5Ym9va1wiOiBcIl43LjYuNVwiLFxuICAgIFwidGFpbHdpbmRjc3NcIjogXCJeMy4zLjZcIixcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNS4yLjJcIixcbiAgICBcInZpdGUtcGx1Z2luLXJlcGxhY2VcIjogXCJeMC4xLjFcIixcbiAgICBcInZpdGVzdFwiOiBcIl4xLjYuMFwiLFxuICAgIFwid29ya2JveC1jb3JlXCI6IFwiXjcuMC4wXCIsXG4gICAgXCJ3b3JrYm94LXByZWNhY2hpbmdcIjogXCJeNy4wLjBcIixcbiAgICBcIndvcmtib3gtcm91dGluZ1wiOiBcIl43LjAuMFwiLFxuICAgIFwid29ya2JveC13aW5kb3dcIjogXCJeNy4wLjBcIlxuICB9LFxuICBcInJlYWRtZVwiOiBcIkVSUk9SOiBObyBSRUFETUUgZGF0YSBmb3VuZCFcIixcbiAgXCJ2b2x0YVwiOiB7XG4gICAgXCJub2RlXCI6IFwiMTguMTkuMFwiXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHlCQUF5QjtBQUVsQyxPQUFPLHdCQUF3Qjs7O0FDVC9CO0FBQUEsRUFDRSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsRUFDWCxTQUFXO0FBQUEsRUFDWCxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsSUFDVCxnQkFBZ0I7QUFBQSxJQUNoQixLQUFPO0FBQUEsSUFDUCxPQUFTO0FBQUEsSUFDVCxnQkFBZ0I7QUFBQSxJQUNoQixtQkFBbUI7QUFBQSxJQUNuQixLQUFPO0FBQUEsSUFDUCxNQUFRO0FBQUEsSUFDUixTQUFXO0FBQUEsSUFDWCxXQUFhO0FBQUEsSUFDYixtQkFBbUI7QUFBQSxJQUNuQixXQUFhO0FBQUEsSUFDYixNQUFR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
