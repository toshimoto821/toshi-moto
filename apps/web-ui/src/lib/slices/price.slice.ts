import {
  createSlice,
  createSelector,
  PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { add } from "date-fns";
import {
  getPrice,
  getCirculatingSupply,
  getHistoricPriceDiff,
  getHistoricPrice,
  apiSlice,
} from "./api.slice";
import type { AppDispatch, RootState } from "../store";
import { type AppStartListening } from "../store/middleware/listener";
import { uiSlice, roundUpToNearHour } from "./ui.slice";
import { type GraphTimeFrameRange } from "@lib/slices/ui.slice.types";
import { wait } from "../utils";
import { ICurrency } from "@root/types";
import type { PriceHistoricArgs } from "./api.slice.types";
import { timeMinute } from "d3";

interface PriceState {
  btcPrice: number;
  last_updated_at: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  circulatingSupply: number;
  forecastPrices: IPrices;
  forecastModel: IForcastModelType | null;
  streamStatus: "CONNECTED" | "DISCONNECTED";
  streamPaused: boolean;
  priceDiffs: Record<GraphTimeFrameRange, number>;
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
  streamStatus: "DISCONNECTED",
  streamPaused: false,
  priceDiffs: {
    "1D": 0,
    "1W": 0,
    "1M": 0,
    "3M": 0,
    "1Y": 0,
    "2Y": 0,
    "5Y": 0,
  },
};

export const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    setStreamStatus(state, action: PayloadAction<PriceState["streamStatus"]>) {
      state.streamStatus = action.payload;
    },
    setStreamPause(state, action: PayloadAction<boolean>) {
      state.streamPaused = action.payload;
    },
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

    builder.addMatcher(getHistoricPriceDiff.matchFulfilled, (state, action) => {
      const value = action.payload.data.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.period]: cur.diff,
        };
      }, {} as Record<GraphTimeFrameRange, number>);

      state.priceDiffs = value;
    });

    builder.addMatcher(getHistoricPrice.matchFulfilled, (state, action) => {
      // console.log("action", action);
      const { range } = action.payload.meta || {};
      if (range) {
        const prices = action.payload.prices || [];
        const [first] = prices;

        // const last = prices[prices.length - 1];
        if (first) {
          const diff = state.btcPrice - first[1];
          state.priceDiffs = state.priceDiffs || {};
          state.priceDiffs[range] = diff;
        }
      }
    });
  },
});

export const { setForecast, setPrice, setStreamStatus, setStreamPause } =
  priceSlice.actions;
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
export const openPriceSocket = createAsyncThunk<
  void,
  boolean,
  { dispatch: AppDispatch }
>("price/openSocket", async (retry, { dispatch, getState }) => {
  if (ws) {
    if (ws.readyState === WebSocket.CLOSED) {
      console.log("closing ws");
      dispatch(setStreamStatus("DISCONNECTED"));
      ws.close();
      ws = null;
    } else {
      return;
    }
  }

  ws = new WebSocket("wss://data-stream.binance.vision:9443/ws/btcusdt@ticker");
  dispatch(setStreamStatus("CONNECTED"));
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);

    // dispatch(
    //   showToast({
    //     line1: "Websocket Error",
    //     // @ts-expect-error message
    //     line2: JSON.stringify(error.message),
    //   })
    // );
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
        const state = getState() as RootState;
        if (newPrice !== state.price.btcPrice) {
          dispatch(setPrice(newPrice));
        }
        // const inputs = setGraphByRange(state.ui.graphTimeFrameRange!);
        // need to stream prices to chart as well

        const {
          graphStartDate,
          graphEndDate,
          graphTimeFrameGroup,
          graphTimeFrameRange,
          previousGraphTimeFrameRange,
        } = state.ui;

        const end = roundUpToNearHour(new Date(graphEndDate!));

        const from = Math.floor(graphStartDate! / 1000);
        const to = Math.floor(end.getTime() / 1000);
        const range = graphTimeFrameRange || previousGraphTimeFrameRange;
        const args: PriceHistoricArgs = {
          currency: "usd" as ICurrency,
          from,
          to,
          groupBy: graphTimeFrameGroup!,
          range: graphTimeFrameRange!,
        };
        const eventTime: number = data.E;
        const now = Date.now();
        const diff = now - graphEndDate;

        // only keep active if its greater than the
        if (range) {
          const isLive = shouldBeLive(range, diff);
          // console.log("isLive", isLive);
          if (isLive) {
            dispatch(
              apiSlice.util.updateQueryData(
                "getHistoricPrice",
                args,
                (draft) => {
                  const current = [...draft.prices];
                  const lastPrice = current[current.length - 1];
                  const secondToLastPrice = current[current.length - 2];
                  const diff = lastPrice[0] - secondToLastPrice[0];
                  // console.log(
                  //   "lastPrice",
                  //   new Date(lastPrice[0]),
                  //   lastPrice[1]
                  // );
                  // console.log(
                  //   "secondToLastPrice",
                  //   new Date(secondToLastPrice[0]),
                  //   secondToLastPrice[1]
                  // );
                  // const FIVE_MINUTES = 1000 * 60 * 5;

                  const shouldAppend = shouldAppendPrice(range, diff);
                  if (shouldAppend) {
                    // console.log("appending", new Date(eventTime), newPrice);
                    const rounded = timeMinute(
                      add(new Date(eventTime), { seconds: 30 })
                    ).getTime();

                    current.push([rounded, newPrice]);
                    current.shift();
                  } else {
                    // console.log("replacing", new Date(eventTime), newPrice);
                    current[current.length - 1] = [eventTime, newPrice];
                  }

                  draft.prices = current;
                }
              )
            );
          }
        }
      }
    };
  } catch (e) {
    console.log("exception", e);
  }
});

export const shouldBeLive = (range: GraphTimeFrameRange, diff: number) => {
  const FIVE_MINUTES = 1000 * 60 * 5;
  const HOURLY = 1000 * 60 * 60;
  const DAILY = 1000 * 60 * 60 * 24;
  const WEEKLY = DAILY * 7;

  switch (range) {
    case "1D":
      return diff <= FIVE_MINUTES * 2;
    case "1W":
      return diff <= HOURLY * 2;
    case "1M":
      return diff <= HOURLY * 2;
    case "3M":
      return diff <= DAILY;
    case "1Y":
      return diff <= DAILY;
    case "2Y":
      return diff <= WEEKLY;
    case "5Y":
      return diff <= WEEKLY;
  }
};

export const shouldAppendPrice = (range: GraphTimeFrameRange, diff: number) => {
  const FIVE_MINUTES = 1000 * 60 * 5;
  const HOURLY = 1000 * 60 * 60;
  const DAILY = 1000 * 60 * 60 * 24;
  const WEEKLY = DAILY * 7;

  switch (range) {
    case "1D":
      return diff >= FIVE_MINUTES;
    case "1W":
      return diff >= HOURLY;
    case "1M":
      return diff >= HOURLY;
    case "3M":
      return diff >= DAILY;
    case "1Y":
      return diff >= DAILY;
    case "2Y":
      return diff >= WEEKLY;
    case "5Y":
      return diff >= WEEKLY;
  }
};

export const closePriceSocket = createAsyncThunk(
  "price/closeSocket",
  async (_, { dispatch }) => {
    dispatch(setStreamStatus("DISCONNECTED"));
    if (ws) {
      ws.close();
      ws = null;
    }
  }
);
