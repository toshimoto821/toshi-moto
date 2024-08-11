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
import {
  AddressArgs,
  AddressResponse,
  CirculatingSupplyResponse,
  PriceResponse,
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
      // queryFn: async ({ address }, queryApi) => {
      //   try {
      //     const state = queryApi.getState() as RootState;
      //     const nodeUrl = selectBaseNodeUrl(state);
      //     const url = `${nodeUrl}/api/address/${address}`;
      //     const response = await xhrRequest<AddressResponse>(url, {
      //       id: "getAddress",
      //     });
      //     const data: AddressResponse = response.data;

      //     return { data };
      //   } catch (error) {
      //     return { error: error as FetchBaseQueryError };
      //   }
      // },
    }),
    getTransactions: builder.query<
      TransactionsResponse,
      { address: string; walletId: string; queueId?: string }
    >({
      query: getTransactionQuery,
      // queryFn: async ({ address }, queryApi) => {
      //   try {
      //     const state = queryApi.getState() as RootState;
      //     const nodeUrl = selectBaseNodeUrl(state);
      //     const url = `${nodeUrl}/api/address/${address}/txs`;
      //     const response = await xhrRequest<TransactionsResponse>(url, {
      //       id: "getTransactions",
      //     });
      //     const data: TransactionsResponse = response.data;

      //     return { data };
      //   } catch (error) {
      //     return { error: error as FetchBaseQueryError };
      //   }
      // },
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

export const { getAddress, getTransactions } = apiSlice.endpoints;
