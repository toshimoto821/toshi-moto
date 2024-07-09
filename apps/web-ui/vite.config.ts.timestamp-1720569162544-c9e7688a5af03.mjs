// apps/web-ui/vite.config.ts
import { defineConfig } from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/vitest@1.6.0_@types+node@18.16.20_@vitest+ui@1.6.0_happy-dom@12.10.3_less@4.1.3_stylus@0.59.0/node_modules/vitest/dist/config.js";
import react from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/@vitejs+plugin-react@4.2.1_vite@5.2.11/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { nxViteTsPaths } from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/@nx+vite@19.4.0_@swc-node+register@1.9.2_@swc+core@1.5.29_@types+node@18.16.20_nx@19.1.0_type_ubebtdck2yf5msjrgomug2cr4q/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js";
import { VitePWA } from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/vite-plugin-pwa@0.17.5_vite@5.2.11_workbox-build@7.1.0_workbox-window@7.0.0/node_modules/vite-plugin-pwa/dist/index.js";
import svgr from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/vite-plugin-svgr@4.2.0_rollup@4.18.0_typescript@5.3.3_vite@5.2.11/node_modules/vite-plugin-svgr/dist/index.js";
import { replaceCodePlugin } from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/vite-plugin-replace@0.1.1_vite@5.2.11/node_modules/vite-plugin-replace/index.js";
import webpackStatsPlugin from "file:///Users/jamescharlesworth/projects/btc/toshi-moto/node_modules/.pnpm/rollup-plugin-webpack-stats@1.0.1_rollup@4.18.0/node_modules/rollup-plugin-webpack-stats/dist/index.mjs";

