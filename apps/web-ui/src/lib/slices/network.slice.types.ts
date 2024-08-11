import { APIResponse } from "./api.slice.types";
///////////////////////////////////////////
// Types
///////////////////////////////////////////

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
