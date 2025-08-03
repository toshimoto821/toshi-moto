import {
  createSlice,
  createSelector,
  PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  getPrice,
  getCirculatingSupply,
  getHistoricPriceDiff,
  getHistoricPrice,
  apiSlice,
} from "./api.slice";
import type { AppDispatch, RootState } from "../store";
import { roundUpToNearHour } from "./ui.slice";
import { type GraphTimeFrameRange } from "@lib/slices/ui.slice.types";
import { wait } from "../utils";
import { ICurrency } from "@root/types";
import { groupByHistoricCallback } from "./ui.slice";
import type { BinanceKlineMetric, PriceHistoricArgs } from "./api.slice.types";

const VITE_PRICING_STREAM_DISABLED = import.meta.env
  .VITE_PRICING_STREAM_DISABLED;

interface PriceState {
  btcPrice: number;
  last_updated_at: number;
  last_updated_stream_at: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  circulatingSupply: number;

  streamStatus: "CONNECTED" | "DISCONNECTED";
  streamPaused: boolean;
  priceDiffs: Record<GraphTimeFrameRange, number>;
}

export type IPrices = [number, number, number][];

const initialState: PriceState = {
  btcPrice: 0,
  last_updated_at: 0,
  last_updated_stream_at: 0,
  usd_24h_change: 0,
  usd_24h_vol: 0,
  circulatingSupply: 0,
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

    setPrice(state, action: PayloadAction<number>) {
      state.btcPrice = action.payload;
      state.last_updated_at = Date.now();
    },
    setLastUpdatedStreamAt(state, action: PayloadAction<number>) {
      state.last_updated_stream_at = action.payload;
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
          const curPrice = parseFloat(first.openPrice);
          const diff = state.btcPrice - curPrice;
          state.priceDiffs = state.priceDiffs || {};
          state.priceDiffs[range] = diff;
        }
      }
    });
  },
});

export const {
  setPrice,
  setStreamStatus,
  setStreamPause,
  setLastUpdatedStreamAt,
} = priceSlice.actions;
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

////////////////////////////////////////
/// WebSocket
////////////////////////////////////////

export const updatePricing = createAsyncThunk<
  void,
  { kline: BinanceKlineMetric },
  { dispatch: AppDispatch }
>("price/updatePricing", async ({ kline }, { dispatch, getState }) => {
  const state = getState() as RootState;
  const {
    graphStartDate,
    graphEndDate,
    graphTimeFrameRange,
    previousGraphTimeFrameRange,
    forecastEnabled,
  } = state.ui;

  // Skip price updates when forecast is enabled
  if (forecastEnabled) {
    return;
  }

  const { last_updated_stream_at } = state.price;

  const end = roundUpToNearHour(new Date(graphEndDate!));

  const from = Math.floor(graphStartDate! / 1000);
  const to = Math.floor(end.getTime() / 1000);
  const range = graphTimeFrameRange || previousGraphTimeFrameRange;

  const groupBy = groupByHistoricCallback(
    state.ui.graphTimeFrameRange!,
    state.ui.previousGraphTimeFrameRange,
    state.ui.breakpoint
  );
  const args: PriceHistoricArgs = {
    currency: "usd" as ICurrency,
    from,
    to,
    groupBy,
    range: graphTimeFrameRange!,
  };

  const now = Date.now();
  const gapBetweenNowAndChartEndTime = now - end.getTime();
  // console.log(diff, "diff");
  const timeSineLastTick = now - last_updated_stream_at;
  // only keep active if its greater than the
  if (range && (!last_updated_stream_at || timeSineLastTick > 1000 * 1)) {
    const isLive = shouldBeLive(range, gapBetweenNowAndChartEndTime);
    // console.log("isLive", isLive);
    if (isLive) {
      dispatch(setLastUpdatedStreamAt(now));
      dispatch(
        apiSlice.util.updateQueryData("getHistoricPrice", args, (draft) => {
          const current = [...draft.prices];
          const lastPrice = current[current.length - 1];

          // console.log("lastPrice", new Date(lastPrice[0]), lastPrice[1]);
          // console.log(
          //   "secondToLastPrice",
          //   new Date(secondToLastPrice[0]),
          //   secondToLastPrice[1]
          // );
          // const FIVE_MINUTES = 1000 * 60 * 5;

          const shouldAppend = kline.closeTime > lastPrice.closeTime;

          if (shouldAppend) {
            // console.log("ts: appending", new Date(eventTime), price);
            // const rounded = timeMinute(add(now, { seconds: 0 })).getTime();

            // current.push([now, price]);
            // console.log("new volume", parseFloat(kline.quoteAssetVolume));
            current.push(kline);
            current.shift();
          } else {
            // console.log("ts: replacing", now, kline);

            current[current.length - 1] = {
              ...kline,
            };
          }

          draft.prices = current;
        })
      );
    }
  }
});