// apps/web-ui/package.json
var package_default = {
  name: "web-ui",
  private: true,
  version: "1.6.3",
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
    "@radix-ui/themes": "^3.0.5",
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
    vite: "^5.0.11",
    "vite-plugin-pwa": "^0.17.5",
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
  cacheDir: "../../node_modules/.vite/apps/web-ui",
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
    ...!isCypressRunning ? VitePWA({
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
        description: "Visualize Bitcoin transactions in real time",
        theme_color: "rgb(229, 231, 235)",
        icons: [
          {
            src: "assets/pwa/android/android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "assets/pwa/android/android-launchericon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "assets/pwa/android/android-launchericon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "assets/pwa/android/android-launchericon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    }) : [],
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHMiLCAiYXBwcy93ZWItdWkvcGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvamFtZXNjaGFybGVzd29ydGgvcHJvamVjdHMvYnRjL3Rvc2hpLW1vdG8vYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlLXBsdWdpbi1zdmdyL2NsaWVudFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gXCJAbngvdml0ZS9wbHVnaW5zL254LXRzY29uZmlnLXBhdGhzLnBsdWdpblwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBzdmdyIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XG5pbXBvcnQgeyByZXBsYWNlQ29kZVBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1yZXBsYWNlXCI7XG4vLyBpbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IHdlYnBhY2tTdGF0c1BsdWdpbiBmcm9tIFwicm9sbHVwLXBsdWdpbi13ZWJwYWNrLXN0YXRzXCI7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSBcIi4vcGFja2FnZS5qc29uXCI7XG5cbmNvbnN0IGlzQ3lwcmVzc1J1bm5pbmcgPSBwcm9jZXNzLmVudi5DSTtcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290OiBfX2Rpcm5hbWUsXG4gIGNhY2hlRGlyOiBcIi4uLy4uL25vZGVfbW9kdWxlcy8udml0ZS9hcHBzL3dlYi11aVwiLFxuICBzZXJ2ZXI6IHtcbiAgICBobXI6ICFpc0N5cHJlc3NSdW5uaW5nLFxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBVc2UgYSBzdXBwb3J0ZWQgZmlsZSBwYXR0ZXJuIGZvciBWaXRlIDUvUm9sbHVwIDRcbiAgICAgICAgLy8gQGRvYyBodHRwczovL3JlbGF0aXZlLWNpLmNvbS9kb2N1bWVudGF0aW9uL2d1aWRlcy92aXRlLWNvbmZpZ1xuICAgICAgICBhc3NldEZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLltoYXNoXVtleHRuYW1lXVwiLFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLltoYXNoXS5qc1wiLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLltoYXNoXS5qc1wiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiYml0Y29pbmpzLWxpYlwiOiBcIkB0b3NoaW1vdG84MjEvYml0Y29pbmpzXCIsXG4gICAgICBcIkByb290XCI6IFwiL3NyY1wiLFxuICAgICAgXCJAY29tcG9uZW50c1wiOiBcIi9zcmMvY29tcG9uZW50c1wiLFxuICAgICAgXCJAbGliXCI6IFwiL3NyYy9saWJcIixcbiAgICAgIFwiQG1hY2hpbmVzXCI6IFwiL3NyYy9tYWNoaW5lc1wiLFxuICAgICAgXCJAbW9kZWxzXCI6IFwiL3NyYy9tb2RlbHNcIixcbiAgICAgIFwiQHByb3ZpZGVyc1wiOiBcIi9zcmMvcHJvdmlkZXJzXCIsXG4gICAgICBcIkBzY3JlZW5zXCI6IFwiL3NyYy9zY3JlZW5zXCIsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHdlYnBhY2tTdGF0c1BsdWdpbigpLFxuICAgIHJlcGxhY2VDb2RlUGx1Z2luKHtcbiAgICAgIHJlcGxhY2VtZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX1ZFUlNJT05fX1wiLFxuICAgICAgICAgIHRvOiBwYWNrYWdlSnNvbi52ZXJzaW9uLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX1JFTE9BRF9TV19fXCIsXG4gICAgICAgICAgdG86IFwidHJ1ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX0RBVEVfX1wiLFxuICAgICAgICAgIHRvOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuICAgIHJlYWN0KCksXG4gICAgLi4uKCFpc0N5cHJlc3NSdW5uaW5nXG4gICAgICA/IFZpdGVQV0Eoe1xuICAgICAgICAgIGluamVjdFJlZ2lzdGVyOiBcInNjcmlwdFwiLFxuICAgICAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXG4gICAgICAgICAgc3RyYXRlZ2llczogXCJpbmplY3RNYW5pZmVzdFwiLFxuICAgICAgICAgIHNyY0RpcjogXCJzcmNcIixcbiAgICAgICAgICBmaWxlbmFtZTogXCJzdy50c1wiLFxuICAgICAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB0eXBlOiBcIm1vZHVsZVwiLFxuICAgICAgICAgICAgLyogb3RoZXIgb3B0aW9ucyAqL1xuICAgICAgICAgIH0sXG4gICAgICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgICAgIG5hbWU6IFwiVG9zaGkgTW90b1wiLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogXCJUb3NoaSBNb3RvXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJWaXN1YWxpemUgQml0Y29pbiB0cmFuc2FjdGlvbnMgaW4gcmVhbCB0aW1lXCIsXG4gICAgICAgICAgICB0aGVtZV9jb2xvcjogXCJyZ2IoMjI5LCAyMzEsIDIzNSlcIixcbiAgICAgICAgICAgIGljb25zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6IFwiYXNzZXRzL3B3YS9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTE5Mi0xOTIucG5nXCIsXG4gICAgICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6IFwiYXNzZXRzL3B3YS9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6IFwiYXNzZXRzL3B3YS9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgICAgcHVycG9zZTogXCJhbnlcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogXCJhc3NldHMvcHdhL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNTEyeDUxMi5wbmdcIixcbiAgICAgICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiBcIm1hc2thYmxlXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICA6IFtdKSxcbiAgICBzdmdyKCksXG4gICAgbnhWaXRlVHNQYXRocygpLFxuICAgIC8vIHZpc3VhbGl6ZXIoeyB0ZW1wbGF0ZTogXCJyYXctZGF0YVwiLCBmaWxlbmFtZTogXCJhcHBzL3dlYi11aS9zdGF0cy5qc29uXCIgfSksXG4gIF0sXG4gIC8vIHdvcmtlcjoge1xuICAvLyAgIHBsdWdpbnM6IFtueFZpdGVUc1BhdGhzKCldLFxuICAvLyB9LFxuICAvLyBidWlsZDoge1xuICAvLyAgIG91dERpcjogXCIuLi8uLi9kaXN0L2FwcHMvd2ViLXVpXCIsXG4gIC8vICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIC8vICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWUsXG4gIC8vICAgY29tbW9uanNPcHRpb25zOiB7XG4gIC8vICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcbiAgLy8gICB9LFxuICAvLyB9LFxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogXCJoYXBweS1kb21cIixcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwid2ViLXVpXCIsXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxuICBcInZlcnNpb25cIjogXCIxLjYuM1wiLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImN5cHJlc3M6b3BlblwiOiBcImN5cHJlc3Mgb3BlblwiLFxuICAgIFwiZGV2XCI6IFwidml0ZVwiLFxuICAgIFwiYnVpbGRcIjogXCJ0c2MgJiYgdml0ZSBidWlsZFwiLFxuICAgIFwiYnVpbGQ6ZG9ja2VyXCI6IFwiZG9ja2VyIGJ1aWxkeCBidWlsZCAtLXBsYXRmb3JtIGxpbnV4L2FybTY0LGxpbnV4L2FtZDY0IC0tdGFnIHRvc2hpbW90bzgyMS90b3NoaS1tb3RvOiR7VkVSU0lPTn0gLS1vdXRwdXQgXFxcInR5cGU9cmVnaXN0cnlcXFwiIC5cIixcbiAgICBcImJ1aWxkOmV4dGVuc2lvblwiOiBcInRzYyAmJiB2aXRlIGJ1aWxkIC0tY29uZmlnIHZpdGUuY29uZmlnLmV4dGVuc2lvbi50c1wiLFxuICAgIFwidHNjXCI6IFwidHNjXCIsXG4gICAgXCJsaW50XCI6IFwiZXNsaW50IC4gLS1leHQgdHMsdHN4IC0tcmVwb3J0LXVudXNlZC1kaXNhYmxlLWRpcmVjdGl2ZXMgLS1tYXgtd2FybmluZ3MgMjAwXCIsXG4gICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCIsXG4gICAgXCJzdG9yeWJvb2tcIjogXCJzdG9yeWJvb2sgZGV2IC1wIDYwMDZcIixcbiAgICBcImJ1aWxkLXN0b3J5Ym9va1wiOiBcInN0b3J5Ym9vayBidWlsZFwiLFxuICAgIFwiY2hyb21hdGljXCI6IFwibnB4IGNocm9tYXRpY1wiLFxuICAgIFwidGVzdFwiOiBcInZpdGVzdCAtLXJ1blwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkByYWRpeC11aS9jb2xvcnNcIjogXCJeMy4wLjBcIixcbiAgICBcIkByYWRpeC11aS9yZWFjdC1hY2NvcmRpb25cIjogXCJeMS4xLjJcIixcbiAgICBcIkByYWRpeC11aS9yZWFjdC1pY29uc1wiOiBcIl4xLjMuMFwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LXByb2dyZXNzXCI6IFwiXjEuMC4zXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3QtdG9hc3RcIjogXCJeMS4xLjVcIixcbiAgICBcIkByYWRpeC11aS90aGVtZXNcIjogXCJeMy4wLjVcIixcbiAgICBcIkB0eXBlcy9kM1wiOiBcIl43LjQuM1wiLFxuICAgIFwiQHR5cGVzL2QzLXNhbmtleVwiOiBcIl4wLjEyLjRcIixcbiAgICBcIkB0eXBlcy9sb2Rhc2hcIjogXCJeNC4xNC4yMDJcIixcbiAgICBcIkB1aXcvcmVhY3QtanNvbi12aWV3XCI6IFwiMi4wLjAtYWxwaGEuMTJcIixcbiAgICBcIkB4c3RhdGUvcmVhY3RcIjogXCJeNC4wLjFcIixcbiAgICBcImNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eVwiOiBcIl4wLjcuMFwiLFxuICAgIFwiY2xzeFwiOiBcIl4yLjAuMFwiLFxuICAgIFwiZDNcIjogXCJeNy44LjVcIixcbiAgICBcImQzLXNhbmtleVwiOiBcIjAuMTJcIixcbiAgICBcImRhdGUtZm5zXCI6IFwiXjMuMy4xXCIsXG4gICAgXCJkb3QtcHJvcC1pbW11dGFibGVcIjogXCJeMi4xLjFcIixcbiAgICBcImxvZGFzaFwiOiBcIl40LjE3LjIxXCIsXG4gICAgXCJyZWFjdFwiOiBcIl4xOC4yLjBcIixcbiAgICBcInJlYWN0LWRheS1waWNrZXJcIjogXCJeOC4xMC4wXCIsXG4gICAgXCJyZWFjdC1kb21cIjogXCJeMTguMi4wXCIsXG4gICAgXCJyZWFjdC1yZXdhcmRzXCI6IFwiXjIuMC40XCIsXG4gICAgXCJyZWFjdC1yb3V0ZXItZG9tXCI6IFwiXjYuMjEuMFwiLFxuICAgIFwidGFpbHdpbmQtbWVyZ2VcIjogXCJeMi4xLjBcIixcbiAgICBcInRhaWx3aW5kY3NzLWFuaW1hdGVcIjogXCJeMS4wLjdcIixcbiAgICBcInhzdGF0ZVwiOiBcIl41LjQuMVwiLFxuICAgIFwieHN0YXRlLWhlbHBlcnNcIjogXCJeMi4wLjBcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAc3Rvcnlib29rL2FkZG9uLWVzc2VudGlhbHNcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svYWRkb24taW50ZXJhY3Rpb25zXCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL2FkZG9uLWxpbmtzXCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL2FkZG9uLW9uYm9hcmRpbmdcIjogXCJeMS4wLjEwXCIsXG4gICAgXCJAc3Rvcnlib29rL2Jsb2Nrc1wiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay9yZWFjdFwiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay9yZWFjdC12aXRlXCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL3Rlc3RcIjogXCJeNy42LjVcIixcbiAgICBcIkB0ZXN0aW5nLWxpYnJhcnkvamVzdC1kb21cIjogXCJeNi4xLjVcIixcbiAgICBcIkB0ZXN0aW5nLWxpYnJhcnkvcmVhY3RcIjogXCJeMTQuMS4yXCIsXG4gICAgXCJAdHlwZXMvY2hyb21lXCI6IFwiXjAuMC4yNjNcIixcbiAgICBcIkB0eXBlcy9qZXN0XCI6IFwiXjI5LjUuMTFcIixcbiAgICBcIkB0eXBlcy9yZWFjdFwiOiBcIl4xOC4yLjQzXCIsXG4gICAgXCJAdHlwZXMvcmVhY3QtZG9tXCI6IFwiXjE4LjIuMTdcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9lc2xpbnQtcGx1Z2luXCI6IFwiXjYuMTQuMFwiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlclwiOiBcIl42LjE0LjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMi4xXCIsXG4gICAgXCJhdXRvcHJlZml4ZXJcIjogXCJeMTAuNC4xNlwiLFxuICAgIFwiZXNsaW50XCI6IFwiXjguNTUuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1yZWFjdC1ob29rc1wiOiBcIl40LjYuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1yZWFjdC1yZWZyZXNoXCI6IFwiXjAuNC41XCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXN0b3J5Ym9va1wiOiBcIl4wLjYuMTVcIixcbiAgICBcImhhcHB5LWRvbVwiOiBcIl4xMi4xMC4zXCIsXG4gICAgXCJtc3dcIjogXCJeMi4yLjJcIixcbiAgICBcInBvc3Rjc3NcIjogXCJeOC40LjMyXCIsXG4gICAgXCJzdG9yeWJvb2tcIjogXCJeNy42LjVcIixcbiAgICBcInRhaWx3aW5kY3NzXCI6IFwiXjMuMy42XCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjUuMi4yXCIsXG4gICAgXCJ2aXRlXCI6IFwiXjUuMC4xMVwiLFxuICAgIFwidml0ZS1wbHVnaW4tcHdhXCI6IFwiXjAuMTcuNVwiLFxuICAgIFwidml0ZS1wbHVnaW4tcmVwbGFjZVwiOiBcIl4wLjEuMVwiLFxuICAgIFwidml0ZXN0XCI6IFwiXjEuNi4wXCIsXG4gICAgXCJ3b3JrYm94LWNvcmVcIjogXCJeNy4wLjBcIixcbiAgICBcIndvcmtib3gtcHJlY2FjaGluZ1wiOiBcIl43LjAuMFwiLFxuICAgIFwid29ya2JveC1yb3V0aW5nXCI6IFwiXjcuMC4wXCIsXG4gICAgXCJ3b3JrYm94LXdpbmRvd1wiOiBcIl43LjAuMFwiXG4gIH0sXG4gIFwicmVhZG1lXCI6IFwiRVJST1I6IE5vIFJFQURNRSBkYXRhIGZvdW5kIVwiLFxuICBcInZvbHRhXCI6IHtcbiAgICBcIm5vZGVcIjogXCIxOC4xOS4wXCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLGVBQWU7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMseUJBQXlCO0FBRWxDLE9BQU8sd0JBQXdCOzs7QUNUL0I7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLFNBQVc7QUFBQSxFQUNYLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxJQUNULGdCQUFnQjtB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
