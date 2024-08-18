import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { isAnyOf } from "@reduxjs/toolkit";
import { selectBaseApiUrl, selectBaseNodeUrl } from "./config.slice";
import type { RootState } from "../store";
import { ONE_HUNDRED_MILLION } from "../utils";
import type {
  AddressArgs,
  AddressResponse,
  CirculatingSupplyResponse,
  PriceResponse,
  PriceHistoryResponse,
  PriceHistoricArgs,
  TransactionsResponse,
} from "./api.slice.types";
import { setPrice } from "./price.slice";

export const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const endpoint = api.endpoint;
  let baseUrl = "";
  if (endpoint === "getAddress" || endpoint === "getTransactions") {
    baseUrl = selectBaseNodeUrl(state);
  } else {
    baseUrl = selectBaseApiUrl(state);
  }
  const baseQuery = fetchBaseQuery({ baseUrl });

  return baseQuery(args, api, extraOptions);
};

export const transformCirculatingSupply = (response: number) => {
  return response / ONE_HUNDRED_MILLION;
};

export const getPriceQuery = () => {
  const params = {
    ids: "bitcoin",
    vs_currencies: "usd",
    include_24hr_vol: "true",
    include_24hr_change: "true",
    include_last_updated_at: "true",
  };
  const queryString = new URLSearchParams(params).toString();
  return `/api/prices/simple?${queryString}`;
};

export const getCirculatingSupplyQuery = () =>
  "https://blockchain.info/q/totalbc";

export const getAddressQuery = (args: AddressArgs) => {
  return `/api/address/${args.address}`;
};

export const getTransactionQuery = ({ address }: AddressArgs) =>
  `/api/address/${address}/txs`;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getAddress: builder.query<AddressResponse, AddressArgs>({
      query: getAddressQuery,
    }),
    getTransactions: builder.query<
      TransactionsResponse,
      { address: string; walletId: string; queueId?: string }
    >({
      query: getTransactionQuery,
    }),
    getCirculatingSupply: builder.query<
      CirculatingSupplyResponse,
      { queueId?: string } | void
    >({
      query: getCirculatingSupplyQuery,
      transformResponse: transformCirculatingSupply,
    }),
    getPrice: builder.query<PriceResponse, { queueId?: string } | void>({
      query: getPriceQuery,
      async onCacheEntryAdded(_, api) {
        // @todo allow user to manaully disable streaming price.
        // const state = api.getState();

        await api.cacheDataLoaded;
        const ws = new WebSocket(
          "wss://data-stream.binance.vision:9443/ws/btcusdt@ticker"
        );

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
        try {
          ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.e === "ping") {
              ws.send(JSON.stringify({ e: "pong", ...data }));
            } else {
              const newPrice = parseFloat(data.c);
              api.dispatch(setPrice(newPrice));
            }
          };
        } catch (e) {
          console.log("exception", e);
        }

        await api.cacheEntryRemoved;
        ws.close();
      },
    }),
    getHistoricPrice: builder.query<PriceHistoryResponse, PriceHistoricArgs>({
      query: (args) => {
        const { from, to, groupBy, currency = "usd" } = args;
        return `/api/prices/range?vs_currency=${currency}&from=${from}&to=${to}&group_by=${groupBy}`;
      },
    }),
  }),
});

export const {
  useGetPriceQuery,
  useGetHistoricPriceQuery,
  useGetCirculatingSupplyQuery,
} = apiSlice;

export const { getAddress, getTransactions, getPrice, getCirculatingSupply } =
  apiSlice.endpoints;

//////////////////////////////////////
// actions
//////////////////////////////////////

export const API_REQUEST_FULFILLED = isAnyOf(
  getAddress.matchFulfilled,
  getTransactions.matchFulfilled,
  getPrice.matchFulfilled,
  getCirculatingSupply.matchFulfilled
);

export const API_REQUEST_REJECTED = isAnyOf(
  getAddress.matchRejected,
  getTransactions.matchRejected,
  getPrice.matchRejected,
  getCirculatingSupply.matchRejected
);

export const API_REQUEST_PENDING = isAnyOf(
  getAddress.matchPending,
  getTransactions.matchPending,
  getPrice.matchPending,
  getCirculatingSupply.matchPending
);

export const API_REQUEST_FULFILLED_REJECTED = isAnyOf(
  getAddress.matchFulfilled,
  getAddress.matchRejected,
  getTransactions.matchFulfilled,
  getTransactions.matchRejected,
  getPrice.matchFulfilled,
  getPrice.matchRejected,
  getCirculatingSupply.matchFulfilled,
  getCirculatingSupply.matchRejected
);
