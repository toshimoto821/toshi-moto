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
  version: "1.9.8",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHMiLCAiYXBwcy93ZWItdWkvcGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvamFtZXNjaGFybGVzd29ydGgvcHJvamVjdHMvYnRjL3Rvc2hpLW1vdG8vYXBwcy93ZWItdWkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWVzY2hhcmxlc3dvcnRoL3Byb2plY3RzL2J0Yy90b3NoaS1tb3RvL2FwcHMvd2ViLXVpL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlLXBsdWdpbi1zdmdyL2NsaWVudFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gXCJAbngvdml0ZS9wbHVnaW5zL254LXRzY29uZmlnLXBhdGhzLnBsdWdpblwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBzdmdyIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XG5pbXBvcnQgeyByZXBsYWNlQ29kZVBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1yZXBsYWNlXCI7XG4vLyBpbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IHdlYnBhY2tTdGF0c1BsdWdpbiBmcm9tIFwicm9sbHVwLXBsdWdpbi13ZWJwYWNrLXN0YXRzXCI7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSBcIi4vcGFja2FnZS5qc29uXCI7XG5cbmNvbnN0IGlzQ3lwcmVzc1J1bm5pbmcgPSBwcm9jZXNzLmVudi5DSTtcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJvb3Q6IF9fZGlybmFtZSxcbiAgLy8gY2FjaGVEaXI6IFwiLi4vLi4vbm9kZV9tb2R1bGVzLy52aXRlL2FwcHMvd2ViLXVpXCIsXG4gIHNlcnZlcjoge1xuICAgIGhtcjogIWlzQ3lwcmVzc1J1bm5pbmcsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFVzZSBhIHN1cHBvcnRlZCBmaWxlIHBhdHRlcm4gZm9yIFZpdGUgNS9Sb2xsdXAgNFxuICAgICAgICAvLyBAZG9jIGh0dHBzOi8vcmVsYXRpdmUtY2kuY29tL2RvY3VtZW50YXRpb24vZ3VpZGVzL3ZpdGUtY29uZmlnXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdW2V4dG5hbWVdXCIsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdLmpzXCIsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2hhc2hdLmpzXCIsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJiaXRjb2luanMtbGliXCI6IFwiQHRvc2hpbW90bzgyMS9iaXRjb2luanNcIixcbiAgICAgIFwiQHJvb3RcIjogXCIvc3JjXCIsXG4gICAgICBcIkBjb21wb25lbnRzXCI6IFwiL3NyYy9jb21wb25lbnRzXCIsXG4gICAgICBcIkBsaWJcIjogXCIvc3JjL2xpYlwiLFxuICAgICAgXCJAbWFjaGluZXNcIjogXCIvc3JjL21hY2hpbmVzXCIsXG4gICAgICBcIkBtb2RlbHNcIjogXCIvc3JjL21vZGVsc1wiLFxuICAgICAgXCJAcHJvdmlkZXJzXCI6IFwiL3NyYy9wcm92aWRlcnNcIixcbiAgICAgIFwiQHNjcmVlbnNcIjogXCIvc3JjL3NjcmVlbnNcIixcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgd2VicGFja1N0YXRzUGx1Z2luKCksXG4gICAgcmVwbGFjZUNvZGVQbHVnaW4oe1xuICAgICAgcmVwbGFjZW1lbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBmcm9tOiBcIl9fVkVSU0lPTl9fXCIsXG4gICAgICAgICAgdG86IHBhY2thZ2VKc29uLnZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBmcm9tOiBcIl9fUkVMT0FEX1NXX19cIixcbiAgICAgICAgICB0bzogXCJ0cnVlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBmcm9tOiBcIl9fREFURV9fXCIsXG4gICAgICAgICAgdG86IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gICAgcmVhY3QoKSxcbiAgICAuLi4oIWlzQ3lwcmVzc1J1bm5pbmdcbiAgICAgID8gVml0ZVBXQSh7XG4gICAgICAgICAgaW5qZWN0UmVnaXN0ZXI6IFwic2NyaXB0XCIsXG4gICAgICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgICAgICAgICBzdHJhdGVnaWVzOiBcImluamVjdE1hbmlmZXN0XCIsXG4gICAgICAgICAgc3JjRGlyOiBcInNyY1wiLFxuICAgICAgICAgIGZpbGVuYW1lOiBcInN3LnRzXCIsXG4gICAgICAgICAgd29ya2JveDoge1xuICAgICAgICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIHR5cGU6IFwibW9kdWxlXCIsXG4gICAgICAgICAgICAvKiBvdGhlciBvcHRpb25zICovXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYW5pZmVzdDoge1xuICAgICAgICAgICAgbmFtZTogXCJUb3NoaSBNb3RvXCIsXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiBcIlRvc2hpIE1vdG9cIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlZpc3VhbGl6ZSBCaXRjb2luIHRyYW5zYWN0aW9ucyBpbiByZWFsIHRpbWVcIixcbiAgICAgICAgICAgIHRoZW1lX2NvbG9yOiBcInJnYigyMjksIDIzMSwgMjM1KVwiLFxuICAgICAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogXCJhc3NldHMvcHdhL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tMTkyLTE5Mi5wbmdcIixcbiAgICAgICAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogXCJhc3NldHMvcHdhL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNTEyeDUxMi5wbmdcIixcbiAgICAgICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogXCJhc3NldHMvcHdhL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNTEyeDUxMi5wbmdcIixcbiAgICAgICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiBcImFueVwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3JjOiBcImFzc2V0cy9wd2EvYW5kcm9pZC9hbmRyb2lkLWxhdW5jaGVyaWNvbi01MTJ4NTEyLnBuZ1wiLFxuICAgICAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIDogW10pLFxuICAgIHN2Z3IoKSxcbiAgICBueFZpdGVUc1BhdGhzKCksXG4gICAgLy8gdmlzdWFsaXplcih7IHRlbXBsYXRlOiBcInJhdy1kYXRhXCIsIGZpbGVuYW1lOiBcImFwcHMvd2ViLXVpL3N0YXRzLmpzb25cIiB9KSxcbiAgXSxcbiAgLy8gd29ya2VyOiB7XG4gIC8vICAgcGx1Z2luczogW254Vml0ZVRzUGF0aHMoKV0sXG4gIC8vIH0sXG4gIC8vIGJ1aWxkOiB7XG4gIC8vICAgb3V0RGlyOiBcIi4uLy4uL2Rpc3QvYXBwcy93ZWItdWlcIixcbiAgLy8gICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgLy8gICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSxcbiAgLy8gICBjb21tb25qc09wdGlvbnM6IHtcbiAgLy8gICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxuICAvLyAgIH0sXG4gIC8vIH0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiBcImhhcHB5LWRvbVwiLFxuICB9LFxufSk7XG4iLCAie1xuICBcIm5hbWVcIjogXCJ3ZWItdWlcIixcbiAgXCJwcml2YXRlXCI6IHRydWUsXG4gIFwidmVyc2lvblwiOiBcIjEuOS44XCIsXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiY3lwcmVzczpvcGVuXCI6IFwiY3lwcmVzcyBvcGVuXCIsXG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInRzYyAmJiB2aXRlIGJ1aWxkXCIsXG4gICAgXCJidWlsZDpkb2NrZXJcIjogXCJkb2NrZXIgYnVpbGR4IGJ1aWxkIC0tcGxhdGZvcm0gbGludXgvYXJtNjQsbGludXgvYW1kNjQgLS10YWcgdG9zaGltb3RvODIxL3Rvc2hpLW1vdG86JHtWRVJTSU9OfSAtLW91dHB1dCBcXFwidHlwZT1yZWdpc3RyeVxcXCIgLlwiLFxuICAgIFwiYnVpbGQ6ZXh0ZW5zaW9uXCI6IFwidHNjICYmIHZpdGUgYnVpbGQgLS1jb25maWcgdml0ZS5jb25maWcuZXh0ZW5zaW9uLnRzXCIsXG4gICAgXCJ0c2NcIjogXCJ0c2NcIixcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLiAtLWV4dCB0cyx0c3ggLS1yZXBvcnQtdW51c2VkLWRpc2FibGUtZGlyZWN0aXZlcyAtLW1heC13YXJuaW5ncyAyMDBcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcInN0b3J5Ym9va1wiOiBcInN0b3J5Ym9vayBkZXYgLXAgNjAwNlwiLFxuICAgIFwiYnVpbGQtc3Rvcnlib29rXCI6IFwic3Rvcnlib29rIGJ1aWxkXCIsXG4gICAgXCJjaHJvbWF0aWNcIjogXCJucHggY2hyb21hdGljXCIsXG4gICAgXCJ0ZXN0XCI6IFwidml0ZXN0IC0tcnVuXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHJhZGl4LXVpL2NvbG9yc1wiOiBcIl4zLjAuMFwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvblwiOiBcIl4xLjEuMlwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LWljb25zXCI6IFwiXjEuMy4wXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3QtcHJvZ3Jlc3NcIjogXCJeMS4wLjNcIixcbiAgICBcIkByYWRpeC11aS9yZWFjdC10b2FzdFwiOiBcIl4xLjEuNVwiLFxuICAgIFwiQHJhZGl4LXVpL3RoZW1lc1wiOiBcIl4zLjAuNVwiLFxuICAgIFwiQHR5cGVzL2QzXCI6IFwiXjcuNC4zXCIsXG4gICAgXCJAdHlwZXMvZDMtc2Fua2V5XCI6IFwiXjAuMTIuNFwiLFxuICAgIFwiQHR5cGVzL2xvZGFzaFwiOiBcIl40LjE0LjIwMlwiLFxuICAgIFwiQHVpdy9yZWFjdC1qc29uLXZpZXdcIjogXCIyLjAuMC1hbHBoYS4xMlwiLFxuICAgIFwiQHhzdGF0ZS9yZWFjdFwiOiBcIl40LjAuMVwiLFxuICAgIFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCI6IFwiXjAuNy4wXCIsXG4gICAgXCJjbHN4XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJkM1wiOiBcIl43LjguNVwiLFxuICAgIFwiZDMtc2Fua2V5XCI6IFwiMC4xMlwiLFxuICAgIFwiZGF0ZS1mbnNcIjogXCJeMy4zLjFcIixcbiAgICBcImRvdC1wcm9wLWltbXV0YWJsZVwiOiBcIl4yLjEuMVwiLFxuICAgIFwibG9kYXNoXCI6IFwiXjQuMTcuMjFcIixcbiAgICBcInJlYWN0XCI6IFwiXjE4LjIuMFwiLFxuICAgIFwicmVhY3QtZGF5LXBpY2tlclwiOiBcIl44LjEwLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xOC4yLjBcIixcbiAgICBcInJlYWN0LXJld2FyZHNcIjogXCJeMi4wLjRcIixcbiAgICBcInJlYWN0LXJvdXRlci1kb21cIjogXCJeNi4yMS4wXCIsXG4gICAgXCJ0YWlsd2luZC1tZXJnZVwiOiBcIl4yLjEuMFwiLFxuICAgIFwidGFpbHdpbmRjc3MtYW5pbWF0ZVwiOiBcIl4xLjAuN1wiLFxuICAgIFwieHN0YXRlXCI6IFwiXjUuNC4xXCIsXG4gICAgXCJ4c3RhdGUtaGVscGVyc1wiOiBcIl4yLjAuMFwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBzdG9yeWJvb2svYWRkb24tZXNzZW50aWFsc1wiOiBcIl43LjYuNVwiLFxuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1pbnRlcmFjdGlvbnNcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svYWRkb24tbGlua3NcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svYWRkb24tb25ib2FyZGluZ1wiOiBcIl4xLjAuMTBcIixcbiAgICBcIkBzdG9yeWJvb2svYmxvY2tzXCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL3JlYWN0XCI6IFwiXjcuNi41XCIsXG4gICAgXCJAc3Rvcnlib29rL3JlYWN0LXZpdGVcIjogXCJeNy42LjVcIixcbiAgICBcIkBzdG9yeWJvb2svdGVzdFwiOiBcIl43LjYuNVwiLFxuICAgIFwiQHRlc3RpbmctbGlicmFyeS9qZXN0LWRvbVwiOiBcIl42LjEuNVwiLFxuICAgIFwiQHRlc3RpbmctbGlicmFyeS9yZWFjdFwiOiBcIl4xNC4xLjJcIixcbiAgICBcIkB0eXBlcy9jaHJvbWVcIjogXCJeMC4wLjI2M1wiLFxuICAgIFwiQHR5cGVzL2plc3RcIjogXCJeMjkuNS4xMVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiXjE4LjIuNDNcIixcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCJeMTguMi4xN1wiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L2VzbGludC1wbHVnaW5cIjogXCJeNi4xNC4wXCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvcGFyc2VyXCI6IFwiXjYuMTQuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCJeNC4yLjFcIixcbiAgICBcImF1dG9wcmVmaXhlclwiOiBcIl4xMC40LjE2XCIsXG4gICAgXCJlc2xpbnRcIjogXCJeOC41NS4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0LWhvb2tzXCI6IFwiXjQuNi4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0LXJlZnJlc2hcIjogXCJeMC40LjVcIixcbiAgICBcImVzbGludC1wbHVnaW4tc3Rvcnlib29rXCI6IFwiXjAuNi4xNVwiLFxuICAgIFwiaGFwcHktZG9tXCI6IFwiXjEyLjEwLjNcIixcbiAgICBcIm1zd1wiOiBcIl4yLjIuMlwiLFxuICAgIFwicG9zdGNzc1wiOiBcIl44LjQuMzJcIixcbiAgICBcInN0b3J5Ym9va1wiOiBcIl43LjYuNVwiLFxuICAgIFwidGFpbHdpbmRjc3NcIjogXCJeMy4zLjZcIixcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNS4yLjJcIixcbiAgICBcInZpdGVcIjogXCJeNS4wLjExXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1wd2FcIjogXCJeMC4xNy41XCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1yZXBsYWNlXCI6IFwiXjAuMS4xXCIsXG4gICAgXCJ2aXRlc3RcIjogXCJeMS42LjBcIixcbiAgICBcIndvcmtib3gtY29yZVwiOiBcIl43LjAuMFwiLFxuICAgIFwid29ya2JveC1wcmVjYWNoaW5nXCI6IFwiXjcuMC4wXCIsXG4gICAgXCJ3b3JrYm94LXJvdXRpbmdcIjogXCJeNy4wLjBcIixcbiAgICBcIndvcmtib3gtd2luZG93XCI6IFwiXjcuMC4wXCJcbiAgfSxcbiAgXCJyZWFkbWVcIjogXCJFUlJPUjogTm8gUkVBRE1FIGRhdGEgZm91bmQhXCIsXG4gIFwidm9sdGFcIjoge1xuICAgIFwibm9kZVwiOiBcIjE4LjE5LjBcIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFVBQVU7QUFDakIsU0FBUyx5QkFBeUI7QUFFbEMsT0FBTyx3QkFBd0I7OztBQ1QvQjtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsU0FBVztBQUFBLEVBQ1gsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLElBQ1QsZ0JB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
