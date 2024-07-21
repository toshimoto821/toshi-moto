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
  version: "1.7.11",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHMiLCAiYXBwcy93ZWItdWkvcGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvamFtZXNjaGFybGVzd29ydGgvcHJvamVjdHMvYnRjL3Rvc2hpLW1vdG8vYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlLXBsdWdpbi1zdmdyL2NsaWVudFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gXCJAbngvdml0ZS9wbHVnaW5zL254LXRzY29uZmlnLXBhdGhzLnBsdWdpblwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBzdmdyIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XG5pbXBvcnQgeyByZXBsYWNlQ29kZVBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1yZXBsYWNlXCI7XG4vLyBpbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IHdlYnBhY2tTdGF0c1BsdWdpbiBmcm9tIFwicm9sbHVwLXBsdWdpbi13ZWJwYWNrLXN0YXRzXCI7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSBcIi4vcGFja2FnZS5qc29uXCI7XG5cbmNvbnN0IGlzQ3lwcmVzc1J1bm5pbmcgPSBwcm9jZXNzLmVudi5DSTtcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290OiBfX2Rpcm5hbWUsXG4gIGNhY2hlRGlyOiBcIi4uLy4uL25vZGVfbW9kdWxlcy8udml0ZS9hcHBzL3dlYi11aVwiLFxuICBzZXJ2ZXI6IHtcbiAgICBobXI6ICFpc0N5cHJlc3NSdW5uaW5nLFxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBVc2UgYSBzdXBwb3J0ZWQgZmlsZSBwYXR0ZXJuIGZvciBWaXRlIDUvUm9sbHVwIDRcbiAgICAgICAgLy8gQGRvYyBodHRwczovL3JlbGF0aXZlLWNpLmNvbS9kb2N1bWVudGF0aW9uL2d1aWRlcy92aXRlLWNvbmZpZ1xuICAgICAgICBhc3NldEZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLltoYXNoXVtleHRuYW1lXVwiLFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLltoYXNoXS5qc1wiLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLltoYXNoXS5qc1wiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiYml0Y29pbmpzLWxpYlwiOiBcIkB0b3NoaW1vdG84MjEvYml0Y29pbmpzXCIsXG4gICAgICBcIkByb290XCI6IFwiL3NyY1wiLFxuICAgICAgXCJAY29tcG9uZW50c1wiOiBcIi9zcmMvY29tcG9uZW50c1wiLFxuICAgICAgXCJAbGliXCI6IFwiL3NyYy9saWJcIixcbiAgICAgIFwiQG1hY2hpbmVzXCI6IFwiL3NyYy9tYWNoaW5lc1wiLFxuICAgICAgXCJAbW9kZWxzXCI6IFwiL3NyYy9tb2RlbHNcIixcbiAgICAgIFwiQHByb3ZpZGVyc1wiOiBcIi9zcmMvcHJvdmlkZXJzXCIsXG4gICAgICBcIkBzY3JlZW5zXCI6IFwiL3NyYy9zY3JlZW5zXCIsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHdlYnBhY2tTdGF0c1BsdWdpbigpLFxuICAgIHJlcGxhY2VDb2RlUGx1Z2luKHtcbiAgICAgIHJlcGxhY2VtZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX1ZFUlNJT05fX1wiLFxuICAgICAgICAgIHRvOiBwYWNrYWdlSnNvbi52ZXJzaW9uLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX1JFTE9BRF9TV19fXCIsXG4gICAgICAgICAgdG86IFwidHJ1ZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZnJvbTogXCJfX0RBVEVfX1wiLFxuICAgICAgICAgIHRvOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuICAgIHJlYWN0KCksXG4gICAgLi4uKCFpc0N5cHJlc3NSdW5uaW5nXG4gICAgICA/IFZpdGVQV0Eoe1xuICAgICAgICAgIGluamVjdFJlZ2lzdGVyOiBcInNjcmlwdFwiLFxuICAgICAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXG4gICAgICAgICAgc3RyYXRlZ2llczogXCJpbmplY3RNYW5pZmVzdFwiLFxuICAgICAgICAgIHNyY0RpcjogXCJzcmNcIixcbiAgICAgICAgICBmaWxlbmFtZTogXCJzdy50c1wiLFxuICAgICAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB0eXBlOiBcIm1vZHVsZVwiLFxuICAgICAgICAgICAgLyogb3RoZXIgb3B0aW9ucyAqL1xuICAgICAgICAgIH0sXG4gICAgICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgICAgIG5hbWU6IFwiVG9zaGkgTW90b1wiLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogXCJUb3NoaSBNb3RvXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJWaXN1YWxpemUgQml0Y29pbiB0cmFuc2FjdGlvbnMgaW4gcmVhbCB0aW1lXCIsXG4gICAgICAgICAgICB0aGVtZV9jb2xvcjogXCJyZ2IoMjI5LCAyMzEsIDIzNSlcIixcbiAgICAgICAgICAgIGljb25zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6IFwiYXNzZXRzL3B3YS9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTE5Mi0xOTIucG5nXCIsXG4gICAgICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6IFwiYXNzZXRzL3B3YS9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6IFwiYXNzZXRzL3B3YS9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgICAgcHVycG9zZTogXCJhbnlcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogXCJhc3NldHMvcHdhL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNTEyeDUxMi5wbmdcIixcbiAgICAgICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiBcIm1hc2thYmxlXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICA6IFtdKSxcbiAgICBzdmdyKCksXG4gICAgbnhWaXRlVHNQYXRocygpLFxuICAgIC8vIHZpc3VhbGl6ZXIoeyB0ZW1wbGF0ZTogXCJyYXctZGF0YVwiLCBmaWxlbmFtZTogXCJhcHBzL3dlYi11aS9zdGF0cy5qc29uXCIgfSksXG4gIF0sXG4gIC8vIHdvcmtlcjoge1xuICAvLyAgIHBsdWdpbnM6IFtueFZpdGVUc1BhdGhzKCldLFxuICAvLyB9LFxuICAvLyBidWlsZDoge1xuICAvLyAgIG91dERpcjogXCIuLi8uLi9kaXN0L2FwcHMvd2ViLXVpXCIsXG4gIC8vICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIC8vICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWUsXG4gIC8vICAgY29tbW9uanNPcHRpb25zOiB7XG4gIC8vICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcbiAgLy8gICB9LFxuICAvLyB9LFxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogXCJoYXBweS1kb21cIixcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwid2ViLXVpXCIsXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxuICBcInZlcnNpb25cIjogXCIxLjcuMTFcIixcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJjeXByZXNzOm9wZW5cIjogXCJjeXByZXNzIG9wZW5cIixcbiAgICBcImRldlwiOiBcInZpdGVcIixcbiAgICBcImJ1aWxkXCI6IFwidHNjICYmIHZpdGUgYnVpbGRcIixcbiAgICBcImJ1aWxkOmRvY2tlclwiOiBcImRvY2tlciBidWlsZHggYnVpbGQgLS1wbGF0Zm9ybSBsaW51eC9hcm02NCxsaW51eC9hbWQ2NCAtLXRhZyB0b3NoaW1vdG84MjEvdG9zaGktbW90bzoke1ZFUlNJT059IC0tb3V0cHV0IFxcXCJ0eXBlPXJlZ2lzdHJ5XFxcIiAuXCIsXG4gICAgXCJidWlsZDpleHRlbnNpb25cIjogXCJ0c2MgJiYgdml0ZSBidWlsZCAtLWNvbmZpZyB2aXRlLmNvbmZpZy5leHRlbnNpb24udHNcIixcbiAgICBcInRzY1wiOiBcInRzY1wiLFxuICAgIFwibGludFwiOiBcImVzbGludCAuIC0tZXh0IHRzLHRzeCAtLXJlcG9ydC11bnVzZWQtZGlzYWJsZS1kaXJlY3RpdmVzIC0tbWF4LXdhcm5pbmdzIDIwMFwiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxuICAgIFwic3Rvcnlib29rXCI6IFwic3Rvcnlib29rIGRldiAtcCA2MDA2XCIsXG4gICAgXCJidWlsZC1zdG9yeWJvb2tcIjogXCJzdG9yeWJvb2sgYnVpbGRcIixcbiAgICBcImNocm9tYXRpY1wiOiBcIm5weCBjaHJvbWF0aWNcIixcbiAgICBcInRlc3RcIjogXCJ2aXRlc3QgLS1ydW5cIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAcmFkaXgtdWkvY29sb3JzXCI6IFwiXjMuMC4wXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3QtYWNjb3JkaW9uXCI6IFwiXjEuMS4yXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3QtaWNvbnNcIjogXCJeMS4zLjBcIixcbiAgICBcIkByYWRpeC11aS9yZWFjdC1wcm9ncmVzc1wiOiBcIl4xLjAuM1wiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRvYXN0XCI6IFwiXjEuMS41XCIsXG4gICAgXCJAcmFkaXgtdWkvdGhlbWVzXCI6IFwiXjMuMC41XCIsXG4gICAgXCJAdHlwZXMvZDNcIjogXCJeNy40LjNcIixcbiAgICBcIkB0eXBlcy9kMy1zYW5rZXlcIjogXCJeMC4xMi40XCIsXG4gICAgXCJAdHlwZXMvbG9kYXNoXCI6IFwiXjQuMTQuMjAyXCIsXG4gICAgXCJAdWl3L3JlYWN0LWpzb24tdmlld1wiOiBcIjIuMC4wLWFscGhhLjEyXCIsXG4gICAgXCJAeHN0YXRlL3JlYWN0XCI6IFwiXjQuMC4xXCIsXG4gICAgXCJjbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIjogXCJeMC43LjBcIixcbiAgICBcImNsc3hcIjogXCJeMi4wLjBcIixcbiAgICBcImQzXCI6IFwiXjcuOC41XCIsXG4gICAgXCJkMy1zYW5rZXlcIjogXCIwLjEyXCIsXG4gICAgXCJkYXRlLWZuc1wiOiBcIl4zLjMuMVwiLFxuICAgIFwiZG90LXByb3AtaW1tdXRhYmxlXCI6IFwiXjIuMS4xXCIsXG4gICAgXCJsb2Rhc2hcIjogXCJeNC4xNy4yMVwiLFxuICAgIFwicmVhY3RcIjogXCJeMTguMi4wXCIsXG4gICAgXCJyZWFjdC1kYXktcGlja2VyXCI6IFwiXjguMTAuMFwiLFxuICAgIFwicmVhY3QtZG9tXCI6IFwiXjE4LjIuMFwiLFxuICAgIFwicmVhY3QtcmV3YXJkc1wiOiBcIl4yLjAuNFwiLFxuICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiOiBcIl42LjIxLjBcIixcbiAgICBcInRhaWx3aW5kLW1lcmdlXCI6IFwiXjIuMS4wXCIsXG4gICAgXCJ0YWlsd2luZGNzcy1hbmltYXRlXCI6IFwiXjEuMC43XCIsXG4gICAgXCJ4c3RhdGVcIjogXCJeNS40LjFcIixcbiAgICBcInhzdGF0ZS1oZWxwZXJzXCI6IFwiXjIuMC4wXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1lc3NlbnRpYWxzXCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL2FkZG9uLWludGVyYWN0aW9uc1wiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1saW5rc1wiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1vbmJvYXJkaW5nXCI6IFwiXjEuMC4xMFwiLFxuICAgIFwiQHN0b3J5Ym9vay9ibG9ja3NcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svcmVhY3RcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svcmVhY3Qtdml0ZVwiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay90ZXN0XCI6IFwiXjcuNi41XCIsXG4gICAgXCJAdGVzdGluZy1saWJyYXJ5L2plc3QtZG9tXCI6IFwiXjYuMS41XCIsXG4gICAgXCJAdGVzdGluZy1saWJyYXJ5L3JlYWN0XCI6IFwiXjE0LjEuMlwiLFxuICAgIFwiQHR5cGVzL2Nocm9tZVwiOiBcIl4wLjAuMjYzXCIsXG4gICAgXCJAdHlwZXMvamVzdFwiOiBcIl4yOS41LjExXCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMi40M1wiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4yLjE3XCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl42LjE0LjBcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCJeNi4xNC4wXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiOiBcIl40LjIuMVwiLFxuICAgIFwiYXV0b3ByZWZpeGVyXCI6IFwiXjEwLjQuMTZcIixcbiAgICBcImVzbGludFwiOiBcIl44LjU1LjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtaG9va3NcIjogXCJeNC42LjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtcmVmcmVzaFwiOiBcIl4wLjQuNVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1zdG9yeWJvb2tcIjogXCJeMC42LjE1XCIsXG4gICAgXCJoYXBweS1kb21cIjogXCJeMTIuMTAuM1wiLFxuICAgIFwibXN3XCI6IFwiXjIuMi4yXCIsXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4zMlwiLFxuICAgIFwic3Rvcnlib29rXCI6IFwiXjcuNi41XCIsXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjMuNlwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjIuMlwiLFxuICAgIFwidml0ZVwiOiBcIl41LjAuMTFcIixcbiAgICBcInZpdGUtcGx1Z2luLXB3YVwiOiBcIl4wLjE3LjVcIixcbiAgICBcInZpdGUtcGx1Z2luLXJlcGxhY2VcIjogXCJeMC4xLjFcIixcbiAgICBcInZpdGVzdFwiOiBcIl4xLjYuMFwiLFxuICAgIFwid29ya2JveC1jb3JlXCI6IFwiXjcuMC4wXCIsXG4gICAgXCJ3b3JrYm94LXByZWNhY2hpbmdcIjogXCJeNy4wLjBcIixcbiAgICBcIndvcmtib3gtcm91dGluZ1wiOiBcIl43LjAuMFwiLFxuICAgIFwid29ya2JveC13aW5kb3dcIjogXCJeNy4wLjBcIlxuICB9LFxuICBcInJlYWRtZVwiOiBcIkVSUk9SOiBObyBSRUFETUUgZGF0YSBmb3VuZCFcIixcbiAgXCJ2b2x0YVwiOiB7XG4gICAgXCJub2RlXCI6IFwiMTguMTkuMFwiXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHlCQUF5QjtBQUVsQyxPQUFPLHdCQUF3Qjs7O0FDVC9CO0FBQUEsRUFDRSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsRUFDWCxTQUFXO0FBQUEsRUFDWCxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsSUFDVCxnQkFBZ0I7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
