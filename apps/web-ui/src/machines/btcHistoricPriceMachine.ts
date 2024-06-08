import { fromPromise, setup, assign, sendTo, assertEvent } from "xstate";
const VITE_COINGECKO_API_URL = import.meta.env.VITE_COINGECKO_API_URL;
import type { ICurrency } from "@root/types";
import { type IChartTimeFrameRange } from "@root/machines/appMachine";

type IGetUrl = {
  currency: ICurrency;
  from: number;
  to: number; //1422577232 (unix timestamp)
  uri: string;
  groupBy: IGroupBy;
  bust?: string;
  //1673039598 - 1704575598
};

const getUrl = ({ currency, from, to, uri, groupBy }: IGetUrl) => {
  // const path = `${VITE_COINGECKO_API_URL}`;
  const url = `${uri}?vs_currency=${currency}&from=${from}&to=${to}&group_by=${groupBy}`;

  return url;
};

export type IPrices = [number, number][];
type IProcessType = "RESET" | "UNSHIFT" | "PUSH";
export type IGroupBy = "5M" | "1H" | "1D" | "1W";
export const btcHistoricPriceMachine = setup({
  types: {} as {
    context: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      networkLoggerRef: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      walletActorRef: any;
      loading: boolean;
      currency: ICurrency;
      from: number;
      to: number;
      groupBy: IGroupBy;
      uri: string;
      lastUpdatedAt?: number;
      prices?: IPrices;
      // this is updated after the data is set;
      // appMachine chartTimeFrameRange is used just for ui
      // this applies to the prices data itself
      chartTimeFrameRange: IChartTimeFrameRange | null;
      nextChartTimeFrameRange: IChartTimeFrameRange | null;
      lowerBoundDate: Date | null;
      upperBoundDate: Date | null;
      // @deprecated
      requestId?: string;
    };
    events:
      | {
          type: "INIT";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { networkLoggerRef: any; walletActorRef: any; uri?: string };
        }
      | {
          type: "FETCH";
          data?: {
            from: number;
            to: number;
            groupBy?: IGroupBy;
            chartTimeFrameRange: IChartTimeFrameRange | null;
            currency: ICurrency;
            uri?: string;
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
          groupBy: IGroupBy;
          processType: IProcessType;
          uri: string;
        };
      }) => {
        const { currency, from, to, uri, groupBy } = input;
        const url = getUrl({ currency, from, to, uri, groupBy });
        const startTime = new Date().getTime();
        return fetch(url)
          .then(async (resp) => {
            const endTime = new Date().getTime();
            if (resp.status >= 500) {
              throw new Error(resp.statusText);
            }
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
          })
          .catch((ex) => {
            console.log(ex);
            throw ex;
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
    groupBy: "1D",
    chartTimeFrameRange: null,
    nextChartTimeFrameRange: null,
    uri: VITE_COINGECKO_API_URL,
    lowerBoundDate: null,
    upperBoundDate: null,
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
            nextChartTimeFrameRange: ({ event }) => {
              return event.data?.chartTimeFrameRange ?? null;
            },
            from: ({ context, event }) => {
              return event.data?.from ?? context.from;
            },
            to: ({ context, event }) => {
              return event.data?.to ?? context.to;
            },
            groupBy: ({ context, event }) => {
              return event.data?.groupBy ?? context.groupBy;
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
            const groupBy = event.data?.groupBy ?? context.groupBy;
            const currency = event.data?.currency ?? context.currency;
            const uri = event.data?.uri ?? context.uri;

            const url = getUrl({ currency, from, to, uri, groupBy });

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
      invoke: [
        {
          src: "fetchBtcHistoricPrices",
          input: ({ context, event }) => {
            assertEvent(event, ["FETCH"]);
            const processType: IProcessType = "RESET";

            return {
              currency: event.data?.currency ?? context.currency,
              from: event.data?.from ?? context.from,
              to: event.data?.to ?? context.to,
              id: context.requestId!,
              uri: event.data?.uri ?? context.uri,
              groupBy: event.data?.groupBy ?? "1D",
              processType,
            };
          },
          onDone: {
            target: "idle",
            actions: [
              assign({
                loading: false,
                chartTimeFrameRange: ({ context }) => {
                  return context.nextChartTimeFrameRange;
                },
                nextChartTimeFrameRange: () => null,
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
                ({ context, event, self }) => {
                  const { currency, from, to, groupBy, chartTimeFrameRange } =
                    context;
                  // @todo this is not correct
                  const uri = context.uri;
                  return {
                    type: "GLOBAL_REQUEST",
                    data: {
                      status: "complete",
                      id: context.requestId,
                      requests: [
                        {
                          url: getUrl({ from, to, currency, uri, groupBy }),
                          meta: {
                            currency,
                            from,
                            to,
                            type: "btc-historic-price",
                          },
                          status: "complete",
                          id: context.requestId,
                          retry: () => {
                            self.send({
                              type: "FETCH",
                              data: {
                                from,
                                to,
                                currency,
                                uri,
                                groupBy,
                                chartTimeFrameRange,
                              },
                            });
                          },
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
                  const { currency, from, to, groupBy } = context;
                  const uri = context.uri; // @todo this should use event.data
                  return {
                    type: "GLOBAL_REQUEST",
                    data: {
                      status: "error",
                      id: context.requestId,
                      requests: [
                        {
                          url: getUrl({ from, to, currency, uri, groupBy }),
                          meta: {
                            currency,
                            from,
                            to,
                            type: "btc-historic-price",
                          },
                          status: "error",
                          id: context.requestId,
                          createdAt: new Date().getTime(),
                          retry: () => {
                            alert("test");
                            // self.send({
                            //   type: "FETCH",
                            // });
                          },
                          response: {
                            data: {
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      ],
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
