import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "./api.slice";
import type { RootState } from "../store";

interface PriceState {
  btcPrice: number;
  last_updated_at: number;
  usd_24h_change: number;
  usd_24h_vol: number;
}

const initialState: PriceState = {
  btcPrice: 0,
  last_updated_at: 0,
  usd_24h_change: 0,
  usd_24h_vol: 0,
};

export const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addMatcher(
      apiSlice.endpoints.getPrice.matchFulfilled,
      (state, action) => {
        state.btcPrice = action.payload.bitcoin.usd;
        state.last_updated_at = action.payload.bitcoin.last_updated_at * 1000;
        state.usd_24h_change = action.payload.bitcoin.usd_24h_change;
        state.usd_24h_vol = action.payload.bitcoin.usd_24h_vol;
      }
    );
  },
});

export const priceReducer = priceSlice.reducer;

export const selectBtcPrice = (state: RootState) => ({
  btcPrice: state.price.btcPrice,
  last_updated_at: state.price.last_updated_at,
  usd_24h_change: state.price.usd_24h_change,
});
