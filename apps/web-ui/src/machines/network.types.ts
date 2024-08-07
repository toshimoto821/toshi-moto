export type IRequest<T> = {
  id: string;
  url: string;
  meta?: any;
  response?: IResponse<T>;
  retry?: () => void;
  loading: boolean;
  status: string;
  createdAt: number;
};

export type IResponse<T> = {
  id: string;
  data: T;
  headers: Record<string, string>;
  details: {
    duration: number;
    status: number;
    startTime: number;
    endTime: number;
  };
};

export type IRequestResponse<T> = {
  request: IRequest<T>;
  response: IResponse<T>;
};

export type IXhrOptions = {
  // method?: string;
  // headers?: Record<string, string>;
  // body?: string;
  timeout?: number;
  id?: string;
  ttl?: number;
};
