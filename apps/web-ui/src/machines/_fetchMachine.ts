// @ts-nocheck
import { createMachine, assign, fromPromise, sendParent } from "xstate";
import { assertEvent } from "xstate-helpers";
import { type IResponse } from "./network.types";

type IXhrOptions = {
  // method?: string;
  // headers?: Record<string, string>;
  // body?: string;
  timeout?: number;
};

type Headers = Record<string, string>;

const defaultOptions = {
  timeout: 10000,
};
const xhrRequest = (url: string, opts: IXhrOptions = defaultOptions) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = new Date().getTime();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const endTime = new Date().getTime();
        const duration = endTime - startTime;
        const responseHeaders = xhr.getAllResponseHeaders();

        // Convert the header string into an array
        // of individual headers
        const arr = responseHeaders.trim().split(/[\r\n]+/);

        // Create a map of header names to values
        const headerMap: Headers = arr.reduce((acc, line) => {
          const parts = line.split(": ");
          const header = parts.shift() as string;
          const value = parts.join(": ");
          return {
            ...acc,
            [header]: value,
          };
        }, {});

        const data =
          headerMap["content-type"] === "application/json"
            ? JSON.parse(xhr.responseText)
            : xhr.responseText;

        const details = {
          duration,
          status: xhr.status,
        };
        const response: IResponse = { data, headers: headerMap, details };
        if (xhr.status === 200) {
          resolve(response);
        } else {
          reject(response);
        }
      }
    };
    xhr.timeout = opts.timeout ?? defaultOptions.timeout;
    xhr.onerror = reject;
    xhr.open("GET", url, true);
    xhr.send();
  });

function invokeApi(url: string) {
  // mempool.space doesnt support fetch options request
  return xhrRequest(url);
  // return fetch(url, {
  //   signal: AbortSignal.timeout(10000),
  // }).then(async (response) => {
  //   if (response.status === 200) {
  //     return response.json();
  //   }
  //   const text = await response.text();
  //   throw new Error(text);
  // });
}

export const fetchMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYgCUBRAZQoBUBtABgF1FQAHAe1lwBddO+NiAAeiAMwA2AEwA6aY0kBWAJwBGFdOUAOcVoA0IAJ6IAtOLWNZkgOzLxAFkY2t0t0oC+Hw2ix5CRLIANpzoEARQJBCCYLIEAG6cANaxAGJ0AMIAEgD6AIIAIgWUVFRMrEggXDz8gsJiCIyGJo1ePhg4BMTBoeH4kWAAToOcg7LsQei8AGajqLLptNn5RSVlLMLVfAJClQ1NxoiMbSC+nQGy0+i4QQCug2DkdGQAmuWb3Nt1e2bSDiqyNRqcRKGx2f7aFRKBzNCRg2Q2NSIhwKGwqZSMJSSE5nfzdK43e6Pd6VLa1XagBqmBxqByyGlKJTaZSMySMZywhCmSTaWRKWmY7TSOz8plqLzeED4TgQODCXFdIgfGo7epmJSMOkqGniRTaBxKPSaTnmFQ2WQqS0G9GuNw2Bw4jp4wIhMIRZVfCmiRCaWTiS2SS3SNSuRnaTmONSyZw2Rj66GGxniR1+RWyWC3TCYODwUmfclqrk0ukMpksrHsmycsMWuwqcT2xlaQ0p874qboIIegs-ItYi06vUGo3STnBumKBw2cRCtl6XQ2VvOy7XO4Pbuq3umaRC2S6YGx6QNzHSFQmo-moGSQMz7SMBROaQSjxAA */
    initial: "loading",
    context: {
      data: null,
      response: null,
      error: null,
      loading: false,
      retries: 0,
      maxRetries: 3,
    },
    types: {} as {
      context: {
        data: any;
        response: any;
        loading: boolean;
        error: any;
        retries: number;
        maxRetries: number;
      };
      events:
        | {
            type: "RETRY";
            data: { url: string };
            input?: any;
          }
        | {
            type: "RESET";
            input?: any;
          }
        | {
            type: "xstate.error.actor.FETCH_ADDRESS";
            input?: any;
            data?: any;
            error?: any;
          };
    },
    states: {
      loading: {
        id: "loading",
        entry: [
          assign({
            loading: true,
            data: ({ event }) => {
              return event.input;
            },
          }),
        ],
        invoke: {
          id: "FETCH_ADDRESS",
          src: "FETCH_ADDRESS",
          input: ({ context }) => {
            return { url: context.data.url };
          },
          onDone: {
            target: "success",
            actions: [
              assign({
                loading: false,
                response: ({ event }) => {
                  return event.output;
                },
              }),
            ],
          },
          onError: "failure",
        },
      },
      success: {
        entry: sendParent(({ context }) => {
          console.log("sending parent");
          return {
            type: "COMPLETE",
            data: {
              id: context.data.id,
              response: context.response,
            },
          };
        }),
      },
      fatal: {},
      failure: {
        always: {
          target: "fatal",
          guard: ({ context }) => {
            return context.retries > 3;
          },
        },
        entry: [
          sendParent(({ context, event }) => {
            assertEvent(event, "xstate.error.actor.FETCH_ADDRESS");
            return {
              type: "ERROR",
              data: {
                ...context.data,
                response: event.error,
              },
            };
          }),
        ],
        on: {
          RETRY: {
            target: "loading",
            actions: assign({
              retries: ({ context }) => {
                return context.retries + 1;
              },
            }),
          },
        },
      },
    },
    on: {
      RESET: {
        target: ".loading",
        actions: assign({
          retries: 0,
        }),
      },
    },
  },
  {
    actors: {
      FETCH_ADDRESS: fromPromise(
        async ({ input }: { input: { url: string } }) => {
          return invokeApi(input?.url);
        }
      ),
    },
  }
);
