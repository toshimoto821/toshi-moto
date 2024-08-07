import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  QueryReturnValue,
  BaseQueryApi,
} from "@reduxjs/toolkit/query/react";
import { xhrRequest } from "@root/lib/utils";
import { selectBaseApiUrl, selectBaseNodeUrl } from "./config.slice";
import type { RootState } from "../store";
import { ONE_HUNDRED_MILLION } from "../utils";

export const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;

  const baseUrl = selectBaseApiUrl(state);
  const baseQuery = fetchBaseQuery({ baseUrl });
  return baseQuery(args, api, { ...extraOptions });
};

export interface PriceResponse {
  bitcoin: {
    last_updated_at: number;
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
  };
}

export interface AddressResponse {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

export type CirculatingSupplyResponse = number;

export type APIResponse = PriceResponse | CirculatingSupplyResponse;

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

const queryFn = async (
  address: string,
  api: BaseQueryApi
): Promise<
  // eslint-disable-next-line @typescript-eslint/ban-types
  QueryReturnValue<AddressResponse, FetchBaseQueryError, {} | undefined>
> => {
  console.log(api);
  try {
    const state = api.getState() as RootState;
    const nodeUrl = selectBaseNodeUrl(state);
    const url = `${nodeUrl}/api/address/${address}`;
    const response = await xhrRequest<AddressResponse>(url, {
      id: "getAddress",
    });

    return { data: response };
  } catch (error) {
    return { error: error as FetchBaseQueryError };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getAddress: builder.query<string, string>({
      queryFn,
    }),

    getCirculatingSupply: builder.query<CirculatingSupplyResponse, void>({
      query: getCirculatingSupplyQuery,
      transformResponse: transformCirculatingSupply,
    }),
    getPrice: builder.query<PriceResponse, void>({
      query: getPriceQuery,
    }),
    getHistoricPrice: builder.mutation({
      query: () => "/api/prices/range",
    }),
  }),
});

export const {
  useGetPriceQuery,
  useGetHistoricPriceMutation,
  useGetCirculatingSupplyQuery,
} = apiSlice;

export const { getAddress } = apiSlice.endpoints;
