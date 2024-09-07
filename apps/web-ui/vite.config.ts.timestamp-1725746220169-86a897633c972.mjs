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
  version: "1.15.1",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHMiLCAiYXBwcy93ZWItdWkvcGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvamFtZXNjaGFybGVzd29ydGgvcHJvamVjdHMvYnRjL3Rvc2hpLW1vdG8vYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlLXBsdWdpbi1zdmdyL2NsaWVudFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gXCJAbngvdml0ZS9wbHVnaW5zL254LXRzY29uZmlnLXBhdGhzLnBsdWdpblwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBzdmdyIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XG5pbXBvcnQgeyByZXBsYWNlQ29kZVBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1yZXBsYWNlXCI7XG4vLyBpbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IHdlYnBhY2tTdGF0c1BsdWdpbiBmcm9tIFwicm9sbHVwLXBsdWdpbi13ZWJwYWNrLXN0YXRzXCI7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSBcIi4vcGFja2FnZS5qc29uXCI7XG5cbmNvbnN0IGlzQ3lwcmVzc1J1bm5pbmcgPSBwcm9jZXNzLmVudi5DSTtcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJvb3Q6IF9fZGlybmFtZSxcbiAgLy8gY2FjaGVEaXI6IFwiLi4vLi4vbm9kZV9tb2R1bGVzLy52aXRlL2FwcHMvd2ViLXVpXCIsXG4gIHNlcnZlcjoge1xuICAgIGhtcjogIWlzQ3lwcmVzc1J1bm5pbmcsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFVzZSBhIHN1cHBvcnRlZCBmaWxlIHBhdHRlcm4gZm9yIFZpdGUgNS9Sb2xsdXAgNFxuICAgICAgICAvLyBAZG9jIGh0dHBzOi8vcmVsYXRpdmUtY2kuY29tL2RvY3VtZW50YXRpb24vZ3VpZGVzL3ZpdGUtY29uZmlnXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdW2V4dG5hbWVdXCIsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdLmpzXCIsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdLmpzXCIsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJiaXRjb2luanMtbGliXCI6IFwiQHRvc2hpbW90bzgyMS9iaXRjb2luanNcIixcbiAgICAgIFwiQHJvb3RcIjogXCIvc3JjXCIsXG4gICAgICBcIkBjb21wb25lbnRzXCI6IFwiL3NyYy9jb21wb25lbnRzXCIsXG4gICAgICBcIkBsaWJcIjogXCIvc3JjL2xpYlwiLFxuICAgICAgXCJAbWFjaGluZXNcIjogXCIvc3JjL21hY2hpbmVzXCIsXG4gICAgICBcIkBtb2RlbHNcIjogXCIvc3JjL21vZGVsc1wiLFxuICAgICAgXCJAcHJvdmlkZXJzXCI6IFwiL3NyYy9wcm92aWRlcnNcIixcbiAgICAgIFwiQHNjcmVlbnNcIjogXCIvc3JjL3NjcmVlbnNcIixcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgd2VicGFja1N0YXRzUGx1Z2luKCksXG4gICAgcmVwbGFjZUNvZGVQbHVnaW4oe1xuICAgICAgcmVwbGFjZW1lbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBmcm9tOiBcIl9fVkVSU0lPTl9fXCIsXG4gICAgICAgICAgdG86IHBhY2thZ2VKc29uLnZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBmcm9tOiBcIl9fUkVMT0FEX1NXX19cIixcbiAgICAgICAgICB0bzogXCJ0cnVlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBmcm9tOiBcIl9fREFURV9fXCIsXG4gICAgICAgICAgdG86IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIGluamVjdFJlZ2lzdGVyOiBcInNjcmlwdFwiLFxuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgICAgIHN0cmF0ZWdpZXM6IFwiaW5qZWN0TWFuaWZlc3RcIixcbiAgICAgIHNyY0RpcjogXCJzcmNcIixcbiAgICAgIGZpbGVuYW1lOiBcInN3LnRzXCIsXG4gICAgICB3b3JrYm94OiB7XG4gICAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHR5cGU6IFwibW9kdWxlXCIsXG4gICAgICAgIC8qIG90aGVyIG9wdGlvbnMgKi9cbiAgICAgIH0sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiBcIlRvc2hpIE1vdG9cIixcbiAgICAgICAgc2hvcnRfbmFtZTogXCJUb3NoaSBNb3RvXCIsXG4gICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJWaXN1YWxpemUgQml0Y29pbiB0cmFuc2FjdGlvbnMgaW4gcmVhbCB0aW1lXCIsXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiNlNWU3ZWJcIixcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogXCIjZTVlN2ViXCIsXG5cbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiYXNzZXRzL3B3YS9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTE5Mi0xOTIucG5nXCIsXG4gICAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcImFzc2V0cy9wd2EvYW5kcm9pZC9hbmRyb2lkLWxhdW5jaGVyaWNvbi01MTItNTEyLnBuZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJhc3NldHMvcHdhL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNTEyLTUxMi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICBwdXJwb3NlOiBcImFueVwiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcImFzc2V0cy9wd2EvYW5kcm9pZC9hbmRyb2lkLWxhdW5jaGVyaWNvbi01MTItNTEyLnBuZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIixcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBzdmdyKCksXG4gICAgbnhWaXRlVHNQYXRocygpLFxuICAgIC8vIHZpc3VhbGl6ZXIoeyB0ZW1wbGF0ZTogXCJyYXctZGF0YVwiLCBmaWxlbmFtZTogXCJhcHBzL3dlYi11aS9zdGF0cy5qc29uXCIgfSksXG4gIF0sXG4gIC8vIHdvcmtlcjoge1xuICAvLyAgIHBsdWdpbnM6IFtueFZpdGVUc1BhdGhzKCldLFxuICAvLyB9LFxuICAvLyBidWlsZDoge1xuICAvLyAgIG91dERpcjogXCIuLi8uLi9kaXN0L2FwcHMvd2ViLXVpXCIsXG4gIC8vICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIC8vICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWUsXG4gIC8vICAgY29tbW9uanNPcHRpb25zOiB7XG4gIC8vICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcbiAgLy8gICB9LFxuICAvLyB9LFxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogXCJoYXBweS1kb21cIixcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwid2ViLXVpXCIsXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxuICBcInZlcnNpb25cIjogXCIxLjE1LjFcIixcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJjeXByZXNzOm9wZW5cIjogXCJjeXByZXNzIG9wZW5cIixcbiAgICBcImRldlwiOiBcInZpdGVcIixcbiAgICBcImJ1aWxkXCI6IFwidHNjICYmIHZpdGUgYnVpbGRcIixcbiAgICBcImJ1aWxkOmRvY2tlclwiOiBcImRvY2tlciBidWlsZHggYnVpbGQgLS1wbGF0Zm9ybSBsaW51eC9hcm02NCxsaW51eC9hbWQ2NCAtLXRhZyB0b3NoaW1vdG84MjEvdG9zaGktbW90bzoke1ZFUlNJT059IC0tb3V0cHV0IFxcXCJ0eXBlPXJlZ2lzdHJ5XFxcIiAuXCIsXG4gICAgXCJidWlsZDpleHRlbnNpb25cIjogXCJ0c2MgJiYgdml0ZSBidWlsZCAtLWNvbmZpZyB2aXRlLmNvbmZpZy5leHRlbnNpb24udHNcIixcbiAgICBcInRzY1wiOiBcInRzY1wiLFxuICAgIFwibGludFwiOiBcImVzbGludCAuIC0tZXh0IHRzLHRzeCAtLXJlcG9ydC11bnVzZWQtZGlzYWJsZS1kaXJlY3RpdmVzIC0tbWF4LXdhcm5pbmdzIDIwMFwiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxuICAgIFwic3Rvcnlib29rXCI6IFwic3Rvcnlib29rIGRldiAtcCA2MDA2XCIsXG4gICAgXCJidWlsZC1zdG9yeWJvb2tcIjogXCJzdG9yeWJvb2sgYnVpbGRcIixcbiAgICBcImNocm9tYXRpY1wiOiBcIm5weCBjaHJvbWF0aWNcIixcbiAgICBcInRlc3RcIjogXCJ2aXRlc3QgLS1ydW5cIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAcmFkaXgtdWkvY29sb3JzXCI6IFwiXjMuMC4wXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3QtYWNjb3JkaW9uXCI6IFwiXjEuMS4yXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3QtaWNvbnNcIjogXCJeMS4zLjBcIixcbiAgICBcIkByYWRpeC11aS9yZWFjdC1wcm9ncmVzc1wiOiBcIl4xLjAuM1wiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRvYXN0XCI6IFwiXjEuMS41XCIsXG4gICAgXCJAcmFkaXgtdWkvdGhlbWVzXCI6IFwiXjMuMS4zXCIsXG4gICAgXCJAdHlwZXMvZDNcIjogXCJeNy40LjNcIixcbiAgICBcIkB0eXBlcy9kMy1zYW5rZXlcIjogXCJeMC4xMi40XCIsXG4gICAgXCJAdHlwZXMvbG9kYXNoXCI6IFwiXjQuMTQuMjAyXCIsXG4gICAgXCJAdWl3L3JlYWN0LWpzb24tdmlld1wiOiBcIjIuMC4wLWFscGhhLjEyXCIsXG4gICAgXCJAeHN0YXRlL3JlYWN0XCI6IFwiXjQuMC4xXCIsXG4gICAgXCJjbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIjogXCJeMC43LjBcIixcbiAgICBcImNsc3hcIjogXCJeMi4wLjBcIixcbiAgICBcImQzXCI6IFwiXjcuOC41XCIsXG4gICAgXCJkMy1zYW5rZXlcIjogXCIwLjEyXCIsXG4gICAgXCJkYXRlLWZuc1wiOiBcIl4zLjMuMVwiLFxuICAgIFwiZG90LXByb3AtaW1tdXRhYmxlXCI6IFwiXjIuMS4xXCIsXG4gICAgXCJsb2Rhc2hcIjogXCJeNC4xNy4yMVwiLFxuICAgIFwicmVhY3RcIjogXCJeMTguMi4wXCIsXG4gICAgXCJyZWFjdC1kYXktcGlja2VyXCI6IFwiXjguMTAuMFwiLFxuICAgIFwicmVhY3QtZG9tXCI6IFwiXjE4LjIuMFwiLFxuICAgIFwicmVhY3QtcmV3YXJkc1wiOiBcIl4yLjAuNFwiLFxuICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiOiBcIl42LjIxLjBcIixcbiAgICBcInRhaWx3aW5kLW1lcmdlXCI6IFwiXjIuMS4wXCIsXG4gICAgXCJ0YWlsd2luZGNzcy1hbmltYXRlXCI6IFwiXjEuMC43XCIsXG4gICAgXCJ4c3RhdGVcIjogXCJeNS40LjFcIixcbiAgICBcInhzdGF0ZS1oZWxwZXJzXCI6IFwiXjIuMC4wXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1lc3NlbnRpYWxzXCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL2FkZG9uLWludGVyYWN0aW9uc1wiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1saW5rc1wiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1vbmJvYXJkaW5nXCI6IFwiXjEuMC4xMFwiLFxuICAgIFwiQHN0b3J5Ym9vay9ibG9ja3NcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svcmVhY3RcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svcmVhY3Qtdml0ZVwiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay90ZXN0XCI6IFwiXjcuNi41XCIsXG4gICAgXCJAdGVzdGluZy1saWJyYXJ5L2plc3QtZG9tXCI6IFwiXjYuMS41XCIsXG4gICAgXCJAdGVzdGluZy1saWJyYXJ5L3JlYWN0XCI6IFwiXjE0LjEuMlwiLFxuICAgIFwiQHR5cGVzL2Nocm9tZVwiOiBcIl4wLjAuMjYzXCIsXG4gICAgXCJAdHlwZXMvamVzdFwiOiBcIl4yOS41LjExXCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMi40M1wiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4yLjE3XCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl42LjE0LjBcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCJeNi4xNC4wXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiOiBcIl40LjIuMVwiLFxuICAgIFwiYXV0b3ByZWZpeGVyXCI6IFwiXjEwLjQuMTZcIixcbiAgICBcImVzbGludFwiOiBcIl44LjU1LjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtaG9va3NcIjogXCJeNC42LjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtcmVmcmVzaFwiOiBcIl4wLjQuNVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1zdG9yeWJvb2tcIjogXCJeMC42LjE1XCIsXG4gICAgXCJoYXBweS1kb21cIjogXCJeMTIuMTAuM1wiLFxuICAgIFwibXN3XCI6IFwiXjIuMi4yXCIsXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4zMlwiLFxuICAgIFwic3Rvcnlib29rXCI6IFwiXjcuNi41XCIsXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjMuNlwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjIuMlwiLFxuICAgIFwidml0ZS1wbHVnaW4tcmVwbGFjZVwiOiBcIl4wLjEuMVwiLFxuICAgIFwidml0ZXN0XCI6IFwiXjEuNi4wXCIsXG4gICAgXCJ3b3JrYm94LWNvcmVcIjogXCJeNy4wLjBcIixcbiAgICBcIndvcmtib3gtcHJlY2FjaGluZ1wiOiBcIl43LjAuMFwiLFxuICAgIFwid29ya2JveC1yb3V0aW5nXCI6IFwiXjcuMC4wXCIsXG4gICAgXCJ3b3JrYm94LXdpbmRvd1wiOiBcIl43LjAuMFwiXG4gIH0sXG4gIFwicmVhZG1lXCI6IFwiRVJST1I6IE5vIFJFQURNRSBkYXRhIGZvdW5kIVwiLFxuICBcInZvbHRhXCI6IHtcbiAgICBcIm5vZGVcIjogXCIxOC4xOS4wXCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLGVBQWU7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMseUJBQXlCO0FBRWxDLE9BQU8sd0JBQXdCOzs7QUNUL0I7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLFNBQVc7QUFBQSxFQUNYLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxJQUNULGdCQUFnQjtBQUFBLElBQ2hCLEtBQU87QUFBQSxJQUNQLE9BQVM7QUFBQSxJQUNULGdCQUFnQjtBQUFBLElBQ2hCLG1CQUFtQjtBQUFBLElBQ25CLEtBQU87QUFBQSxJQUNQLE1BQVE7QUFBQSxJQUNSLFNBQVc7QUFBQSxJQUNYLFdBQWE7QUFBQSxJQUNiLG1CQUFtQjtBQUFBLElBQ25CLFdBQWE7QUFBQSxJQUNiLE1BQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxjQUFnQjtBQUFBLElBQ2Qsb0JBQW9C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