let ws: WebSocket | null = null;
// let requestedSocketRange: GraphTimeFrameRange | null = null;
// let actualSocketRange: GraphTimeFrameRange | null = null;
interface OpenSocketProps {
  retry?: boolean;
  forceRange?: GraphTimeFrameRange;
}
export const openPriceSocket = createAsyncThunk<
  void,
  OpenSocketProps,
  { dispatch: AppDispatch }
>("price/openSocket", async (props, { dispatch, getState }) => {
  if (VITE_PRICING_STREAM_DISABLED) {
    return;
  }

  const { retry = true, forceRange } = props;
  if (ws) {
    if (ws.readyState === WebSocket.CONNECTING) {
      return;
    } else {
      ws.close();
    }
  }

  const state = getState() as RootState;

  const groupBy = groupByHistoricCallback(
    state.ui.graphTimeFrameRange!,
    state.ui.previousGraphTimeFrameRange,
    state.ui.breakpoint
  );

  ws = new WebSocket(
    `wss://data-stream.binance.vision:9443/ws/btcusdt@kline_${groupBy}`
  );
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
        dispatch(openPriceSocket({ retry: false, forceRange }));
      });
    }
  };
  try {
    dispatch(setLastUpdatedStreamAt(Date.now()));
    ws.onmessage = (e) => {
      if (!ws) return;
      const data = JSON.parse(e.data);
      if (data.e === "ping") {
        ws.send(JSON.stringify({ e: "pong", ...data }));
      } else {
        // console.log("data", data);
        // requestedSocketRange = data.k.i.toUpperCase() as GraphTimeFrameRange;
        const newPrice = parseFloat(data.k.c);
        const state = getState() as RootState;
        if (newPrice !== state.price.btcPrice) {
          dispatch(setPrice(newPrice));
          // cant use the volume from binance because its in usdt
          // whereas the volume in db is from coingeck and is usd.
          // @todo need to change the stream type when the chart type changes
          // so that i can listen to the kline stream and get the volume accurately
          // console.log("volume", volume);
          // console.log("range", data.k.i);
          // console.log("volume", volume);
          const kline: BinanceKlineMetric = {
            closePrice: data.k.c,
            closeTime: data.k.T,
            highPrice: data.k.h,
            lowPrice: data.k.l,
            openPrice: data.k.o,
            volume: data.k.v,
            quoteAssetVolume: data.k.q,
            numberOfTrades: data.k.n,
            openTime: data.k.t,
            takerBuyBaseAssetVolume: data.k.V,
            takerBuyQuoteAssetVolume: data.k.Q,
          };

          dispatch(updatePricing({ kline }));
        }
      }
    };
  } catch (e) {
    console.log("exception", e);
  }
});

export const shouldBeLive = (range: GraphTimeFrameRange, diff: number) => {
  // const FIVE_MINUTES = 1000 * 60 * 5;
  const FIFTEEN_MINUTES = 1000 * 60 * 15;
  const HOURLY = 1000 * 60 * 60;
  const DAILY = 1000 * 60 * 60 * 24;
  const WEEKLY = DAILY * 7;

  switch (range) {
    case "1D":
      return diff <= FIFTEEN_MINUTES * 2;
    case "1W":
      return diff <= HOURLY * 2;
    case "1M":
      return diff <= HOURLY * 24;
    case "3M":
      return diff <= DAILY;
    case "1Y":
      return diff <= DAILY * 3;
    case "2Y":
      return diff <= WEEKLY;
    case "5Y":
      return diff <= WEEKLY;
  }
};

export const shouldAppendPrice = (
  range: GraphTimeFrameRange,
  diff: number,
  breakpoint = 0
) => {
  const FIFTEEN_MINUTES = 1000 * 60 * 15;
  const HOURLY = 1000 * 60 * 60;
  const DAILY = 1000 * 60 * 60 * 24;
  const WEEKLY = DAILY * 7;
  const MONTHLY = DAILY * 30;

  // Desktop has different rules for chart blocks
  if (breakpoint > 2) {
    switch (range) {
      case "1D":
        return diff > FIFTEEN_MINUTES;
      case "1W":
        return diff > HOURLY * 2;
      case "1M":
        return diff > HOURLY * 6;
      case "3M":
        return diff > DAILY;
      case "1Y":
        return diff > DAILY * 3;
      case "2Y":
        return diff > WEEKLY;
      case "5Y":
        return diff > MONTHLY;
    }
  }

  // mobile
  switch (range) {
    case "1D":
      return diff > HOURLY;
    case "1W":
      return diff > HOURLY * 6;
    case "1M":
      return diff > DAILY;
    case "3M":
      return diff > DAILY * 3;
    case "1Y":
      return diff > WEEKLY;
    case "2Y":
      return diff > MONTHLY;
    case "5Y":
      return diff > MONTHLY;
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
