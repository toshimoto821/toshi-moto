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
  },
});

export const configReducer = configSlice.reducer;

export const selectAppVersion = (state: RootState) => state.config.appVersion;
export const setAppVersion = createAction<string>("config/setAppVersion");

export const selectBaseNodeUrl = (state: RootState) => state.config.api.nodeUrl;
export const selectBaseApiUrl = (state: RootState) => state.config.api.url;
