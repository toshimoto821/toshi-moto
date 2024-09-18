import type { ICurrency } from "@root/types";

interface ToastMessage {
  line1: string;
  line2?: string;
}

export interface UIState {
  currency: ICurrency;
  debugMode: boolean;
  filterUtxoOnly: string[];
  graphTimeFrameRange: GraphTimeFrameRange | null;
  previousGraphTimeFrameRange: GraphTimeFrameRange | null;
  graphTimeFrameGroup: GroupBy;
  graphStartDate: number;
  graphStartDateNext: number | null;
  graphEndDate: number;
  graphEndDateNext: number | null;
  graphBtcAllocation: boolean;
  graphPlotDots: boolean;
  graphSelectedTransactions: string[];
  graphIsLocked: boolean;
  graphSelectedIndex: number | null;
  navbarBalanceVisibility: boolean;
  netAssetValue: boolean;
  privatePrice: boolean;
  selectedWalletId: string | null;
  toastOpen: boolean;
  toastMessage: ToastMessage | null;
  walletExpandedAddresses: string[];
}

export type GraphTimeFrameRange =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "1Y"
  | "2Y"
  | "5Y";

export type GroupBy =
  | "5m"
  | "15m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";
