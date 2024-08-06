import {
  createEntityAdapter,
  createSlice,
  isAnyOf,
  createSelector,
} from "@reduxjs/toolkit";
import {
  apiSlice,
  getPriceQuery,
  getCirculatingSupplyQuery,
  type APIResponse,
} from "./api.slice";
import type { RootState } from "../store";
import type { AppStartListening } from "../store/middleware/listener";

export interface Request<T> {
  id: string;
  url: string;
  createdAt: number;
  completedAt?: number;
  status: string;
  meta: RequestMeta;
  // used in ui for showing count
  inactive?: boolean;
  response?: {
    data: T;
  };
}

export interface RequestMeta {
  priority: number;
  type: string;
  address?: string;
  walletId?: string;
}

const requestsAdapter = createEntityAdapter<Request<APIResponse>>({
  sortComparer: (a, b) => a.createdAt - b.createdAt,
});

export interface NetworkState {
  requests: ReturnType<typeof requestsAdapter.getInitialState>;
}
const initialState: NetworkState = {
  requests: requestsAdapter.getInitialState(),
};

interface BaseQueryMeta {
  request: {
    url: string;
  };
  // Add other fields if necessary
}

export const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    markCompleteAsInactive(state) {
      Object.values(state.requests.entities)
        .filter((req) => req.status === "complete")
        .forEach((req) => (req.inactive = true));
    },
  },
  extraReducers(builder) {
    // pending
    builder.addMatcher(
      isAnyOf(
        apiSlice.endpoints.getPrice.matchPending,
        apiSlice.endpoints.getCirculatingSupply.matchPending
      ),
      (state, action) => {
        const request: Request<APIResponse> = {
          id: action.meta.requestId,
          url: getRequestUrl(action.meta.arg.endpointName),
          createdAt: action.meta.startedTimeStamp,
          status: action.meta.requestStatus,
          meta: {
            type: getRequestType(action.meta.arg.endpointName),
            priority: 1,
          },
        };
        state.requests = requestsAdapter.upsertOne(state.requests, request);
      }
    );
    // complete
    builder.addMatcher(
      isAnyOf(
        apiSlice.endpoints.getPrice.matchFulfilled,
        apiSlice.endpoints.getCirculatingSupply.matchFulfilled
      ),
      (state, action) => {
        const req = state.requests.entities[action.meta.requestId];

        if (req) {
          const baseQueryMeta = action.meta.baseQueryMeta as BaseQueryMeta;
          state.requests = requestsAdapter.updateOne(state.requests, {
            id: action.meta.requestId,
            changes: {
              status: "complete",
              completedAt: action.meta.fulfilledTimeStamp,
              url: baseQueryMeta.request.url,
              response: {
                data: action.payload,
              },
            },
          });
        }
      }
    );
  },
});

export const { markCompleteAsInactive } = networkSlice.actions;

export const getRequestUrl = (type: string) => {
  if (type === "getPrice") {
    // const baseUrl = dynamicBaseQuery("", api, {});
    return getPriceQuery();
  }
  if (type === "getCirculatingSupply") {
    return getCirculatingSupplyQuery();
  }
  return "";
};

export const getRequestType = (type: string) => {
  if (type === "getPrice") {
    return "price";
  }

  if (type === "getCirculatingSupply") {
    return "supply";
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

export const selectQueuedRequests = (
  state: RootState,
  showInactive = false
) => {
  const requests = selectRequestByStatus("queued", showInactive)(state);

  return requests;
};

export const selectPendingRequests = (
  state: RootState,
  showInactive = false
) => {
  const requests = selectRequestByStatus("pending", showInactive)(state);

  return requests;
};

export const selectCompleteRequests = (
  state: RootState,
  showInactive = false
) => {
  const requests = selectRequestByStatus("complete", showInactive)(state);

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

///////////////////////////////////////////
// Middleware
///////////////////////////////////////////

let networkTimer: NodeJS.Timeout | null = null;
export const addNetworkListener = (startAppListening: AppStartListening) => {
  startAppListening({
    matcher: isAnyOf(
      apiSlice.endpoints.getPrice.matchFulfilled,
      apiSlice.endpoints.getCirculatingSupply.matchFulfilled
    ),
    effect: async (_, listenerApi) => {
      if (networkTimer) {
        clearTimeout(networkTimer);
      }
      networkTimer = setTimeout(() => {
        listenerApi.dispatch(markCompleteAsInactive());
      }, 5000);
    },
  });
};
