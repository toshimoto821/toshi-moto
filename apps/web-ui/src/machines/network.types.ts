export type IRequest = {
  id: string;
  url: string;
  meta?: any;
  response?: IResponse;
  retry?: () => void;
  loading: boolean;
  status: string;
  createdAt: number;
};

export type IResponse = {
  id: string;
  data: any;
  headers: Record<string, string>;
  details: {
    duration: number;
    status: number;
    startTime: number;
    endTime: number;
  };
};

export type IRequestResponse = {
  request: IRequest;
  response: IResponse;
};

export type IXhrOptions = {
  // method?: string;
  // headers?: Record<string, string>;
  // body?: string;
  timeout?: number;
  id?: string;
  ttl?: number;
};
