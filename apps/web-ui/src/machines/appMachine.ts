import { assign, sendTo, enqueueActions, setup, raise } from "xstate";
import * as d3 from "d3";
import { assertEvent } from "xstate-helpers";
import { sub, add } from "date-fns";
import dotProp from "dot-prop-immutable";
import { utxoMachine } from "./utxoMachine";
import { ICurrency } from "@root/types";
import { merge } from "lodash";
import {
  ITxLite,
  type IWalletInput,
  type ITxsInput,
  type AddressMeta,
} from "../models/Wallet";
import type {
  APP_MACHINE_ADD_WALLET,
  APP_MACHINE_FETCH_UTXO,
} from "./global.types";
// import { Utxo } from "@models/Utxo";
import { IRequest, IResponse } from "./network.types";
import { networkLoggerMachine } from "@machines/networkLoggerMachine";
import { colorScale } from "@components/graphs/graph-utils";
import { type IPrices } from "./btcHistoricPriceMachine";

const VITE_BITCOIN_NODE_URL = import.meta.env.VITE_BITCOIN_NODE_URL;
const VITE_REST_TIME_BETWEEN_REQUESTS = import.meta.env
  .VITE_REST_TIME_BETWEEN_REQUESTS;
const VITE_MAX_CONCURRENT_REQUESTS = import.meta.env
  .VITE_MAX_CONCURRENT_REQUESTS;

const VITE_COINGECKO_API_URL = import.meta.env.VITE_COINGECKO_API_URL;
const VITE_COINGECKO_PRICE_API_URL = import.meta.env
  .VITE_COINGECKO_PRICE_API_URL;

const TXS_LIMIT = 10;

// if (!/local/.test(window.location.hostname)) {
//   VITE_COINGECKO_PRICE_API_URL = `https://api.toshimoto.app${VITE_COINGECKO_PRICE_API_URL}`;
// }
// if (!/local/.test(window.location.hostname)) {
//   VITE_COINGECKO_API_URL = `https://api.toshimoto.app${VITE_COINGECKO_API_URL}`;
// }

// console.log(VITE_COINGECKO_PRICE_API_URL);

// @todo remove this. its duplicated from Utxo model
export type IUtxoInput = {
  walletId?: string;
  address: string;
  xpub?: string;
  xpubs?: string[];
  transactions?: string[];
  isChange?: boolean;
  manual?: boolean;
  index?: number;
  accountType?: "SINGLE_SIG" | "MULTI_SIG";
  status?: string;
  loading?: boolean;
  ttl?: number;
  id?: string;
};

const setAddresses = (
  addresses: Record<string, IUtxoRequest>,
  data: IUtxoInput | IUtxoInput[]
): Record<string, IUtxoRequest> => {
  if (Array.isArray(data)) {
    // return data.reduce((acc, cur) => setUtxo(acc, cur), {});
    const ret = data.reduce((acc, cur) => {
      return setAddresses(acc, cur);
    }, addresses) as Record<string, IUtxoRequest>;
    return ret;
  } else {
    return {
      ...addresses,
      [data.address]: {
        ...(addresses[data.address] || {}),
        address: data.address,
        status: data.status ?? addresses[data.address]?.status,
        loading: data.loading ?? addresses[data.address]?.loading,
      },
    } as Record<string, IUtxoRequest>;
  }
};

const paginationFilter = (wallet: IWalletInput, address: IUtxoInput) => {
  if (!address) return false;
  if (address.manual) return true;
  if (typeof address.index === "undefined") return false;
  if (!wallet.changeMeta) return true;
  if (!wallet.receiveMeta) return true;
  if (address.isChange) {
    if (
      address.index >
      wallet.changeMeta.startIndex + wallet.changeMeta.limit
    ) {
      return false;
    }
    if (address.index < wallet.changeMeta.startIndex) {
      return false;
    }
    return true;
  }

  if (address.index < wallet.receiveMeta.startIndex) {
    return false;
  }

  if (
    address.index >
    wallet.receiveMeta.startIndex + wallet.receiveMeta.limit
  ) {
    return false;
  }
  return true;
};

export type ICreateRequestOpts = {
  // for txs, pagination works with after_txid
  // http://umbrel.local:3006/api/address/32ixEdVJWo3kmvJGMTZq5jAQVZZeuwnqzo/txs?after_txid=e8cedac888bf131b6b0b59090afffd9d822d623061195bc863be19dc4ce6e337
  utxoAfterTxid?: string;
};
const createUtxoRequestObject = (
  data: IUtxoInput & { config: IAppMetaConfig },
  type: "utxo" | "txs" = "utxo",
  opts: ICreateRequestOpts = {}
) => {
  // @todo make dynamic from settings
  let txsChain = "";
  if (type === "txs" && opts.utxoAfterTxid) {
    txsChain = `/chain/${opts.utxoAfterTxid}`;
  }

  const url =
    type === "utxo"
      ? `${data.config?.bitcoinNodeUrl ?? VITE_BITCOIN_NODE_URL}/api/address/${
          data.address
        }`
      : `${data.config?.bitcoinNodeUrl ?? VITE_BITCOIN_NODE_URL}/api/address/${
          data.address
        }/txs${txsChain}`;

  return {
    url,
    id: data.id ?? new Date().getTime().toString(),
    meta: {
      walletId: data.walletId,
      address: data.address,
      type,
      // cache: data.cache,
      ttl: data.ttl ?? 1000 * 60 * 60 * 24, // 1 day ttl default
    },
  } as IRequest;
};

export type IAppMetaConfig = {
  bitcoinNodeUrl: string;
  historicalPriceUrl: string;
  priceUrl: string;
  restTimeBetweenRequests: number;
  maxConcurrentRequests: number;
};

export type IUtxoRequest = {
  address: string;
  response?: IResponse;
  status: string;
  loading: boolean;
  ttl?: number;
};

export type IAppAddressFilters = {
  change: boolean;
  receive: boolean;
  utxoOnly: boolean;
  // this are addresses that are the first to receive btc
  // externally, not from a wallet or sibling wallet
  // inputAddresses: boolean;
};

