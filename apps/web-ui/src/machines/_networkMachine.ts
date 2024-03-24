// @ts-nocheck
import { createMachine, assign } from "xstate";
import { fetchMachine } from "./_fetchMachine";
import { type IRequest } from "./network.types";

// This isnt exactly what i want but it works.
// fetch kicks it off and calls initiate which creates a child machine
// and calls FETCH on the child machine to kick off the request
// I listen to the COMPLETE event globally and then stop the child machine
// and update the request in the parent machine
// am then in initiate or idle?
// on a single request im in idle
// however FETCH gets called again and now im in initiate

// @todo list
// - [ ] add a cancel button to cancel a request
// - [ ] add a cancel all button to cancel all requests
// - [ ] add a retry button to retry a request
// - [ ] add a retry all button to retry all requests
// - [ ] add delete button to delete a request

export const networkMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDswBcDuB7ATgawGIBhAeQFkAFAGQFEAVGgbQAYBdRUABy1gEs1eWZBxAAPRMwA0IAJ4SAvvOmpMuQgCUaAZXot2SENz4ChI8QgCMzCwDoATMwAsAVgAcANkeuLAdld33AGZpOQQAWgtHRxtXZwC7V2YfC3cfH2ZAxWV0bHwCGnV1EnU9ESN+QWEDcwSAThtmZ2dAux9A5IsEpxDEO1rnGOZXF2cXV1q7C0DHLJAVXMIAMXoiAAlSg3KTKtBQsMnmGMdI10DE92cLCzjpc3d7mJ9HWtqM0aCrxSU5rAg4EXmajKPAqpmqiAi3hip1q7litWuznczHcPXCfVcNhSUWYtUCyKuFlhs0B+BsvAgABswMDjJUzBCpoFoYFYfDEcjUbJGYEBu47LyzvjhkiLiScmobJwcFgAMZwPjIKC00E7MSIRy4hpeWJnFH49wWNGROw2KK1HwvFxnF73cWqMlgHAynAq7YM8JMlls5wIpqctGs2yJEWjNwTKYzL5AA */
  id: "network",
  initial: "idle",
  context: {
    activeRequestCount: 0,
    requests: [] as IRequest[],
  },
  types: {
    context: {} as {
      activeRequestCount: number;
      requests: IRequest[];
    },
  },
  states: {
    idle: {},
    processing: {
      invoke: {
        src: "childFetchMatch",
        // this is a hack to get the id of the request into the child machine
        id: (() => `${new Date().getTime().toString()}`) as any,
        input: ({ event, context }) => {
          const id =
            event.data.id ?? context.requests[context.requests.length - 1].id;
          return { ...event.data, id };
        },
      },
      entry: assign({
        activeRequestCount: ({ context }) => context.activeRequestCount + 1,
        requests: ({ context, event }) => {
          if (event.type === "FETCH") {
            const id = new Date().getTime().toString();

            return [
              ...context.requests,
              {
                ...event.data,
                loading: true,
                status: "loading",
                id,
              },
            ];
          }
          const ref = context.requests.find(
            (request) => request.id === event.data.id
          )?.ref;
          if (ref) {
            ref.send({ type: "RESET", input: event.data });
          }

          return context.requests.map((request) => {
            return {
              ...request,
              loading: true,
              status: "loading",
            };
          });
        },
      }),
      on: {},
    },
    error: {},
  },
  on: {
    COMPLETE: {
      target: ".idle",
      actions: [
        assign({
          activeRequestCount: ({ context }) => {
            console.log("activeRequestCount decrement");
            return context.activeRequestCount - 1;
          },
          requests: ({ context, event }) => {
            return context.requests.map((request) => {
              if (request.id === event.data.id) {
                return {
                  ...request,
                  response: event.data.response,
                  loading: false,
                  status: "complete",
                };
              }
              return request;
            });
          },
        }),
      ],
    },
    RESET: {
      target: ".processing",
    },
    ERROR: {
      target: ".error",
      actions: assign({
        activeRequestCount: ({ context }) => {
          console.log("activeRequestCount decrement");
          return context.activeRequestCount - 1;
        },
        requests: ({ context, event }) => {
          return context.requests.map((request) => {
            if (request.id === event.data.id) {
              return {
                ...request,
                response: event.data.response,
                loading: false,
                status: "error",
              };
            }
            return request;
          });
        },
      }),
    },

    FETCH: {
      target: ".processing",
    },
  },
}).provide({
  actors: {
    childFetchMatch: fetchMachine,
  },
});
