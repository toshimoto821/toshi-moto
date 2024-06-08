import {
  createMachine,
  assign,
  enqueueActions,
  assertEvent,
  raise,
} from "xstate";
import { GLOBAL_REQUEST } from "./global.types";
import type { IRequest } from "./network.types";

export const networkLoggerMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDswBcDuB7ATgawBksoYcA6DAQwEs1rkoBiAYQCUBRAQQBV2BtAAwBdRKAAOWWLWpZkokAA9EAgDQgAnsoC+Wtaky5CxUhRp0GjAKoAFACI9+w+RKl1Z8pQgC0AdgCsZAAsfn4+AMxhAn5hfgCcYQCMABxqmggATABsCWSR6VFJSWGBsbE+Aj46eujY+EQkYORU0ha27ATsvIIiSCAu0u69nknpZAk+CYHFgZnp4bF+KRqICRW5PulhsRWB5eWJOrogyFgQcPL6tUYNOM6SA3JDiF7pcWQbPkmxgXNJE1+pZ5-XLpdKxBLFWJJPyTA5HS6GeomZrmKB3VwyR6gTwvBI5D5fH6ff6xQEIBLpHIUkYQpKZYIQ8KHLRAA */
  initial: "waiting",
  id: "networkLogger",
  context: {
    requests: [],
    loadingOrQueued: new Set<string>(),
    queuedRequests: new Set<string>(),
    loadingRequests: new Set<string>(),
    completedRequests: new Set<string>(),
  },
  types: {} as {
    context: {
      requests: IRequest[];
      loadingOrQueued: Set<string>;
      queuedRequests: Set<string>;
      loadingRequests: Set<string>;
      completedRequests: Set<string>;
    };
    events:
      | { type: "CLEAR_QUEUE_IF_COMPLETE" }
      | GLOBAL_REQUEST
      | {
          type: "DELETE";
          data: {
            id: string;
          };
        }
      | {
          type: "DELETE_ALL";
        };
  },
  states: {
    waiting: {
      on: {
        CLEAR_QUEUE_IF_COMPLETE: {
          target: "clearingQueueIfComplete",
        },
      },
    },
    clearingQueueIfComplete: {
      after: {
        4000: [
          {
            target: "waiting",
            actions: assign({
              loadingOrQueued: new Set<string>(),
              completedRequests: new Set<string>(),
            }),
            guard: ({ context }) => {
              return (
                context.loadingRequests.size + context.queuedRequests.size === 0
              );
            },
          },
          {
            target: "waiting",
          },
        ],
      },
    },
  },

  on: {
    GLOBAL_REQUEST: {
      actions: [
        assign({
          loadingOrQueued: ({ context, event }) => {
            const updated = new Set(Array.from(context.loadingOrQueued));
            if (
              event.data.status === "queued" ||
              event.data.status === "loading"
            ) {
              event.data.requests.forEach((request) => {
                updated.add(request.id);
              });
            }
            return updated;
          },
          queuedRequests: ({ context, event }) => {
            const updated = new Set(Array.from(context.queuedRequests));
            if (event.data.status === "queued") {
              event.data.requests.forEach((request) => {
                updated.add(request.id);
              });
            } else if (
              event.data.status === "complete" ||
              event.data.status === "loading" ||
              event.data.status === "error"
            ) {
              event.data.requests.forEach((request) => {
                updated.delete(request.id);
              });
            }
            return updated;
          },
          loadingRequests: ({ context, event }) => {
            const updated = new Set(Array.from(context.loadingRequests));
            if (event.data.status === "loading") {
              event.data.requests.forEach((request) => {
                updated.add(request.id);
              });
            } else {
              event.data.requests.forEach((request) => {
                updated.delete(request.id);
              });
            }
            return updated;
          },
          completedRequests: ({ context, event }) => {
            const updated = new Set(Array.from(context.completedRequests));
            if (
              event.data.status === "complete" ||
              event.data.status === "error"
            ) {
              event.data.requests.forEach((request) => {
                updated.add(request.id);
              });
            }

            return updated;
          },
        }),
        enqueueActions(({ context, event, enqueue }) => {
          assertEvent(event, "GLOBAL_REQUEST");
          const requestStatus = event.data.status;

          if (requestStatus === "loading" || requestStatus === "queued") {
            // requests can come in batches. We need to filter out the ones we already have
            // click two fast.
            // will get one loading request
            // then another with a duplicate of the loading request
            // probably need to figure out why this is happening
            // for now dedupe them
            // something with the requestMachine being invoked right away and
            const requests: Record<string, boolean | undefined> =
              context.requests.reduce((acc, cur) => {
                return {
                  ...acc,
                  [cur.id]: true,
                };
              }, {});

            // if its in the requests object, update it and remove it from incoming
            const newRequests = event.data.requests.filter(
              (req) => !requests[req.id]
            ) as IRequest[];

            const incomingExistingRequests = event.data.requests.filter(
              (req) => requests[req.id]
            );

            const updatedExisting = context.requests.map((request) => {
              const e = incomingExistingRequests.find(
                (incomingRequest) => incomingRequest.id === request.id
              );
              if (e) return e;
              return request;
            });
            enqueue(
              assign({
                requests: [...updatedExisting, ...newRequests],
              })
            );
            // assign({ requests: [...context.requests, { ...event.data }] })})
          } else if (
            requestStatus === "complete" ||
            requestStatus === "error"
          ) {
            enqueue(raise({ type: "CLEAR_QUEUE_IF_COMPLETE" }));
            enqueue(
              assign({
                requests: context.requests.map((request) => {
                  const requestResponse = event.data.requests.find(
                    (response) => response.id === request.id
                  );
                  if (!requestResponse) return request;
                  return requestResponse;
                }),
              })
            );
          }
        }),
      ],
    },
    DELETE: {
      actions: assign({
        requests: ({ context, event }) => {
          // console.log(context);
          return context.requests.filter(
            (request) => request.id !== event.data.id
          );
        },
      }),
    },
    DELETE_ALL: {
      actions: assign({
        requests: [],
        loadingOrQueued: new Set<string>(),
        queuedRequests: new Set<string>(),
        loadingRequests: new Set<string>(),
        completedRequests: new Set<string>(),
      }),
    },
  },
});
