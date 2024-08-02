import {
  createAction,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@lib/store";

interface ConfigState {
  appVersion: string;
}

const initialState: ConfigState = {
  appVersion: "0.0.0",
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
