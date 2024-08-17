import type { ICurrency } from "@root/types";

interface ToastMessage {
  line1: string;
  line2?: string;
}

export interface UIState {
  currency: ICurrency;
  filterUtxoOnly: string[];
  graphTimeFrameRange: GraphTimeFrameRange;
  graphTimeFrameGroup: GroupBy;
  graphStartDate: number;
  graphEndDate: number;
  graphBtcAllocation: boolean;
  graphPlotDots: boolean;
  graphSelectedTransactions: string[];
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
  | "5Y"
  | "ALL";

export type GroupBy = "5M" | "1H" | "1D" | "1W";