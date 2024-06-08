import React from "react";
import type { Preview } from "@storybook/react";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { worker } from "../src/mocks/browser";
import { AppProvider } from "../src/providers/AppProvider";

if (typeof global.process === "undefined") {
  worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
  });
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <AppProvider>
        <Theme>
          <Story />
        </Theme>
      </AppProvider>
    ),
  ],
};

// server.listen();

export default preview;
