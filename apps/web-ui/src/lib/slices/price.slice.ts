import {
  createSlice,
  createSelector,
  PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { getPrice, getCirculatingSupply } from "./api.slice";
import type { RootState } from "../store";
import { type AppStartListening } from "../store/middleware/listener";
import { showToast, uiSlice } from "./ui.slice";
import { wait } from "../utils";

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
    setPrice(state, action: PayloadAction<number>) {
      state.btcPrice = action.payload;
      state.last_updated_at = Date.now();
    },
  },
  extraReducers(builder) {
    builder.addMatcher(getPrice.matchFulfilled, (state, action) => {
      state.btcPrice = action.payload.bitcoin.usd;
      state.last_updated_at = action.payload.bitcoin.last_updated_at * 1000;
      state.usd_24h_change = action.payload.bitcoin.usd_24h_change;
      state.usd_24h_vol = action.payload.bitcoin.usd_24h_vol;
    });

    builder.addMatcher(getCirculatingSupply.matchFulfilled, (state, action) => {
      state.circulatingSupply = action.payload;
    });
  },
});

export const { setForecast, setPrice } = priceSlice.actions;
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

export const selectForecast = createSelector(
  (state: RootState) => state.price.forecastModel,
  (state: RootState) => state.price.forecastPrices,
  (forecastModel, forecastPrices) => {
    return {
      forecastModel,
      forecastPrices,
    };
  }
);

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

////////////////////////////////////////
/// WebSocket
////////////////////////////////////////
let ws: WebSocket | null = null;
export const openPriceSocket = createAsyncThunk<void, boolean>(
  "price/openSocket",
  async (retry, { dispatch }) => {
    if (ws) {
      if (ws.readyState === WebSocket.CLOSED) {
        console.log("closing ws");
        ws.close();
        ws = null;
      } else {
        return;
      }
    }

    ws = new WebSocket(
      "wss://data-stream.binance.vision:9443/ws/btcusdt@ticker"
    );

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);

      dispatch(
        showToast({
          line1: "Websocket Error",
          // @ts-expect-error message
          line2: JSON.stringify(error.message),
        })
      );
      dispatch(closePriceSocket());
      if (retry) {
        wait(1000).then(() => {
          dispatch(openPriceSocket(false));
        });
      }
    };
    try {
      ws.onmessage = (e) => {
        if (!ws) return;
        const data = JSON.parse(e.data);
        if (data.e === "ping") {
          ws.send(JSON.stringify({ e: "pong", ...data }));
        } else {
          const newPrice = parseFloat(data.c);

          dispatch(setPrice(newPrice));
        }
      };
    } catch (e) {
      console.log("exception", e);
    }
  }
);

export const closePriceSocket = createAsyncThunk(
  "price/closeSocket",
  async () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  }
);
