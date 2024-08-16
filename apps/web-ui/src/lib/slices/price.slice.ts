import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { apiSlice } from "./api.slice";
import type { RootState } from "../store";
import { type AppStartListening } from "../store/middleware/listener";
import { uiSlice } from "./ui.slice";

interface PriceState {
  btcPrice: number;
  last_updated_at: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  circulatingSupply: number;
  forecastPrices: IPrices;
  forecastModel: IForcastModelType | null;
}

export type IPrices = [number, number][];
export type IForcastModelType = "BEAR" | "BULL" | "CRAB" | "SAYLOR";

const initialState: PriceState = {
  btcPrice: 0,
  last_updated_at: 0,
  usd_24h_change: 0,
  usd_24h_vol: 0,
  circulatingSupply: 0,
  forecastPrices: [],
  forecastModel: null,
};

export const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    setForecast(
      state,
      action: PayloadAction<{
        forecastModel: IForcastModelType | null;
        forecastPrices?: IPrices;
      }>
    ) {
      state.forecastModel = action.payload.forecastModel;
      state.forecastPrices = action.payload.forecastPrices || [];
    },
  },
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

    builder.addMatcher(
      apiSlice.endpoints.getCirculatingSupply.matchFulfilled,
      (state, action) => {
        state.circulatingSupply = action.payload;
      }
    );
  },
});

export const { setForecast } = priceSlice.actions;
export const priceReducer = priceSlice.reducer;

export const selectBtcPrice = createSelector(
  (state: RootState) => state.price,
  (price) => ({
    btcPrice: price.btcPrice,
    last_updated_at: price.last_updated_at,
    usd_24h_change: price.usd_24h_change,
    circulatingSupply: price.circulatingSupply,
  })
);

export const selectForecast = (state: RootState) => ({
  forecastModel: state.price.forecastModel,
  forecastPrices: state.price.forecastPrices,
});

export const selectForecastPrice = createSelector(
  (state: RootState) => state.price.forecastModel,
  (state: RootState) => state.price.forecastPrices,
  (model, prices) => {
    if (model && prices.length) {
      return prices[prices.length - 1][1];
    }
    return null;
  }
);

////////////////////////////////////////
// Middleware
////////////////////////////////////////
export const addPriceListener = (startAppListening: AppStartListening) => {
  // @todo on changing time range, the forecast should be updated, not reset
  startAppListening({
    predicate: (action) => {
      return (
        uiSlice.actions.setUI.match(action) &&
        !!action.payload.graphTimeFrameRange
      );
    },
    effect: (_, { dispatch }) => {
      dispatch(
        setForecast({
          forecastModel: null,
          forecastPrices: [],
        })
      );
    },
  });
};
