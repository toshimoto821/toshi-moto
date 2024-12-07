import { createListenerMiddleware, addListener } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../store";

import { addNetworkListener } from "@root/lib/slices/network.slice";
import { addWalletListener } from "@root/lib/slices/wallets.slice";
// import { addUIListener } from "@root/lib/slices/ui.slice";

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export type AppStartListening = typeof startAppListening;

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
export type AppAddListener = typeof addAppListener;

addNetworkListener(startAppListening);
addWalletListener(startAppListening);
// addUIListener(startAppListening);
