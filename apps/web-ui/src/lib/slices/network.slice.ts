import {
  createEntityAdapter,
  createSlice,
  isAnyOf,
  createSelector,
  PayloadAction,
  nanoid,
} from "@reduxjs/toolkit";
import {
  apiSlice,
  getPriceQuery,
  getCirculatingSupplyQuery,
  getAddressQuery,
  getTransactionQuery,
} from "./api.slice";
import { wait } from "./slice.utils";
import { createAppAsyncThunk } from "../store/withTypes";
import type { AddressArgs } from "./api.slice.types";
import type { APIRequestResponse } from "./network.slice.types";
import type { RootState } from "../store";
import type {
  QueueItem,
  QueueItemAction,
  NetworkState,
} from "./network.slice.types";
import {
  initialState as configInitialState,
  type ConfigState,
} from "./config.slice";
import type { AppStartListening } from "../store/middleware/listener";

export const requestsAdapter = createEntityAdapter<APIRequestResponse>({
  sortComparer: (a, b) => a.startedTimeStamp - b.startedTimeStamp,
});
export const queueAdapter = createEntityAdapter<QueueItem>();
export const processingAdapter = createEntityAdapter<QueueItem>();

const initialState: NetworkState = {
  config: {
    api: configInitialState.api,
  },
  queue: queueAdapter.getInitialState(),
  processing: processingAdapter.getInitialState(),
  requests: requestsAdapter.getInitialState(),
};

// interface BaseQueryMeta {
//   request: {
//     url: string;
//   };
//   // Add other fields if necessary
// }

const API_REQUEST_FULFILLED = isAnyOf(
  apiSlice.endpoints.getAddress.matchFulfilled,
  apiSlice.endpoints.getTransactions.matchFulfilled,
  apiSlice.endpoints.getPrice.matchFulfilled,
  apiSlice.endpoints.getCirculatingSupply.matchFulfilled
);

const API_REQUEST_REJECTED = isAnyOf(
  apiSlice.endpoints.getAddress.matchRejected,
  apiSlice.endpoints.getTransactions.matchRejected,
  apiSlice.endpoints.getPrice.matchRejected,
  apiSlice.endpoints.getCirculatingSupply.matchRejected
);

const API_REQUEST_PENDING = isAnyOf(
  apiSlice.endpoints.getAddress.matchPending,
  apiSlice.endpoints.getTransactions.matchPending,
  apiSlice.endpoints.getPrice.matchPending,
  apiSlice.endpoints.getCirculatingSupply.matchPending
);

const API_REQUEST_FULFILLED_REJECTED = isAnyOf(
  apiSlice.endpoints.getAddress.matchFulfilled,
  apiSlice.endpoints.getAddress.matchRejected,
  apiSlice.endpoints.getTransactions.matchFulfilled,
  apiSlice.endpoints.getTransactions.matchRejected,
  apiSlice.endpoints.getPrice.matchFulfilled,
  apiSlice.endpoints.getPrice.matchRejected,
  apiSlice.endpoints.getCirculatingSupply.matchFulfilled,
  apiSlice.endpoints.getCirculatingSupply.matchRejected
);
///////////////////////////////////////////
// Slice
///////////////////////////////////////////

