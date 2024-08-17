import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
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

export const { getAddress, getTransactions } = apiSlice.endpoints;

//////////////////////////////////////
// Selectors
//////////////////////////////////////
