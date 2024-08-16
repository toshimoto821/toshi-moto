import { ThunkAction, UnknownAction } from "@reduxjs/toolkit";
import { APIResponse } from "./api.slice.types";
import { apiSlice } from "./api.slice";
import type { RootState } from "../store";
import type { ConfigState } from "./config.slice";
import {
  queueAdapter,
  processingAdapter,
  requestsAdapter,
} from "./network.slice";
///////////////////////////////////////////
// Types
///////////////////////////////////////////

export type CustomThunkAction = ThunkAction<
  void,
  RootState,
  unknown,
  UnknownAction
>;

export interface QueueItemAction {
  endpoint: keyof typeof apiSlice.endpoints;
  args: any;
}
// type Payload = ReturnType<typeof apiSlice.endpoints.getAddress.initiate>;
export interface QueueItem {
  id: string;
  action: QueueItemAction;
}

export interface NetworkState {
  config: {
    api: ConfigState["api"];
    network: ConfigState["network"];
  };
  queue: ReturnType<typeof queueAdapter.getInitialState>;
  processing: ReturnType<typeof processingAdapter.getInitialState>;
  requests: ReturnType<typeof requestsAdapter.getInitialState>;
}

export interface Request<T> {
  id: string;
  url: {
    origin?: string;
    pathname: string;
    search?: string;
  };
  startedTimeStamp: number;
  fulfilledTimeStamp?: number;
  status: string;
  meta: RequestMeta;
  // used in ui for showing count
  inactive?: boolean;
  response?: {
    data: T;
  };
}

export type APIRequestResponse = Request<APIResponse>;

export interface RequestMeta {
  priority: number;
  type: string;
  address?: string;
  walletId?: string;
}
