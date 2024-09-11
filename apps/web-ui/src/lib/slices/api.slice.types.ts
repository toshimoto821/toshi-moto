import type { ICurrency } from "@root/types";
import { type GroupBy } from "@lib/slices/ui.slice.types";
import { type GraphTimeFrameRange } from "@lib/slices/ui.slice.types";
export interface PriceResponse {
  bitcoin: {
    last_updated_at: number;
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
  };
}

export interface BinanceKlineMetric {
  openTime: number;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  closePrice: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface PriceHistoryResponse {
  meta: {
    from: number;
    to: number;
    groupBy: GroupBy;
    range: GraphTimeFrameRange | null;
  };
  prices: BinanceKlineMetric[];
}

export interface PriceHistoryDiffResponse {
  data: {
    period: GraphTimeFrameRange;
    diff: number;
  }[];
}

export interface PriceHistoricArgs {
  from: number;
  to: number;
  currency?: ICurrency;
  groupBy: GroupBy;
  range?: GraphTimeFrameRange;
}

export interface AddressArgs {
  address: string;
  walletId: string;
  queueId?: string;
  index: number;
  isChange: boolean;
}

export interface AddressResponse {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

export interface Vout {
  value: number;
  scriptpubkey: string;
  scriptpubkey_address: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
}

export interface Vin {
  is_coinbase: boolean;
  prevout: Vout;
  scriptsig: string;
  scriptsig_asm: string;
  sequence: number;
  txid: string;
  vout: number;
  witness: string[];
  inner_redeemscript_asm: string;
  inner_witnessscript_asm: string;
}
export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  size: number;
  weight: number;
  fee: number;
  vin: Vin[];
  vout: Vout[];
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

export type TransactionsResponse = Transaction[];

export type CirculatingSupplyResponse = number;

export type APIResponse =
  | PriceResponse
  | CirculatingSupplyResponse
  | AddressResponse
  | TransactionsResponse
  | PriceHistoryResponse;

export interface Config {
  key: string;
  value: string;
}
export interface ConfigResponse {
  configs: Config[];
}

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export interface GenericResponse {
  message: string;
}