export const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<ConfigState>) => {
      state.config.api = action.payload.api;
    },
    enqueueAction: (
      state,
      action: PayloadAction<QueueItemAction | QueueItemAction[]>
    ) => {
      const items: QueueItemAction[] = [];
      if (Array.isArray(action.payload)) {
        items.push(...action.payload);
      } else {
        items.push(action.payload);
      }

      queueAdapter.addMany(
        state.queue,
        items.map((item) => ({
          id: nanoid(),
          action: item,
        }))
      );
    },

    markCompleteAsInactive(state) {
      Object.values(state.requests.entities)
        .filter((req) => req.status === "fulfilled")
        .forEach((req) => (req.inactive = true));
    },
  },
  extraReducers(builder) {
    // pending
    builder.addMatcher(API_REQUEST_PENDING, (state, action) => {
      // dequeue
      const id = action.meta.arg.originalArgs?.queueId || action.meta.requestId;
      if (id) {
        const item: QueueItem = state.queue.entities[id];
        if (item) {
          queueAdapter.removeOne(state.queue, id);
          processingAdapter.addOne(state.processing, item);
        } else {
          processingAdapter.addOne(state.processing, {
            id,
            action: {
              endpoint: action.meta.arg
                .endpointName as QueueItemAction["endpoint"],
              args: action.meta.arg.originalArgs,
            },
          });
        }

        const request: APIRequestResponse = {
          id,
          url: getRequestUrl(
            action.meta.arg.endpointName,
            action.meta.arg.originalArgs
          ),
          startedTimeStamp: action.meta.startedTimeStamp,
          status: action.meta.requestStatus,
          meta: {
            type: getRequestType(action.meta.arg.endpointName),
            priority: 1,
          },
        };
        state.requests = requestsAdapter.upsertOne(state.requests, request);
      }
    });

    // complete
    builder.addMatcher(API_REQUEST_FULFILLED, (state, action) => {
      const id = action.meta.arg.originalArgs?.queueId || action.meta.requestId;
      if (id) {
        // const item: QueueItem = state.processing.entities[id];
        state.processing = processingAdapter.removeOne(state.processing, id);
      }
      // @ts-expect-error baseQueryMeta is not in the type
      const url = new URL(action.meta.baseQueryMeta.request.url);

      requestsAdapter.updateOne(state.requests, {
        id,
        changes: {
          fulfilledTimeStamp: action.meta.fulfilledTimeStamp,
          status: action.meta.requestStatus,
          url: {
            origin: url.origin,
            pathname: url.pathname,
          },
          response: {
            data: action.payload,
          },
        },
      });
    });

    // @todo handle rejected
    builder.addMatcher(API_REQUEST_REJECTED, (state, action) => {
      const id = action.meta.arg.originalArgs?.queueId || action.meta.requestId;
      if (id) {
        processingAdapter.removeOne(state.processing, id);
      }
      // @ts-expect-error baseQueryMeta is not in the type
      const url = new URL(action.meta.baseQueryMeta.request.url);

      requestsAdapter.updateOne(state.requests, {
        id,
        changes: {
          status: action.meta.requestStatus,
          url: {
            origin: url.origin,
            pathname: url.pathname,
          },
        },
      });
    });
  },
});

export const { markCompleteAsInactive, enqueueAction } = networkSlice.actions;

///////////////////////////////////////////
// Middleware
///////////////////////////////////////////
// const networkQueue: PayloadAction<Request<APIResponse>>[] = [];

let networkTimer: NodeJS.Timeout | null = null;
export const addNetworkListener = (startAppListening: AppStartListening) => {
  startAppListening({
    matcher: API_REQUEST_FULFILLED_REJECTED,
    effect: async (_, listenerApi) => {
      if (networkTimer) {
        clearTimeout(networkTimer);
      }
      networkTimer = setTimeout(() => {
        listenerApi.dispatch(markCompleteAsInactive());
      }, 5000);
    },
  });

  startAppListening({
    predicate: (action, state) => {
      return (
        networkSlice.actions.enqueueAction.match(action) &&
        state.network.processing.ids.length === 0
      );
    },
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(processQueue());
    },
  });

  // api fulfilled listener
  startAppListening({
    matcher: API_REQUEST_FULFILLED,
    effect: (_, { dispatch }) => {
      dispatch(processQueue());
    },
  });

  startAppListening({
    matcher: API_REQUEST_REJECTED,
    effect(action, { dispatch }) {
      if (!action.meta.condition) {
        dispatch(processQueue());
      }
    },
  });
};

///////////////////////////////////////////
/// actors
///////////////////////////////////////////

