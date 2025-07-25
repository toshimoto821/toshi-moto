import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./providers/AppProvider";
import { App } from "./App.tsx";
import { Theme } from "@radix-ui/themes";
import "./index.css";

import "react-day-picker/dist/style.css";
import "@radix-ui/themes/styles.css";
console.log(`Version: __VERSION__`);

if (window.location.pathname !== "/") {
  window.location.href = "/";
}
// build
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <Theme accentColor="orange" radius="small" scaling="90%">
        <App />
      </Theme>
    </AppProvider>
  </React.StrictMode>
);
