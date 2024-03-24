import type { IRequest, IResponse } from "./network.types";

export type APP_MACHINE_ADD_WALLET = {
  type: "APP_MACHINE_ADD_WALLET";
  data: any;
  flags: {
    hasUpdatedUtxoOrXpub: boolean;
  };
};

export type APP_MACHINE_FETCH_UTXO = {
  type: "APP_MACHINE_FETCH_UTXO";
  data: {
    walletId: string;
    address: string;
    ttl?: number;
  };
};

export type GLOBAL_REQUEST = {
  type: "GLOBAL_REQUEST";
  data: {
    status: string;
    id: string;
    requests: IRequest[];
    responses: IResponse[];
  };
};
