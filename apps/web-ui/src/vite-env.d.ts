/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "virtual:pwa-register" {
  import type { RegisterSWOptions } from "vite-plugin-pwa/types";

  export type { RegisterSWOptions };

  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}

declare module "@toshimoto821/bitcoinjs";

declare module "react-day-picker";
