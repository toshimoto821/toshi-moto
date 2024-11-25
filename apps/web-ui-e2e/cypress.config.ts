import { nxE2EPreset } from "@nx/cypress/plugins/cypress-preset";

import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: "src",
      bundler: "vite",

      webServerCommands: {
        default: "nx run web-ui:dev", //"echo 'No command specified'",
        production: "nx run web-ui:serve-static:cy",
      },

      ciWebServerCommand: "nx run web-ui:serve-static:cy",
    }),
    browser: "chrome",
    viewportWidth: 1280,
    viewportHeight: 1480,
    baseUrl: "http://localhost:5173",
    // screenshotsFolder: "cypress/screenshots",
    trashAssetsBeforeRuns: true,
    chromeWebSecurity: false,
  },
});