export const processQueue = createAppAsyncThunk(
  "network/processQueue",
  async (_, listenerApi) => {
    const state = listenerApi.getState();
    const queueIds = state.network.queue.ids.slice();
    const processingCount = state.network.processing.ids.length;
    const { conconcurrentRequests, timeBetweenRequests } = state.config.network;
    const QUEUE_SIZE = conconcurrentRequests;

    if (timeBetweenRequests > 0) {
      await wait(timeBetweenRequests);
    }
    const diff = QUEUE_SIZE - processingCount;
    if (diff > 0) {
      const processingIds = queueIds.slice(0, diff);
      processingIds.forEach((id) => {
        const item = state.network.queue.entities[id];
        if (item.action.endpoint === "getAddress") {
          // need to pass the host with getAddress
          listenerApi.dispatch(
            apiSlice.endpoints.getAddress.initiate({
              ...item.action.args,
              queueId: id,
            } as AddressArgs)
          );
        } else if (item.action.endpoint === "getTransactions") {
          listenerApi.dispatch(
            apiSlice.endpoints.getTransactions.initiate({
              ...item.action.args,
              queueId: id,
            })
          );
        }
      });
    }
  }
);

export const getRequestUrl = (type: string, originalArgs: any) => {
  if (type === "getTransactions") {
    const pathname = getTransactionQuery(originalArgs);
    return {
      pathname,
    };
  }

  if (type === "getAddress") {
    const pathname = getAddressQuery(originalArgs);
    return {
      pathname,
    };
  }
  if (type === "getPrice") {
    // const baseUrl = dynamicBaseQuery("", api, {});
    const pathname = getPriceQuery();
    const [, search = ""] = pathname.split("?");

    return {
      pathname,
      search,
    };
  }
  if (type === "getCirculatingSupply") {
    const url = new URL(getCirculatingSupplyQuery());
    return {
      origin: url.origin,
      pathname: url.pathname,
      search: url.search,
    };
  }
  throw new Error("unknown request type");
};

export const getRequestType = (type: string) => {
  if (type === "getPrice") {
    return "price";
  }

  if (type === "getCirculatingSupply") {
    return "supply";
  }

  if (type === "getTransactions") {
    return "transactions";
  }

  if (type === "getAddress") {
    return "address";
  }

  return "unknown";
};

export const networkReducer = networkSlice.reducer;

///////////////////////////////////////////
// Selectors
///////////////////////////////////////////

const requestSelectors = requestsAdapter.getSelectors<RootState>(
  (state) => state.network.requests
);

const queueSelectors = queueAdapter.getSelectors<RootState>(
  (state) => state.network.queue
);

const processingSelectors = processingAdapter.getSelectors<RootState>(
  (state) => state.network.processing
);

export const selectRequests = (state: RootState) => {
  // combine all
  const requests = requestSelectors.selectAll(state);

  return requests;
};

const selectRequestByStatus = (status: string, showInactive = false) => {
  return (state: RootState) => {
    const requests = requestSelectors.selectAll(state);

    return requests.filter(
      (request) =>
        request.status === status && (showInactive || !request.inactive)
    );
  };
};

export const selectQueuedRequests = (state: RootState) => {
  const queue = queueSelectors.selectAll(state);

  return queue;
};

export const selectPendingRequests = (state: RootState) => {
  const requests = processingSelectors.selectAll(state);

  return requests;
};

export const selectCompleteRequests = (
  state: RootState,
  showInactive = false
) => {
  const requests = selectRequestByStatus("fulfilled", showInactive)(state);

  return requests;
};

export const selectCountRequests = createSelector(
  // @fixme should select deeper state
  (state: RootState) => state,
  (state: RootState) => {
    const total = state.network.requests.ids.length;
    const complete = selectCompleteRequests(state);
    const completeLen = complete.length;
    const queued = selectQueuedRequests(state).length;
    const pending = selectPendingRequests(state).length;

    return {
      total,
      queued,
      pending,
      complete: completeLen,
      // done: done.length,
    };
  }
);