export type IChartTimeframeGroups = "5M" | "1H" | "1D" | "1W" | "1M";

export type IChartTimeFrameRange =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "1Y"
  | "2Y"
  | "5Y"
  | "ALL";

export type IForcastModelType = "BEAR" | "BULL" | "CRAB" | "SAYLOR";

export type AppMachineMeta = {
  ready: boolean;
  // this is how to group the metrics
  // for example, 1D is 5M
  chartTimeframeGroup: IChartTimeframeGroups;
  // this is what is visible to user, not what the
  // metrics are grouped by
  // null is when a user picks an exact date;
  chartTimeFrameRange: IChartTimeFrameRange | null;
  chartStartDate: number;
  chartEndDate: number;
  appVersion: string;
  forcastModel: IForcastModelType | null;
  windowFocusTimestamp: number;
  netAssetValue: boolean;
  addressFilters: IAppAddressFilters;
  balanceVisible: boolean;
  config: IAppMetaConfig;
  showPlotDots: boolean;
  showBtcAllocation: boolean;
  currency: ICurrency;
  privatePrice: boolean;
};

export const appMachine = setup({
  types: {} as {
    context: {
      btcWallets: IWalletInput[];
      subscribers: Record<string, any>;
      transactions: ITxsInput; // @todo type
      addresses: Record<string, IUtxoRequest>;
      meta: AppMachineMeta;
      forcastPrices: IPrices;

      // @deprecated
      utxos: Record<string, IUtxoRequest>;
      wallets: Record<string, IWalletInput>;
      data: any;

      networkLoggerRef: any;
      raw: any;
      utxoMachineRef: any;
      selectedTxs: Set<string>;
      selectedWalletsUtxos: Set<string>;
    };
    events:
      | {
          type: "APP_MACHINE_TOAST";
          data: {
            message: {
              line1: string;
              line2: string;
              action: {
                text: string;
                altText: string;
                onClick: () => void;
              };
            };
          };
        }
      | {
          type: "APP_MACHINE_TRIM_WALLET_ADDRESSES";
          data: {
            walletId: string;
            addressType: "CHANGE" | "RECEIVE";
            index: number;
          };
        }
      | {
          type: "APP_MACHINE_UPDATE_CHART_RANGE_BY_DATE";
          data: { chartStartDate: number; chartEndDate: number };
        }
      | {
          type: "APP_MACHINE_UPDATE_CHART_RANGE";
          data: { group: IChartTimeFrameRange };
        }
      | {
          type: "APP_MACHINE_ZOOM_TO_DATE";
          data: {
            date: number;
            direction: "IN" | "OUT";
          };
        }
      | {
          type: "APP_MACHINE_UPDATE_META";
          data: { meta: Partial<AppMachineMeta> };
        }
      | {
          type: "APP_MACHINE_UPDATE_FORCAST_MODEL";
          data: {
            forcastModel: IForcastModelType | null;
            forcastPrices: IPrices;
          };
        }
      | { type: "APP_MACHINE_UPDATE_APP_VERSION"; data: { appVersion: string } }
      | { type: "APP_MACHINE_TOGGLE_NET_ASSET_VALUE" }
      | {
          type: "APP_MACHINE_REHYDRATE";
          data: {
            context: {
              btcWallets: IWalletInput[];
              addresses: Record<string, IUtxoRequest>;
              transactions: ITxsInput;
              selectedTxs: Set<string>;
              meta: AppMachineMeta;
            };
          };
        }
      | {
          type: "APP_MACHINE_CHANGE_ADDRESS_FILTER";
          data: { filter: IAppAddressFilters; walletId: string };
        }
      | { type: "APP_MACHINE_UTXO_RECEIVER"; data: any }
      | {
          type: "APP_MACHINE_FETCH_WALLETS_UTXOS";
          data?: {
            walletId: string;
            xpub?: string;
            xpubs?: string[];
            bypassCache?: boolean;
            ttl?: number;
            addressType?: "CHANGE" | "RECEIVE";
            accountType?: "MULTI_SIG" | "SINGLE_SIG";
            changeStart?: number;
            changeLimit?: number;
            receiveStart?: number;
            receiveLimit?: number;

            utxos?: string[];
          };
        }
      | APP_MACHINE_FETCH_UTXO
      | APP_MACHINE_ADD_WALLET
      | {
          type: "APP_MACHINE_SET_XPUB_UTXOS";
          data: {
            walletId: string;
            xpub?: string;
            xpubs?: string[];
            utxos: Record<string, IUtxoInput>;
            addressType?: "CHANGE" | "RECEIVE";
            accountType?: "MULTI_SIG" | "SINGLE_SIG";
            receiveStart: number;
            receiveLimit: number;
            changeStart: number;
            changeLimit: number;
            bypassCache: boolean;
          };
        }
      | {
          type: "APP_MACHINE_UPDATE_WALLET_PAGINATION_LIMIT";
          data: {
            walletId: string;
            addressType: "CHANGE" | "RECEIVE";
            incrementOrDecrement: number;
          };
        }
      | {
          type: "APP_MACHINE_SET_WALLET_PAGINATION";
          data: {
            walletId: string;
            addressType: "CHANGE" | "RECEIVE";
            startIndex?: number;
            minStartIndex?: number; // used for scrolling to hidden addresses
            minLimitIndex?: number; // used for scrolling to hidden addresses
            limit?: number;
          };
        }
      | {
          type: "APP_MACHINE_EMPTY_QUEUE";
        }
      | {
          type: "APP_MACHINE_TOGGLE_SELECTED_TX";
          data: { txid: string };
        }
      | {
          type: "APP_MACHINE_TOGGLE_SELECTED_TXS";
          data: { txids: string[]; walletId: string };
        }
      | {
          type: "APP_MACHINE_CHANGE_SELECTED_TXS";
          data: { txids: string[]; selected: boolean };
        }
      | {
          type: "APP_MACHINE_CLEAR_SELECTED_TXS";
        }
      | {
          type: "APP_MACHINE_DELETE_WALLET";
          data: { walletId: string };
        }
      | {
          type: "xstate.done.actor.fetcher";
          output: {
            requests: IRequest[];
            responses: IResponse[];
          };
        }
      | {
          type: "UNSUBSCRIBE";
          data: any;
        }
      | {
          type: "SUBSCRIBE";
          data: any;
        }
      | {
          type: "ADD_ADDRESS";
          data: { address: string };
        }
      | {
          type: "RESPONSE";
          data: any;
        }
      | {
          type: "REQUEST";
          data: any;
        }
      | {
          type: "ERROR";
          data: any;
        }
      | {
          type: "RETRY";
          data: { address: string };
        }
      | {
          type: "LOGGER";
          data: any;
        }
      | {
          type: "SET_REQUEST_ACTOR";
          data: any;
        };
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqCyyDGALAlgHZgDEAygKoBCZAwgEoCSVAogNoAMAuoqKgPax8AF3z9CvEAA9EHADQgAnrIC+KhWkw4CxEhQBylGg2btukgUNHjJMhPKWr1ITVjxFSAGQDyAcV8s9Jw8SCCWImISoXYOyvZqGuhuOqQAggAi6QD6AOqpnp4sACrBFoIRNtGyCnEcCS5J2h4kvj5U+VkAYsW0ABJZFEUAGt6loeHWUaAxNU6JWu66rd7tnln0LACKFCxkResstCyMAGqBY3zlk7aIAKwAnAB097cAHAAsAMz3AIwATBxPn93i93rMEO8fo8fq9bgA2QG-Dj3Dh-OGfequJrER4AMzAwjwtH4AFtUAAbAmkC5hK6RG72cF1eqEfgQOCSLGLMBlKz0qoIAC071e4MFPwR0L+wI4AHYXvdZbKPnDMY1uY8iCJeRUptJqo4EDK1QsUniCYsoDrrgL3rd3o9Pk6JbKvu93krRYagQ73n8fnb-rDXnKfrKTckPObCbhiWTKcIeeM6ZVpohPvLHSGJQiYX6QeD7k84bL-qjbhL7t8-uG1CogA */
  id: "appMachine",
  initial: "init",
  context: ({ input }: { input: any }) => ({
    btcWallets: [],
    subscribers: {},
    addresses: {},
    transactions: { txs: {}, addr: {} },
    meta: {
      ready: false,
      netAssetValue: false,
      chartTimeframeGroup: "1D",
      chartTimeFrameRange: "5Y",
      chartStartDate: d3.timeDay(sub(new Date(), { years: 5 })).getTime(),
      chartEndDate: d3.timeDay(add(new Date(), { hours: 1 })).getTime(),
      forcastModel: null,
      forcastPrices: [],
      appVersion: "",
      balanceVisible: false,
      showPlotDots: true,
      showBtcAllocation: true,
      currency: "usd",
      windowFocusTimestamp: 0,
      privatePrice: false,
      addressFilters: {
        utxoOnly: false,
        change: true,
        receive: true,
        // inputAddresses: false,
      },
      config: {
        bitcoinNodeUrl: VITE_BITCOIN_NODE_URL,
        historicalPriceUrl: VITE_COINGECKO_API_URL,
        priceUrl: VITE_COINGECKO_PRICE_API_URL,
        maxConcurrentRequests: VITE_MAX_CONCURRENT_REQUESTS,
        restTimeBetweenRequests: VITE_REST_TIME_BETWEEN_REQUESTS,
      },
    },
    forcastPrices: [],
    selectedTxs: new Set(input?.selectedTxs),
    // @deprecated
    utxos: {},
    wallets: {},
    raw: null,
    networkLoggerRef: null,
    data: null,
    utxoMachineRef: null,

    selectedWalletsUtxos: new Set(input?.selectedWalletsUtxos),
  }),

  invoke: [
    // @ts-expect-error - not sure why this started erroring in ts, but it works
    {
      id: "utxoMachine",
      src: utxoMachine,
    },
    // @ts-expect-error - not sure why this started erroring in ts, but it works
    {
      id: "networkMachine",
      src: networkLoggerMachine,
    },
    // {
    //   id: "btcPriceMachine",
    //   src: btcPriceMachine,
    // },
  ],
  states: {
    init: {},
    fetchingUtxo: {
      entry: [
        assign({
          addresses: ({ context, event }) => {
            assertEvent(event, "APP_MACHINE_FETCH_UTXO");
            return setAddresses(context.addresses, {
              ...event.data,
              status: "loading",
              loading: true,
            });
          },
        }),
        sendTo("utxoMachine", ({ event, context }) => {
          assertEvent(event, "APP_MACHINE_FETCH_UTXO");

          return {
            type: "FETCH",
            data: {
              requests: [
                createUtxoRequestObject({
                  ...event.data,
                  config: context.meta.config,
                }),
              ],
            },
          };
        }),
      ],
      always: "init",
    },
    fetchingWalletsUtxos: {
      entry: [
        assign({
          btcWallets: ({ context, event }) => {
            assertEvent(event, "APP_MACHINE_FETCH_WALLETS_UTXOS");
            const walletId = event.data?.walletId;
            return context.btcWallets.map((wallet) => {
              if (wallet.id == walletId) {
                return {
                  ...wallet,
                  refreshedAt: new Date(),
                };
              }
              return wallet;
            });
          },
          addresses: ({ context, event }) => {
            assertEvent(event, "APP_MACHINE_FETCH_WALLETS_UTXOS");
            const bypassCache = event.data?.bypassCache;
            const addressType = event.data?.addressType;
            let utxosInput = [] as IUtxoInput[];
            const walletId = event.data?.walletId;
            if (event.data?.utxos?.length && walletId) {
              utxosInput = event.data.utxos.map((address) => ({
                walletId,
                address,
                status: "loading",
                loading: true,
              }));
            } else {
              utxosInput = context.btcWallets
                // event can occur for single wallet/xpub
                .filter((wallet) =>
                  event.data?.walletId
                    ? wallet.id === event.data.walletId
                    : true
                )
                .map((wallet) => {
                  const walletAddresses = Object.values(wallet.addresses || {})
                    .filter((address) => paginationFilter(wallet, address))
                    .filter((address) => {
                      const keyMeta = address.isChange
                        ? "changeMeta"
                        : "receiveMeta";

                      if (!keyMeta) return true;
                      if (typeof address.index === "undefined") return true;
                      if (
                        address.index <=
                        Math.max(
                          wallet[keyMeta].lastAddressIndex,
                          wallet[keyMeta].limit
                        )
                      ) {
                        return true;
                      }
                      return false;
                    })
                    .filter((address) => {
                      if (!addressType) {
                        return true;
                      }
                      // manually entered addresses dont know if they are change,
                      // treat them like received
                      const isChange = address.isChange ?? false;
                      return isChange === (addressType === "CHANGE");
                    })
                    .filter((address) => {
                      if (bypassCache) return true;
                      const cachedUtxo = context.addresses[address.address];
                      if (cachedUtxo?.status === "complete") return false;
                      return true;
                    })
                    .map((address) => address.address);
                  // .filter(
                  //   (address) =>
                  //     bypassCache ||
                  //     isCacheExpired(context.addresses[address])
                  // );

                  return walletAddresses.map((address) => {
                    return {
                      walletId: wallet.id,
                      address,
                      status: "loading",
                      loading: true,
                    } as IUtxoInput;
                  });
                })
                .flat();
            }
            return setAddresses(context.addresses, utxosInput);
          },
        }),
        enqueueActions(({ context, enqueue, event }) => {
          assertEvent(event, "APP_MACHINE_FETCH_WALLETS_UTXOS");
          // should fetch all or change/receive addresses
          const bypassCache = event.data?.bypassCache;
          const ttl = event.data?.ttl;
          const addressType = event.data?.addressType;
          let requests = [] as IRequest[];
          const walletId = event.data?.walletId;
          if (event.data?.utxos && walletId) {
            requests = event.data.utxos.map((address) =>
              createUtxoRequestObject({
                walletId,
                address,
                ttl,
                id: `ts:${new Date().getTime().toString()};addr:${address}`,
                config: context.meta.config,
              })
            );
          } else {
            requests = context.btcWallets
              .filter((wallet) =>
                event.data?.walletId ? wallet.id === event.data.walletId : true
              )
              .map((wallet) => {
                const walletAddresses = Object.values(wallet.addresses || {})
                  .filter((address) => paginationFilter(wallet, address))
                  .filter((address) => {
                    const keyMeta = address.isChange
                      ? "changeMeta"
                      : "receiveMeta";
                    if (!keyMeta) return true;
                    if (typeof address.index === "undefined") return true;
                    if (
                      address.index <=
                      Math.max(
                        wallet[keyMeta].lastAddressIndex,
                        wallet[keyMeta].limit
                      )
                    ) {
                      return true;
                    }
                    return false;
                  })
                  .filter((address) => {
                    if (!addressType) {
                      return true;
                    }
                    const isChange = address.isChange ?? false;
                    return isChange === (addressType === "CHANGE");
                  })
                  .filter((address) => {
                    if (bypassCache) return true;
                    const cachedUtxo = context.addresses[address.address];
                    if (cachedUtxo?.status === "complete") return false;
                    return true;
                  });
                // .filter((address) => {
                //   const cachedUtxo = context.addresses[address.address];
                //   return bypassCache || isCacheExpired(cachedUtxo);
                // });

                return walletAddresses.map((address) =>
                  createUtxoRequestObject({
                    walletId: wallet.id,
                    address: address.address,
                    ttl,
                    id: `ts:${new Date().getTime().toString()};addr:${
                      address.address
                    }`,
                    config: context.meta.config,
                  })
                );
              })
              .flat();
          }

          if (requests.length) {
            enqueue(
              sendTo("utxoMachine", {
                type: "FETCH",
                data: { requests, config: context.meta.config },
              })
            );
          }
        }),
      ],
      // always: "init",
    },
  },
  on: {
    SUBSCRIBE: {
      actions: assign({
        subscribers: ({ context, event }) => {
          return {
            ...context.subscribers,
            [event.data.ref.id]: event.data.ref,
          };
        },
      }),
    },
    UNSUBSCRIBE: {
      actions: assign({
        subscribers: ({ context, event }) => {
          return {
            ...context.subscribers,
            [event.data.ref.id]: undefined,
          };
        },
      }),
    },
    LOGGER: {
      actions: assign({
        networkLoggerRef: ({ event }) => {
          return event.data.ref;
        },
      }),
    },
    APP_MACHINE_EMPTY_QUEUE: {
      actions: [sendTo("utxoMachine", { type: "UTXO_MACHINE_EMPTY_QUEUE" })],
    },
    APP_MACHINE_ADD_WALLET: {
      actions: [
        enqueueActions(({ context, event, enqueue }) => {
          let wallets = context.btcWallets;
          let wallet = { ...event.data };
          if (event.data.id && wallets.some((w) => w.id === event.data.id)) {
            wallets = wallets.map((wallet) => {
              if (wallet.id === event.data.id) {
                return {
                  ...wallet,
                  ...event.data,
                  color: event.data.color ?? colorScale(event.data.name),
                  addresses: {
                    ...wallet.addresses,
                    ...event.data.addresses,
                  },
                };
              }
              return wallet;
            });
          } else {
            wallet = {
              ...event.data,
              color: event.data.color ?? colorScale(wallet.name),
              addressMeta: {
                addressWithBalances: new Set(),
              },
              receiveMeta: {
                startIndex: 0,
                limit: 10,
                lastAddressIndex: 10,
              },
              changeMeta: {
                startIndex: 0,
                limit: 10,
                lastAddressIndex: 10,
              },
              id: event.data.id || "wallet:" + new Date().getTime().toString(),
            };

            wallets = [wallet, ...wallets];
          }

          enqueue(
            assign({
              btcWallets: wallets,
            })
          );

          // only call add wallet and fetch utxos if there is a change to utxos or xpub
          if (event.flags.hasUpdatedUtxoOrXpub) {
            Object.values(context.subscribers).forEach((subscriber) => {
              enqueue(
                sendTo(subscriber, () => ({
                  type: "WALLET_LIST_ADD_WALLET",
                  data: {
                    wallet,
                    bitcoinNodeUrl: context.meta.config.bitcoinNodeUrl,
                  },
                }))
              );
            });
            // raise({ type: "APP_MACHINE_FETCH_WALLETS_UTXOS" });
          }
        }),
      ],
    },
    APP_MACHINE_FETCH_UTXO: {
      target: ".fetchingUtxo",
    },
    APP_MACHINE_FETCH_WALLETS_UTXOS: {
      target: ".fetchingWalletsUtxos",
    },
    // does this handle errors??
    APP_MACHINE_UTXO_RECEIVER: {
      actions: [
        assign({
          addresses: ({ context, event }) => {
            const addresses = { ...context.addresses };
            for (const request of event.data.requests) {
              // two types, utxo and tx. only assign utxo to addresses
              if (request.meta.type === "utxo") {
                addresses[request.meta.address] = {
                  ...(addresses[request.meta.address] || {}),
                  address: request.meta.address,
                  status: event.data.status,
                  ttl: request.meta.ttl,
                  loading:
                    event.data.status !== "complete" &&
                    event.data.status !== "error",
                };
                if (request.response) {
                  addresses[request.meta.address].response = request.response;
                }
              }
            }

            return addresses;
          },
          transactions: ({ context, event }) => {
            const transactions = { ...context.transactions };
            for (const request of event.data.requests) {
              if (request.meta.type === "txs") {
                transactions.addr = transactions.addr || {};
                transactions.txs = transactions.txs || {};
                if (event.data.status === "complete") {
                  delete transactions.addr[request.meta.address];
                } else {
                  transactions.addr[request.meta.address] = {
                    ...(transactions.addr[request.meta.address] || {}),
                    address: request.meta.address,
                    status: event.data.status,
                    ttl: request.meta.ttl,
                    loading: event.data.status !== "complete",
                  };
                }

                if (request.response) {
                  for (const tx of request.response.data) {
                    const txid = tx.txid as string;
                    transactions.txs[txid] = {
                      timestamp: new Date().getTime(),
                      response: tx,
                    };
                  }
                }
              }
            }

            return transactions;
          },
          btcWallets: ({ context, event }) => {
            let btcWallets = [...context.btcWallets];
            for (const request of event.data.requests) {
              if (
                request.meta.type === "txs" &&
                event.data.status === "complete"
              ) {
                const responseData = request.response.data;
                const walletIndex = btcWallets.findIndex(
                  (wallet) => wallet.id === request.meta.walletId
                );

                // store on each address the tx belongs too,
                btcWallets = dotProp.set(
                  btcWallets,
                  `${walletIndex}.addresses.${request.meta.address}`,
                  (address: IUtxoInput) => {
                    // limit to 10 for now
                    // the additional if they exist will be fetched in the next request
                    const limitedTxs = responseData.slice(0, TXS_LIMIT);
                    for (const tx of limitedTxs) {
                      if (!address.transactions?.includes(tx.txid)) {
                        address.transactions = address.transactions || [];
                        address.transactions.push(tx.txid);
                      }
                    }
                    return address;
                  }
                );

                // @todo store as list on wallet for later use?
                // May way to have a txs list page
                btcWallets = dotProp.set(
                  btcWallets,
                  `${walletIndex}.transactions`,
                  (txs: Record<string, ITxLite>) => {
                    // limit to 10 for now
                    // the additional if they exist will be fetched in the next request
                    const limitedTxs = responseData.slice(0, TXS_LIMIT);
                    for (const tx of limitedTxs) {
                      const txid = tx.txid as string;
                      const blockHeight = tx.status.block_height as number;
                      txs[txid] = {
                        txid,
                        blockHeight,
                      };
                    }
                    return txs;
                  }
                );
                btcWallets = dotProp.set(
                  btcWallets,
                  `${walletIndex}.earliestTxDate`,
                  (date: number) => {
                    let d;
                    if (typeof date !== "number") {
                      d = new Date().getTime();
                    } else {
                      d = date;
                    }
                    // set the value if the date is sooner that current value
                    // limit to 10 for now
                    // the additional if they exist will be fetched in the next request
                    const limitedTxs = responseData.slice(0, TXS_LIMIT);
                    for (const tx of limitedTxs) {
                      const timestamp = tx.status.block_time * 1000;
                      if (!d || timestamp < d) {
                        d = timestamp;
                      }
                    }
                    return d;
                  }
                );

                const wallet = btcWallets[walletIndex];
                const address = wallet.addresses[request.meta.address];
                const metaKey = address.isChange ? "changeMeta" : "receiveMeta";
                const addressIndex = address?.index;
                if (addressIndex) {
                  btcWallets = dotProp.set(
                    btcWallets,
                    `${walletIndex}.${metaKey}`,
                    (meta: AddressMeta) => {
                      if (
                        !meta.lastAddressIndex ||
                        meta.lastAddressIndex < addressIndex
                      ) {
                        return {
                          ...meta,
                          lastAddressIndex: addressIndex,
                        };
                      }
                      return meta;
                    }
                  );
                }
              }
            }
            return btcWallets;
          },
        }),

        enqueueActions(({ context, event, enqueue }) => {
          // if the utxo has txs then fetch the txs
          // console.log(event);
          if (event.data.status === "complete") {
            const requests = [] as IRequest[];
            for (const request of event.data.requests) {
              if (request.meta.type === "utxo") {
                const responseData = request.response.data;

                if (
                  responseData?.chain_stats?.tx_count ||
                  responseData?.mempool_stats?.tx_count
                ) {
                  const txRequest = createUtxoRequestObject(
                    {
                      walletId: request.meta.walletId,
                      address: request.meta.address,
                      id: `ts:${new Date().getTime().toString()};addr:${
                        request.meta.address
                      };txs`,
                      config: context.meta.config,
                      ttl: request.meta.ttl ?? undefined,
                    },
                    "txs"
                  );
                  requests.push(txRequest);
                }
              }
              if (request.meta.type === "txs") {
                // need to look at response and if response hsa more than max
                // (10 or 50? - need to determine how that is set)
                // then need to make additional requests using chain_stats.tx_count and after_txid
                // need to push to requests object and then send to utxoMachine
                // look in context.btcWallets[walletIndex].addresses[address].transactions.length
                // compare to context.addresses.[id].response.data.chain_stats.tx_count
                // if the number of address in btcwallet doesnt match tx_count, need to fetch more
                // (include the total of this response in the sum of the total txs)
                // if the number of address in btcwallet matches tx_count, then we are done
                // const startIndex = request.meta.startIndex ?? 0;

                // this should be determined based on the api response
                // however api doesnt appear to accept limit parameter
                // on memepool.space the response size is 50
                // on umbrel its 10.  Must be some config on the server side.
                // i could slice the array to 10 so its consistent?
                const limit = TXS_LIMIT;
                const limitedTxs = request.response.data.slice(0, limit);
                if (limitedTxs.length >= limit) {
                  const lastTx = limitedTxs[limitedTxs.length - 1];
                  const txRequest = createUtxoRequestObject(
                    {
                      walletId: request.meta.walletId,
                      address: request.meta.address,
                      id: `ts:${new Date().getTime().toString()};addr:${
                        request.meta.address
                      };txs`,
                      config: context.meta.config,
                    },
                    "txs",
                    { utxoAfterTxid: lastTx.txid }
                  );
                  requests.push(txRequest);
                }
              }
            }
            if (requests.length) {
              enqueue(
                sendTo("utxoMachine", {
                  type: "FETCH",
                  data: {
                    requests,
                  },
                })
              );
            }
          } else if (event.data.status === "error") {
            console.log("error", event.data);
            Object.values(context.subscribers).forEach((subscriber) => {
              enqueue(
                sendTo(subscriber, () => ({
                  type: "TOAST",
                  data: {
                    message: {
                      line1: "Error fetching",
                      line2: "Please try again",
                      action: {
                        text: "ok",
                        altText: "OK",
                        onClick: () => {},
                      },
                    },
                  },
                }))
              );
            });
          }

          Object.values(context.subscribers).forEach((subscriber) => {
            enqueue(
              sendTo(subscriber, () => ({
                type: "GLOBAL_REQUEST",
                data: { ...event.data },
              }))
            );
          });
        }),
      ],
    },
    APP_MACHINE_TOAST: {
      actions: [
        enqueueActions(({ context, event, enqueue }) => {
          Object.values(context.subscribers).forEach((subscriber) => {
            enqueue(
              sendTo(subscriber, () => ({
                type: "TOAST",
                data: event.data,
              }))
            );
          });
        }),
      ],
    },
    APP_MACHINE_SET_XPUB_UTXOS: {
      actions: [
        assign({
          btcWallets: ({ context, event }) => {
            const index = context.btcWallets.findIndex(
              (wallet) => wallet.id === event.data.walletId
            );

            let btcWallets = context.btcWallets;
            btcWallets = dotProp.set(
              btcWallets,
              `${index}.addresses`,
              (utxos: IUtxoInput) => {
                return merge({}, utxos, event.data.utxos);
              }
            );

            btcWallets = dotProp.set(
              btcWallets,
              `${index}.changeMeta.limit`,
              event.data.changeLimit
            );

            btcWallets = dotProp.set(
              btcWallets,
              `${index}.receiveMeta.limit`,
              event.data.receiveLimit
            );

            return btcWallets;
          },
        }),
        raise(({ event }) => {
          assertEvent(event, "APP_MACHINE_SET_XPUB_UTXOS");
          const data = {
            walletId: event.data.walletId,
            xpub: event.data.xpub,
            xpubs: event.data.xpubs,
            bypassCache: event.data.bypassCache,
            addressType: event.data.addressType,
            accountType: event.data.accountType,
            changeStart: event.data.changeStart,
            changeLimit: event.data.changeLimit,
            receiveStart: event.data.receiveStart,
            receiveLimit: event.data.receiveLimit,

            // utxos: event.data.utxos,
          };
          return { type: "APP_MACHINE_FETCH_WALLETS_UTXOS", data };
        }),
      ],
    },
    APP_MACHINE_UPDATE_WALLET_PAGINATION_LIMIT: {
      actions: [
        assign({
          btcWallets: ({ context, event }) => {
            const index = context.btcWallets.findIndex(
              (wallet) => wallet.id === event.data.walletId
            );

            const ret = dotProp.set(
              context,
              `btcWallets.${index}.${event.data.addressType.toLowerCase()}Meta`,
              (meta: any) => {
                const limit = meta.limit + event.data.incrementOrDecrement;
                return {
                  ...meta,
                  limit,
                };
              }
            );
            return ret.btcWallets;
          },
        }),
        enqueueActions(({ event, context, enqueue }) => {
          const wallet = context.btcWallets.find(
            (wallet) => wallet.id === event.data.walletId
          );
          if (wallet) {
            const changeLimit = wallet.changeMeta.limit;
            const receiveLimit = wallet.receiveMeta.limit;
            Object.values(context.subscribers).forEach((subscriber) => {
              enqueue(
                sendTo(subscriber, () => ({
                  // rename to update wallet
                  type: "WALLET_LIST_ADD_WALLET",
                  data: { wallet, changeLimit, receiveLimit },
                }))
              );
            });
          }
        }),
      ],
    },
    // @deprecated
    APP_MACHINE_SET_WALLET_PAGINATION: {
      actions: [
        assign({
          btcWallets: ({ context, event }) => {
            const index = context.btcWallets.findIndex(
              (wallet) => wallet.id === event.data.walletId
            );

            const ret = dotProp.set(
              context,
              `btcWallets.${index}.${event.data.addressType.toLowerCase()}Meta`,
              (meta: any) => {
                let startIndex = event.data.startIndex ?? meta.startIndex;
                let limit = event.data.limit ?? meta.limit;
                if (event.data.minLimitIndex) {
                  if (event.data.minLimitIndex > limit + startIndex) {
                    limit = event.data.minLimitIndex;
                  }
                }
                if (event.data.minStartIndex) {
                  if (event.data.minStartIndex < startIndex) {
                    startIndex = event.data.minStartIndex;
                  }
                }
                return {
                  ...meta,
                  startIndex,
                  limit,
                };
              }
            );

            return ret.btcWallets;
          },
        }),
        // raise(({ event }) => {
        //   assertEvent(event, "GLOBAL_SET_WALLET_PAGINATION");
        //   const data = {
        //     walletId: event.data.walletId,
        //     xpub: event.data.xpub,
        //     xpubs: event.data.xpubs,
        //     bypassCache: true,
        //     addressType: event.data.addressType,
        //     accountType: event.data.accountType,
        //   };
        //   return { type: "APP_MACHINE_FETCH_WALLETS_UTXOS", data };
        // }),
      ],
    },
    APP_MACHINE_DELETE_WALLET: {
      actions: [
        assign({
          btcWallets: ({ context, event }) => {
            const btcWallets = context.btcWallets.filter(
              (wallet) => wallet.id !== event.data.walletId
            );

            return btcWallets;
          },
        }),
      ],
    },
    APP_MACHINE_CLEAR_SELECTED_TXS: {
      actions: assign({
        selectedTxs: () => new Set(),
      }),
    },

    APP_MACHINE_TOGGLE_SELECTED_TXS: {
      actions: assign({
        selectedTxs: ({ event, context }) => {
          const { txids } = event.data;

          const current: Set<string> = context.selectedTxs
            ? new Set(Array.from(context.selectedTxs))
            : new Set();

          for (const txid of txids) {
            if (current.has(txid)) {
              current.delete(txid);
            } else {
              current.add(txid);
            }
          }
          // if (!wallet) return current;
          // const utxos = wallet.listUtxos;
          // const txs = wallet.transactions;
          return current;
        },
      }),
    },
    APP_MACHINE_CHANGE_SELECTED_TXS: {
      actions: assign({
        selectedTxs: ({ event, context }) => {
          const { txids, selected } = event.data;

          const current: Set<string> = context.selectedTxs
            ? new Set(Array.from(context.selectedTxs))
            : new Set();

          for (const txid of txids) {
            if (selected) {
              current.add(txid);
            } else {
              current.delete(txid);
            }
          }
          // if (!wallet) return current;
          // const utxos = wallet.listUtxos;
          // const txs = wallet.transactions;
          return current;
        },
      }),
    },

    APP_MACHINE_REHYDRATE: {
      actions: assign({
        btcWallets: ({ event }) => {
          assertEvent(event, "APP_MACHINE_REHYDRATE");
          return event.data.context.btcWallets;
        },
        addresses: ({ event }) => {
          assertEvent(event, "APP_MACHINE_REHYDRATE");
          // reset loading status

          return Object.keys(event.data.context.addresses).reduce(
            (acc, key) => {
              const address = event.data.context.addresses[key];
              if (address.status === "loading" || address.loading) {
                address.status = "error";
                address.loading = false;
              }
              acc[key] = address;
              return acc;
            },
            {} as Record<string, IUtxoRequest>
          );
        },
        transactions: ({ event }) => {
          assertEvent(event, "APP_MACHINE_REHYDRATE");
          return event.data.context.transactions;
        },
        meta: ({ context, event }) => ({
          ...context.meta,
          ...event.data.context.meta,
          ready: true,
          config: {
            ...context.meta.config,
            ...event.data.context.meta.config,
          },
        }),
        selectedTxs: ({ event }) => {
          assertEvent(event, "APP_MACHINE_REHYDRATE");
          const set = new Set(Array.from(event.data.context.selectedTxs));

          return set;
        },
      }),
    },
    APP_MACHINE_TOGGLE_SELECTED_TX: {
      actions: assign({
        selectedTxs: ({ context, event }) => {
          const { txid } = event.data;

          const current: Set<string> = context.selectedTxs
            ? new Set(Array.from(context.selectedTxs))
            : new Set();
          if (current.has(txid)) {
            current.delete(txid);
          } else {
            current.add(txid);
          }
          return current;
        },
      }),
    },
    APP_MACHINE_TOGGLE_NET_ASSET_VALUE: {
      actions: assign({
        meta: ({ context }) => {
          return {
            ...context.meta,
            netAssetValue: !context.meta.netAssetValue,
          };
        },
      }),
    },
    APP_MACHINE_CHANGE_ADDRESS_FILTER: {
      actions: assign({
        btcWallets: ({ context, event }) => {
          assertEvent(event, "APP_MACHINE_CHANGE_ADDRESS_FILTER");
          const { filter, walletId } = event.data;
          const index = context.btcWallets.findIndex(
            (wallet) => wallet.id === walletId
          );
          const ret = dotProp.set(
            context,
            `btcWallets.${index}.settings`,
            (meta: any) => {
              return {
                ...meta,
                addressFilters: filter,
              };
            }
          );

          return ret.btcWallets;
        },
      }),
    },
    APP_MACHINE_UPDATE_APP_VERSION: {
      actions: assign({
        meta: ({ context, event }) => {
          return {
            ...context.meta,
            appVersion: event.data.appVersion,
          };
        },
      }),
    },
    APP_MACHINE_UPDATE_META: {
      actions: assign({
        meta: ({ context, event }) => {
          return {
            ...context.meta,
            ...event.data.meta,
          };
        },
      }),
    },
    APP_MACHINE_UPDATE_FORCAST_MODEL: {
      actions: assign({
        meta: ({ context, event }) => {
          return {
            ...context.meta,
            forcastModel: event.data.forcastModel,
          };
        },
        forcastPrices: ({ event }) => {
          if (event.data.forcastModel) {
            return event.data.forcastPrices;
          }
          return [];
        },
      }),
    },
    APP_MACHINE_UPDATE_CHART_RANGE: {
      actions: assign({
        meta: ({ context, event }) => {
          // const { chartEndDate, chartStartDate } = context.meta;
          const { group } = event.data;
          // take the current time and subtract the value
          // next hour start (close to now)
          // round it forward to prevent requests for
          // every ticking second. so now it gets cached.
          const now = add(new Date(), { hours: 1 });
          const meta = {} as Partial<AppMachineMeta>;
          meta.chartEndDate = d3.timeHour(now).getTime();
          if (group === "1D") {
            meta.chartStartDate = d3
              .timeMinute(sub(now, { days: 1 }))
              .getTime();
            meta.chartTimeframeGroup = "5M";
            meta.chartTimeFrameRange = "1D";
          } else if (group === "1W") {
            meta.chartStartDate = d3.timeHour(sub(now, { days: 7 })).getTime();
            meta.chartTimeframeGroup = "1H";
            meta.chartTimeFrameRange = "1W";
          } else if (group === "1M") {
            meta.chartStartDate = d3
              .timeHour(sub(now, { months: 1 }))
              .getTime();
            meta.chartTimeframeGroup = "1H";
            meta.chartTimeFrameRange = "1M";
          } else if (group === "3M") {
            meta.chartStartDate = d3
              .timeHour(sub(now, { months: 3 }))
              .getTime();
            meta.chartTimeframeGroup = "1D";
            meta.chartTimeFrameRange = "3M";
          } else if (group === "1Y") {
            meta.chartStartDate = d3.timeDay(sub(now, { years: 1 })).getTime();
            meta.chartTimeframeGroup = "1D";
            meta.chartTimeFrameRange = "1Y";
          } else if (group === "2Y") {
            meta.chartStartDate = d3.timeDay(sub(now, { years: 2 })).getTime();
            meta.chartTimeframeGroup = "1D";
            meta.chartTimeFrameRange = "2Y";
          } else if (group === "5Y") {
            meta.chartStartDate = d3.timeDay(sub(now, { years: 5 })).getTime();
            meta.chartTimeframeGroup = "1D";
            meta.chartTimeFrameRange = "5Y";
          }

          meta.forcastModel = null;

          return {
            ...context.meta,
            ...meta,
          };
        },
      }),
    },
    APP_MACHINE_UPDATE_CHART_RANGE_BY_DATE: {
      actions: assign({
        meta: ({ context, event }) => {
          const { chartEndDate, chartStartDate } = event.data;
          const diff = chartEndDate - chartStartDate;
          const diffInDays = diff / (1000 * 60 * 60 * 24);

          const meta = {} as Partial<AppMachineMeta>;
          if (diffInDays < 2) {
            meta.chartTimeframeGroup = "5M";
          } else if (diffInDays < 8) {
            meta.chartTimeframeGroup = "1H";
          } else if (diffInDays < 31) {
            meta.chartTimeframeGroup = "1H";
          } else if (diffInDays < 365) {
            meta.chartTimeframeGroup = "1D";
          } else {
            meta.chartTimeframeGroup = "1D";
          }

          meta.chartEndDate = chartEndDate;
          meta.chartStartDate = chartStartDate;
          // meta.chartTimeFrameRange = null;

          return {
            ...context.meta,
            ...meta,
          };
        },
      }),
    },
    APP_MACHINE_ZOOM_TO_DATE: {
      actions: assign({
        meta: ({ context, event }) => {
          const { date, direction } = event.data;

          // get the current time range, and center and zoom around new date
          const diff = context.meta.chartEndDate - context.meta.chartStartDate;
          const center = date;
          const range = diff;
          const meta = {} as Partial<AppMachineMeta>;
          if (direction === "IN") {
            meta.chartEndDate = center + range / 4;
            meta.chartStartDate = center - range / 4;
          } else if (direction === "OUT") {
            meta.chartEndDate = center + range * 2;
            meta.chartStartDate = center - range * 2;
          }
          const diffInDays =
            (meta.chartEndDate! - meta.chartStartDate!) / (1000 * 60 * 60 * 24);
          if (diffInDays < 1) {
            meta.chartTimeframeGroup = "5M";
          } else if (diffInDays < 90) {
            meta.chartTimeframeGroup = "1H";
          } else {
            meta.chartTimeframeGroup = "1D";
          }
          meta.chartTimeFrameRange = null;
          return {
            ...context.meta,
            ...meta,
          };
          // return context.meta;
        },
      }),
    },
    APP_MACHINE_TRIM_WALLET_ADDRESSES: {
      actions: assign({
        btcWallets: ({ context, event }) => {
          let btcWallets = [...context.btcWallets];

          const { walletId, addressType, index } = event.data;
          const walletIndex = context.btcWallets.findIndex(
            (wallet) => wallet.id === walletId
          );

          // recreate the address object
          const addresses = Object.values(
            context.btcWallets[walletIndex].addresses
          ).filter((address) => {
            if (address.index > index) {
              if (address.isChange && addressType === "CHANGE") {
                return false;
              }
              if (!address.isChange && addressType === "RECEIVE") {
                return false;
              }
            }
            return true;
          });
          const addressObject = addresses.reduce((acc, address) => {
            acc[address.address] = address;
            return acc;
          }, {} as Record<string, IUtxoInput>);

          btcWallets = dotProp.set(
            btcWallets,
            `${walletIndex}.addresses`,
            addressObject
          );

          // update the lastAddressIndex
          btcWallets = dotProp.set(
            btcWallets,
            `${walletIndex}.${addressType.toLowerCase()}Meta.lastAddressIndex`,
            index
          );

          btcWallets = dotProp.set(
            btcWallets,
            `${walletIndex}.${addressType.toLowerCase()}Meta.limit`,
            index + 1
          );
          return btcWallets;
        },
      }),
    },
  },
});
