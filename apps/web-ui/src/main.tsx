import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./providers/AppProvider.tsx";
import { AppLoader } from "./AppLoader.tsx";

import { Theme } from "@radix-ui/themes";
import "./index.css";

import "react-day-picker/dist/style.css";
import "@radix-ui/themes/styles.css";
console.log(`Version:  __VERSION__`);

if (window.location.pathname !== "/") {
  window.location.href = "/";
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <Theme accentColor="orange" radius="small" scaling="90%">
        <AppLoader />
      </Theme>
    </AppProvider>
  </React.StrictMode>
);
