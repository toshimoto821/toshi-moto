import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist-indexeddb-storage";
import { persistReducer } from "redux-persist";

import { configReducer } from "./slices/config.slice";
import { apiSlice } from "./slices/api.slice";
import { priceReducer } from "./slices/price.slice";
import { networkReducer } from "./slices/network.slice";
import { walletsReducer } from "./slices/wallets.slice";
import { uiReducer } from "./slices/ui.slice";

import { listenerMiddleware } from "./store/middleware/listener";

const reducer = combineReducers({
  config: configReducer,
  price: priceReducer,
  network: networkReducer,
  wallets: walletsReducer,
  ui: uiReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistConfig = {
  key: "appRoot",
  version: 1,
  storage: storage("motostorage"),
  blacklist: [apiSlice.reducerPath, "network"],
};

const persistedReducer = persistReducer(persistConfig, reducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    })
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),

  // .prepend(listenerMiddleware.middleware)
});

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>;
// Export a reusable type for handwritten thunks
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;
