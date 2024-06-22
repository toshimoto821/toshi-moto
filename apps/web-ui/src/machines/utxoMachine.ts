import {
  createMachine,
  fromPromise,
  assign,
  sendParent,
  assertEvent,
  enqueueActions,
} from "xstate";
import type { IResponse, IRequest } from "./network.types";
import { invokeApi, wait } from "@lib/utils";
import { type IAppMetaConfig } from "@machines/appMachine";

const MAX_CONCURRENT_REQUESTS = import.meta.env.VITE_MAX_CONCURRENT_REQUESTS;
const REST_TIME_BETWEEN_REQUESTS = import.meta.env
  .VITE_REST_TIME_BETWEEN_REQUESTS;

type IMetaUtxoMachine = {
  restTime: number;
  maxConcurrentRequests: number;
  bitcoinNodeUrl: string;
};
type FETCH_EVENT = {
  type: "FETCH";
  data: { requests: IRequest[]; emptyQueue?: boolean; config?: IAppMetaConfig };
  error?: any;
  input?: any;
};

export const utxoMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QCcwEcCucAuBiAqgCoAaA8gPoCyAggMIASAkgHICi5rlACoQJrkBFfK2EBtAAwBdRKAAOAe1gBLbEvkA7GSAAeiAIwBOPQDoArABYA7JYBMADiN3z4vQDYbAGhABPRAFo9cVNjGz1Lc3M7V1cwgwNbAF8Er1RMHGM0rEIlAFsweQw8CA0wYyV1ADd5AGtS1KxYbAysLNz8woRyqoBjAENVDQlJIa0FZQHNJB1-PVNLYztTG3c7F1nzAGZzVy9fBA2F5fEDezjXSwMNh0sklPQGpsywLmR5brhldShcEamxlTUk1AugQfjixnEG1s4kseii5hsNgMdl2iBsm2MegRNkhMLsG1c5kutxA9XSTxebw+5W+oj00j+igBGi0IL8BNcxnCWNckOWULsnh8M1hxhO+Ks4nE7lcRhJZMazTAWEp71gn1pNgZciZE1Z-lM+OMhLhiIudiiBlRoLhwQ2Ni220igQdUXl93SSggABswLgAGKsQgMX468aA-WgywuYwI-EWdzSrFCvYbWZc9yWGIbaWuCxhd1pRUAMzA2G6AAtcMV1KUujU6h6S2XK51Km9+oChqGQP89VM2XMbIdVoibLCs+ZrW5gnZLDn0UnTFsroWHsZS+Wq2BkK9kMZZN7+sX5MgcsYFU1N63630Jt2pKNdRGB-p3BDYdFTFjLKYLFbhQQPQbFnGJLlMcQHTzNd0mvKtA2Degez7F9gQNAxxBCeJLjcVwLQcUxrQCJExTmFYtmRcQHCSZIQHUeQIDgLRLyfcMWVfG0gkwnNHDnXl8WRIjzAg2MNmRWwxNhAUNhgxUnmyPICmwVjmSBaZQUJYwcxcJFvwJUJfyIgkDj0Nx4g2DZ8yRAlZMeFpnleNUNRU-s0I01YtKJLE-ycZEEWtJYDC5S4ThxfCQNssofTAFzUPU9lRTsMJf3CK4CXEKdAKRcwFkNS5zgRHNVlcSK4Ni9i3ICKVhx4uE+KosSUUAgIxLFDKkoMLyCUFcwaISIA */
    initial: "idle",
    id: "request",
    context: {
      queue: [],
      requests: [],
      responses: [],
      meta: {
        restTime: REST_TIME_BETWEEN_REQUESTS,
        maxConcurrentRequests: MAX_CONCURRENT_REQUESTS,
        bitcoinNodeUrl: "",
      },
      // dep

      id: null,
      walletId: null,
      response: null,
      url: null,
      error: null,
      loading: false,
      retries: 0,
      maxRetries: 3,
      input: null,
    },
    types: {} as {
      context: {
        queue: IRequest[];
        requests: IRequest[];
        responses: IResponse[];
        meta: IMetaUtxoMachine;
        lastFetchTs?: number;
        // @deprecated
        url: string | null;
        id: string | null;
        walletId: string | null;
        response: IResponse | null;
        loading: boolean;
        error: any;
        retries: number;
        maxRetries: number;
        // networkActorRef: any;
        // meta: any;
        input: any;
      };
      events:
        | FETCH_EVENT
        | {
            type: "RETRY";
            input?: any;
            error?: any;
          }
        | {
            type: "UTXO_MACHINE_EMPTY_QUEUE";
          };
    },
    states: {
      queueTimeout: {
        invoke: {
          src: "waitFor",
          input: ({ context }) => {
            let timeout = context.meta.restTime;
            if (typeof timeout === "string") {
              timeout = parseInt(timeout, 10);
            }
            return { timeout };
          },
          onDone: "fetch",
        },
      },
      queueProcessing: {
        always: [
          {
            target: "idle",
            actions: assign({
              lastFetchTs: () => new Date().getTime(),
            }),
            guard: "isQueueEmpty",
          },
          {
            target: "queueTimeout",
            actions: assign({
              lastFetchTs: () => undefined,
              requests: ({ context }) => {
                const requests = context.queue.slice(
                  0,
                  context.meta.maxConcurrentRequests ?? MAX_CONCURRENT_REQUESTS
                );
                return [...requests];
              },
              queue: ({ context }) => {
                const queue = context.queue.slice(
                  context.meta.maxConcurrentRequests ?? MAX_CONCURRENT_REQUESTS,
                  context.queue.length
                );

                return queue;
              },
            }),
            guard: "shouldWaitToFetch",
          },
          {
            actions: assign({
              lastFetchTs: () => undefined,
              requests: ({ context }) => {
                const requests = context.queue.slice(
                  0,
                  MAX_CONCURRENT_REQUESTS
                );
                return [...requests];
              },
              queue: ({ context }) => {
                const queue = context.queue.slice(
                  context.meta.maxConcurrentRequests ?? MAX_CONCURRENT_REQUESTS,
                  context.queue.length
                );

                return queue;
              },
            }),
            target: "fetch",
          },
        ],
      },
      idle: {
        on: {
          FETCH: {
            target: "fetch",
            actions: [
              assign({
                meta: ({ context, event }) => {
                  return {
                    ...context.meta,
                    maxConcurrentRequests:
                      event.data.config?.maxConcurrentRequests ??
                      context.meta.maxConcurrentRequests,
                    restTime:
                      event.data.config?.restTimeBetweenRequests ??
                      context.meta.restTime,
                  };
                },
                requests: ({ context, event }) => {
                  const requests = event.data.requests.slice(
                    0,
                    event.data.config?.maxConcurrentRequests ??
                      MAX_CONCURRENT_REQUESTS
                  );

                  return [...context.queue, ...requests];
                },
                queue: ({ event }) => {
                  const requests = event.data.requests.slice(
                    event.data.config?.maxConcurrentRequests ??
                      MAX_CONCURRENT_REQUESTS,
                    event.data.requests.length
                  );
                  return [...requests];
                }, // empty queue
              }),
              enqueueActions(({ context, enqueue }) => {
                const { queue } = context;
                if (queue.length) {
                  enqueue(
                    sendParent(({ event }) => {
                      assertEvent(event, "FETCH");
                      return {
                        type: "APP_MACHINE_UTXO_RECEIVER",
                        data: {
                          status: "queued",
                          requests: queue.map((req) => {
                            return {
                              meta: {},
                              ...req,
                              status: "queued",
                              loading: true,
                              createdAt: new Date().getTime(),
                            };
                          }),
                        },
                      };
                    })
                  );
                }
              }),
            ],
          },
        },
        // always: [
        //   {
        //     target: "fetch",
        //     actions: assign({
        //       requests: ({ context }) => {
        //         const requests = context.queue.slice(
        //           0,
        //           MAX_CONCURRENT_REQUESTS
        //         );
        //         return [...requests];
        //       },
        //       queue: ({ context }) => {
        //         const queue = context.queue.slice(
        //           MAX_CONCURRENT_REQUESTS,
        //           context.queue.length
        //         );

        //         return queue;
        //       },
        //     }),
        //     guard: ({ context }) => {
        //       return context.queue.length > 0;
        //     },
        //   },
        // ],
      },
      fetch: {
        on: {
          // if a request comes in while we are fetching,
          // store it for later in the queue
        },
        entry: [
          sendParent(({ context }) => {
            return {
              type: "APP_MACHINE_UTXO_RECEIVER",
              data: {
                status: "loading",
                requests: context.requests.map((req) => ({
                  ...req,
                  status: "loading",
                  createdAt: new Date().getTime(),
                })),
              },
            };
          }),
        ],
        invoke: {
          src: "fetch",
          input: ({ context }) => {
            return {
              requests: context.requests,
              restTime: context.meta.restTime,
              lastFetchTs: context.lastFetchTs,
            };
          },
          onDone: [
            {
              target: "queueProcessing",
              actions: [
                sendParent(({ event, context }) => {
                  return {
                    type: "APP_MACHINE_UTXO_RECEIVER",
                    data: {
                      status: "complete",
                      requests: context.requests.map((request) => {
                        const response = event.output.find(
                          (response: IResponse) => {
                            return response.id === request.id;
                          }
                        );
                        return {
                          ...request,
                          status: "complete",
                          createdAt: new Date().getTime(),
                          response,
                        };
                      }),
                    },
                  };
                }),
              ],
            },
          ],
          onError: {
            target: "idle",
            actions: [
              sendParent(({ event, context }) => {
                // assertEvent(event, "FETCH");

                const error = event.error as any;
                if (error?.id) {
                  const id = error.id as string;
                  return {
                    type: "APP_MACHINE_UTXO_RECEIVER",
                    data: {
                      status: "error",
                      requests: context.requests
                        .filter((request) => request.id === id)
                        .map((request) => {
                          return {
                            ...request,
                            status: "error",
                            loading: false,
                            createdAt: new Date().getTime(),
                          };
                        }),
                    },
                  };
                }
                // dom exception / hard error and dont have access
                return {
                  type: "APP_MACHINE_UTXO_RECEIVER",
                  data: {
                    status: "error",
                    requests: context.requests.map((request) => {
                      return {
                        meta: {},
                        ...request,
                        status: "error",
                        loading: false,
                        createdAt: new Date().getTime(),
                      };
                    }),
                  },
                };
              }),
              ({ event }) => {
                console.log("error fetching, handle retry", event);
              },
            ],
          },
        },
      },
    },
    on: {
      FETCH: {
        // @todo need to send to APP_MACHINE_UTXO_RECEIVER with status queue
        actions: [
          assign({
            queue: ({ context, event }) => {
              const requests = event.data.requests.filter(
                (request: IRequest) => {
                  const inQueue = context.queue.find(
                    (req) => req.url === request.url
                  );
                  if (inQueue) return false;
                  const isProcessing = context.requests.find(
                    (req) => req.url === request.url
                  );
                  if (isProcessing) return false;
                  return true;
                }
              );
              const first = requests.filter(
                (request) => request.meta.priority === "high"
              );
              const last = requests.filter(
                (request) => request.meta.priority !== "high"
              );
              return [...first, ...context.queue, ...last];
            },
          }),
          sendParent(({ event, context }) => {
            assertEvent(event, "FETCH");
            return {
              type: "APP_MACHINE_UTXO_RECEIVER",
              data: {
                status: "queued",
                requests: context.queue.map((req) => {
                  return {
                    ...req,
                    status: "queued",
                    loading: true,
                    createdAt: new Date().getTime(),
                  };
                }),
              },
            };
          }),
        ],
      },
      UTXO_MACHINE_EMPTY_QUEUE: {
        actions: [
          assign({
            queue: [],
          }),
        ],
      },
    },
  },
  {
    guards: {
      shouldWaitToFetch: ({ context }) => {
        if (context.meta.restTime > 0) {
          return true;
        }
        return false;
      },
      isQueueEmpty: ({ context }) => {
        if (context.queue.length === 0) return true;
        return false;
      },
    },
    actors: {
      waitFor: fromPromise(
        async ({ input }: { input: { timeout: number } }) => {
          await wait(input.timeout);
        }
      ),
      fetch: fromPromise(
        async ({
          input,
        }: {
          input: {
            lastFetchTs: number;
            restTime: number;
            requests: {
              url: string;
              id: string;
              meta?: { ttl?: number };
            }[];
          };
        }) => {
          if (input.lastFetchTs) {
            const restTime = input.restTime;
            if (restTime) {
              const ms = new Date().getTime() - input.lastFetchTs;
              if (ms < restTime) {
                await wait(restTime - ms);
              }
            }
          }
          return Promise.all([
            ...input.requests.map((request) =>
              invokeApi(request.url, request.id, request.meta?.ttl)
            ),
          ]);
        }
      ),
    },
  }
);
