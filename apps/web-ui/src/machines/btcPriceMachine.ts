import type { ICurrency } from "@root/types";
import { fromPromise, setup, assign, sendTo } from "xstate";

const VITE_COINGECKO_API_URL = import.meta.env.VITE_COINGECKO_API_URL;

const getUrl = (currency: ICurrency) => {
  const path = `${VITE_COINGECKO_API_URL}/api/v3/simple/price`;
  const url = `${path}?ids=bitcoin&vs_currencies=${currency}&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=2`;
  return url;
};

type IBtcPrices = {
  [key: string]: {
    price: number;
    change: number;
    volume: number;
  };
};
const IN_MEMORY_CACHE = {
  cache: {} as IBtcPrices,
};

export const btcPriceMachine = setup({
  types: {} as {
    context: {
      networkLoggerRef?: any;
      walletActorRef?: any;
      loading: boolean;
      circulatingSupply: number;
      currency: ICurrency;
      lastUpdatedAt?: number;
      btcPrices: IBtcPrices;
      requestId?: string;
      error: string | null;
    };
    events:
      | {
          type: "FETCH";
          data?: {
            currency: ICurrency;
          };
        }
      | {
          type: "INIT";
          data: {
            networkLoggerRef: any;
            walletActorRef: any;
            currency: ICurrency;
          };
        };
  },
  actors: {
    fetchCirculatingSupply: fromPromise(() => {
      console.log;
      return fetch("https://blockchain.info/q/totalbc").then(async (resp) => {
        const data = await resp.json();
        return data as number;
      });
    }),
    fetchBtcPrices: fromPromise(
      ({ input }: { input: { currency: ICurrency } }) => {
        const currency = input.currency;
        const url = getUrl(currency);
        const startTime = new Date().getTime();
        return fetch(url).then(async (resp) => {
          const endTime = new Date().getTime();
          const data = await resp.json();
          const headers = { ...resp.headers };
          return {
            headers,
            details: {
              startTime,
              endTime,
              duration: endTime - startTime,
              status: resp.status,
            },
            data,
          };
        });
      }
    ),
  },
}).createMachine({
  initial: "init",
  context: {
    loading: false,
    currency: "usd",
    circulatingSupply: 1964370000000000,
    btcPrices: IN_MEMORY_CACHE.cache,
    error: null,
  },
  states: {
    init: {
      after: {
        1000: "supply",
      },
    },
    supply: {
      invoke: {
        src: "fetchCirculatingSupply",
        onDone: {
          target: "loading",
          actions: assign({
            circulatingSupply: ({ event }) => event.output,
          }),
        },
        onError: {
          target: "loading",
        },
      },
    },
    idle: {
      on: {
        FETCH: {
          target: "loading",
          actions: assign({
            currency: ({ event, context }) =>
              event.data?.currency ?? context.currency,
          }),
        },
      },
      // after: {
      //   3600000: {
      //     target: "loading",
      //   },
      // },
    },
    loading: {
      entry: [
        assign({
          loading: true,
          requestId: () => `${new Date().getTime()}-btcprice`,
        }),
        sendTo(
          ({ context }) => context.networkLoggerRef,
          ({ context }) => {
            const { currency } = context;
            const url = getUrl(currency);

            return {
              type: "GLOBAL_REQUEST",
              data: {
                status: "loading",
                id: context.requestId,
                requests: [
                  {
                    url,
                    meta: { currency, type: "btc-price" },
                    id: context.requestId,
                    status: "loading",
                    createdAt: new Date().getTime(),
                  },
                ],
              },
            };
          }
        ),
      ],
      invoke: {
        src: "fetchBtcPrices",
        input: ({ context }) => ({
          currency: context.currency,
          id: context.requestId!,
        }),
        onDone: {
          target: "idle",
          actions: [
            assign({
              loading: false,
              lastUpdatedAt: ({ event }) => {
                const ts = event.output.data.bitcoin.last_updated_at * 1000;
                return ts;
              },
              error: null,
              btcPrices: ({ event, context }) => {
                //return event.data
                const { bitcoin } = event.output.data;
                const data = [context.currency].reduce((acc, currency) => {
                  return {
                    ...acc,
                    [currency]: {
                      price: bitcoin[currency],
                      change: bitcoin[`${currency}_24h_change`],
                      volume: bitcoin[`${currency}_24h_vol`],
                    },
                  };
                }, {});
                return data;
              },
            }),
            sendTo(
              ({ context }) => context.networkLoggerRef,
              ({ context, event }) => {
                return {
                  type: "GLOBAL_REQUEST",
                  data: {
                    status: "complete",
                    id: context.requestId,
                    requests: [
                      {
                        url: getUrl(context.currency),
                        meta: {
                          currency: context.currency,
                          type: "btc-price",
                        },
                        status: "complete",
                        id: context.requestId,
                        createdAt: new Date().getTime(),
                        response: {
                          ...event.output,
                        },
                      },
                    ],
                  },
                };
              }
            ),
            ({ context }) => {
              // send to network logger
              IN_MEMORY_CACHE.cache = context.btcPrices;
              // console.log(context.btcPrices);
            },
          ],
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              loading: false,
              error: ({ event }) => {
                return (event.error as any).message as string;
              },
            }),
            sendTo(
              ({ context }) => context.networkLoggerRef,
              ({ context, event }) => {
                return {
                  type: "GLOBAL_REQUEST",
                  data: {
                    status: "error",
                    id: context.requestId,
                    requests: [
                      {
                        url: getUrl(context.currency),
                        meta: {
                          currency: context.currency,
                          type: "btc-price",
                        },
                        status: "error",
                        id: context.requestId,
                        createdAt: new Date().getTime(),
                        response: {
                          data: {
                            error: (event.error as any).message,
                          },
                        },
                      },
                    ],
                  },
                };
              }
            ),
            sendTo(
              ({ context }) => context.walletActorRef,
              () => {
                return {
                  type: "APP_MACHINE_TOAST",
                  data: {
                    message: {
                      line1: "Error fetching btc historic prices",
                      line2: "Please try again later",
                      action: {
                        text: "ok",
                        altText: "ok",
                        onClick: () => {},
                      },
                    },
                  },
                };
              }
            ),
            ({ event }) => {
              console.log("@todo handle error", event);
            },
          ],
        },
      },
    },
  },
  on: {
    INIT: {
      actions: assign({
        networkLoggerRef: ({ event }) => event.data.networkLoggerRef,
        walletActorRef: ({ event }) => event.data.walletActorRef,
        currency: ({ event }) => event.data.currency,
      }),
    },
  },
});
