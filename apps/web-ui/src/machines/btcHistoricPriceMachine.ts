import { fromPromise, setup, assign, sendTo, assertEvent } from "xstate";
const VITE_COINGECKO_API_URL = import.meta.env.VITE_COINGECKO_API_URL;
import type { ICurrency } from "@root/types";

type IGetUrl = {
  currency: ICurrency;
  from: number;
  to: number; //1422577232 (unix timestamp)
  //1673039598 - 1704575598
};
const getUrl = ({ currency, from, to }: IGetUrl) => {
  const path = `${VITE_COINGECKO_API_URL}/api/v3/coins/bitcoin/market_chart/range`;
  const url = `${path}?vs_currency=${currency}&from=${from}&to=${to}`;

  return url;
};

export type IPrices = [number, number][];
type IProcessType = "RESET" | "UNSHIFT" | "PUSH";
export const btcHistoricPriceMachine = setup({
  types: {} as {
    context: {
      networkLoggerRef: any;
      walletActorRef: any;
      loading: boolean;
      currency: ICurrency;
      from: number;
      to: number;
      lastUpdatedAt?: number;
      prices?: IPrices;
      // @deprecated
      requestId?: string;
    };
    events:
      | { type: "INIT"; data: { networkLoggerRef: any; walletActorRef: any } }
      | {
          type: "FETCH";
          data?: {
            from: number;
            to: number;
            currency: ICurrency;
          };
        }
      | {
          type: "UPDATE_PRICES";
          data: {
            prices: IPrices;
          };
        };
  },
  actors: {
    fetchBtcHistoricPrices: fromPromise(
      ({
        input,
      }: {
        input: {
          currency: ICurrency;
          from: number;
          to: number;
          processType: IProcessType;
        };
      }) => {
        const { currency, from, to } = input;
        const url = getUrl({ currency, from, to });
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
            meta: {
              processType: input.processType,
            },
            data,
          };
        });
      }
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgNwBcBiASQDkaAVAbQAYBdRUABwHtZKuXvi4gAHogDMkgCwkA7K0kBGAGwBWABzqZ85ToA0IAJ6JNykutbWATPpvnzrZQF8XRtFjyFSuCABswKgAxAFFGAGEACTZOJBA+AQohEXiJBBlVeRJJdQBOSXkZNWVS0skjUwysnLzWVRlNDUVVTTcPDBwCYjIAoIBVOgBlKJpglg5RRMFhUXSZKwU81Tr1dWlNeVUbSsRleWz1eXNdVtyGh3aQTy6fEn9edAgCKCoIYTAyfAA3XgBrT43bw9B5PF4IAi-TDoZLCWKxKb8GapUDpaRyRQqDTaXT6GS7BA2BwkVjHZS5WRFfLqK5A7qkUHPfCvMAAJ1ZvFZJG4-hhADNOagSHS7ozwZDeNDYfh4ZN4tNpXMpLIFEo1FodHpDCYpLoFLJJHkbLYbKpJG0rvheBA4KIRcREUkUkqEABaVQE13qEh5X1+-3+yS0zrA3z4SiO5EuonezHG5ak1jaTQ7HUIZSsDGaOp1A6GmxWGTBrz03qBSOKtKILR5EgyQoyZbbTNm1NVU2SEj6bbLdXk1T6Yu3EGPJlQCvOqsZNt7FY5BylI6SeO6GxuNxAA */
  initial: "init",
  context: {
    networkLoggerRef: null,
    walletActorRef: null,
    loading: false,
    currency: "usd",
    from: 0,
    to: 0,
  },
  states: {
    init: {
      on: {
        INIT: {
          target: "idle",
          actions: assign({
            networkLoggerRef: ({ event }) => {
              return event.data.networkLoggerRef;
            },
            walletActorRef: ({ event }) => {
              return event.data.walletActorRef;
            },
          }),
        },
      },
    },
    idle: {
      on: {
        FETCH: {
          target: "loading",
          actions: assign({
            from: ({ context, event }) => {
              return event.data?.from ?? context.from;
            },
            to: ({ context, event }) => {
              return event.data?.to ?? context.to;
            },
          }),
        },
      },
    },
    loading: {
      entry: [
        assign({
          loading: true,
          requestId: () => `${new Date().getTime()}-btcprice`,
        }),
        sendTo(
          ({ context }) => context.networkLoggerRef,
          ({ context, event }) => {
            assertEvent(event, ["FETCH"]);
            const to = event.data?.to ?? context.to;
            const from = event.data?.from ?? context.from;
            const currency = event.data?.currency ?? context.currency;

            const url = getUrl({ currency, from, to });

            return {
              type: "GLOBAL_REQUEST",
              data: {
                status: "loading",
                id: context.requestId,
                requests: [
                  {
                    url,
                    meta: { currency, from, to, type: "btc-historic-price" },
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
        src: "fetchBtcHistoricPrices",
        input: ({ context, event }) => {
          assertEvent(event, ["FETCH"]);
          let processType: IProcessType = "RESET";

          return {
            currency: event.data?.currency ?? context.currency,
            from: event.data?.from ?? context.from,
            to: event.data?.to ?? context.to,
            id: context.requestId!,
            processType,
          };
        },
        onDone: {
          target: "idle",
          actions: [
            assign({
              loading: false,
              lastUpdatedAt: () => {
                return new Date().getTime();
              },
              prices: ({ context, event }) => {
                if (event.output.meta.processType === "RESET") {
                  return event.output.data.prices;
                }
                return context.prices;
              },
            }),
            sendTo(
              ({ context }) => context.networkLoggerRef,
              ({ context, event }) => {
                const { currency, from, to } = context;
                return {
                  type: "GLOBAL_REQUEST",
                  data: {
                    status: "complete",
                    id: context.requestId,
                    requests: [
                      {
                        url: getUrl({ from, to, currency }),
                        meta: {
                          currency,
                          from,
                          to,
                          type: "btc-historic-price",
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
          ],
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              loading: false,
            }),
            sendTo(
              ({ context }) => context.networkLoggerRef,
              ({ context, event }) => {
                const { currency, from, to } = context;

                return {
                  type: "GLOBAL_REQUEST",
                  data: {
                    status: "error",
                    id: context.requestId,
                    requests: [
                      {
                        url: getUrl({ from, to, currency }),
                        meta: {
                          currency,
                          from,
                          to,
                          type: "btc-historic-price",
                        },
                        status: "error",
                        id: context.requestId,
                        createdAt: new Date().getTime(),
                        response: {
                          data: {
                            error: (event.error as any).message as string,
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
              ({ context }) => {
                console.log(context.walletActorRef);
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
    UPDATE_PRICES: {
      actions: assign({
        prices: ({ event }) => {
          return event.data.prices;
        },
      }),
    },
  },
});
