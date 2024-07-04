import { nxE2EPreset } from "@nx/cypress/plugins/cypress-preset";

import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: "src",
      bundler: "vite",
      webServerCommands: {
        default: "nx run web-ui:serve:cy",
        // production: "nx run web-ui:preview",
      },
      ciWebServerCommand: "nx run web-ui:serve-static:cy",
    }),
    baseUrl: "http://localhost:9229",
  },
});