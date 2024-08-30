import {
  createAction,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@lib/store";
import { getBitcoinNodeUrl } from "../utils";
import { getConfig } from "./api.slice";
import type { Config } from "./api.slice.types";

const historicPriceUrl = import.meta.env.VITE_COINGECKO_API_URL;
const priceUrl = import.meta.env.VITE_COINGECKO_PRICE_API_URL;

const nodeUrl = getBitcoinNodeUrl();
const apiUrl = import.meta.env.VITE_API_URL;
const conconcurrentRequests = import.meta.env.VITE_MAX_CONCURRENT_REQUESTS;
const timeBetweenRequests = import.meta.env.VITE_REST_TIME_BETWEEN_REQUESTS;

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
  pushNotifications: {
    enabled: boolean;
    publicKey: string;
  };
  configs: Config[];
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
    conconcurrentRequests,
    timeBetweenRequests,
  },
  pushNotifications: {
    enabled: false,
    publicKey: "",
  },
  configs: [],
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
      const pushNotifications = {
        ...state.pushNotifications,
        ...action.payload.pushNotifications,
      };
      return {
        ...state,
        api: {
          ...apiConfig,
        },
        network: {
          ...networkConfig,
        },
        pushNotifications: {
          ...pushNotifications,
        },
      };
    },
  },
  extraReducers(builder) {
    builder.addMatcher(getConfig.matchFulfilled, (state, action) => {
      const publicKeyConfig = action.payload.configs.find(
        (config) => config.key === "push.public-key"
      );
      if (publicKeyConfig) {
        state.pushNotifications = state.pushNotifications || {
          enabled: false,
          publicKey: "",
        };
        state.pushNotifications.publicKey = publicKeyConfig.value;
      }
      state.configs = action.payload.configs;
    });
  },
});
export const { setConfig } = configSlice.actions;
export const configReducer = configSlice.reducer;

export const selectAppVersion = (state: RootState) => state.config.appVersion;
export const setAppVersion = createAction<string>("config/setAppVersion");
export const selectApiConfig = (state: RootState) => state.config.api;
export const selectPushNotificationsConfig = (state: RootState) =>
  state.config.pushNotifications;
export const selectNetworkConfig = (state: RootState) => state.config.network;

export const selectBaseNodeUrl = (state: RootState) => state.config.api.nodeUrl;
export const selectBaseApiUrl = (state: RootState) => state.config.api.url;
