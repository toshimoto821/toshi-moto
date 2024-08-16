import {
  createAction,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@lib/store";

const historicPriceUrl = import.meta.env.VITE_COINGECKO_API_URL;
const priceUrl = import.meta.env.VITE_COINGECKO_PRICE_API_URL;

const nodeUrl = import.meta.env.VITE_BITCOIN_NODE_URL;
const apiUrl = import.meta.env.VITE_API_URL;

export interface ConfigState {
  appVersion: string;
  api: {
    priceUrl: string;
    historicPriceUrl: string;
    nodeUrl: string;
    url: string;
  };
  network: {
    conconcurrentRequests: number;
    timeBetweenRequests: number;
  };
}

export const initialState: ConfigState = {
  appVersion: "0.0.0",
  api: {
    priceUrl,
    historicPriceUrl,
    nodeUrl,
    url: apiUrl,
  },
  network: {
    conconcurrentRequests: 4,
    timeBetweenRequests: 0,
  },
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setAppVersion: (state, action: PayloadAction<string>) => {
      state.appVersion = action.payload;
    },
    setConfig(state, action: PayloadAction<Partial<ConfigState>>) {
      const apiConfig = {
        ...state.api,
        ...action.payload.api,
      };
      const networkConfig = {
        ...state.network,
        ...action.payload.network,
      };
      return {
        ...state,
        api: {
          ...apiConfig,
        },
        network: {
          ...networkConfig,
        },
      };
    },
  },
});
export const { setConfig } = configSlice.actions;
export const configReducer = configSlice.reducer;

export const selectAppVersion = (state: RootState) => state.config.appVersion;
export const setAppVersion = createAction<string>("config/setAppVersion");
export const selectApiConfig = (state: RootState) => state.config.api;
export const selectNetworkConfig = (state: RootState) => state.config.network;

export const selectBaseNodeUrl = (state: RootState) => state.config.api.nodeUrl;
export const selectBaseApiUrl = (state: RootState) => state.config.api.url;
